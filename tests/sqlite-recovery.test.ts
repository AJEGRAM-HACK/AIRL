import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LiveStore } from '../src/server/live/store';
import { ProductionStore } from '../src/server/production/store';
import { RoomJobs } from '../src/server/production/room-jobs';
import { canonicalCharacters } from '../src/ai/memory/canonical';

test('store initialization and canonical reads wait for another process to release a database lock', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'airl-db-lock-'));
  const path = join(directory, 'room.sqlite');
  new LiveStore(path).dispose();
  new ProductionStore(path).close();
  try {
    const checks = [
      () => new LiveStore(path).dispose(),
      () => new ProductionStore(path).close(),
      () => new RoomJobs(path).close(),
      () => assert.equal(canonicalCharacters(path).length, 3),
    ];
    for (const check of checks) {
      const child = spawn(process.execPath, ['-e', `
        const {DatabaseSync}=require('node:sqlite');
        const db=new DatabaseSync(process.argv[1],{timeout:5000});
        db.exec('PRAGMA journal_mode=DELETE; BEGIN EXCLUSIVE');
        process.stdout.write('locked');
        Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,350);
        db.exec('COMMIT');db.close();
      `, path], { stdio: ['ignore', 'pipe', 'pipe'] });
      const exited = once(child, 'exit');
      try {
        await once(child.stdout!, 'data');
        check();
        const [code] = await exited;
        assert.equal(code, 0);
      } finally { child.kill(); }
    }
  } finally { rmSync(directory, { recursive:true, force:true }); }
});
