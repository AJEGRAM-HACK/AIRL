import type { Usage } from '@/ai/schemas/gateway';
export function estimateCost(usage: Usage, mode: string, env: Record<string, string | undefined> = process.env) {
  if (mode === 'demo' || mode === 'ollama') return 0;
  const inputRate = Number(env.AIRL_AI_INPUT_USD_PER_MILLION);
  const outputRate = Number(env.AIRL_AI_OUTPUT_USD_PER_MILLION);
  if (usage.inputTokens === null || usage.outputTokens === null || !env.AIRL_AI_INPUT_USD_PER_MILLION || !env.AIRL_AI_OUTPUT_USD_PER_MILLION || !Number.isFinite(inputRate) || !Number.isFinite(outputRate) || inputRate < 0 || outputRate < 0) return null;
  return (usage.inputTokens * inputRate + usage.outputTokens * outputRate) / 1_000_000;
}
