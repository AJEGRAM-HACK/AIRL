import { DatabaseSync } from 'node:sqlite';
import { resolve } from 'node:path';
import { LiveStore } from '@/server/live/store';
import { ProductionStore } from './store';
import { produce } from './workflow';
import { selectProvider } from '@/ai/providers/registry';
import { Manifest, Critique } from './schemas';
export const roomDatabasePath = () => resolve(process.env.AIRL_LIVE_DB_PATH || '.data/airl-live.sqlite');
export class RoomJobs {
  private db: DatabaseSync;
  private claimUntil = 0;
  constructor(readonly path = roomDatabasePath()) {
    const live = new LiveStore(path); live.dispose();
    const production = new ProductionStore(path); production.close();
    this.db = new DatabaseSync(path);
    this.db.exec('PRAGMA busy_timeout=5000');
  }
  claim() {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const job = this.db.prepare("SELECT * FROM room_jobs WHERE (status='queued' OR (status='running' AND lease_until<?)) AND NOT EXISTS(SELECT 1 FROM room_jobs active WHERE active.status='running' AND active.lease_until>=?) ORDER BY created LIMIT 1").get(Date.now(),Date.now());
      if (job) {
        this.claimUntil = Date.now()+150_000;
        this.db.prepare("UPDATE room_jobs SET status='running',lease_until=?,updated=? WHERE id=?").run(this.claimUntil,Date.now(),String(job.id));
      }
      this.db.exec('COMMIT');
      return job;
    } catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  attach(id: string, runId: string) {
    const result = this.db.prepare("UPDATE room_jobs SET run_id=?,attempts=attempts+1,updated=? WHERE id=? AND status='running' AND lease_until=?").run(runId,Date.now(),id,this.claimUntil);
    if (!result.changes) throw new Error('Production lease expired');
  }
  finish(id: string, status: 'review' | 'failed') { this.db.prepare('UPDATE room_jobs SET status=?,lease_until=NULL,updated=? WHERE id=? AND lease_until=?').run(status,Date.now(),id,this.claimUntil); }
  list(roomId: string, operator = false) {
    const jobs = this.db.prepare('SELECT id,round_id,choice,status,attempts,run_id,created,updated FROM room_jobs WHERE room_id=? ORDER BY created DESC LIMIT 20').all(roomId);
    const production = new ProductionStore(this.path);
    try {
      return jobs.map(job => {
        const runId = job.run_id ? String(job.run_id) : null;
        const artifact = runId ? (job.status === 'published' ? production.inspect(runId).episode : null) : null;
        const published = artifact ? JSON.parse(String(artifact.artifact)) : null;
        const draft = operator && runId ? production.draft(runId) : null;
        const recorded = operator && runId ? production.inspect(runId).events : [];
        const critic = recorded.filter(event => event.stage === 'Creative Critic' && event.status === 'succeeded').at(-1);
        return { id: String(job.id), round_id: String(job.round_id), choice: String(job.choice), status: String(job.status), attempts: Number(job.attempts), run_id: runId, created: Number(job.created), updated: Number(job.updated), mode: 'demo', manifest: (published || draft)?.manifest || null, feedback: operator ? (draft?.critique || (critic ? JSON.parse(String(critic.data)).output : null)) : null,
          events: operator && runId ? recorded.map(event => ({ stage: event.stage, status: event.status, attempt: event.attempt, timestamp: event.created_at, ...(event.status === 'failed' ? { failure: JSON.parse(String(event.data)) } : {}) })) : [] };
      });
    } finally { production.close(); }
  }
  action(id: string, action: 'publish' | 'reject' | 'retry') {
    const job = this.db.prepare('SELECT * FROM room_jobs WHERE id=?').get(id);
    if (!job) throw new Error('Job not found');
    if (action === 'publish') {
      const production = new ProductionStore(this.path);
      try {
        const draft = job.run_id ? production.draft(String(job.run_id)) : null;
        if (job.status !== 'published') { Manifest.parse(draft?.manifest); if (!Critique.parse(draft?.critique).approved) throw new Error('Review required'); }
        production.publishRoomJob(id);
      } finally { production.close(); }
      return;
    }
    if (action === 'reject' && job.status === 'rejected') return;
    if (action === 'retry' && ['queued','running','review','published'].includes(String(job.status))) return;
    if (action === 'reject' && job.status === 'review') this.db.prepare("UPDATE room_jobs SET status='rejected',updated=? WHERE id=?").run(Date.now(),id);
    else if (action === 'retry' && job.status === 'failed' && Number(job.attempts) < 3) this.db.prepare("UPDATE room_jobs SET status='queued',updated=? WHERE id=?").run(Date.now(),id);
    else throw new Error('Action is unavailable for this job state');
  }
  close() { this.db.close(); }
}
export async function runRoomJob(path = roomDatabasePath()) {
  const jobs = new RoomJobs(path);
  const job = jobs.claim();
  if (!job) { jobs.close(); return false; }
  const id = String(job.id);
  const production = new ProductionStore(path);
  try {
    if (job.run_id) {
      const old = production.inspect(String(job.run_id));
      if (old.production?.status === 'review' && production.draft(String(job.run_id))) { jobs.finish(id,'review'); return true; }
      if (old.production?.status === 'running') production.finish(String(job.run_id),'failed');
    }
    if (Number(job.attempts) >= 3) { jobs.finish(id,'failed'); return true; }
    const selected = await selectProvider({ mode: 'demo', consent: false }, AbortSignal.timeout(110_000));
    const result = await produce(production, selected.executor, { roomId: 'barangay-2099', winningChoice: String(job.choice) }, selected.model, runId => jobs.attach(id,runId), true);
    jobs.finish(id, result.status === 'review' && production.draft(result.id) ? 'review' : 'failed');
  } catch { jobs.finish(id,'failed'); } finally { production.close(); jobs.close(); }
  return true;
}
// A single callback drains work that accumulated while another claim was active.
export async function drainRoomJobs(path = roomDatabasePath()) {
  for (let count = 0; count < 20; count++) {
    if (!await runRoomJob(path)) break;
  }
}
