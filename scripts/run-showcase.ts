import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdirSync, mkdtempSync } from 'node:fs';
import { join, resolve } from 'node:path';
import showcase from '../demo/barangay-2099.json';
import { firstProduction } from '../src/lib/first-production';
import { PlatformStore } from '../src/server/platform/store';

const dataDir = resolve('.data');
mkdirSync(dataDir, { recursive: true });
const databasePath = join(mkdtempSync(join(dataDir, 'showcase-')), 'airl.sqlite');
const { round, episode, job, canon } = showcase;
const { universeId } = firstProduction;
const store = new PlatformStore(databasePath);

try {
  store.transaction(() => {
    // Replace the automatically seeded open round in this new database.
    store.db.prepare('DELETE FROM live_options WHERE round_id IN (SELECT id FROM live_rounds WHERE room_id=?)').run(universeId);
    store.db.prepare('DELETE FROM live_rounds WHERE room_id=?').run(universeId);
    store.db.prepare("INSERT INTO live_rounds (id,room_id,status,winner,created) VALUES (?,?,'closed',?,?)")
      .run(round.id, universeId, round.winner, round.created);

    const insertOption = store.db.prepare('INSERT INTO live_options (round_id,id,title,description,position) VALUES (?,?,?,?,?)');
    const insertVote = store.db.prepare('INSERT INTO live_votes (round_id,token_hash,option_id) VALUES (?,?,?)');
    for (const [position, option] of round.options.entries()) {
      insertOption.run(round.id, option.id, option.title, option.description, position);
      // The showcase carries aggregate vote counts, with fresh synthetic voter identifiers.
      for (let index = 0; index < option.votes; index++) {
        insertVote.run(round.id, randomUUID(), option.id);
      }
    }

    store.db.prepare('INSERT INTO episodes (run_id,room_id,artifact,created_at) VALUES (?,?,?,?)')
      .run(episode.id, universeId, JSON.stringify(episode.artifact), episode.createdAt);
    store.db.prepare('INSERT INTO universe_episodes (episode_id,universe_id,story_order,round_id,published_at) VALUES (?,?,?,?,?)')
      .run(episode.id, universeId, episode.storyOrder, round.id, episode.publishedAt);
    store.db.prepare("INSERT INTO room_jobs (id,round_id,room_id,choice,status,attempts,run_id,created,updated,mode,model,story_order) VALUES (?,?,?,?,'published',?,?,?,?,?,?,?)")
      .run(job.id, round.id, universeId, job.choice, job.attempts, episode.id, job.created, job.updated, job.mode, job.model, episode.storyOrder);

    const insertCanon = store.db.prepare('INSERT INTO canon_events (id,universe_id,character_id,episode_id,scene_id,story_order,content,kind) VALUES (?,?,?,?,?,?,?,?)');
    for (const event of canon) {
      insertCanon.run(event.id, universeId, event.characterId, episode.id, event.sceneId, episode.storyOrder, event.content, event.kind);
    }
  });
} finally {
  store.close();
}

console.log('Open /journey?universe=barangay-2099 to explore the saved showcase.');
const next = spawn(process.execPath, [
  'node_modules/next/dist/bin/next', 'dev', '--webpack', '--hostname', '127.0.0.1', ...process.argv.slice(2),
], {
  stdio: 'inherit',
  env: { ...process.env, AIRL_LIVE_DB_PATH: databasePath, AIRL_ALLOW_LIVE_REQUESTS: 'false', AI_PROVIDER: 'demo' },
});
next.on('error', error => {
  console.error(error.message);
  process.exitCode = 1;
});
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => next.kill(signal));
}
next.on('exit', (code, signal) => {
  process.exitCode = code ?? (signal === 'SIGINT' ? 130 : signal === 'SIGTERM' ? 143 : 1);
});
