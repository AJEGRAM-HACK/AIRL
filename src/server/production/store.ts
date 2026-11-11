import { migratePlatform, worldSnapshot, OFFICIAL } from '@/server/platform/migration';
import { CanonChanges } from '@/lib/domain';
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
  constructor(path: string, initialCharacters = characters, readonly universeId: string = OFFICIAL) {
    mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path, { timeout: 5000 });
    this.db.exec(`PRAGMA journal_mode=WAL;
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
    for (const c of initialCharacters) seed.run(c.id, JSON.stringify(c));
    migratePlatform(this.db);
  }
  private applyMemories(updates: { characterId: string; memory: string }[]) {
    for (const update of updates) {
      const row = this.db.prepare('SELECT profile FROM universe_characters WHERE universe_id=? AND slug=?').get(this.universeId,update.characterId);
      if (!row) throw new Error('Unknown character');
      const profile = JSON.parse(String(row.profile)) as Character;
      if (!profile.memories.includes(update.memory)) profile.memories.push(update.memory);
      this.db.prepare('UPDATE universe_characters SET profile=? WHERE universe_id=? AND slug=?').run(JSON.stringify(profile),this.universeId,update.characterId);
      if(this.universeId===OFFICIAL)this.db.prepare('UPDATE characters SET profile=? WHERE id=?').run(JSON.stringify(profile),update.characterId);
    }
  }
  context(roomId: string, executionMode: import('@/ai/schemas/gateway').Mode | 'openai' = 'openai', sharedCanon = false) {
    if(this.universeId!==OFFICIAL)return worldSnapshot(this.db,roomId);
    const profiles = this.db.prepare('SELECT profile FROM universe_characters WHERE universe_id=? ORDER BY slug').all(this.universeId).map(row => ({ ...characters.find(character => character.id === String(JSON.parse(String(row.profile)).id)), ...JSON.parse(String(row.profile)) }) as Character);
    const history = this.db.prepare("SELECT e.artifact FROM episodes e JOIN productions p ON p.id=e.run_id WHERE e.room_id=? AND (?=1 OR p.execution_mode=? OR (?='hosted_openai' AND p.execution_mode='openai')) ORDER BY e.created_at DESC LIMIT 5").all(roomId, sharedCanon ? 1 : 0, executionMode, executionMode).reverse().map(row => JSON.parse(String(row.artifact)));
    return { universeId:this.universeId,world:JSON.parse(String(this.db.prepare('SELECT settings FROM universes WHERE id=?').get(this.universeId)!.settings)),characters: profiles, seededHistory: episodes, approvedHistory: history };
  }
  create(input: ProductionInput, model: string, executionMode: import('@/ai/schemas/gateway').Mode | 'openai' = 'openai') {
    const id = randomUUID(), now = new Date().toISOString();
    this.db.prepare('INSERT INTO productions(id,room_id,status,model,input,created_at,updated_at,execution_mode,universe_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(id, input.roomId, 'running', model, JSON.stringify(input), now, now, executionMode, this.universeId);
    return id;
  }
  event(id: string, stage: Stage | 'Connection' | 'Workflow', attempt: number, status: string, data: unknown = {}) {
    this.db.prepare('INSERT INTO events(run_id, stage, attempt, status, data, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(id, stage, attempt, status, JSON.stringify(data), new Date().toISOString());
  }
  finish(id: string, status: 'complete' | 'review' | 'failed') { this.db.prepare('UPDATE productions SET status=?,updated_at=? WHERE id=?').run(status, new Date().toISOString(), id); }
  approve(id: string, roomId: string, artifact: unknown, updates: {characterId: string; memory: string}[]) {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      this.db.prepare('INSERT INTO episodes(run_id,room_id,artifact,created_at) VALUES (?, ?, ?, ?)').run(id, roomId, JSON.stringify(artifact), new Date().toISOString());
      this.applyMemories(updates);
      this.recordCanon(id,updates,[],undefined);
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
  publishRoomJob(jobId: string, corrections?: unknown) {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const job = this.db.prepare('SELECT * FROM room_jobs WHERE id=?').get(jobId);
      if (!job) throw new Error('Job not found');
      if (job.status === 'published') { this.db.exec('COMMIT'); return; }
      if (job.status !== 'review' || !job.run_id) throw new Error('Job is not ready for review');
      if(String(job.room_id)!==this.universeId)throw new Error('Universe mismatch');
      const artifact = this.draft(String(job.run_id));
      if (!artifact?.critique?.approved || !['demo','ollama','hosted_openai','openai'].includes(artifact.executionMode)) throw new Error('Critic approval and supported execution mode are required');
      const production = this.db.prepare('SELECT status,execution_mode FROM productions WHERE id=?').get(String(job.run_id));
      if (production?.status !== 'review' || production.execution_mode !== artifact.executionMode || artifact.executionMode !== job.mode) throw new Error('Artifact does not match this reviewed production');
      const script = Script.parse(artifact.script);
      validateScript(script);
      validateManifest(Manifest.parse(artifact.manifest),script);
      const approved=CanonChanges.parse(corrections || {memoryUpdates:script.memoryUpdates,relationshipUpdates:script.relationshipUpdates || []});
      const ids=new Set(this.db.prepare('SELECT slug FROM universe_characters WHERE universe_id=?').all(this.universeId).map(row=>String(row.slug)));
      for(const update of approved.memoryUpdates){if(!ids.has(update.characterId)|| (update.sceneId&&!script.scenes.some(scene=>scene.id===update.sceneId)))throw new Error('Invalid canon source');}
      for(const update of approved.relationshipUpdates)if(!ids.has(update.from)||!ids.has(update.to))throw new Error('Cross-universe relationship');
      this.applyMemories(approved.memoryUpdates);
      this.recordCanon(String(job.run_id),approved.memoryUpdates,approved.relationshipUpdates,job);
      artifact.script.memoryUpdates=approved.memoryUpdates;artifact.script.relationshipUpdates=approved.relationshipUpdates;
      this.db.prepare('INSERT INTO episodes(run_id,room_id,artifact,created_at) VALUES(?,?,?,?)').run(String(job.run_id),String(job.room_id),JSON.stringify(artifact),new Date().toISOString());
      this.finish(String(job.run_id), 'complete');
      this.db.prepare("UPDATE room_jobs SET status='published',updated=? WHERE id=?").run(Date.now(),jobId);
      this.db.exec('COMMIT');
    } catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  saveOutline(id:string,script:unknown) {this.db.prepare('INSERT INTO production_outlines VALUES(?,?) ON CONFLICT(run_id) DO UPDATE SET script=excluded.script').run(id,JSON.stringify(script));}
  savePreview(id:string,script:unknown,manifest:unknown) {
    this.db.prepare('INSERT INTO production_previews SELECT ?,COALESCE(MAX(version),0)+1,?,? FROM production_previews WHERE run_id=?').run(id,JSON.stringify(script),JSON.stringify(manifest),id);
  }
  preview(id:string) {
    const row=this.db.prepare('SELECT * FROM production_previews WHERE run_id=? ORDER BY version DESC LIMIT 1').get(id);
    const outline=this.db.prepare('SELECT script FROM production_outlines WHERE run_id=?').get(id);
    return {version:row?Number(row.version):null,manifest:row?JSON.parse(String(row.manifest)):null,script:outline?JSON.parse(String(outline.script)):null};
  }
  resumable(id:string,input:ProductionInput,model:string,mode:string) {
    const old=this.inspect(id);const production=old.production;
    if(!production||production.model!==model||production.execution_mode!==mode||production.input!==JSON.stringify(input))return {};
    const output=(stage:string)=>{const row=old.events.filter(event=>event.stage===stage&&event.status==='succeeded').at(-1);return row?JSON.parse(String(row.data)).output:undefined;};
    const concept=output('Story Director'),feedback=output('Creative Critic');
    if(feedback&&!feedback.approved)return {concept,feedback};
    const script=output('Screenwriter'),manifest=output('Visual Producer');
    try {if(script)validateScript(Script.parse(script));if(manifest)validateManifest(Manifest.parse(manifest),script);}catch{return {concept};}
    return {concept,script,manifest};
  }
  private recordCanon(id:string,updates:{characterId:string;memory:string;sceneId?:string}[],relationships:{from:string;to:string;description:string}[],job?:Record<string,unknown>) {
    const existing=this.db.prepare('SELECT episode_id FROM universe_episodes WHERE episode_id=?').get(id);
    const order=job?.story_order?Number(job.story_order):Number(this.db.prepare('SELECT next_order FROM universes WHERE id=?').get(this.universeId)!.next_order);
    if(!existing){this.db.prepare('INSERT INTO universe_episodes VALUES(?,?,?,?,?)').run(id,this.universeId,order,job?.round_id?String(job.round_id):null,new Date().toISOString());this.db.prepare('UPDATE universes SET next_order=MAX(next_order,?) WHERE id=?').run(order+1,this.universeId);}
    updates.forEach((update,index)=>this.db.prepare('INSERT OR IGNORE INTO canon_events VALUES(?,?,?,?,?,?,?,?)').run(`${id}:memory:${index}`,this.universeId,update.characterId,id,update.sceneId||this.draft(id)?.script?.scenes?.find((scene:{id:string;dialogue:{characterId:string}[]})=>scene.dialogue.some(line=>line.characterId===update.characterId))?.id||null,order,update.memory,'memory'));
    relationships.forEach((update,index)=>{
      this.db.prepare('INSERT INTO universe_relationships VALUES(?,?,?,?) ON CONFLICT(universe_id,from_slug,to_slug) DO UPDATE SET description=excluded.description').run(this.universeId,update.from,update.to,update.description);
      this.db.prepare('INSERT OR IGNORE INTO canon_events VALUES(?,?,?,?,?,?,?,?)').run(`${id}:relationship:${index}`,this.universeId,update.from,id,null,order,`${update.from} → ${update.to}: ${update.description}`,'relationship');
    });
  }
  inspect(id: string) {
    return { production: this.db.prepare('SELECT * FROM productions WHERE id=?').get(id), events: this.db.prepare('SELECT * FROM events WHERE run_id=? ORDER BY sequence').all(id), episode: this.db.prepare('SELECT * FROM episodes WHERE run_id=?').get(id) };
  }
  close() { this.db.close(); }
}
