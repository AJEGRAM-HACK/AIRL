import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

test('LAN launcher rejects wildcard, loopback, public and unassigned addresses before opening a listener', () => {
  for (const host of ['0.0.0.0', '127.0.0.1', '8.8.8.8', '192.168.255.254']) {
    const result = spawnSync(process.execPath, ['scripts/demo-lan.mjs'], {
      env: { ...process.env, AIRL_DEMO_HOST: host }, encoding: 'utf8', timeout: 10000,
    });
    assert.equal(result.status, 1, host);
    assert.match(result.stderr, /private IPv4 address assigned to this Mac/);
  }
});
