import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { LiveStore, LiveError } from '../src/server/live/store';
import { VoteInput } from '../src/features/live/types';
function setup() {
  const directory = mkdtempSync(join(tmpdir(), 'airl-live-test-'));
  const path = join(directory, 'live.sqlite');
  const store = new LiveStore(path);
  return { store, path, cleanup() { store.dispose(); rmSync(directory, { recursive: true, force: true }); } };
}
const status = (expected: number) => (error: unknown) => error instanceof LiveError && error.status === expected;
test('independent participants record real votes, retry idempotently and persist across connections', () => {
  const t = setup();
  try {
    const a = t.store.join(), b = t.store.join();
    const round = t.store.snapshot().roundId;
    t.store.vote(a, round, 'karaoke');
    t.store.vote(a, round, 'karaoke');
    t.store.vote(b, round, 'taho');
    assert.throws(() => t.store.vote(a, round, 'offline'), status(409));
    const reopened = new LiveStore(t.path);
    try {
      assert.equal(reopened.snapshot().totalVotes, 2);
      assert.equal(reopened.snapshot().participantCount, 2);
      assert.equal(reopened.personal(a).vote, 'karaoke');
      assert.equal(reopened.personal(b).vote, 'taho');
    } finally { reopened.dispose(); }
  } finally { t.cleanup(); }
});
test('only operator can close, ties are deterministic, code rotates identity and cannot be reused', () => {
  const t = setup();
  try {
    const a = t.store.join(), b = t.store.join();
    const round = t.store.snapshot().roundId;
    t.store.vote(a, round, 'karaoke');
    t.store.vote(b, round, 'taho');
    assert.throws(() => t.store.closeRound(a, round), status(403));
    assert.throws(() => t.store.closeRound(undefined, round), status(401));
    const code = t.store.issueOperatorCode();
    const operator = t.store.redeemOperatorCode(a, code);
    assert.equal(t.store.session(a), undefined);
    assert.equal(t.store.personal(operator).vote, 'karaoke');
    assert.equal(t.store.snapshot().participantCount, 2);
    assert.throws(() => t.store.redeemOperatorCode(b, code), status(403));
    t.store.closeRound(operator, round);
    t.store.closeRound(operator, round);
    assert.equal(t.store.snapshot().winner, 'karaoke');
    assert.equal(t.store.snapshot().status, 'closed');
    const c = t.store.join();
    assert.throws(() => t.store.vote(c, round, 'offline'), status(409));
    t.store.vote(b, round, 'taho'); // Safe retry after closure.
    t.store.nextRound(operator, round);
    const next = t.store.snapshot();
    assert.notEqual(next.roundId, round);
    assert.equal(next.totalVotes, 0);
    assert.equal(t.store.personal(operator).vote, null);
    t.store.nextRound(operator, round); // Replayed creation doesn't add another round.
    assert.equal(t.store.snapshot().roundId, next.roundId);
  } finally { t.cleanup(); }
});
test('server rejects forged identities, foreign choices and malformed client-supplied permissions', () => {
  const t = setup();
  try {
    const round = t.store.snapshot().roundId;
    assert.throws(() => t.store.vote('invented-cookie', round, 'taho'), status(401));
    const participant = t.store.join();
    assert.throws(() => t.store.vote(participant, round, 'invalid'), status(400));
    assert.throws(() => t.store.vote(participant, 'missing', 'taho'), status(404));
    assert.equal(VoteInput.safeParse({ roundId: round, optionId: 'taho', role: 'operator' }).success, false);
    assert.equal(t.store.snapshot().totalVotes, 0);
    assert.throws(() => t.store.nextRound(participant, round), status(403));
  } finally { t.cleanup(); }
});
test('rate limits persist and an empty round closes with stable displayed-order winner', () => {
  const t = setup();
  try {
    t.store.limit('test', 1);
    assert.throws(() => t.store.limit('test', 1), status(429));
    const operator = t.store.redeemOperatorCode(t.store.join(), t.store.issueOperatorCode());
    const round = t.store.snapshot().roundId;
    assert.throws(() => t.store.nextRound(operator, round), status(409));
    t.store.closeRound(operator, round);
    assert.equal(t.store.snapshot().winner, 'karaoke');
  } finally { t.cleanup(); }
});
