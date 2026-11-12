import { z } from 'zod';
import { ReplyOutput, type CharacterReplyInput, type Usage } from '@/ai/schemas/gateway';
import { characterPrompt } from '@/ai/prompts/character';
import { Concept, Critique, Script, ScriptScene } from '@/server/production/schemas';
import { visualContract, scriptRequest, assembleManifest, reviewRequest } from './stage-contracts';
import { createOpenAIExecutor, instructions } from '@/server/production/openai';
import type { CreativeAIProvider, StoryInput, ScriptInput, ScriptOutput, ReviewInput } from './creative';

const cinematicScript = Script.extend({
  relationshipUpdates: Script.shape.relationshipUpdates.unwrap(),
  scenes: z.array(ScriptScene.extend({
    dialogue: z.array(ScriptScene.shape.dialogue.element).min(3).max(4),
  })).length(3),
});
const cinematicGuidance = {
  director: ' Create an engaging three-scene Filipino sci-fi comedy with an immediate hook, escalating conflict, a sharp comic payoff and a surprising cliffhanger. Keep each concept field under 45 words. Use only the supplied cast and established canon. The player presents cinematic character artwork and existing backgrounds.',
  script: ' Write exactly three scenes with three or four short dialogue lines per scene, at most 14 words per line. Each scene lasts 14 seconds. Use lively natural Filipino and Taglish, distinct character voices, escalating stakes, callbacks and a memorable final reveal. Only supplied cast IDs may appear. Make the winning choice central. Keep scene descriptions brief and make every memory update a fact explicitly established by the dialogue. Avoid extra characters, new visual props or facts that depend on unrendered action.',
  visual: ' Choose visual properties for exactly three scenes in script order. Set each durationSeconds to 14. Use only IDs found in the script dialogue. The application preserves all dialogue and scene IDs. Prefer a dramatic reveal, character-focused middle scene and cliffhanger ending. Cinematic character artwork, lighting and camera motion are available with the approved background IDs.',
  critic: ' Review the actual three-scene animated composition with three or four short lines per 14-second scene. Character artwork, camera motion, captions and backgrounds convey the story. Treat spoken or described actions as caption-conveyed events. A sip, payment or announcement can be understood through dialogue and captions while the character artwork stays symbolic. Judge whether the audience can understand each event from that presentation. Judge continuity, cast fidelity, distinct voices, winning-choice relevance, comic payoff and a clear cliffhanger. Reject ungrounded memories or contradictions. Give at most three concise actionable feedback items.',
};
export class OpenAICreativeProvider implements CreativeAIProvider {
  readonly mode = 'openai';
  private executor;
  constructor(key: string, model: string, signal?: AbortSignal, onUsage?: (usage: Usage) => void) { this.executor = createOpenAIExecutor(key, model, signal, onUsage); }
  async generateStructured<T extends z.ZodType>(schema:T,instruction:string,input:unknown,name?:string):Promise<z.infer<T>> {return schema.parse(await this.executor.structured(schema,JSON.stringify(input),instruction,name));}
  async generateCharacterReply(input: CharacterReplyInput) { return ReplyOutput.parse(await this.executor.reply(ReplyOutput, characterPrompt(input))); }
  async preflight() { await this.executor.preflight(); }
  async generateStory(input: StoryInput & { context?: unknown }) {
    return this.generateStructured(Concept, instructions['Story Director'] + cinematicGuidance.director, input, 'Story Director');
  }
  async generateScript(input: ScriptInput) {
    return this.generateStructured(cinematicScript, instructions.Screenwriter + cinematicGuidance.script, scriptRequest(input), 'Screenwriter');
  }
  async generateScenes(input: ScriptOutput) {
    const speakers = [...new Set(input.scenes.flatMap(scene => scene.dialogue.map(line => line.characterId)))];
    const cinematicVisual = visualContract.omit({ cast: true }).extend({
      scenes: z.array(visualContract.shape.scenes.element.extend({
        durationSeconds: z.literal(14),
        characters: z.array(z.enum(speakers as [string, ...string[]])),
      })).length(3),
    });
    const plan = await this.generateStructured(cinematicVisual, instructions['Visual Producer'] + cinematicGuidance.visual, input, 'Visual Producer');
    return assembleManifest(plan, input);
  }
  async reviewContent(input: ReviewInput) {
    return this.generateStructured(Critique, instructions['Creative Critic'] + cinematicGuidance.critic, reviewRequest(input), 'Creative Critic');
  }
}
