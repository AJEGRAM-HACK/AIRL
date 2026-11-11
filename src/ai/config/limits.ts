function boundedInteger(value: string | undefined, fallback: number, minimum: number, maximum: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum ? parsed : fallback;
}
export function inferenceLimits(env: Record<string, string | undefined> = process.env) {
  return {
    timeoutMs: boundedInteger(env.AIRL_AI_REQUEST_TIMEOUT_MS, 110_000, 1000, 110_000),
    outputTokens: boundedInteger(env.AIRL_AI_MAX_OUTPUT_TOKENS, 2400, 256, 4000),
    contextWindow: boundedInteger(env.OLLAMA_CONTEXT_WINDOW, 8192, 4096, 8192),
  };
}
