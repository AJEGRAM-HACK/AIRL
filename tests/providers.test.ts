import { test } from 'node:test';
import assert from 'node:assert/strict';
import { selectProvider } from '../src/ai/providers/registry';
import { GatewayRequest } from '../src/ai/schemas/gateway';
import { estimateCost } from '../src/ai/usage/estimate';
test('BYOK uses only the supplied creator credential and fails without fallback (mock transport)', async () => {
  const original = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = async (_url, options) => {
    calls++;
    const headers = new Headers(options?.headers);
    assert.equal(headers.get('authorization'), 'Bearer creator-test-key');
    return new Response(JSON.stringify({ error: { message: 'credential-secret-must-not-be-logged', type: 'invalid_request_error', code: 'invalid_api_key' } }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  };
  try {
    const selected = await selectProvider({ mode: 'creator_byok', model: 'test-model', apiKey: 'creator-test-key', consent: true }, AbortSignal.timeout(5000), undefined, { OPENAI_API_KEY: 'hosted-key-must-not-be-used' });
    await assert.rejects(selected.preflight());
    assert.equal(calls, 1);
  } finally { globalThis.fetch = original; }
});
test('paid requests need explicit consent and missing BYOK never selects the hosted key', async () => {
  await assert.rejects(selectProvider({ mode: 'hosted_openai', consent: false }, AbortSignal.timeout(1000)), /consent/);
  await assert.rejects(selectProvider({ mode: 'creator_byok', consent: true, model: 'test' }, AbortSignal.timeout(1000), undefined, { OPENAI_API_KEY: 'hosted-test-key' }), /credential_missing/);
  assert.equal(GatewayRequest.safeParse({ mode: 'creator_byok', model: 'sk-secret', operation: 'test' }).success, false);
});
test('demo character inference needs no network and cost estimates use only configured rates', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('Unexpected network call'); };
  try {
    const selected = await selectProvider({ mode: 'demo', consent: false }, AbortSignal.timeout(1000));
    assert.match((await selected.provider.generateCharacterReply({ characterId: 'tita-nena', message: 'karaoke' })).text, /karaoke/);
  } finally { globalThis.fetch = original; }
  assert.equal(estimateCost({ inputTokens: 1000, outputTokens: 1000 }, 'creator_byok', {}), null);
  assert.equal(estimateCost({ inputTokens: 1000, outputTokens: 1000 }, 'creator_byok', { AIRL_AI_INPUT_USD_PER_MILLION: '1', AIRL_AI_OUTPUT_USD_PER_MILLION: '2' }), .003);
});
test('cloud deployments reject Ollama before making a localhost request', async () => {
  await assert.rejects(selectProvider({ mode: 'ollama', consent: false }, AbortSignal.timeout(1000), undefined, { VERCEL: '1' }), /local_server/);
});
test('creator leases, request limits and usage history enforce server-side isolation', async () => {
  const { LiveStore } = await import('../src/server/live/store');
  const { mkdtempSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const directory = mkdtempSync(join(tmpdir(), 'airl-provider-test-'));
  const store = new LiveStore(join(directory, 'usage.sqlite'));
  const oldLimit = process.env.AIRL_AI_DAILY_REQUEST_LIMIT;
  try {
    const user = store.join();
    assert.throws(() => store.creator(user));
    const creatorToken = store.redeemOperatorCode(user, store.issueOperatorCode());
    const owner = store.creator(creatorToken);
    const lease = store.acquireAI('ollama-test');
    assert.throws(() => store.acquireAI('ollama-test'));
    store.releaseAI('ollama-test', lease);
    process.env.AIRL_AI_DAILY_REQUEST_LIMIT = '1';
    const id = store.beginUsage(owner, 'demo', 'template', 'test');
    store.finishUsage(id, 'complete', 0, 0, 0, null);
    assert.throws(() => store.beginUsage(owner, 'demo', 'template', 'test'));
    assert.equal(store.usage(owner).length, 1);
    assert.equal(store.usage('unrelated-user').length, 0);
    assert.equal(JSON.stringify(store.usage(owner)).includes('apiKey'), false);
  } finally {
    if (oldLimit === undefined) delete process.env.AIRL_AI_DAILY_REQUEST_LIMIT;
    else process.env.AIRL_AI_DAILY_REQUEST_LIMIT = oldLimit;
    store.dispose(); rmSync(directory, { recursive: true, force: true });
  }
});
test('hosted mode preserves production history from the legacy openai identifier', async () => {
  const { ProductionStore } = await import('../src/server/production/store');
  const store = new ProductionStore(':memory:');
  try {
    const id = store.create({ roomId: 'barangay-2099', winningChoice: 'Legacy event' }, 'test', 'openai');
    store.approve(id, 'barangay-2099', { legacy: true }, []);
    assert.equal(store.context('barangay-2099', 'hosted_openai').approvedHistory.length, 1);
    assert.equal(store.context('barangay-2099', 'ollama').approvedHistory.length, 0);
  } finally { store.close(); }
});

test('Ollama script context preserves approved canon without escaped base and incomplete JSON is retryable', async () => {
  const { OllamaCreativeProvider } = await import('../src/ai/providers/ollama');
  const { DemoCreativeProvider } = await import('../src/ai/providers/creative');
  const { z } = await import('zod');
  const { mkdtempSync, rmSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const directory = mkdtempSync(join(tmpdir(), 'airl-ollama-script-'));
  const original = globalThis.fetch;
  const oldPath = process.env.AIRL_LIVE_DB_PATH;
  process.env.AIRL_LIVE_DB_PATH = join(directory, 'usage.sqlite');
  const demo = new DemoCreativeProvider();
  const input = { roomId: 'barangay-2099' as const, winningChoice: 'Karaoke night' };
  const concept = await demo.generateStory(input);
  const expected = await demo.generateScript({input, concept});
  let calls = 0;
  globalThis.fetch = async (_url, options) => {
    const body = JSON.parse(String(options?.body));
    const payload = JSON.parse(body.messages[1].content);
    assert.equal(payload.base, undefined);
    assert.deepEqual(payload.context.characters, [{ id: 'captain-bot', memories: ['Approved memory'] }]);
    assert.deepEqual(payload.context.history, ['Approved history']);
    assert.deepEqual(payload.feedback, { feedback: ['Keep continuity'] });
    assert.equal(body.format.properties.scenes.maxItems, 3);
    calls++;
    return Response.json({ message: { content: calls === 1 ? '{"title":' : JSON.stringify(expected) } });
  };
  try {
    const provider = new OllamaCreativeProvider('test-local-model');
    const extended = { input, concept, feedback: { feedback: ['Keep continuity'] }, base: JSON.stringify({context:{characters:[{id:'captain-bot',memories:['Approved memory']}],approvedHistory:[{script:{summary:'Approved history'}}]}}) };
    await assert.rejects(provider.generateScript(extended), z.ZodError);
    assert.deepEqual(await provider.generateScript(extended), expected);
    assert.equal(calls, 2);
  } finally {
    globalThis.fetch = original;
    if(oldPath === undefined) delete process.env.AIRL_LIVE_DB_PATH; else process.env.AIRL_LIVE_DB_PATH = oldPath;
    rmSync(directory, {recursive:true, force:true});
  }
});
