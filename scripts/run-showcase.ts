import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync, linkSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import showcase from '../demo/barangay-2099.json';
import { firstProduction } from '../src/lib/first-production';
import { PlatformStore } from '../src/server/platform/store';

function seedShowcase(databasePath: string, viewer = false) {
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

      if (viewer) {
        const openRound = randomUUID();
        store.db.prepare("INSERT INTO live_rounds (id,room_id,status,created) VALUES (?,?,'open',?)")
          .run(openRound, universeId, Math.max(Date.now(), round.created + 1));
        for (const [position, option] of round.options.entries()) {
          insertOption.run(openRound, option.id, option.title, option.description, position);
        }
        store.db.exec('CREATE TABLE viewer_demo_checkpoint (version INTEGER PRIMARY KEY)');
        store.db.prepare('INSERT INTO viewer_demo_checkpoint VALUES (1)').run();
      }

      const insertCanon = store.db.prepare('INSERT INTO canon_events (id,universe_id,character_id,episode_id,scene_id,story_order,content,kind) VALUES (?,?,?,?,?,?,?,?)');
      for (const event of canon) {
        insertCanon.run(event.id, universeId, event.characterId, episode.id, event.sceneId, episode.storyOrder, event.content, event.kind);
      }
    });
  } finally {
    store.close();
  }
}

function prepareViewerDatabase(path: string | undefined) {
  if (!path || !isAbsolute(path)) throw new Error('Set AIRL_LIVE_DB_PATH to an absolute path on persistent storage.');
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  if (!existsSync(path)) {
    const staging = mkdtempSync(join(dirname(path), '.viewer-seed-'));
    try {
      const stagedPath = join(staging, 'airl.sqlite');
      seedShowcase(stagedPath, true);
      const db = new DatabaseSync(stagedPath);
      try {
        // Publish a self-contained SQLite file after checkpointing WAL.
        db.exec('PRAGMA journal_mode=DELETE');
      } finally {
        db.close();
      }
      try {
        linkSync(stagedPath, path);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      }
    } finally {
      rmSync(staging, { recursive: true, force: true });
    }
  }

  const db = new DatabaseSync(path, { readOnly: true });
  try {
    const marker = db.prepare("SELECT 1 FROM sqlite_schema WHERE type='table' AND name='viewer_demo_checkpoint'").get();
    if (!marker || !db.prepare('SELECT 1 FROM viewer_demo_checkpoint WHERE version=1').get()) {
      throw new Error('Use a dedicated viewer-demo database path. The existing database was left untouched.');
    }
  } finally {
    db.close();
  }
  return path;
}

const viewer = process.argv[2] === '--viewer';
const args = process.argv.slice(viewer ? 3 : 2);
let databasePath: string;
if (viewer) {
  databasePath = prepareViewerDatabase(process.env.AIRL_LIVE_DB_PATH);
} else {
  const dataDir = resolve('.data');
  mkdirSync(dataDir, { recursive: true });
  databasePath = join(mkdtempSync(join(dataDir, 'showcase-')), 'airl.sqlite');
  seedShowcase(databasePath);
}

console.log('Open /journey?universe=barangay-2099 to explore the saved showcase.');
const next = spawn(process.execPath, [
  'node_modules/next/dist/bin/next', ...(viewer ? ['start'] : ['dev', '--webpack']),
  '--hostname', '127.0.0.1', ...args,
], {
  stdio: 'inherit',
  env: { ...process.env, AIRL_LIVE_DB_PATH: databasePath, AIRL_ALLOW_LIVE_REQUESTS: 'false', AI_PROVIDER: 'demo',
    ...(viewer ? { AIRL_VIEWER_DEMO: 'true' } : {}),
  },
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
