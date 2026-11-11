import { ReplyInput, ReplyOutput, type CharacterReplyInput, type Mode } from '@/ai/schemas/gateway';
import { scriptedResponse } from '@/features/persona/scenarios';
import { z } from 'zod';
import { Concept, Script, Manifest, Critique, Input, validateManifest, validateScript, type Stage } from '@/server/production/schemas';
import type { Executor } from '@/server/production/workflow';
export type StoryInput = z.infer<typeof Input>;
export type StoryOutput = z.infer<typeof Concept>;
export type ScriptInput = { input: StoryInput; concept: StoryOutput };
export type ScriptOutput = z.infer<typeof Script>;
export type SceneOutput = z.infer<typeof Manifest>;
export type ReviewInput = { script: ScriptOutput; manifest: SceneOutput };
export interface CreativeAIProvider {
  readonly mode: Mode | 'openai';
  generateCharacterReply(input: CharacterReplyInput): Promise<z.infer<typeof ReplyOutput>>;
  generateStory(input: StoryInput & { context?: unknown }): Promise<StoryOutput>;
  generateScript(input: ScriptInput): Promise<ScriptOutput>;
  generateScenes(input: ScriptOutput): Promise<SceneOutput>;
  reviewContent(input: ReviewInput): Promise<z.infer<typeof Critique>>;
}
export class DemoCreativeProvider implements CreativeAIProvider {
  readonly mode = 'demo';
  async generateCharacterReply(input: CharacterReplyInput) {
    ReplyInput.parse(input);
    return ReplyOutput.parse({ text: scriptedResponse(input.characterId, /karaoke/i.test(input.message) ? 'decision' : 'greeting') });
  }
  async generateStory(input: StoryInput) {
    Input.parse(input);
    return Concept.parse({ title: `Barangay protocol: ${input.winningChoice}`, premise: input.winningChoice, conflict: 'Captain Bot treats a community idea as an optimization problem.', humor: 'Tita Nena questions the logic while Kuya Taho finds a business opportunity.', cliffhanger: 'The barangay group chat asks for a new vote.' });
  }
  async generateScript({ input, concept }: ScriptInput) {
    Input.parse(input);
    Concept.parse(concept);
    return Script.parse({ title: concept.title, summary: `Demo-generated content: ${input.winningChoice}`, scenes: [
      { id: 'scene-1', description: 'Captain Bot announces the community suggestion in the plaza.', dialogue: [{ characterId: 'captain-bot', text: `Mga kabarangay, proposal received: ${input.winningChoice}. Optimization begins now.` }] },
      { id: 'scene-2', description: 'Tita Nena demands a practical explanation.', dialogue: [{ characterId: 'tita-nena', text: `Anak, ang plano mo: ${input.winningChoice}? May common sense setting ba iyan?` }] },
      { id: 'scene-3', description: 'Kuya Taho tests a new promotion as the group chat lights up.', dialogue: [{ characterId: 'kuya-taho', text: 'Habang nagde-debate kayo, may taho promo ako. Pero boss, may bagong poll na sa group chat!' }] },
    ], memoryUpdates: [] });
  }
  async generateScenes(script: ScriptOutput) {
    Script.parse(script);
    validateScript(script);
    return Manifest.parse({ title: script.title, scenes: script.scenes.map((scene, index) => ({ id: scene.id, style: index === 0 ? 'dramatic-reveal' : index === 1 ? 'reaction-comedy' : 'cliffhanger', background: index === 2 ? 'taho-stall' : 'barangay-plaza', characters: [...new Set(scene.dialogue.map(line => line.characterId))], animation: 'fade-in', durationSeconds: 10, dialogue: scene.dialogue })) });
  }
  async reviewContent({ script, manifest }: ReviewInput) {
    validateScript(Script.parse(script));
    validateManifest(Manifest.parse(manifest), script);
    return Critique.parse({ approved: true, continuity: 'Deterministic demo template with no canonical memory changes.', characterVoice: 'Scripted character lines.', visualFeasibility: 'Manifest passed local scene and dialogue validation.', feedback: [] });
  }
}
// Bridges the existing orchestrator to either provider without changing its stage contracts.
export function creativeExecutor(provider: CreativeAIProvider, preflight: () => Promise<void> = async () => {}): Executor {
  return {
    executionMode: provider.mode,
    preflight,
    async execute(stage: Stage, schema: z.ZodType, prompt: string) {
      const data = JSON.parse(prompt);
      let output: unknown;
      switch (stage) {
        case 'Story Director': output = await provider.generateStory({ ...Input.parse(data.input), context: data.context }); break;
        case 'Screenwriter': {
          const base = JSON.parse(data.base);
          // Preserve all continuity and critic feedback for the live adapter.
          output = await provider.generateScript({ ...data, input: Input.parse(base.input) }); break;
        }
        case 'Visual Producer': output = await provider.generateScenes(Script.parse(data.script)); break;
        case 'Creative Critic': output = await provider.reviewContent(data); break;
      }
      return schema.parse(output);
    },
  };
}
