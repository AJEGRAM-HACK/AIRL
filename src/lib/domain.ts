import { z } from 'zod';
export const CharacterSchema = z.object({ id: z.string(), name: z.string(), role: z.string(), voice: z.string(), motivation: z.string(), relationships: z.array(z.string()), memories: z.array(z.string()), color: z.string(), symbol: z.string(), universe: z.string(), avatar: z.string(), assets: z.array(z.string()), personality: z.array(z.string()), backstory: z.string(), dialogueConstraints: z.array(z.string()), knowledge: z.array(z.string()) });
export type Character = z.infer<typeof CharacterSchema>;
export const SceneSchema = z.object({ id: z.string(), style: z.enum(['dramatic-reveal','character-dialogue','reaction-comedy','news-broadcast','cliffhanger']), speaker: z.string(), caption: z.string() });
export const EpisodeSchema = z.object({ id: z.string(), number: z.number(), title: z.string(), description: z.string(), scenes: z.array(SceneSchema) });
export type Episode = z.infer<typeof EpisodeSchema>;
export type AgentName = 'Story Director' | 'Screenwriter' | 'Visual Producer' | 'Creative Critic';
export type ProductionState = 'not-connected' | 'queued' | 'running' | 'review' | 'failed' | 'complete';
// UI-facing future integration ports. The local production CLI has separate server schemas.
export interface ProductionRepository { getStatus(roomId: string): Promise<ProductionState>; }
export interface AgentRunner { run(input: { roomId: string; winningChoice: string; history: Episode[]; characters: Character[] }): Promise<Episode>; }

export const Slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).min(1).max(80);
export const Interests = z.object({
  genres: z.array(z.string().max(80)).max(12).default([]), settings: z.array(z.string().max(80)).max(12).default([]),
  themes: z.array(z.string().max(80)).max(12).default([]), tone: z.string().max(160).default(''),
  languages: z.array(z.string().max(40)).max(8).default([]), avoid: z.array(z.string().max(120)).max(20).default([]),
  idea: z.string().max(1000).default(''),
});
export const WorldSettings = z.object({
  languages:z.array(z.string().max(40)).max(8).default([]),
  setting: z.string().max(600).default(''), era: z.string().max(160).default(''), genre: z.string().max(160).default(''),
  tone: z.string().max(160).default(''), premise: z.string().max(1500).default(''), storyline: z.string().max(3000).default(''),
  rules: z.array(z.string().max(500)).max(20).default([]),
});
export const WorldCharacter = z.object({
  id: Slug, name: z.string().trim().min(1).max(100), role: z.string().max(200).default(''),
  personality: z.array(z.string().max(200)).max(12).default([]), voice: z.string().max(300).default(''),
  appearance: z.string().max(600).default(''), motivations: z.array(z.string().max(300)).max(12).default([]),
  speakingStyle: z.string().max(500).default(''), backstory: z.string().max(2000).default(''),
  rules: z.array(z.string().max(300)).max(20).default([]), memories: z.array(z.string().max(1000)).default([]),
  assets: z.array(z.string().uuid()).max(12).default([]), color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#a78bfa'),
  symbol: z.enum(['bot','glasses','coffee','person']).default('person'),
});
export const WorldDraft = z.object({ title: z.string().trim().min(1).max(120), settings: WorldSettings.default(()=>WorldSettings.parse({})), characters: z.array(WorldCharacter).max(12).default([]),firstVote:z.array(z.string().trim().min(1).max(200)).min(2).max(6).optional() });
export const RelationshipChange = z.object({ from: Slug, to: Slug, description: z.string().trim().min(1).max(500) });
export const CanonChanges = z.object({ memoryUpdates: z.array(z.object({characterId: Slug, memory: z.string().trim().min(1).max(1000), sceneId: z.string().max(100).optional()})).max(40), relationshipUpdates: z.array(RelationshipChange).max(30).default([]) });
export const PitchSet = z.object({ pitches: z.array(z.object({ title: z.string().max(120), settings: WorldSettings, characters: z.array(WorldCharacter).min(1).max(3), conflict: z.string().max(600), firstVote: z.array(z.string().min(1).max(200)).length(3) })).length(3) });
export const StoryAnswer = z.object({ answer: z.string().max(2000), citationIds: z.array(z.string().max(160)).max(8), unclear: z.boolean() });
export type AccountRole = 'viewer' | 'creator' | 'admin';
export type Account = { id: string; email: string; name: string; role: AccountRole; interests: z.infer<typeof Interests>; onboarded: boolean };
export type World = { id: string; title: string; ownerId: string | null; official: boolean; visibility: 'private' | 'public'; archived: boolean; settings: z.infer<typeof WorldSettings>; nextOrder: number };
