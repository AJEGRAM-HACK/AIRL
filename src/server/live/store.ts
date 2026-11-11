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
  constructor(path = resolve(process.env.AIRL_LIVE_DB_PATH || '.data/airl-live.sqlite')) {
    mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
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
    if (!this.db.prepare('SELECT id FROM live_rounds WHERE room_id=? LIMIT 1').get(DEMO_ROOM)) {
      this.db.exec('BEGIN IMMEDIATE');
      try {
        // Recheck after the lock in case another process seeded this room.
        if (!this.db.prepare('SELECT id FROM live_rounds WHERE room_id=? LIMIT 1').get(DEMO_ROOM)) this.insertRound();
        this.db.exec('COMMIT');
      } catch (error) { this.db.exec('ROLLBACK'); throw error; }
    }
  }
  private insertRound() {
    const id = randomUUID();
    this.db.prepare('INSERT INTO live_rounds VALUES(?,?,?,NULL,?)').run(id, DEMO_ROOM, 'open', Date.now());
    choices.forEach((choice, index) => this.db.prepare('INSERT INTO live_options VALUES(?,?,?,?,?)').run(id, choice.id, choice.title, choice.description, index));
    return id;
  }
  limit(identity: string, maximum = 40) {
    const now = Date.now();
    const row = this.db.prepare(`INSERT INTO live_limits VALUES(?,1,?) ON CONFLICT(identity) DO UPDATE SET count=CASE WHEN reset_at<? THEN 1 ELSE count+1 END,reset_at=CASE WHEN reset_at<? THEN ? ELSE reset_at END RETURNING count`).get(hash(identity), now + 60_000, now, now, now + 60_000);
    if (Number(row?.count) > maximum) throw new LiveError(429, 'Please wait a minute before trying again.');
  }
  session(token?: string) {
    if (!token) return undefined;
    return this.db.prepare('SELECT token_hash,role FROM live_sessions WHERE token_hash=? AND expires>?').get(hash(token), Date.now());
  }
  join(token?: string) {
    const existing = this.session(token);
    const value = existing && token ? token : randomBytes(32).toString('base64url');
    if (!existing) this.db.prepare('INSERT INTO live_sessions VALUES(?,?,?)').run(hash(value), 'participant', Date.now() + 7 * 86400_000);
    this.db.prepare('INSERT OR IGNORE INTO live_members VALUES(?,?)').run(DEMO_ROOM, hash(value));
    return value;
  }
  private requireSession(token?: string, operator = false) {
    const session = this.session(token);
    if (!session) throw new LiveError(401, 'Join the room first.');
    if (operator && session.role !== 'operator') throw new LiveError(403, 'Operator access is required.');
    return String(session.token_hash);
  }
  issueOperatorCode() {
    const code = randomBytes(24).toString('base64url');
    this.db.prepare('INSERT INTO live_operator_codes VALUES(?,?)').run(hash(code), Date.now() + 10 * 60_000);
    return code;
  }
  redeemOperatorCode(token: string | undefined, code: string) {
    const identity = this.requireSession(token);
    this.limit(`operator:${identity}`, 10);
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const result = this.db.prepare('DELETE FROM live_operator_codes WHERE code_hash=? AND expires>?').run(hash(code), Date.now());
      if (!result.changes) throw new LiveError(403, 'The operator code is invalid or expired.');
      // Rotate the cookie token when privilege changes.
      const rotated = randomBytes(32).toString('base64url');
      this.db.prepare('INSERT INTO live_sessions VALUES(?,?,?)').run(hash(rotated), 'operator', Date.now() + 8 * 3600_000);
      this.db.prepare('DELETE FROM live_sessions WHERE token_hash=?').run(identity);
      this.db.prepare('INSERT OR IGNORE INTO live_members VALUES(?,?)').run(DEMO_ROOM, hash(rotated));
      // Keep the same participant identity for votes and membership.
      this.db.prepare('UPDATE live_votes SET token_hash=? WHERE token_hash=?').run(hash(rotated), identity);
      this.db.prepare('DELETE FROM live_members WHERE token_hash=?').run(identity);
      this.db.exec('COMMIT');
      return rotated;
    } catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  snapshot(): RoomState {
    this.db.exec('BEGIN');
    try {
      const round = this.db.prepare('SELECT * FROM live_rounds WHERE room_id=? ORDER BY created DESC,rowid DESC LIMIT 1').get(DEMO_ROOM)!;
      const options = this.db.prepare('SELECT o.id,o.title,o.description,COUNT(v.token_hash) votes FROM live_options o LEFT JOIN live_votes v ON v.round_id=o.round_id AND v.option_id=o.id WHERE o.round_id=? GROUP BY o.id ORDER BY o.position').all(String(round.id));
      const participants = this.db.prepare('SELECT COUNT(*) count FROM live_members WHERE room_id=?').get(DEMO_ROOM)!;
      this.db.exec('COMMIT');
      return { roomId: DEMO_ROOM, roundId: String(round.id), status: round.status as 'open' | 'closed', winner: round.winner ? String(round.winner) : null, participantCount: Number(participants.count), totalVotes: options.reduce((sum, item) => sum + Number(item.votes), 0), options: options.map(item => ({ id: String(item.id), title: String(item.title), description: String(item.description), votes: Number(item.votes) })) };
    } catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  personal(token?: string) {
    const session = this.session(token);
    const state = this.snapshot();
    const vote = session ? this.db.prepare('SELECT option_id FROM live_votes WHERE round_id=? AND token_hash=?').get(state.roundId, String(session.token_hash)) : undefined;
    return { joined: !!session, operator: session?.role === 'operator', vote: vote ? String(vote.option_id) : null };
  }
  vote(token: string | undefined, roundId: string, optionId: string) {
    const identity = this.requireSession(token);
    this.limit(`vote:${identity}`);
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const round = this.db.prepare('SELECT status FROM live_rounds WHERE id=? AND room_id=?').get(roundId, DEMO_ROOM);
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
  closeRound(token: string | undefined, roundId: string) {
    this.requireSession(token, true);
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const round = this.db.prepare('SELECT * FROM live_rounds WHERE id=? AND room_id=?').get(roundId, DEMO_ROOM);
      if (!round) throw new LiveError(404, 'Round not found.');
      if (round.status === 'open') {
        const winner = this.db.prepare('SELECT o.id FROM live_options o LEFT JOIN live_votes v ON v.round_id=o.round_id AND v.option_id=o.id WHERE o.round_id=? GROUP BY o.id ORDER BY COUNT(v.token_hash) DESC,o.position ASC LIMIT 1').get(roundId);
        this.db.prepare("UPDATE live_rounds SET status='closed',winner=? WHERE id=?").run(String(winner!.id), roundId);
      }
      const closed = this.db.prepare('SELECT winner FROM live_rounds WHERE id=?').get(roundId)!;
      const option = this.db.prepare('SELECT title FROM live_options WHERE round_id=? AND id=?').get(roundId,String(closed.winner))!;
      this.db.prepare("INSERT OR IGNORE INTO room_jobs(id,round_id,room_id,choice,status,created,updated) VALUES(?,?,?,?,?,?,?)").run(randomUUID(),roundId,DEMO_ROOM,String(option.title),'queued',Date.now(),Date.now());
      this.db.exec('COMMIT');
    } catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  nextRound(token: string | undefined, previousId: string) {
    this.requireSession(token, true);
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const latest = this.db.prepare('SELECT id,status FROM live_rounds WHERE room_id=? ORDER BY created DESC,rowid DESC LIMIT 1').get(DEMO_ROOM)!;
      if (latest.id === previousId) {
        if (latest.status !== 'closed') throw new LiveError(409, 'Close the current round first.');
        this.insertRound();
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
