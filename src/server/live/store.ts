import { migratePlatform, worldSnapshot, OFFICIAL } from '@/server/platform/migration';
import { RoomProviderSelection, type RoomProvider } from '@/features/live/production-selection';
import { DatabaseSync } from 'node:sqlite';
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { choices, DEMO_ROOM } from '@/lib/fixtures';
import type { RoomState } from '@/features/live/types';
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
export class LiveError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
export class LiveStore {
  private db: DatabaseSync;
  constructor(path = resolve(process.env.AIRL_LIVE_DB_PATH || '.data/airl-live.sqlite'), readonly roomId: string = DEMO_ROOM) {
    mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path, { timeout: 5000 });
    this.db.exec(`PRAGMA journal_mode=WAL;
      CREATE TABLE IF NOT EXISTS live_sessions(token_hash TEXT PRIMARY KEY, role TEXT NOT NULL, expires INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS live_members(room_id TEXT NOT NULL, token_hash TEXT NOT NULL, PRIMARY KEY(room_id,token_hash));
      CREATE TABLE IF NOT EXISTS live_rounds(id TEXT PRIMARY KEY, room_id TEXT NOT NULL, status TEXT NOT NULL, winner TEXT, created INTEGER NOT NULL);
      CREATE UNIQUE INDEX IF NOT EXISTS one_live_open_round ON live_rounds(room_id) WHERE status='open';
      CREATE TABLE IF NOT EXISTS live_options(round_id TEXT NOT NULL,id TEXT NOT NULL,title TEXT NOT NULL,description TEXT NOT NULL,position INTEGER NOT NULL,PRIMARY KEY(round_id,id));
      CREATE TABLE IF NOT EXISTS live_votes(round_id TEXT NOT NULL,token_hash TEXT NOT NULL,option_id TEXT NOT NULL,PRIMARY KEY(round_id,token_hash));
      CREATE TABLE IF NOT EXISTS live_operator_codes(code_hash TEXT PRIMARY KEY,expires INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS ai_usage(id TEXT PRIMARY KEY,owner TEXT NOT NULL,mode TEXT NOT NULL,model TEXT NOT NULL,operation TEXT NOT NULL,status TEXT NOT NULL,started INTEGER NOT NULL,finished INTEGER,input_tokens INTEGER,output_tokens INTEGER,estimated_usd REAL,error_code TEXT);
      CREATE TABLE IF NOT EXISTS ai_leases(resource TEXT PRIMARY KEY,lease_id TEXT NOT NULL,expires INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS room_jobs(id TEXT PRIMARY KEY,round_id TEXT NOT NULL UNIQUE,room_id TEXT NOT NULL,choice TEXT NOT NULL,status TEXT NOT NULL,attempts INTEGER NOT NULL DEFAULT 0,run_id TEXT,lease_until INTEGER,created INTEGER NOT NULL,updated INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS live_limits(identity TEXT PRIMARY KEY,count INTEGER NOT NULL,reset_at INTEGER NOT NULL);`);
    const jobColumns = this.db.prepare('PRAGMA table_info(room_jobs)').all();
    for (const [name, definition] of [['mode',"TEXT NOT NULL DEFAULT 'demo'"],['model','TEXT'],['paid_consent','INTEGER NOT NULL DEFAULT 0'],['requested_by','TEXT']]) {
      if (!jobColumns.some(column => column.name === name)) this.db.exec(`ALTER TABLE room_jobs ADD COLUMN ${name} ${definition}`);
    }
    migratePlatform(this.db);
    if (!this.db.prepare('SELECT room_id FROM universe_rooms WHERE room_id=?').get(this.roomId)) throw new LiveError(404,'Room not found.');
    if (!this.db.prepare('SELECT id FROM live_rounds WHERE room_id=? LIMIT 1').get(this.roomId)) {
      this.db.exec('BEGIN IMMEDIATE');
      try {
        // Recheck after the lock in case another process seeded this room.
        if (!this.db.prepare('SELECT id FROM live_rounds WHERE room_id=? LIMIT 1').get(this.roomId)) this.insertRound();
        this.db.exec('COMMIT');
      } catch (error) { this.db.exec('ROLLBACK'); throw error; }
    }
  }
  private insertRound(options = this.roomId === DEMO_ROOM ? choices : [{id:"option-1",title:"Continue the plan",description:"Follow the current direction."},{id:"option-2",title:"Investigate the unexpected",description:"Find the source of the mystery."},{id:"option-3",title:"Seek an ally",description:"Ask someone for help."}]) {
    const id = randomUUID();
    this.db.prepare('INSERT INTO live_rounds VALUES(?,?,?,NULL,?)').run(id, this.roomId, 'open', Date.now());
    options.forEach((choice, index) => this.db.prepare('INSERT INTO live_options VALUES(?,?,?,?,?)').run(id, choice.id, choice.title, choice.description, index));
    return id;
  }
  limit(identity: string, maximum = 40) {
    const now = Date.now();
    const row = this.db.prepare(`INSERT INTO live_limits VALUES(?,1,?) ON CONFLICT(identity) DO UPDATE SET count=CASE WHEN reset_at<? THEN 1 ELSE count+1 END,reset_at=CASE WHEN reset_at<? THEN ? ELSE reset_at END RETURNING count`).get(hash(identity), now + 60_000, now, now, now + 60_000);
    if (Number(row?.count) > maximum) throw new LiveError(429, 'Please wait a minute before trying again.');
  }
  session(token?: string) {
    if (!token) return undefined;
    return this.db.prepare('SELECT l.token_hash,l.role,a.id AS account_id,a.role AS account_role FROM live_sessions l LEFT JOIN account_sessions s ON s.token_hash=l.token_hash LEFT JOIN accounts a ON a.id=s.account_id WHERE l.token_hash=? AND l.expires>?').get(hash(token), Date.now());
  }
  join(token?: string) {
    const existing = this.session(token);
    const value = existing && token ? token : randomBytes(32).toString('base64url');
    if (!existing) this.db.prepare('INSERT INTO live_sessions VALUES(?,?,?)').run(hash(value), 'participant', Date.now() + 7 * 86400_000);
    this.db.prepare('INSERT OR IGNORE INTO live_members VALUES(?,?)').run(this.roomId, hash(value));
    return value;
  }
  private requireSession(token?: string, operator = false) {
    const session = this.session(token);
    if (!session) throw new LiveError(401, 'Join the room first.');
    if (operator && !this.canOperate(session)) throw new LiveError(403, 'Room management access is required.');
    return String(session.token_hash);
  }
  private canOperate(session: Record<string,unknown>) {
    if(session.account_role==='admin')return true;
    const world=this.db.prepare('SELECT owner_id,official FROM universes WHERE id=(SELECT universe_id FROM universe_rooms WHERE room_id=?)').get(this.roomId);
    return (session.account_role==='creator'&&!world?.official&&world?.owner_id===session.account_id)||(session.role==='operator'&&this.roomId===OFFICIAL);
  }
  issueOperatorCode() {
    const code = randomBytes(24).toString('base64url');
    this.db.prepare('INSERT INTO live_operator_codes VALUES(?,?)').run(hash(code), Date.now() + 10 * 60_000);
    this.db.prepare('INSERT INTO room_operator_codes VALUES(?,?)').run(hash(code),this.roomId);
    return code;
  }
  redeemOperatorCode(token: string | undefined, code: string) {
    const identity = this.requireSession(token);
    const scope=this.db.prepare('SELECT room_id FROM room_operator_codes WHERE code_hash=?').get(hash(code));
    if((scope&&scope.room_id!==this.roomId)||(!scope&&this.roomId!==OFFICIAL))throw new LiveError(403,'This code belongs to another room.');
    this.limit(`operator:${identity}`, 10);
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const result = this.db.prepare('DELETE FROM live_operator_codes WHERE code_hash=? AND expires>?').run(hash(code), Date.now());
      if (!result.changes) throw new LiveError(403, 'The operator code is invalid or expired.');
      // Rotate the cookie token when privilege changes.
      const rotated = randomBytes(32).toString('base64url');
      this.db.prepare('INSERT INTO live_sessions VALUES(?,?,?)').run(hash(rotated), 'operator', Date.now() + 8 * 3600_000);
      this.db.prepare('UPDATE account_sessions SET token_hash=? WHERE token_hash=?').run(hash(rotated),identity);
      this.db.prepare('DELETE FROM live_sessions WHERE token_hash=?').run(identity);
      this.db.prepare('INSERT OR IGNORE INTO live_members VALUES(?,?)').run(this.roomId, hash(rotated));
      // Keep the same participant identity for votes and membership.
      this.db.prepare('UPDATE live_votes SET token_hash=? WHERE token_hash=?').run(hash(rotated), identity);
      this.db.prepare('INSERT OR IGNORE INTO live_members SELECT room_id,? FROM live_members WHERE token_hash=?').run(hash(rotated),identity);
      this.db.prepare('DELETE FROM live_members WHERE token_hash=?').run(identity);
      this.db.exec('COMMIT');
      return rotated;
    } catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  snapshot(roundId?:string): RoomState {
    this.db.exec('BEGIN');
    try {
      const round = roundId
        ? this.db.prepare('SELECT * FROM live_rounds WHERE room_id=? AND id=?').get(this.roomId,roundId)
        : this.db.prepare('SELECT * FROM live_rounds WHERE room_id=? ORDER BY created DESC,rowid DESC LIMIT 1').get(this.roomId);
      if(!round)throw new LiveError(404,'Round not found.');
      const options = this.db.prepare('SELECT o.id,o.title,o.description,COUNT(v.token_hash) votes FROM live_options o LEFT JOIN live_votes v ON v.round_id=o.round_id AND v.option_id=o.id WHERE o.round_id=? GROUP BY o.id ORDER BY o.position').all(String(round.id));
      const participants = this.db.prepare('SELECT COUNT(*) count FROM live_members WHERE room_id=?').get(this.roomId)!;
      this.db.exec('COMMIT');
      return { roomId: this.roomId, roundId: String(round.id), status: round.status as 'open' | 'closed', winner: round.winner ? String(round.winner) : null, participantCount: Number(participants.count), totalVotes: options.reduce((sum, item) => sum + Number(item.votes), 0), options: options.map(item => ({ id: String(item.id), title: String(item.title), description: String(item.description), votes: Number(item.votes) })) };
    } catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  personal(token?: string) {
    const session = this.session(token);
    const state = this.snapshot();
    const vote = session ? this.db.prepare('SELECT option_id FROM live_votes WHERE round_id=? AND token_hash=?').get(state.roundId, String(session.token_hash)) : undefined;
    return { joined: !!session && !!this.db.prepare('SELECT room_id FROM live_members WHERE room_id=? AND token_hash=?').get(this.roomId,String(session.token_hash)), operator: !!session && this.canOperate(session), vote: vote ? String(vote.option_id) : null };
  }
  vote(token: string | undefined, roundId: string, optionId: string) {
    const identity = this.requireSession(token);
    if(!this.db.prepare('SELECT room_id FROM live_members WHERE room_id=? AND token_hash=?').get(this.roomId,identity))throw new LiveError(403,'Join this room before voting.');
    this.limit(`vote:${identity}`);
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const round = this.db.prepare('SELECT status FROM live_rounds WHERE id=? AND room_id=?').get(roundId, this.roomId);
      if (!round) throw new LiveError(404, 'Round not found.');
      const old = this.db.prepare('SELECT option_id FROM live_votes WHERE round_id=? AND token_hash=?').get(roundId, identity);
      if (old) {
        if (old.option_id !== optionId) throw new LiveError(409, 'Your vote has already been recorded.');
      } else {
        if (round.status !== 'open') throw new LiveError(409, 'Voting has closed.');
        if (!this.db.prepare('SELECT id FROM live_options WHERE round_id=? AND id=?').get(roundId, optionId)) throw new LiveError(400, 'Invalid option.');
        this.db.prepare('INSERT INTO live_votes VALUES(?,?,?)').run(roundId, identity, optionId);
      }
      this.db.exec('COMMIT');
    } catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  closeRound(token: string | undefined, roundId: string, requested: Partial<RoomProvider> = {}) {
    const identity = this.requireSession(token, true);
    const session=this.session(token);const owner=String(session?.account_id||identity);
    const provider = RoomProviderSelection.parse(requested);
    if(provider.mode==='hosted_openai'&&!['admin','creator'].includes(String(session?.account_role)))throw new LiveError(403,'Hosted production requires an authorized account.');
    if (provider.mode === 'hosted_openai' && (!provider.consent || process.env.AIRL_ALLOW_LIVE_REQUESTS !== 'true' || !process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL)) throw new LiveError(403,'Hosted production requires explicit consent and enabled server credentials.');
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const round = this.db.prepare('SELECT * FROM live_rounds WHERE id=? AND room_id=?').get(roundId, this.roomId);
      if (!round) throw new LiveError(404, 'Round not found.');
      if (round.status === 'open') {
        const winner = this.db.prepare('SELECT o.id FROM live_options o LEFT JOIN live_votes v ON v.round_id=o.round_id AND v.option_id=o.id WHERE o.round_id=? GROUP BY o.id ORDER BY COUNT(v.token_hash) DESC,o.position ASC LIMIT 1').get(roundId);
        this.db.prepare("UPDATE live_rounds SET status='closed',winner=? WHERE id=?").run(String(winner!.id), roundId);
      }
      const closed = this.db.prepare('SELECT winner FROM live_rounds WHERE id=?').get(roundId)!;
      const option = this.db.prepare('SELECT title FROM live_options WHERE round_id=? AND id=?').get(roundId,String(closed.winner))!;
      const existing=this.db.prepare('SELECT id FROM room_jobs WHERE round_id=?').get(roundId);
      if(!existing){
        const snapshot=worldSnapshot(this.db,this.roomId);
        if(!snapshot.characters.length)throw new LiveError(400,'Add at least one character before production.');
        this.db.prepare("INSERT INTO room_jobs(id,round_id,room_id,choice,status,created,updated,mode,model,paid_consent,requested_by,snapshot,story_order) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)").run(randomUUID(),roundId,this.roomId,String(option.title),'queued',Date.now(),Date.now(),provider.mode,provider.model || null,provider.consent ? 1 : 0,owner,JSON.stringify(snapshot),snapshot.storyOrder);
        this.db.prepare('UPDATE universes SET next_order=next_order+1 WHERE id=?').run(snapshot.universeId);
      }
      this.db.exec('COMMIT');
    } catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  nextRound(token: string | undefined, previousId: string, options?: {id:string;title:string;description:string}[], sourceEpisodeId?: string) {
    this.requireSession(token, true);
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const latest = this.db.prepare('SELECT id,status FROM live_rounds WHERE room_id=? ORDER BY created DESC,rowid DESC LIMIT 1').get(this.roomId)!;
      if (latest.id === previousId) {
        if (latest.status !== 'closed') throw new LiveError(409, 'Close the current round first.');
        if (sourceEpisodeId) {
          const episode = this.db.prepare('SELECT episode_id FROM universe_episodes WHERE universe_id=? ORDER BY story_order DESC LIMIT 1').get(this.roomId);
          if (episode?.episode_id !== sourceEpisodeId) throw new LiveError(409, 'The published story changed. Generate fresh suggestions.');
        }
        this.insertRound(options);
      }
      this.db.exec('COMMIT');
    } catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  creator(token?: string) { return this.requireSession(token, true); }
  acquireAI(resource: string) {
    const lease = randomUUID();
    const result = this.db.prepare('INSERT INTO ai_leases VALUES(?,?,?) ON CONFLICT(resource) DO UPDATE SET lease_id=excluded.lease_id,expires=excluded.expires WHERE expires<?').run(resource, lease, Date.now() + 150_000, Date.now());
    if (!result.changes) throw new LiveError(409, 'An inference request is already running. Please wait.');
    return lease;
  }
  releaseAI(resource: string, lease: string) { this.db.prepare('DELETE FROM ai_leases WHERE resource=? AND lease_id=?').run(resource, lease); }
  beginUsage(owner: string, mode: string, model: string, operation: string) {
    const configured = Number(process.env.AIRL_AI_DAILY_REQUEST_LIMIT || 20);
    const limit = Number.isInteger(configured) && configured > 0 ? configured : 20;
    const id = randomUUID();
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const count = this.db.prepare('SELECT COUNT(*) count FROM ai_usage WHERE owner=? AND started>?').get(owner, Date.now() - 86400_000)!;
      if (Number(count.count) >= limit) throw new LiveError(429, 'Your daily provider request limit has been reached.');
      if (['hosted_openai', 'creator_byok'].includes(mode) && process.env.AIRL_AI_DAILY_ESTIMATED_USD_LIMIT) {
        const budget = Number(process.env.AIRL_AI_DAILY_ESTIMATED_USD_LIMIT);
        const reservation = Number(process.env.AIRL_AI_REQUEST_RESERVATION_USD || 1);
        if (!Number.isFinite(budget) || budget <= 0 || !Number.isFinite(reservation) || reservation <= 0) throw new LiveError(400, 'Provider budget configuration is invalid.');
        const spending = this.db.prepare("SELECT COALESCE(SUM(COALESCE(estimated_usd,?)),0) total FROM ai_usage WHERE owner=? AND started>? AND mode IN ('hosted_openai','creator_byok')").get(reservation,owner,Date.now()-86400_000)!;
        if (Number(spending.total) + reservation > budget) throw new LiveError(429, 'Your estimated daily spending budget has been reached.');
      }
      this.db.prepare('INSERT INTO ai_usage(id,owner,mode,model,operation,status,started) VALUES(?,?,?,?,?,?,?)').run(id,owner,mode,model,operation,'running',Date.now());
      this.db.exec('COMMIT');
      return id;
    } catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  setUsageModel(id: string, model: string) { this.db.prepare('UPDATE ai_usage SET model=? WHERE id=?').run(model,id); }
  finishUsage(id: string, status: string, input: number | null, output: number | null, cost: number | null, error: string | null) {
    this.db.prepare('UPDATE ai_usage SET status=?,finished=?,input_tokens=?,output_tokens=?,estimated_usd=?,error_code=? WHERE id=?').run(status,Date.now(),input,output,cost,error,id);
  }
  usage(owner: string) { return this.db.prepare('SELECT id,mode,model,operation,status,started,finished,input_tokens,output_tokens,estimated_usd,error_code FROM ai_usage WHERE owner=? ORDER BY started DESC LIMIT 20').all(owner); }
  dispose() { this.db.close(); }
}
