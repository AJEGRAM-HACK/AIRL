import { Script, Manifest, validateScript, validateManifest } from './schemas';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { characters, episodes } from '../../lib/fixtures';
import type { Character } from '../../lib/domain';
import type { ProductionInput, Stage } from './schemas';
export class ProductionStore {
  private db: DatabaseSync;
  constructor(path: string) {
    mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS characters (id TEXT PRIMARY KEY, profile TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS productions (id TEXT PRIMARY KEY, room_id TEXT NOT NULL, status TEXT NOT NULL, model TEXT NOT NULL, input TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
      CREATE UNIQUE INDEX IF NOT EXISTS one_active_run ON productions(room_id) WHERE status='running';
      CREATE TABLE IF NOT EXISTS production_drafts(run_id TEXT PRIMARY KEY,artifact TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS events (sequence INTEGER PRIMARY KEY AUTOINCREMENT, run_id TEXT NOT NULL, stage TEXT NOT NULL, attempt INTEGER NOT NULL, status TEXT NOT NULL, data TEXT NOT NULL, created_at TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS episodes (run_id TEXT PRIMARY KEY, room_id TEXT NOT NULL, artifact TEXT NOT NULL, created_at TEXT NOT NULL);`);
    // Additive migration keeps existing local production records readable.
    const columns = this.db.prepare('PRAGMA table_info(productions)').all();
    if (!columns.some(column => column.name === 'execution_mode')) {
      this.db.exec("ALTER TABLE productions ADD COLUMN execution_mode TEXT NOT NULL DEFAULT 'openai'");
    }
    const seed = this.db.prepare('INSERT OR IGNORE INTO characters VALUES (?, ?)');
    for (const c of characters) seed.run(c.id, JSON.stringify(c));
  }
  context(roomId: string, executionMode: import('@/ai/schemas/gateway').Mode | 'openai' = 'openai') {
    const profiles = this.db.prepare('SELECT profile FROM characters ORDER BY id').all().map(row => ({ ...characters.find(character => character.id === String(JSON.parse(String(row.profile)).id)), ...JSON.parse(String(row.profile)) }) as Character);
    const history = this.db.prepare("SELECT e.artifact FROM episodes e JOIN productions p ON p.id=e.run_id WHERE e.room_id=? AND (p.execution_mode=? OR (?='hosted_openai' AND p.execution_mode='openai')) ORDER BY e.created_at DESC LIMIT 5").all(roomId, executionMode, executionMode).reverse().map(row => JSON.parse(String(row.artifact)));
    return { characters: profiles, seededHistory: episodes, approvedHistory: history };
  }
  create(input: ProductionInput, model: string, executionMode: import('@/ai/schemas/gateway').Mode | 'openai' = 'openai') {
    const id = randomUUID(), now = new Date().toISOString();
    this.db.prepare('INSERT INTO productions(id,room_id,status,model,input,created_at,updated_at,execution_mode) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(id, input.roomId, 'running', model, JSON.stringify(input), now, now, executionMode);
    return id;
  }
  event(id: string, stage: Stage | 'Connection' | 'Workflow', attempt: number, status: string, data: unknown = {}) {
    this.db.prepare('INSERT INTO events(run_id, stage, attempt, status, data, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(id, stage, attempt, status, JSON.stringify(data), new Date().toISOString());
  }
  finish(id: string, status: 'complete' | 'review' | 'failed') { this.db.prepare('UPDATE productions SET status=?,updated_at=? WHERE id=?').run(status, new Date().toISOString(), id); }
  approve(id: string, roomId: string, artifact: unknown, updates: {characterId: string; memory: string}[]) {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      this.db.prepare('INSERT INTO episodes VALUES (?, ?, ?, ?)').run(id, roomId, JSON.stringify(artifact), new Date().toISOString());
      for (const update of updates) {
        const row = this.db.prepare('SELECT profile FROM characters WHERE id=?').get(update.characterId);
        if (!row) throw new Error('Unknown character');
        const profile = ({ ...characters.find(character => character.id === String(JSON.parse(String(row.profile)).id)), ...JSON.parse(String(row.profile)) }) as Character;
        if (!profile.memories.includes(update.memory)) profile.memories.push(update.memory);
        this.db.prepare('UPDATE characters SET profile=? WHERE id=?').run(JSON.stringify(profile), update.characterId);
      }
      this.finish(id, 'complete');
      this.db.exec('COMMIT');
    } catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  saveDraft(id: string, artifact: unknown) {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      this.db.prepare('INSERT INTO production_drafts VALUES(?,?)').run(id,JSON.stringify(artifact));
      this.finish(id, 'review');
      this.db.exec('COMMIT');
    } catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  draft(id: string) {
    const row = this.db.prepare('SELECT artifact FROM production_drafts WHERE run_id=?').get(id);
    return row ? JSON.parse(String(row.artifact)) : null;
  }
  publishRoomJob(jobId: string) {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const job = this.db.prepare('SELECT * FROM room_jobs WHERE id=?').get(jobId);
      if (!job) throw new Error('Job not found');
      if (job.status === 'published') { this.db.exec('COMMIT'); return; }
      if (job.status !== 'review' || !job.run_id) throw new Error('Job is not ready for review');
      const artifact = this.draft(String(job.run_id));
      if (!artifact?.critique?.approved || artifact.executionMode !== 'demo') throw new Error('Critic approval and demo mode are required');
      const script = Script.parse(artifact.script);
      validateScript(script);
      validateManifest(Manifest.parse(artifact.manifest),script);
      this.db.prepare('INSERT INTO episodes VALUES(?,?,?,?)').run(String(job.run_id),String(job.room_id),JSON.stringify(artifact),new Date().toISOString());
      // Room jobs currently use demo templates, which do not add canonical memory updates.
      this.finish(String(job.run_id), 'complete');
      this.db.prepare("UPDATE room_jobs SET status='published',updated=? WHERE id=?").run(Date.now(),jobId);
      this.db.exec('COMMIT');
    } catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  inspect(id: string) {
    return { production: this.db.prepare('SELECT * FROM productions WHERE id=?').get(id), events: this.db.prepare('SELECT * FROM events WHERE run_id=? ORDER BY sequence').all(id), episode: this.db.prepare('SELECT * FROM episodes WHERE run_id=?').get(id) };
  }
  close() { this.db.close(); }
}
