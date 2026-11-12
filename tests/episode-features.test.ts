import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PlatformStore } from '../src/server/platform/store';
import { LiveStore } from '../src/server/live/store';
import { RoomJobs, runRoomJob } from '../src/server/production/room-jobs';
import { DemoCreativeProvider } from '../src/ai/providers/creative';
import { episodeAudio } from '../src/server/production/audio';
import { suggestNextEpisode } from '../src/server/platform/suggestions';

test('local episode audio contains speech, matches scene timing and coalesces concurrent preparation', { skip: process.platform !== 'darwin' }, async () => {
  const directory = mkdtempSync(join(tmpdir(), 'airl-audio-test-'));
  try {
    const provider = new DemoCreativeProvider();
    const manifest = await provider.generateScenes({ title: 'Audio timing', summary: '', memoryUpdates: [], scenes: [1, 2, 3].map(index => ({
      id: `scene-${index}`, description: '', dialogue: [{ characterId: 'captain-bot', text: 'Hello, barangay.' }],
    })) });
    const [first, concurrent] = await Promise.all([episodeAudio(manifest, join(directory, 'test.sqlite')), episodeAudio(manifest, join(directory, 'test.sqlite'))]);
    assert.deepEqual(first, concurrent);
    assert.equal(first.readUInt32LE(24), 22050);
    assert.equal((first.length - 44) / (22050 * 2), 18);
    for (const second of [0, 6, 12]) {
      const start = 44 + second * 22050 * 2;
      assert.ok(first.subarray(start, start + 22050 * 2).some(byte => byte !== 0));
    }
    assert.deepEqual(await episodeAudio(manifest, join(directory, 'test.sqlite')), first);
    assert.equal(readdirSync(join(directory, 'episode-audio')).length, 1);
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test('next-episode suggestions require owned published context and open an idempotent round from that episode', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'airl-suggestions-test-'));
  const path = join(directory, 'test.sqlite');
  const store = new PlatformStore(path);
  const token = store.signup('suggest-admin@example.test', 'Admin', 'test-password-1234');
  store.bootstrapAdmin('suggest-admin@example.test');
  const admin = store.requireAccount(token);
  const viewerToken = store.signup('suggest-viewer@example.test', 'Viewer', 'test-password-1234');
  const viewer = store.requireAccount(viewerToken);
  const live = new LiveStore(path);
  const jobs = new RoomJobs(path);
  try {
    await assert.rejects(suggestNextEpisode(store, 'barangay-2099', admin, { mode: 'demo', consent: false }, crypto.randomUUID()), /Publish an episode/);
    const round = live.snapshot();
    live.closeRound(token, round.roundId, { mode: 'demo' });
    await runRoomJob(path);
    const job = jobs.list('barangay-2099', true)[0];
    jobs.action(job.id, 'publish');
    const episode = store.episodes('barangay-2099', admin).at(-1)!;
    await assert.rejects(suggestNextEpisode(store, 'barangay-2099', viewer, { mode: 'demo', consent: false }, episode.episode_id));
    await assert.rejects(suggestNextEpisode(store, 'barangay-2099', admin, { mode: 'demo', consent: false }, crypto.randomUUID()), /newer episode/);
    const suggestions = await suggestNextEpisode(store, 'barangay-2099', admin, { mode: 'demo', consent: false }, episode.episode_id);
    assert.equal(suggestions.result.options.length, 3);
    assert.ok(suggestions.result.options[0].description.includes(episode.artifact.manifest.title));
    assert.equal(suggestions.mode, 'demo');
    assert.throws(() => live.nextRound(token, round.roundId, suggestions.result.options, crypto.randomUUID()), /published story changed/);
    assert.equal(live.snapshot().roundId, round.roundId);
    live.nextRound(token, round.roundId, suggestions.result.options, suggestions.episodeId);
    const next = live.snapshot();
    assert.equal(next.status, 'open');
    assert.deepEqual(next.options.map(option => option.title), suggestions.result.options.map(option => option.title));
    live.nextRound(token, round.roundId, [{ id: 'replace', title: 'Wrong replacement', description: '' }], suggestions.episodeId);
    assert.equal(live.snapshot().roundId, next.roundId);
    assert.equal(live.snapshot().options.length, 3);
    assert.equal(store.episodes('barangay-2099', admin).length, 1);
  } finally { jobs.close(); live.dispose(); store.close(); rmSync(directory, { recursive: true, force: true }); }
});
