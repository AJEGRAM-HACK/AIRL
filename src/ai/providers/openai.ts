import { z } from 'zod';
import { ReplyOutput, type CharacterReplyInput, type Usage } from '@/ai/schemas/gateway';
import { characterPrompt } from '@/ai/prompts/character';
import { Concept, Critique } from '@/server/production/schemas';
import { scriptContract, visualContract, stageGuidance, scriptRequest, assembleManifest, reviewRequest } from './stage-contracts';
import { createOpenAIExecutor, instructions } from '@/server/production/openai';
import type { CreativeAIProvider, StoryInput, ScriptInput, ScriptOutput, ReviewInput } from './creative';
export class OpenAICreativeProvider implements CreativeAIProvider {
  readonly mode = 'openai';
  private executor;
  constructor(key: string, model: string, signal?: AbortSignal, onUsage?: (usage: Usage) => void) { this.executor = createOpenAIExecutor(key, model, signal, onUsage); }
  async generateStructured<T extends z.ZodType>(schema:T,instruction:string,input:unknown,name?:string):Promise<z.infer<T>> {return schema.parse(await this.executor.structured(schema,JSON.stringify(input),instruction,name));}
  async generateCharacterReply(input: CharacterReplyInput) { return ReplyOutput.parse(await this.executor.reply(ReplyOutput, characterPrompt(input))); }
  async preflight() { await this.executor.preflight(); }
  async generateStory(input: StoryInput & { context?: unknown }) {
    return this.generateStructured(Concept, instructions['Story Director'] + stageGuidance.director, input, 'Story Director');
  }
  async generateScript(input: ScriptInput) {
    return this.generateStructured(scriptContract, instructions.Screenwriter + stageGuidance.script, scriptRequest(input), 'Screenwriter');
  }
  async generateScenes(input: ScriptOutput) {
    const plan = await this.generateStructured(visualContract, instructions['Visual Producer'] + stageGuidance.visual, input, 'Visual Producer');
    return assembleManifest(plan, input);
  }
  async reviewContent(input: ReviewInput) {
    return this.generateStructured(Critique, instructions['Creative Critic'] + stageGuidance.critic, reviewRequest(input), 'Creative Critic');
  }
}
