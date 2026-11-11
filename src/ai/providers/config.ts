import { creativeExecutor, DemoCreativeProvider } from './creative';
export async function configuredProvider(env: Record<string, string | undefined> = process.env) {
  const mode = env.AI_PROVIDER || 'demo';
  if (mode === 'demo') return { mode, model: 'deterministic-template-v1', executor: creativeExecutor(new DemoCreativeProvider()) };
  if (mode !== 'openai') throw new Error('AI_PROVIDER must be demo or openai.');
  if (!env.OPENAI_API_KEY || !env.OPENAI_MODEL) throw new Error('Live mode requires OPENAI_API_KEY and OPENAI_MODEL.');
  if (env.AIRL_ALLOW_LIVE_REQUESTS !== 'true') throw new Error('Authorize paid requests explicitly by setting AIRL_ALLOW_LIVE_REQUESTS=true.');
  const { OpenAICreativeProvider } = await import('./openai');
  const provider = new OpenAICreativeProvider(env.OPENAI_API_KEY, env.OPENAI_MODEL);
  return { mode, model: env.OPENAI_MODEL, executor: creativeExecutor(provider, () => provider.preflight()) };
}
