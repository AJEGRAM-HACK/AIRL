import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PlatformStore } from "../src/server/platform/store";
import { LiveStore } from "../src/server/live/store";
import { RoomJobs, runRoomJob } from "../src/server/production/room-jobs";
import { retrieveStory, answerStory, pitches } from "../src/server/platform/ai";
function setup() {
  const directory = mkdtempSync(join(tmpdir(), "airl-platform-"));
  const path = join(directory, "db.sqlite");
  const store = new PlatformStore(path);
  const token = store.signup(
    "admin@example.test",
    "Admin",
    "test-password-1234",
  );
  store.bootstrapAdmin("admin@example.test");
  const admin = store.requireAccount(token);
  return {
    path,
    store,
    token,
    admin,
    cleanup() {
      store.close();
      rmSync(directory, { recursive: true, force: true });
    },
  };
}
const character = {
  id: "guide",
  name: "Guide",
  voice: "Kind and concise",
  personality: ["curious"],
};
test("accounts default to viewers, verify passwords, invalidate signout and keep preferences private", () => {
  const t = setup();
  try {
    const token = t.store.signup(
      "viewer@example.test",
      "Viewer",
      "test-password-1234",
    );
    const viewer = t.store.requireAccount(token);
    assert.equal(viewer.role, "viewer");
    assert.throws(() => t.store.create(viewer, { title: "Forbidden" }));
    assert.throws(() =>
      t.store.signin("viewer@example.test", "wrong password"),
    );
    const signed = t.store.signin("viewer@example.test", "test-password-1234");
    t.store.interests(viewer, { genres: ["Mystery"], idea: "Private idea" });
    assert.equal(t.store.requireAccount(signed).interests.idea, "Private idea");
    assert.throws(() => t.store.accounts(viewer));
    t.store.signout(signed);
    assert.equal(t.store.account(signed), null);
    assert.equal(
      JSON.stringify(t.store.accounts(t.admin)).includes("password"),
      false,
    );
  } finally {
    t.cleanup();
  }
});
test("private universes, characters, relationships and assets are isolated; official edits require admin", () => {
  const t = setup();
  try {
    const a = t.store.signup("a@example.test", "A", "test-password-1234"),
      b = t.store.signup("b@example.test", "B", "test-password-1234");
    for (const token of [a, b])
      t.store.grant(t.admin, t.store.requireAccount(token).id, "creator");
    const creator = t.store.requireAccount(a),
      other = t.store.requireAccount(b);
    const world = t.store.create(creator, {
        title: "Private",
        characters: [character],
      }),
      second = t.store.create(other, {
        title: "Other",
        characters: [character],
      });
    assert.throws(() => t.store.getWorld(world.id, other));
    assert.throws(() => t.store.characters(world.id, null));
    assert.throws(() => t.store.getWorld("barangay-2099", creator, true));
    assert.equal(t.store.characters(second.id, other)[0].id, "guide");
    assert.throws(() =>
      t.store.relationship(creator, world.id, {
        from: "guide",
        to: "captain-bot",
        description: "Invalid cross-world",
      }),
    );
    assert.throws(() =>
      t.store.saveCharacter(creator, world.id, {
        ...character,
        color: "url(secret)",
      }),
    );
    const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    const asset = t.store.addAsset(
      creator,
      world.id,
      "reference",
      "image/png",
      png,
    );
    assert.throws(() => t.store.asset(asset, other));
    assert.throws(() =>
      t.store.saveCharacter(other, second.id, {
        ...character,
        assets: [asset],
      }),
    );
    t.store.update(creator, world.id, { visibility: "public" });
    assert.equal(t.store.getWorld(world.id, null).visibility, "public");
    t.store.remove(creator, world.id);
    assert.throws(() => t.store.getWorld(world.id, null));
    t.store.update(creator, world.id, { restore: true });
    assert.equal(t.store.getWorld(world.id, creator).archived, false);
  } finally {
    t.cleanup();
  }
});
test("private generation snapshots inputs, retains previews and publishes corrected canon once in story order", async () => {
  const t = setup();
  try {
    const world = t.store.create(t.admin, {
      title: "Observatory",
      characters: [character],
      firstVote: ["Open the dome", "Wait for dawn", "Ask a guide"],
    });
    const live = new LiveStore(t.path, world.id);
    try {
      live.join(t.token);
      const round = live.snapshot();
      live.vote(t.token, round.roundId, "option-1");
      live.closeRound(t.token, round.roundId, { mode: "demo" });
      assert.throws(() => t.store.deleteCharacter(t.admin, world.id, "guide"));
      assert.equal(live.snapshot(round.roundId).status, "closed");
      const official = new LiveStore(t.path);
      try {
        assert.throws(() => official.snapshot(round.roundId));
      } finally {
        official.dispose();
      }
      t.store.update(t.admin, world.id, {
        settings: { setting: "Changed after enqueue" },
      });
      await runRoomJob(t.path);
      const jobs = new RoomJobs(t.path);
      try {
        const job = jobs.list(world.id, true)[0];
        assert.equal(job.status, "review");
        assert.equal(job.manifest.cast[0].id, "guide");
        assert.ok(job.previewVersion);
        assert.equal(jobs.list(world.id, false)[0].manifest, null);
        const stored = t.store.db
          .prepare("SELECT input FROM productions WHERE id=?")
          .get(job.run_id!)!;
        assert.equal(
          JSON.parse(String(stored.input)).snapshot.world.title,
          "Observatory",
        );
        assert.notEqual(
          JSON.parse(String(stored.input)).snapshot.world.setting,
          "Changed after enqueue",
        );
        const corrections = {
          memoryUpdates: [
            {
              characterId: "guide",
              memory: "Opened the dome.",
              sceneId: "scene-1",
            },
          ],
          relationshipUpdates: [],
        };
        jobs.action(job.id, "publish", corrections);
        jobs.action(job.id, "publish", corrections);
        assert.equal(t.store.episodes(world.id, t.admin).length, 1);
        assert.equal(
          t.store
            .timeline(world.id, t.admin)
            .filter((row) => row.content === "Opened the dome.").length,
          1,
        );
        assert.equal(t.store.episodes("barangay-2099", null).length, 0);
        assert.equal(
          t.store.characters(world.id, t.admin)[0].memories.at(-1),
          "Opened the dome.",
        );
      } finally {
        jobs.close();
      }
    } finally {
      live.dispose();
    }
  } finally {
    t.cleanup();
  }
});
test("story retrieval applies universe, story order, spoiler and draft permissions before inference", async () => {
  const t = setup();
  try {
    const world = t.store.create(t.admin, {
      title: "Story",
      characters: [character],
    });
    const live = new LiveStore(t.path, world.id),
      jobs = new RoomJobs(t.path);
    try {
      live.join(t.token);
      for (let i = 0; i < 2; i++) {
        const round = live.snapshot();
        live.closeRound(t.token, round.roundId, { mode: "demo" });
        await runRoomJob(t.path);
        const job = jobs.list(world.id, true)[0];
        jobs.action(job.id, "publish", {
          memoryUpdates: [
            { characterId: "guide", memory: `Secret chapter ${i + 1}` },
          ],
          relationshipUpdates: [],
        });
        live.nextRound(t.token, round.roundId);
      }
      const episodes = t.store.episodes(world.id, t.admin);
      const through = retrieveStory(t.store, world.id, t.admin, {
        episodeId: episodes[0].episode_id,
        scope: "through",
      });
      assert.equal(
        through.some((source) => source.text.includes("Secret chapter 2")),
        false,
      );
      assert.equal(
        through.every((source) => source.storyOrder <= 1),
        true,
      );
      assert.throws(() =>
        retrieveStory(t.store, world.id, null, { scope: "latest" }),
      );
      t.store.update(t.admin, world.id, { visibility: "public" });
      assert.throws(() =>
        retrieveStory(t.store, world.id, null, {
          scope: "latest",
          draft: true,
          runId: "anything",
        }),
      );
      const answer = await answerStory(
        t.store,
        world.id,
        t.admin,
        { mode: "demo", consent: false },
        {
          question: "What happened?",
          episodeId: episodes[0].episode_id,
          scope: "episode",
        },
      );
      assert.ok(answer.citations.length);
      assert.equal(
        answer.citations.every(
          (source) => source.episodeId === episodes[0].episode_id,
        ),
        true,
      );
    } finally {
      live.dispose();
      jobs.close();
    }
  } finally {
    t.cleanup();
  }
});
test("creator pitch preferences can be overridden without changing the private profile", async () => {
  const t = setup();
  try {
    t.store.interests(t.admin, { genres: ["Mystery"], settings: ["Old city"] });
    const actor = t.store.requireAccount(t.token);
    const result = await pitches(
      t.store,
      actor,
      { mode: "demo", consent: false },
      { settings: ["Space station"] },
    );
    assert.equal(result.result.pitches.length, 3);
    assert.equal(result.result.pitches[0].settings.setting, "Space station");
    assert.deepEqual(t.store.requireAccount(t.token).interests.settings, [
      "Old city",
    ]);
  } finally {
    t.cleanup();
  }
});

test("unavailable selected models persist the connection reason and consume bounded retry attempts (mock transport)", async () => {
  const t = setup();
  const originalFetch = globalThis.fetch;
  const world = t.store.create(t.admin, {
    title: "Unavailable model",
    characters: [character],
  });
  const live = new LiveStore(t.path, world.id),
    jobs = new RoomJobs(t.path);
  try {
    globalThis.fetch = async () =>
      Response.json({ models: [{ name: "qwen3:4b-instruct" }] });
    live.join(t.token);
    live.closeRound(t.token, live.snapshot().roundId, {
      mode: "ollama",
      model: "missing:model",
    });
    for (let attempt = 1; attempt <= 3; attempt++) {
      await runRoomJob(t.path);
      const job = jobs.list(world.id, true)[0];
      assert.equal(job.status, "failed");
      assert.equal(job.attempts, attempt);
      assert.equal(job.events.at(-1)?.failure?.code, "model_not_installed");
      assert.equal(job.run_id, null);
      assert.deepEqual(jobs.list(world.id, false)[0].events, []);
      if (attempt < 3) jobs.action(job.id, "retry");
      else assert.throws(() => jobs.action(job.id, "retry"));
    }
  } finally {
    globalThis.fetch = originalFetch;
    live.dispose();
    jobs.close();
    t.cleanup();
  }
});
