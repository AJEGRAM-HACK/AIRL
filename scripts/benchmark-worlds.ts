import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import assert from "node:assert/strict";
import { PlatformStore } from "../src/server/platform/store";
import { LiveStore } from "../src/server/live/store";
import { RoomJobs, runRoomJob } from "../src/server/production/room-jobs";
import { pitches, answerStory } from "../src/server/platform/ai";
import { inferenceLimits } from "../src/ai/config/limits";
const fixture = JSON.parse(
  readFileSync("benchmarks/local-inputs.json", "utf8"),
);
const directory = resolve(`.data/benchmarks/${Date.now()}`);
mkdirSync(directory, { recursive: true });
process.env.AIRL_LIVE_DB_PATH = resolve(directory, "benchmark.sqlite");
process.env.AIRL_ALLOW_LIVE_REQUESTS = "false";
process.env.OLLAMA_CONTEXT_WINDOW = String(fixture.settings.contextWindow);
process.env.AIRL_AI_REQUEST_TIMEOUT_MS = String(fixture.settings.timeoutMs);
process.env.AIRL_AI_MAX_OUTPUT_TOKENS = String(
  fixture.settings.maxOutputTokens,
);
const store = new PlatformStore(),
  selection = { mode: "ollama" as const, model: fixture.model, consent: false };
const results: any[] = [];
async function episode(id: string, option: string, token: string) {
  const live = new LiveStore(store.path, id),
    jobs = new RoomJobs(store.path);
  const start = Date.now();
  let previewDuringCritic = false;
  try {
    live.join(token);
    const round = live.snapshot();
    live.vote(token, round.roundId, option);
    live.closeRound(token, round.roundId, selection);
    let done = false;
    const running = runRoomJob(store.path).finally(() => {
      done = true;
    });
    while (!done) {
      const job = jobs.list(id, true)[0];
      if (
        job?.status === "running" &&
        job.manifest &&
        job.progress?.stage === "Creative Critic"
      )
        previewDuringCritic = true;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    await running;
    const job = jobs.list(id, true)[0];
    assert.equal(job.status, "review", JSON.stringify(job.events));
    assert.ok(
      previewDuringCritic,
      "Playable manifest existed while Critic was running",
    );
    jobs.action(job.id, "publish");
    jobs.action(job.id, "publish");
    const result = {
      task: id === "barangay-2099" ? "official-episode" : "private-episode",
      mode: "ollama",
      model: fixture.model,
      elapsedMs: Date.now() - start,
      previewDuringCritic,
      attempts: job.attempts,
      validationFailures: job.events.filter(
        (event) => event.status === "failed",
      ).length,
      events: job.events,
      episodeId: job.run_id,
      choice: job.choice,
      manifest: job.manifest,
      quality: {
        threeScenes: job.manifest.scenes.length === 3,
        review:
          "Critic approved; human creative quality review remains recommended",
      },
    };
    results.push(result);
    console.log(
      JSON.stringify({
        task: result.task,
        elapsedMs: result.elapsedMs,
        previewDuringCritic,
        attempts: result.attempts,
      }),
    );
    return job.run_id!;
  } finally {
    live.dispose();
    jobs.close();
  }
}
async function main() {
  const adminToken = store.signup(
    "benchmark-admin@example.test",
    "Benchmark admin",
    "benchmark-password-1234",
  );
  store.bootstrapAdmin("benchmark-admin@example.test");
  const admin = store.requireAccount(adminToken);
  const official = await episode(
    "barangay-2099",
    fixture.officialChoice,
    adminToken,
  );
  const pitchStart = Date.now();
  const generated = await pitches(
    store,
    admin,
    selection,
    fixture.pitchInterests,
  );
  results.push({
    task: "universe-pitches",
    elapsedMs: Date.now() - pitchStart,
    ...generated,
    quality: {
      threePitches: generated.result.pitches.length === 3,
      review: "Inspect originality, preference fidelity and editability",
    },
  });
  console.log(
    JSON.stringify({
      task: "universe-pitches",
      elapsedMs: Date.now() - pitchStart,
    }),
  );
  const creatorToken = store.signup(
    "benchmark-creator@example.test",
    "Benchmark creator",
    "benchmark-password-1234",
  );
  store.grant(admin, store.requireAccount(creatorToken).id, "creator");
  const creator = store.requireAccount(creatorToken);
  const world = store.create(creator, generated.result.pitches[0]);
  store.update(creator, world.id, {
    settings: { ...world.settings, era: "A century after first contact" },
  });
  const privateEpisode = await episode(world.id, "option-1", creatorToken);
  assert.throws(() => store.getWorld(world.id, null));
  const answerStart = Date.now();
  const answer = await answerStory(store, "barangay-2099", admin, selection, {
    question: fixture.storyQuestion,
    episodeId: official,
    characterId: "tita-nena",
    scope: "episode",
  });
  assert.ok(answer.citations.length);
  assert.ok(answer.citations.every((source) => source.episodeId === official));
  results.push({
    task: "story-answer",
    elapsedMs: Date.now() - answerStart,
    ...answer,
    quality: {
      citationsInRequestedEpisode: true,
      review: "Compare answer to cited dialogue",
    },
  });
  console.log(
    JSON.stringify({
      task: "story-answer",
      elapsedMs: Date.now() - answerStart,
      answer: answer.result,
    }),
  );
  writeFileSync(
    resolve(directory, "results.json"),
    JSON.stringify(
      {
        fixture,
        settings: inferenceLimits(),
        results,
        privateUniverse: world.id,
        privateEpisode,
      },
      null,
      2,
    ),
  );
  console.log("Benchmark saved", resolve(directory, "results.json"));
}
main()
  .catch((error) => {
    writeFileSync(
      resolve(directory, "failed-results.json"),
      JSON.stringify(
        {
          fixture,
          results,
          error: error instanceof Error ? error.message : "Benchmark failed",
        },
        null,
        2,
      ),
    );
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => store.close());
