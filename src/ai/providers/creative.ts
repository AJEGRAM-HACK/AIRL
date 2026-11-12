import { PitchSet, StoryAnswer, WorldSettings } from '@/lib/domain';
import { canonicalCharacters } from '@/ai/memory/canonical';
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
  generateStructured<T extends z.ZodType>(schema:T,instruction:string,input:unknown):Promise<z.infer<T>>;
  generateCharacterReply(input: CharacterReplyInput): Promise<z.infer<typeof ReplyOutput>>;
  generateStory(input: StoryInput & { context?: unknown }): Promise<StoryOutput>;
  generateScript(input: ScriptInput): Promise<ScriptOutput>;
  generateScenes(input: ScriptOutput): Promise<SceneOutput>;
  reviewContent(input: ReviewInput): Promise<z.infer<typeof Critique>>;
}
export class DemoCreativeProvider implements CreativeAIProvider {
  readonly mode = 'demo';
  async generateStructured<T extends z.ZodType>(schema:T,_instruction:string,input:unknown):Promise<z.infer<T>> {
    const task=input as {kind:string;question?:string;sources?:{id:string;text:string}[];episode?:{title:string};characters?:{name:string}[];interests?:{settings?:string[];genres?:string[];tone?:string;languages?:string[];idea?:string}};
    if (task.kind === 'next-episode') return schema.parse({ options: [
      { title: `Follow ${task.characters?.[0]?.name || 'the cast'}’s next move`, description: `Continue the unresolved ending of ${task.episode?.title || 'the published episode'} through a new community decision.` },
      { title: 'Let the community challenge the plan', description: `The cast questions the consequences of ${task.episode?.title || 'the last decision'} and proposes a different solution.` },
      { title: 'Test the decision with an unexpected complication', description: `Explore a new obstacle to the plan established in ${task.episode?.title || 'the published episode'}.` },
    ] });
    if(task.kind==='pitches')return schema.parse(PitchSet.parse({pitches:[0,1,2].map(index=>({title:`${task.interests?.settings?.[0]||'A new world'} · ${index+1}`,settings:WorldSettings.parse({setting:task.interests?.settings?.[0]||'An unfamiliar community',genre:task.interests?.genres?.[0]||'Adventure',tone:task.interests?.tone||'Hopeful',premise:task.interests?.idea||'Neighbors face an unexpected shared challenge.',rules:[]}),conflict:'The community must decide whether to trust a stranger.',characters:[{id:'guide',name:'The Guide',role:'Local guide',personality:['curious'],voice:'Thoughtful',appearance:'An original fictional guide',motivations:['Protect the community'],speakingStyle:'Clear and concise',backstory:'Knows the local paths',rules:[],memories:[],assets:[],color:'#a78bfa',symbol:'person'}],firstVote:['Trust the visitor','Investigate first','Ask the council']}))}));
    const source=task.sources?.[0];return schema.parse(StoryAnswer.parse({answer:source?source.text:'The available sources leave this unclear.',citationIds:source?[source.id]:[],unclear:!source}));
  }
  async generateCharacterReply(input: CharacterReplyInput) {
    ReplyInput.parse(input);
    const character = canonicalCharacters().find(item => item.id === input.characterId)!;
    return ReplyOutput.parse({ text: /remember|memory|recall|tandaan/i.test(input.message) ? character.memories.slice(-4).join(' ') : scriptedResponse(input.characterId, /karaoke/i.test(input.message) ? 'decision' : 'greeting') });
  }
  async generateStory(input: StoryInput) {
    Input.parse(input);
    if(input.roomId!=='barangay-2099')return Concept.parse({title:input.winningChoice,premise:input.winningChoice,conflict:'The cast disagrees about the next step.',humor:'A practical complication changes the plan.',cliffhanger:'The audience must decide what happens next.'});
    return Concept.parse({ title: `Barangay protocol: ${input.winningChoice}`, premise: input.winningChoice, conflict: 'Captain Bot treats a community idea as an optimization problem.', humor: 'Tita Nena questions the logic while Kuya Taho finds a business opportunity.', cliffhanger: 'The barangay group chat asks for a new vote.' });
  }
  async generateScript(request: ScriptInput) {
    const {input,concept}=request;
    if(input.roomId!=='barangay-2099'){
      const extended=request as ScriptInput & {base?:string};const cast=extended.base?JSON.parse(extended.base).context.characters:[];
      if(!cast.length)throw new Error('A cast is required.');
      return Script.parse({title:concept.title,summary:input.winningChoice,scenes:[0,1,2].map(index=>({id:`scene-${index+1}`,description:'The cast responds to the audience decision.',dialogue:[{characterId:cast[index%cast.length].id,text:`${input.winningChoice}. We must choose our next step carefully.`}]})),memoryUpdates:[]});
    }
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
    return Manifest.parse({ title: script.title, scenes: script.scenes.map((scene, index) => ({ id: scene.id, style: index === 0 ? 'dramatic-reveal' : index === 1 ? 'reaction-comedy' : 'cliffhanger', background: script.scenes.some(item=>item.dialogue.some(line=>!['captain-bot','tita-nena','kuya-taho'].includes(line.characterId)))?'neutral-night':index === 2 ? 'taho-stall' : 'barangay-plaza', characters: [...new Set(scene.dialogue.map(line => line.characterId))], animation: 'fade-in', durationSeconds: 6, dialogue: scene.dialogue })) });
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
