import { inferenceLimits } from '@/ai/config/limits';
import { LiveStore } from '@/server/live/store';
import { z } from 'zod';
import { Concept, Script, Manifest, Critique } from '@/server/production/schemas';
import { instructions } from '@/server/production/openai';
import { characterPrompt } from '@/ai/prompts/character';
import { ReplyOutput, type CharacterReplyInput, type Usage } from '@/ai/schemas/gateway';
import type { CreativeAIProvider, StoryInput, ScriptInput, ScriptOutput, ReviewInput } from './creative';
const endpoint = 'http://127.0.0.1:11434';
let active = false;
export async function ollamaModels(signal?: AbortSignal) {
  if (process.env.VERCEL) throw new Error('Local Ollama is unavailable from a Vercel deployment.');
  const response = await fetch(`${endpoint}/api/tags`, { signal: signal || AbortSignal.timeout(3000), redirect: 'error' });
  if (!response.ok) throw new Error('Ollama is unavailable.');
  const data = z.object({ models: z.array(z.object({ name: z.string() })) }).parse(await response.json());
  return data.models.map(model => model.name);
}
export class OllamaCreativeProvider implements CreativeAIProvider {
  readonly mode = 'ollama';
  constructor(readonly model: string, private signal: AbortSignal = AbortSignal.timeout(120_000), private onUsage?: (usage: Usage) => void) {}
  async preflight() {
    if (!(await ollamaModels(this.signal)).includes(this.model)) throw new Error('The selected Ollama model is not installed.');
  }
  private async infer<T extends z.ZodType>(schema: T, instruction: string, input: unknown): Promise<z.infer<T>> {
    if (active) throw new Error('Local inference is busy. Retry when the current request finishes.');
    active = true;
    let lockStore: LiveStore | undefined;
    let lease: string | undefined;
    try {
      lockStore = new LiveStore();
      lease = lockStore.acquireAI('ollama-inference');
      if (process.env.VERCEL) throw new Error('Ollama requires the local Mac server.');
      const response = await fetch(`${endpoint}/api/chat`, {
        method: 'POST', redirect: 'error', signal: this.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: this.model, stream: false, think: false, keep_alive: '5m', format: z.toJSONSchema(schema), options: { num_ctx: inferenceLimits().contextWindow, num_predict: inferenceLimits().outputTokens, temperature: 0 }, messages: [{ role: 'system', content: `${instruction} Return compact JSON matching the supplied schema. Exactly three scenes when requested. Use concise dialogue and no markdown.` }, { role: 'user', content: JSON.stringify(input) }] }),
      });
      if (!response.ok) throw new Error('Local inference failed.');
      const result = z.object({ message: z.object({ content: z.string() }), prompt_eval_count: z.number().optional(), eval_count: z.number().optional() }).parse(await response.json());
      this.onUsage?.({ inputTokens: result.prompt_eval_count ?? null, outputTokens: result.eval_count ?? null });
      return schema.parse(JSON.parse(result.message.content));
    } finally {
      if (lease) lockStore?.releaseAI('ollama-inference', lease);
      lockStore?.dispose();
      active = false;
    }
  }
  async generateStory(input: StoryInput & { context?: unknown }) { return this.infer(Concept, instructions['Story Director'], input); }
  async generateScript(input: ScriptInput) { return this.infer(Script, instructions.Screenwriter, input); }
  async generateScenes(input: ScriptOutput) {
    const visualPlan = Manifest.omit({ scenes: true }).extend({ scenes: z.array(Manifest.shape.scenes.element.omit({ id: true, dialogue: true })).length(3) });
    const plan = await this.infer(visualPlan, instructions['Visual Producer'] + ' Choose visual properties only, in script order. Each scene should last 6 seconds. The application preserves original dialogue and scene IDs.', input);
    return Manifest.parse({ title: plan.title, scenes: plan.scenes.map((scene, index) => ({ ...scene, id: input.scenes[index].id, dialogue: input.scenes[index].dialogue, characters: [...new Set([...scene.characters, ...input.scenes[index].dialogue.map(line => line.characterId)])] })) });
  }
  async reviewContent(input: ReviewInput) { return this.infer(Critique, instructions['Creative Critic'], input); }
  async generateCharacterReply(input: CharacterReplyInput) { return this.infer(ReplyOutput, 'Respond as the fictional character using only supplied canon and at most 80 words.', characterPrompt(input)); }
}
