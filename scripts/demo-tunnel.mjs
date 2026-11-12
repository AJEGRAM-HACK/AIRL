import { createServer } from "node:net";
import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const port = Number(process.env.AIRL_TUNNEL_PORT || 3456);
if (!Number.isInteger(port) || port < 1024 || port > 65535 || port === 11434)
  throw new Error("Invalid AIRL_TUNNEL_PORT.");
if (!existsSync(".next/BUILD_ID"))
  throw new Error("Run npm run build before starting the tunnel.");
const config = spawnSync("ngrok", ["config", "check"], { stdio: "ignore" });
if (config.status !== 0)
  throw new Error(
    "Install ngrok and save your free account authtoken locally first.",
  );
async function requireFreePort(value) {
  await new Promise((resolvePort, reject) => {
    const probe = createServer();
    probe.once("error", () =>
      reject(new Error(`Loopback port ${value} is already in use.`)),
    );
    probe.listen(value, "127.0.0.1", () => probe.close(resolvePort));
  });
}
await requireFreePort(port);
await requireFreePort(4040);
const children = new Set();
let stopping = false;
let ngrokFailure = "";
function stop(status = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill("SIGTERM");
  process.exitCode = status;
}
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => stop());
function child(command, args, options = {}) {
  const processChild = spawn(command, args, options);
  children.add(processChild);
  processChild.on("error", () => {
    console.error("A demo process could not start.");
    stop(1);
  });
  processChild.on("exit", () => {
    children.delete(processChild);
    if (!stopping) {
      console.error(
        `A demo process stopped${ngrokFailure ? ` (${ngrokFailure})` : ""}. Restart npm run demo:tunnel.`,
      );
      stop(1);
    }
  });
  return processChild;
}
// Inspection is disabled so the agent does not record account or BYOK request bodies.
const agent = child(
  "ngrok",
  [
    "http",
    `http://127.0.0.1:${port}`,
    "--inspect=false",
    "--log=stdout",
    "--log-format=json",
  ],
  { stdio: ["ignore", "pipe", "pipe"] },
);
for (const output of [agent.stdout, agent.stderr])
  output.on("data", (chunk) => {
    const code = chunk.toString().match(/ERR_NGROK_\d+/)?.[0];
    if (code) ngrokFailure = code;
  });
try {
  let origin;
  const deadline = Date.now() + 30000;
  while (!stopping && Date.now() < deadline) {
    try {
      const response = await fetch("http://127.0.0.1:4040/api/tunnels", {
        signal: AbortSignal.timeout(1000),
      });
      const data = await response.json();
      origin = data.tunnels?.find(
        (tunnel) =>
          tunnel.proto === "https" &&
          tunnel.config?.addr === `http://127.0.0.1:${port}`,
      )?.public_url;
      if (origin) break;
    } catch {}
    await new Promise((resolveWait) => setTimeout(resolveWait, 300));
  }
  if (!origin || stopping)
    throw new Error(
      "ngrok did not establish its HTTPS endpoint. Check account authentication and connectivity.",
    );
  const environment = {
    ...process.env,
    NODE_ENV: "production",
    AIRL_PUBLIC_ORIGIN: origin,
    AIRL_TUNNEL_PORT: String(port),
    AIRL_LIVE_DB_PATH: resolve(
      process.env.AIRL_LIVE_DB_PATH || ".data/airl-live.sqlite",
    ),
    AIRL_ALLOW_LIVE_REQUESTS: "false",
  };
  delete environment.NODE_OPTIONS;
  const server = child(process.execPath, ["scripts/tunnel-server.mjs"], {
    env: environment,
    stdio: ["ignore", "inherit", "inherit", "ipc"],
  });
  await new Promise((resolveReady, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("AIRL did not become ready within 30 seconds.")),
      30000,
    );
    server.on("message", (message) => {
      if (message.ready) {
        clearTimeout(timeout);
        resolveReady();
      }
    });
    server.once("exit", () => {
      clearTimeout(timeout);
      reject(new Error("AIRL stopped before becoming ready."));
    });
  });
  child(
    process.execPath,
    [
      "node_modules/tsx/dist/cli.mjs",
      "scripts/production-worker.ts",
      "--watch",
    ],
    { env: environment, stdio: ["ignore", "inherit", "inherit"] },
  );
  if (process.platform === "darwin")
    child("/usr/bin/caffeinate", ["-i", "-w", String(process.pid)], {
      stdio: "ignore",
    });
  console.log(
    `Audience and QR destination ${origin}/live/barangay-2099\nPresenter Journey ${origin}/journey\nStudio and QR ${origin}/studio/barangay-2099\nKeep this Mac plugged in, its lid open, and this terminal running. Press Ctrl+C to stop.`,
  );
} catch (error) {
  console.error(error.message);
  stop(1);
}
