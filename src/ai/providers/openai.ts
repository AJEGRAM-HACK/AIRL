import { Concept, Script, Manifest, Critique } from '@/server/production/schemas';
import { createOpenAIExecutor } from '@/server/production/openai';
import type { CreativeAIProvider, StoryInput, ScriptInput, ScriptOutput, ReviewInput } from './creative';
export class OpenAICreativeProvider implements CreativeAIProvider {
  readonly mode = 'openai';
  private executor;
  constructor(key: string, model: string) { this.executor = createOpenAIExecutor(key, model); }
  async preflight() { await this.executor.preflight(); }
  async generateStory(input: StoryInput & { context?: unknown }) { return Concept.parse(await this.executor.execute('Story Director', Concept, JSON.stringify(input))); }
  async generateScript(input: ScriptInput) { return Script.parse(await this.executor.execute('Screenwriter', Script, JSON.stringify(input))); }
  async generateScenes(input: ScriptOutput) { return Manifest.parse(await this.executor.execute('Visual Producer', Manifest, JSON.stringify({ script: input }))); }
  async reviewContent(input: ReviewInput) { return Critique.parse(await this.executor.execute('Creative Critic', Critique, JSON.stringify(input))); }
}
