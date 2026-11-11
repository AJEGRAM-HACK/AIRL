import { platformRequest } from "@/server/platform/http";
import { ollamaModels } from "@/ai/providers/ollama";
export const dynamic = "force-dynamic";
export function GET(request: Request) {
  return platformRequest(request, async (store, token) => {
    store.requireAccount(token);
    let local: string[] = [];
    let localError: string | null = null;
    try {
      local = await ollamaModels();
    } catch {
      localError = "Ollama is unavailable on this server.";
    }
    const enabled =
      !!process.env.OPENAI_API_KEY &&
      process.env.AIRL_ALLOW_LIVE_REQUESTS === "true";
    return {
      defaultMode: "ollama",
      defaultModel: process.env.OLLAMA_MODEL || "qwen3:4b-instruct",
      ollama: local,
      ollamaError: localError,
      hosted: enabled
        ? (process.env.OPENAI_ALLOWED_MODELS || process.env.OPENAI_MODEL || "")
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean)
        : [],
      hostedConfigured: enabled,
    };
  });
}
