import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { configuredProvider } from '../src/ai/providers/config';
import { DemoCreativeProvider } from '../src/ai/providers/creative';
import { ProductionStore } from '../src/server/production/store';
import { produce } from '../src/server/production/workflow';
import { scriptedResponse } from '../src/features/persona/scenarios';

test('demo is deterministic, choice-sensitive, schema valid and makes zero network requests', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('Network forbidden in demo test'); };
  const directory = mkdtempSync(join(tmpdir(), 'airl-demo-'));
  const store = new ProductionStore(join(directory, 'demo.sqlite'));
  try {
    const provider = await configuredProvider({});
    assert.equal(provider.mode, 'demo');
    const input = { roomId: 'barangay-2099' as const, winningChoice: 'Launch a mandatory karaoke night' };
    const first = await produce(store, provider.executor, input, provider.model);
    const second = await produce(store, provider.executor, input, provider.model);
    const third = await produce(store, provider.executor, { ...input, winningChoice: 'Declare taho the official currency' }, provider.model);
    assert.equal(first.status, 'complete');
    assert.deepEqual(first.manifest, second.manifest);
    assert.notDeepEqual(first.manifest, third.manifest);
    const saved = store.inspect(first.id);
    assert.equal(saved.production?.execution_mode, 'demo');
    assert.equal(saved.events.filter(event => event.status === 'succeeded').length, 5);
    assert.match(String(saved.episode?.artifact), /"executionMode":"demo"/);
  } finally {
    globalThis.fetch = originalFetch;
    store.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
test('invalid provider and unapproved live configuration stop before network access', async () => {
  await assert.rejects(configuredProvider({ AI_PROVIDER: 'unknown' }));
  await assert.rejects(configuredProvider({ AI_PROVIDER: 'openai' }));
  await assert.rejects(configuredProvider({ AI_PROVIDER: 'openai', OPENAI_API_KEY: 'test', OPENAI_MODEL: 'test' }), /Authorize/);
});
test('demo review rejects changed dialogue and character responses repeat deterministically', async () => {
  const provider = new DemoCreativeProvider();
  const input = { roomId: 'barangay-2099' as const, winningChoice: 'Karaoke night' };
  const script = await provider.generateScript({ input, concept: await provider.generateStory(input) });
  const manifest = await provider.generateScenes(script);
  const changed = structuredClone(manifest);
  changed.scenes[0].dialogue[0].text = 'Changed';
  await assert.rejects(provider.reviewContent({ script, manifest: changed }));
  assert.equal(scriptedResponse('tita-nena', 'decision'), scriptedResponse('tita-nena', 'decision'));
  assert.throws(() => scriptedResponse('unknown', 'greeting'));
});
