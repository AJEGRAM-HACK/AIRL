import { inferenceLimits } from '@/ai/config/limits';
import { selectProvider } from './registry';
import { ProviderMode } from '@/ai/schemas/gateway';
export async function configuredProvider(env: Record<string, string | undefined> = process.env) {
  const mode = ProviderMode.parse(env.AI_PROVIDER === 'openai' ? 'hosted_openai' : env.AI_PROVIDER || 'ollama');
  if (mode === 'creator_byok') throw new Error('BYOK requires an authenticated HTTPS request and cannot run as a background CLI job.');
  if (mode === 'hosted_openai' && env.AIRL_ALLOW_LIVE_REQUESTS !== 'true') throw new Error('Authorize paid requests explicitly by setting AIRL_ALLOW_LIVE_REQUESTS=true.');
  const selected = await selectProvider({ mode, model: mode === 'ollama' ? env.OLLAMA_MODEL : env.OPENAI_MODEL, consent: env.AIRL_ALLOW_LIVE_REQUESTS === 'true' }, AbortSignal.timeout(inferenceLimits(env).timeoutMs), undefined, env);
  return { ...selected, mode };
}
