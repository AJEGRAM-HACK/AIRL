import assert from "node:assert/strict";
import { connect, type ClientHttp2Session } from "node:http2";
import { spawn, execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";
import { PlatformStore } from "../src/server/platform/store";

const directory = resolve(`.data/rehearsals/${Date.now()}`);
mkdirSync(directory, { recursive: true });
const database = resolve(directory, "live.sqlite");
const fixture = new PlatformStore(database);
const email = "rehearsal-admin@example.test";
const password = randomBytes(24).toString("base64url");
fixture.signout(fixture.signup(email, "Rehearsal administrator", password));
fixture.bootstrapAdmin(email);
fixture.close();
let phase = "startup";
const started = Date.now();
const tunnel = spawn(process.execPath, ["scripts/demo-tunnel.mjs"], {
  env: {
    ...process.env,
    AIRL_LIVE_DB_PATH: database,
    AIRL_ALLOW_LIVE_REQUESTS: "false",
  },
  stdio: ["ignore", "pipe", "inherit"],
});
const abort = new AbortController();
const tasks: Promise<void>[] = [];
const pending = new Set<Promise<unknown>>();
const errors: string[] = [];
const connections = new Map<string, ClientHttp2Session>();
function connection(cookie: string) {
  let session = connections.get(cookie);
  if (!session || session.closed || session.destroyed) {
    session = connect(origin);
    session.on("error", () => {});
    connections.set(cookie, session);
  }
  return session;
}
async function transport(
  path: string,
  cookie: string,
  input?: unknown,
  extraHeaders = {},
) {
  return new Promise<Response>((resolveResponse, reject) => {
    const stream = connection(cookie).request({
      ":path": path,
      ":method": input === undefined ? "GET" : "POST",
      origin,
      cookie,
      "content-type": "application/json",
      "ngrok-skip-browser-warning": "airl-rehearsal",
      ...extraHeaders,
    });
    let status = 0;
    const headers = new Headers();
    const chunks: Buffer[] = [];
    stream.on("response", (values) => {
      status = Number(values[":status"]);
      for (const [key, value] of Object.entries(values)) {
        if (key.startsWith(":") || value === undefined) continue;
        for (const item of Array.isArray(value) ? value : [String(value)])
          headers.append(key, item);
      }
    });
    stream.on("data", (chunk) =>
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk),
    );
    stream.on("error", (error) =>
      reject(
        new Error(
          `${path} transport ${(error as { code?: string }).code || error.name}`,
        ),
      ),
    );
    stream.on("end", () => {
      try {
        resolveResponse(
          new Response(Buffer.concat(chunks), { status, headers }),
        );
      } catch (error) {
        reject(error);
      }
    });
    stream.setTimeout(15000, () => {
      stream.close();
      reject(new Error(`${path} request timed out`));
    });
    stream.end(input === undefined ? undefined : JSON.stringify(input));
  });
}
const latency: number[] = [];
const requests: Record<string, number> = {};
const memoryPeaks: Record<string, number> = {};
let responseBytes = 0;
let eventBytes = 0;
let productionNotices = 0;
let origin = "";
let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
let sampler: ReturnType<typeof setInterval> | undefined;
let finalJob: any;
let previewDuringCritic = false;
const participants: {
  cookie: string;
  votes: number;
  connected: boolean;
  published: boolean;
}[] = [];

async function waitFor(predicate: () => boolean, timeout = 10000) {
  const deadline = Date.now() + timeout;
  while (!predicate()) {
    if (Date.now() > deadline)
      throw new Error("Rehearsal condition timed out.");
    await new Promise((resolveWait) => setTimeout(resolveWait, 100));
  }
}
async function request(
  path: string,
  cookie = "",
  input?: unknown,
  expected = 200,
  extraHeaders = {},
) {
  requests[path.split("?")[0]] = (requests[path.split("?")[0]] || 0) + 1;
  const before = Date.now();
  const response = await transport(path, cookie, input, extraHeaders);
  const text = await response.text();
  latency.push(Date.now() - before);
  responseBytes += Buffer.byteLength(text);
  assert.equal(response.status, expected, `${path} HTTP status`);
  return { response, data: JSON.parse(text) };
}
function cookie(response: Response) {
  const value = response.headers.get("set-cookie") || "";
  assert.match(value, /HttpOnly/i);
  assert.match(value, /Secure/i);
  assert.match(value, /SameSite=Strict/i);
  return value.split(";")[0];
}
function track(action: Promise<unknown>) {
  pending.add(action);
  void action
    .catch((error) => errors.push(error.message))
    .finally(() => pending.delete(action));
}
async function publishedState(participant: (typeof participants)[number]) {
  const { data } = await request("/api/production", participant.cookie);
  for (const job of data.jobs) {
    if (job.status !== "published")
      assert.equal(job.manifest, null, "Unpublished media remains private");
    if (job.status === "published") participant.published = true;
  }
}
async function events(participant: (typeof participants)[number]) {
  const stream = connection(participant.cookie).request({
    ":path": "/api/live/rooms/barangay-2099/events",
    cookie: participant.cookie,
    "ngrok-skip-browser-warning": "airl-rehearsal",
  });
  const stop = () => stream.close();
  abort.signal.addEventListener("abort", stop, { once: true });
  await new Promise<void>((ready, reject) => {
    stream.once("response", (headers) => {
      try {
        assert.equal(headers[":status"], 200);
        assert.match(String(headers["content-type"]), /text\/event-stream/);
        ready();
      } catch (error) {
        reject(error);
      }
    });
    stream.once("error", reject);
    stream.end();
  });
  let buffer = "";
  const decoder = new TextDecoder();
  for await (const chunk of stream) {
    eventBytes += chunk.byteLength;
    buffer += decoder.decode(chunk, { stream: true });
    let boundary;
    while ((boundary = buffer.indexOf("\n\n")) !== -1) {
      const event = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      if (event.startsWith("data: ")) {
        const snapshot = JSON.parse(event.slice(6));
        participant.connected = true;
        participant.votes = snapshot.totalVotes;
      }
      if (event.startsWith("event: production")) {
        productionNotices++;
        track(publishedState(participant));
      }
    }
  }
}
function sampleMemory() {
  try {
    const output = execFileSync("ps", ["-Ao", "rss=,command="], {
      encoding: "utf8",
    });
    for (const line of output.split("\n")) {
      const match = line.match(/^\s*(\d+)\s+(.+)$/);
      if (!match) continue;
      const command = match[2];
      const name = command.includes("scripts/tunnel-server.mjs")
        ? "webServerMiB"
        : command.includes("scripts/production-worker.ts")
          ? "workerMiB"
          : command.includes("ngrok http")
            ? "ngrokMiB"
            : /ollama.*runner|llama-server/.test(command)
              ? "modelRunnerMiB"
              : "";
      if (name)
        memoryPeaks[name] = Math.max(
          memoryPeaks[name] || 0,
          Number(match[1]) / 1024,
        );
    }
  } catch {}
}
async function main() {
  origin = await new Promise<string>((resolveOrigin, reject) => {
    let output = "";
    const timeout = setTimeout(
      () => reject(new Error("Tunnel startup timed out.")),
      65000,
    );
    tunnel.stdout!.on("data", (chunk) => {
      output += chunk.toString();
      const match = output.match(
        /Audience and QR destination (https:\/\/[^/]+)\/live/,
      );
      if (match) {
        clearTimeout(timeout);
        resolveOrigin(match[1]);
      }
    });
    tunnel.once("exit", () => {
      clearTimeout(timeout);
      reject(new Error("Tunnel stopped before rehearsal."));
    });
  });
  console.log("Public HTTPS rehearsal started for 35 independent sessions.");
  sampler = setInterval(sampleMemory, 1000);
  phase = "signin";
  const auth = await request("/api/account", "", {
    action: "signin",
    email,
    password,
  });
  const admin = cookie(auth.response);
  assert.equal(auth.data.account.role, "admin");
  const initial = await request("/api/live/rooms/barangay-2099/state");
  const roundId = initial.data.room.roundId;
  phase = "joining";
  for (let index = 0; index < 35; index++) {
    const joined = await request("/api/live/session", "", {});
    participants.push({
      cookie: cookie(joined.response),
      votes: 0,
      connected: false,
      published: false,
    });
  }
  phase = "streaming";
  for (const participant of participants)
    tasks.push(
      events(participant).catch((error) => {
        if (!abort.signal.aborted)
          errors.push(
            `stream transport ${(error as { cause?: { code?: string } }).cause?.code || error.message}`,
          );
      }),
    );
  await waitFor(() =>
    participants.every((participant) => participant.connected),
  );
  phase = "voting";
  await Promise.all(
    participants.map((participant, index) =>
      request("/api/live/rooms/barangay-2099/vote", participant.cookie, {
        roundId,
        optionId: index < 23 ? "karaoke" : "taho",
      }),
    ),
  );
  await request("/api/live/rooms/barangay-2099/vote", participants[0].cookie, {
    roundId,
    optionId: "karaoke",
  });
  await request(
    "/api/live/rooms/barangay-2099/vote",
    participants[0].cookie,
    { roundId, optionId: "taho" },
    409,
  );
  await waitFor(() =>
    participants.every((participant) => participant.votes === 35),
  );
  const counted = await request("/api/live/rooms/barangay-2099/state");
  assert.equal(counted.data.room.totalVotes, 35);
  await request("/api/live/rooms/barangay-2099/next", admin, { roundId }, 403, {
    Origin: "https://untrusted.example",
  });
  const wrongHost = await fetch(
    "http://127.0.0.1:3456/api/live/rooms/barangay-2099/state",
    { headers: { Host: "untrusted.example" } },
  );
  assert.equal(wrongHost.status, 421);
  await request("/api/live/session", admin, {});
  phase = "production";
  const productionStarted = Date.now();
  const closed = await request("/api/live/rooms/barangay-2099/close", admin, {
    roundId,
    provider: { mode: "ollama", model: "qwen3:4b-instruct", consent: false },
  });
  assert.equal(closed.data.room.winner, "karaoke");
  while (Date.now() - productionStarted < 140000) {
    const status = await request("/api/production?operator=1", admin);
    finalJob = status.data.jobs[0];
    if (finalJob?.status === "failed")
      throw new Error(
        "The real local production failed. Inspect the isolated rehearsal database.",
      );
    if (finalJob?.manifest && finalJob.progress?.stage === "Creative Critic")
      previewDuringCritic = true;
    if (finalJob?.status === "review") break;
    await request(
      "/api/live/rooms/barangay-2099/state",
      participants[0].cookie,
    );
    await new Promise((resolveWait) => setTimeout(resolveWait, 1000));
  }
  assert.equal(finalJob?.status, "review");
  const productionMs = Date.now() - productionStarted;
  for (const stage of [
    "Story Director",
    "Screenwriter",
    "Visual Producer",
    "Creative Critic",
  ])
    assert.ok(
      finalJob.events.some(
        (event: any) => event.stage === stage && event.status === "succeeded",
      ),
    );
  await request("/api/production", admin, {
    jobId: finalJob.id,
    action: "publish",
  });
  await request("/api/production", admin, {
    jobId: finalJob.id,
    action: "publish",
  });
  await waitFor(() =>
    participants.every((participant) => participant.published),
  );
  assert.equal(errors.length, 0, errors.join("\n"));
  console.log(
    `35 votes and all audience publication notices verified. Ollama production ${(productionMs / 1000).toFixed(1)} seconds.`,
  );

  browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const browserRequests: Record<string, number> = {};
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("request", (event) => {
    const path = new URL(event.url()).pathname;
    browserRequests[path] = (browserRequests[path] || 0) + 1;
  });
  await page.goto(origin + "/live/barangay-2099");
  const visit = page.getByRole("button", { name: /visit site/i });
  await expect(
    page.getByRole("heading", { name: "Choose the next chapter." }).or(visit),
  ).toBeVisible({ timeout: 15000 });
  if (await visit.isVisible()) await visit.click();
  const preview = page.locator(".episode-gallery .remotion-preview");
  await expect(preview).toBeVisible({ timeout: 20000 });
  await preview.getByRole("button", { name: "Play video", exact: true }).tap();
  await expect
    .poll(async () => Number(await preview.getAttribute("data-frame")))
    .toBeGreaterThan(15);
  await preview.getByRole("button", { name: "Pause video", exact: true }).tap();
  const frame = finalJob.manifest.scenes[0].durationSeconds * 30 + 20;
  await preview
    .getByRole("slider", { name: "Seek episode" })
    .fill(String(frame));
  await expect(preview).toHaveAttribute("data-frame", String(frame));
  const dialogue = preview
    .getByText(finalJob.manifest.scenes[1].dialogue[0].text, { exact: true })
    .first();
  await expect(dialogue).toBeVisible();
  await preview.getByLabel("Captions", { exact: true }).uncheck();
  await expect(dialogue).not.toBeVisible();
  await preview.getByLabel("Captions", { exact: true }).check();
  await expect(dialogue).toBeVisible();
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
  const beforeIdle = browserRequests["/api/production"] || 0;
  await page.waitForTimeout(16000);
  const idleProductionRequests =
    (browserRequests["/api/production"] || 0) - beforeIdle;
  assert.ok(
    idleProductionRequests <= 1,
    "Idle audience polling should be bounded",
  );
  const transfer = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .reduce(
        (sum, resource) =>
          sum + (resource as PerformanceResourceTiming).transferSize,
        0,
      ),
  );
  await page.screenshot({
    path: resolve(directory, "mobile-public-playback.png"),
    fullPage: true,
  });
  await context.close();
  assert.equal(errors.length, 0, errors.join("\n"));
  await Promise.all([...pending]);
  const sorted = [...latency].sort((a, b) => a - b);
  const output = {
    status: "passed",
    audienceSessions: 35,
    physicalDevices: 0,
    mode: "ollama",
    model: "qwen3:4b-instruct",
    origin,
    database,
    elapsedMs: Date.now() - started,
    productionMs,
    previewDuringCritic,
    winningChoice: finalJob.choice,
    productionAttempts: finalJob.attempts,
    runId: finalJob.run_id,
    allVotesObserved: true,
    allPublicationNoticesObserved: true,
    secureCookies: true,
    foreignOriginRejected: true,
    wrongHostRejected: true,
    publicDraftsHidden: true,
    mobileChromePlayback: true,
    seeking: true,
    captions: true,
    idleProductionRequestsIn16Seconds: idleProductionRequests,
    browserRequests,
    browserResourceTransferBytes: transfer,
    transport: "HTTP/2, one reused connection per simulated audience session",
    connections: connections.size,
    requests,
    httpRequests:
      Object.values(requests).reduce((sum, value) => sum + value, 0) + 35,
    responseBytes,
    eventBytes,
    productionNotices,
    latencyMs: {
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      maximum: sorted.at(-1),
    },
    sampledMemoryPeaksMiB: memoryPeaks,
    errors,
  };
  writeFileSync(
    resolve(directory, "results.json"),
    JSON.stringify(output, null, 2),
  );
  console.log(JSON.stringify(output, null, 2));
  console.log("Rehearsal results saved", resolve(directory, "results.json"));
}
main()
  .catch((error) => {
    writeFileSync(
      resolve(directory, "failed-results.json"),
      JSON.stringify(
        {
          status: "failed",
          error: error.message,
          phase,
          audienceSessions: participants.length,
          requests,
          latency,
          origin,
          errors,
        },
        null,
        2,
      ),
    );
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    clearInterval(sampler);
    abort.abort();
    await Promise.allSettled(tasks);
    for (const connection of connections.values()) connection.destroy();
    await browser?.close();
    tunnel.kill("SIGTERM");
  });
