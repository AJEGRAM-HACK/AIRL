import { viewerDemoEnabled } from '@/lib/config/viewer-demo';
import { PlatformStore } from '@/server/platform/store';
import { canonicalCharacters } from '@/ai/memory/canonical';
import { inferenceLimits } from '@/ai/config/limits';
import { GatewayRequest, type Usage } from '@/ai/schemas/gateway';
import { selectProvider, ProviderError } from '@/ai/providers/registry';
import { estimateCost } from '@/ai/usage/estimate';
import { ProductionStore } from '@/server/production/store';
import { produce, safeFailure } from '@/server/production/workflow';
import { LiveStore, LiveError } from '@/server/live/store';
import { sessionToken, errorResponse } from '@/server/live/http';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;
export async function GET() {
  if (viewerDemoEnabled()) return errorResponse(new LiveError(404, 'Endpoint not found.'));
  const store = new LiveStore();
  try {
    const accounts=new PlatformStore();let owner:string;try{owner=accounts.requireAccount(await sessionToken(),true).id;}finally{accounts.close();}
    return Response.json({ usage: store.usage(owner), hostedConfigured: !!process.env.OPENAI_API_KEY && !!process.env.OPENAI_MODEL && process.env.AIRL_ALLOW_LIVE_REQUESTS === 'true', hostedModel: process.env.OPENAI_MODEL || null, ollamaSupported: !process.env.VERCEL }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return errorResponse(error); } finally { store.dispose(); }
}
export async function POST(request: Request) {
  if (viewerDemoEnabled()) return errorResponse(new LiveError(404, 'Endpoint not found.'));
  const store = new LiveStore();
  let usageId: string | undefined;
  let resource: string | undefined;
  let lease: string | undefined;
  let inputTokens: number | null = null, outputTokens: number | null = null;
  let selectedMode = '';
  try {
    const accounts=new PlatformStore();let owner:string;try{owner=accounts.requireAccount(await sessionToken(),true).id;}finally{accounts.close();}
    if (request.headers.get('origin') !== `${new URL(request.url).protocol}//${request.headers.get('host')}`) throw new LiveError(403, 'A same-origin request is required.');
    store.limit(`ai:${owner}`, 8);
    const text = await request.text();
    if (text.length > 4096) throw new LiveError(413, 'Request is too large.');
    let parsed: unknown;
    try { parsed = JSON.parse(text); } catch { throw new LiveError(400, 'Invalid request.'); }
    const input = GatewayRequest.parse(parsed);
    selectedMode = input.mode;
    if (input.mode === 'creator_byok' && new URL(request.url).protocol !== 'https:') throw new LiveError(400, 'BYOK requires an HTTPS connection. Use local Demo or Ollama on this HTTP server.');
    if (input.operation === 'reply' && !input.reply) throw new LiveError(400, 'Choose a character and enter a message.');
    if (input.operation === 'generate' && !input.choice) throw new LiveError(400, 'Enter a story direction.');
    resource = input.mode === 'ollama' ? 'ollama' : `creator:${owner}`;
    lease = store.acquireAI(resource);
    usageId = store.beginUsage(owner, input.mode, input.model || 'provider-default', input.operation);
    const signal = AbortSignal.any([request.signal, AbortSignal.timeout(inferenceLimits().timeoutMs)]);
    const selected = await selectProvider(input, signal, (usage: Usage) => {
      if (usage.inputTokens !== null) inputTokens = (inputTokens || 0) + usage.inputTokens;
      if (usage.outputTokens !== null) outputTokens = (outputTokens || 0) + usage.outputTokens;
    });
    store.setUsageModel(usageId, selected.model);
    await selected.preflight();
    let result: unknown;
    if (input.operation === 'test') {
      // An actual inference proves structured output access, not merely model listing.
      const reply = await selected.provider.generateCharacterReply({ characterId: 'captain-bot', message: 'Introduce yourself in one sentence.' });
      result = { connection: 'tested', reply: reply.text };
    } else if (input.operation === 'reply') result = await selected.provider.generateCharacterReply(input.reply!);
    else {
      const memory = new ProductionStore(':memory:',canonicalCharacters());
      try {
        const job = await produce(memory, selected.executor, { roomId: 'barangay-2099', winningChoice: input.choice! }, selected.model);
        result = { ...job, events: memory.inspect(job.id).events.map(event => ({ stage: event.stage, status: event.status, attempt: event.attempt, timestamp: event.created_at })) };
      } finally { memory.close(); }
    }
    const cost = estimateCost({ inputTokens, outputTokens }, input.mode);
    store.finishUsage(usageId, 'complete', inputTokens, outputTokens, cost, null);
    return Response.json({ mode: input.mode, model: selected.model, label: input.mode === 'demo' ? 'Demo-generated content · Simulated agent workflow' : 'Model inference', result, usage: { inputTokens, outputTokens, estimatedUSD: cost }, capabilities: { backgroundBYOK: false, structuredOutputs: true, timeoutSeconds: inferenceLimits().timeoutMs / 1000, automaticFallback: false } }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    const code = error instanceof ProviderError ? error.code : safeFailure(error).code;
    if (usageId) store.finishUsage(usageId, 'failed', inputTokens, outputTokens, estimateCost({ inputTokens, outputTokens }, selectedMode), code);
    if (error instanceof LiveError) return errorResponse(error);
    return Response.json({ error: code, message: 'Provider request failed. Check configuration, access, quota, or local model availability.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
  } finally {
    if (resource && lease) store.releaseAI(resource, lease);
    store.dispose();
  }
}
