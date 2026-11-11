import { DemoCreativeProvider, creativeExecutor, type CreativeAIProvider } from './creative';
import { ModelId, type ProviderSelection, type Usage } from '@/ai/schemas/gateway';
export class ProviderError extends Error {
  constructor(public code: string) { super(code); }
}
export async function selectProvider(selection: ProviderSelection, signal: AbortSignal, onUsage?: (usage: Usage) => void, env: Record<string, string | undefined> = process.env) {
  const model = selection.model;
  let provider: CreativeAIProvider;
  let selectedModel: string;
  let preflight = async () => {};
  switch (selection.mode) {
    case 'demo':
      selectedModel = 'deterministic-template-v1'; provider = new DemoCreativeProvider(); break;
    case 'ollama': {
      const { OllamaCreativeProvider, ollamaModels } = await import('./ollama');
      if (env.VERCEL) throw new ProviderError('ollama_requires_local_server');
      const available = await ollamaModels(AbortSignal.any([signal, AbortSignal.timeout(3000)]));
      selectedModel = model || env.OLLAMA_MODEL || 'qwen3:4b-instruct';
      if (!selectedModel || !available.includes(selectedModel)) throw new ProviderError('model_not_installed');
      const local = new OllamaCreativeProvider(selectedModel, signal, onUsage);
      provider = local; preflight = () => local.preflight(); break;
    }
    case 'hosted_openai':
    case 'creator_byok': {
      if (!selection.consent) throw new ProviderError('explicit_paid_request_consent_required');
      const key = selection.mode === 'creator_byok' ? selection.apiKey : env.OPENAI_API_KEY;
      if (!key) throw new ProviderError('credential_missing');
      if (selection.mode === 'hosted_openai' && env.AIRL_ALLOW_LIVE_REQUESTS !== 'true') throw new ProviderError('hosted_requests_not_enabled');
      selectedModel = ModelId.parse(model || (selection.mode === 'hosted_openai' ? env.OPENAI_MODEL : undefined));
      const allowed=(env.OPENAI_ALLOWED_MODELS || env.OPENAI_MODEL || '').split(',').map(value=>value.trim()).filter(Boolean);
      if(selection.mode==='hosted_openai'&&!allowed.includes(selectedModel))throw new ProviderError('model_not_allowed');
      const { OpenAICreativeProvider } = await import('./openai');
      const openai = new OpenAICreativeProvider(key, selectedModel, signal, onUsage);
      provider = openai; preflight = () => openai.preflight(); break;
    }
    default: throw new ProviderError('unknown_provider');
  }
  return { provider, model: selectedModel, executor: { ...creativeExecutor(provider, preflight), executionMode: selection.mode }, preflight };
}
