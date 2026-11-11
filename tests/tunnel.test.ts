import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

test("tunnel upstream rejects untrusted origins and the Ollama port before listening", () => {
  for (const origin of [
    "http://airl.ngrok-free.dev",
    "https://attacker.example",
    "https://airl.ngrok-free.dev/path",
    "https://user:password@airl.ngrok-free.dev",
    "https://airl.ngrok-free.dev:444",
  ]) {
    const result = spawnSync(process.execPath, ["scripts/tunnel-server.mjs"], {
      env: { ...process.env, AIRL_PUBLIC_ORIGIN: origin },
      encoding: "utf8",
      timeout: 10000,
    });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /exact HTTPS ngrok development origin/);
  }
  const result = spawnSync(process.execPath, ["scripts/tunnel-server.mjs"], {
    env: {
      ...process.env,
      AIRL_PUBLIC_ORIGIN: "https://airl.ngrok-free.dev",
      AIRL_TUNNEL_PORT: "11434",
    },
    encoding: "utf8",
    timeout: 10000,
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /excluding the Ollama port/);
});
