import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { PlatformStore } from "../src/server/platform/store";
import { LiveStore } from "../src/server/live/store";
import { roomEventStream } from "../src/server/live/stream";

const decode = (value?: Uint8Array) => new TextDecoder().decode(value);
test("live stream emits vote changes and content-free production notices, then closes on access revocation", async () => {
  const directory = mkdtempSync(join(tmpdir(), "airl-stream-"));
  const path = join(directory, "db.sqlite");
  const store = new PlatformStore(path);
  const token = store.signup(
    "stream@example.test",
    "Owner",
    "test-password-1234",
  );
  store.bootstrapAdmin("stream@example.test");
  const owner = store.requireAccount(token);
  const world = store.create(owner, {
    title: "Stream test",
    characters: [{ id: "guide", name: "Guide" }],
  });
  store.update(owner, world.id, { visibility: "public" });
  const live = new LiveStore(path, world.id);
  const abort = new AbortController();
  const reader = roomEventStream(
    path,
    world.id,
    undefined,
    abort.signal,
  ).getReader();
  try {
    assert.match(decode((await reader.read()).value), /^data:/);
    assert.equal(
      decode((await reader.read()).value),
      "event: production\ndata: {}\n\n",
    );
    const participant = live.join();
    const round = live.snapshot();
    live.vote(participant, round.roundId, round.options[0].id);
    const changed = decode((await reader.read()).value);
    assert.match(changed, /"totalVotes":1/);
    live.join(token);
    live.closeRound(token, round.roundId, { mode: "demo" });
    assert.match(decode((await reader.read()).value), /"status":"closed"/);
    assert.equal(
      decode((await reader.read()).value),
      "event: production\ndata: {}\n\n",
    );
    store.update(owner, world.id, { visibility: "private" });
    assert.equal((await reader.read()).done, true);
  } finally {
    abort.abort();
    await reader.cancel();
    live.dispose();
    store.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
