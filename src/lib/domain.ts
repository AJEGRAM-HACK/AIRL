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
