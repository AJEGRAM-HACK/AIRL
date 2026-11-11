import { estimateCost } from '@/ai/usage/estimate';
import { RoomProviderSelection } from '@/features/live/production-selection';
import { DatabaseSync } from 'node:sqlite';
import { resolve } from 'node:path';
import { LiveStore } from '@/server/live/store';
import { ProductionStore } from './store';
import { produce } from './workflow';
import { selectProvider } from '@/ai/providers/registry';
import { inferenceLimits } from '@/ai/config/limits';
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
  setModel(id: string, model: string) { this.db.prepare('UPDATE room_jobs SET model=? WHERE id=? AND lease_until=?').run(model,id,this.claimUntil); }
  attach(id: string, runId: string) {
    const result = this.db.prepare("UPDATE room_jobs SET run_id=?,attempts=attempts+1,updated=? WHERE id=? AND status='running' AND lease_until=?").run(runId,Date.now(),id,this.claimUntil);
    if (!result.changes) throw new Error('Production lease expired');
  }
  finish(id: string, status: 'review' | 'failed') { this.db.prepare('UPDATE room_jobs SET status=?,lease_until=NULL,updated=? WHERE id=? AND lease_until=?').run(status,Date.now(),id,this.claimUntil); }
  list(roomId: string, operator = false) {
    const jobs = this.db.prepare('SELECT id,round_id,choice,status,attempts,run_id,created,updated,mode,model,paid_consent FROM room_jobs WHERE room_id=? ORDER BY created DESC LIMIT 20').all(roomId);
    const production = new ProductionStore(this.path);
    try {
      return jobs.map(job => {
        const runId = job.run_id ? String(job.run_id) : null;
        const artifact = runId ? (job.status === 'published' ? production.inspect(runId).episode : null) : null;
        const published = artifact ? JSON.parse(String(artifact.artifact)) : null;
        const draft = operator && runId ? production.draft(runId) : null;
        const recorded = operator && runId ? production.inspect(runId).events : [];
        const critic = recorded.filter(event => event.stage === 'Creative Critic' && event.status === 'succeeded').at(-1);
        return { id: String(job.id), round_id: String(job.round_id), choice: String(job.choice), status: String(job.status), attempts: Number(job.attempts), run_id: runId, created: Number(job.created), updated: Number(job.updated), mode: String(job.mode), model: job.model ? String(job.model) : null, manifest: (published || draft)?.manifest || null, feedback: operator ? (draft?.critique || (critic ? JSON.parse(String(critic.data)).output : null)) : null,
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
    if (action === 'reject') {
      const changed = this.db.prepare("UPDATE room_jobs SET status='rejected',updated=? WHERE id=? AND status='review'").run(Date.now(),id);
      const current = this.db.prepare('SELECT status FROM room_jobs WHERE id=?').get(id);
      if (changed.changes || current?.status === 'rejected') return;
      throw new Error('Review decision is already finalized');
    }
    if (action === 'retry' && ['queued','running','review','published'].includes(String(job.status))) return;
    if (action === 'retry') {
      const changed = this.db.prepare("UPDATE room_jobs SET status='queued',updated=? WHERE id=? AND status='failed' AND attempts<3").run(Date.now(),id);
      if (changed.changes) return;
    }
    throw new Error('Action is unavailable for this job state');
  }
  close() { this.db.close(); }
}
export async function runRoomJob(path = roomDatabasePath()) {
  const jobs = new RoomJobs(path);
  const job = jobs.claim();
  if (!job) { jobs.close(); return false; }
  const id = String(job.id);
  const production = new ProductionStore(path);
  const live = new LiveStore(path);
  let usageId: string | undefined;
  let inputTokens = 0, outputTokens = 0;
  let mode: 'demo' | 'ollama' | 'hosted_openai' = 'demo';
  try {
    mode = RoomProviderSelection.shape.mode.parse(job.mode);
    if (job.run_id) {
      const old = production.inspect(String(job.run_id));
      if (old.production?.status === 'review' && production.draft(String(job.run_id))) { jobs.finish(id,'review'); return true; }
      if (old.production?.status === 'running') production.finish(String(job.run_id),'failed');
    }
    if (Number(job.attempts) >= 3) { jobs.finish(id,'failed'); return true; }
    usageId = live.beginUsage(String(job.requested_by || 'legacy-room'),mode,String(job.model || 'provider-default'),'room-production');
    const selected = await selectProvider({ mode, model: job.model ? String(job.model) : undefined, consent: job.paid_consent === 1 }, AbortSignal.timeout(inferenceLimits().timeoutMs), usage => { inputTokens += usage.inputTokens || 0; outputTokens += usage.outputTokens || 0; });
    jobs.setModel(id,selected.model);
    live.setUsageModel(usageId,selected.model);
    const result = await produce(production, selected.executor, { roomId: 'barangay-2099', winningChoice: String(job.choice) }, selected.model, runId => jobs.attach(id,runId), true);
    const status = result.status === 'review' && production.draft(result.id) ? 'review' : 'failed';
    jobs.finish(id,status);
    live.finishUsage(usageId,status,inputTokens,outputTokens,estimateCost({inputTokens,outputTokens},mode),status === 'failed' ? 'creative_review_failed' : null);
  } catch {
    jobs.finish(id,'failed');
    if (usageId) live.finishUsage(usageId,'failed',inputTokens,outputTokens,estimateCost({inputTokens,outputTokens},mode),'production_failed');
  } finally { live.dispose(); production.close(); jobs.close(); }
  return true;
}
// A single callback drains work that accumulated while another claim was active.
export async function drainRoomJobs(path = roomDatabasePath()) {
  for (let count = 0; count < 20; count++) {
    if (!await runRoomJob(path)) break;
  }
}
