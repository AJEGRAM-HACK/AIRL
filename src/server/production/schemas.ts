import { z } from 'zod';
export const CharacterId = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).min(1).max(80);
export const SceneStyle = z.enum(['dramatic-reveal', 'character-dialogue', 'reaction-comedy', 'news-broadcast', 'cliffhanger']);
export const Concept = z.object({ title: z.string(), premise: z.string(), conflict: z.string(), humor: z.string(), cliffhanger: z.string() });
export const ScriptScene = z.object({ id: z.string(), description: z.string(), dialogue: z.array(z.object({ characterId: CharacterId, text: z.string() })) });
import { RelationshipChange } from '@/lib/domain';
export const Script = z.object({ title: z.string(), summary: z.string(), scenes: z.array(ScriptScene), memoryUpdates: z.array(z.object({ characterId: CharacterId, memory: z.string() })), relationshipUpdates:z.array(RelationshipChange).optional() });
export const Manifest = z.object({ title: z.string(), cast:z.array(z.object({id:CharacterId,name:z.string().max(100),color:z.string().regex(/^#[0-9a-fA-F]{6}$/),symbol:z.string().max(30)})).optional(), scenes: z.array(z.object({ id: z.string(), style: SceneStyle, background: z.enum(['barangay-plaza', 'barangay-hall', 'taho-stall','neutral-night','neutral-day','interior']), characters: z.array(CharacterId), animation: z.enum(['fade-in', 'slide-in', 'gentle-bob']), durationSeconds: z.number(), dialogue: z.array(z.object({ characterId: CharacterId, text: z.string() })) })) });
export const Critique = z.object({ approved: z.boolean(), continuity: z.string(), characterVoice: z.string(), visualFeasibility: z.string(), feedback: z.array(z.string()) });
export const Input = z.object({ roomId: z.string().min(1).max(80), universeId:z.string().max(80).optional(), snapshot:z.record(z.string(),z.unknown()).optional(), winningChoice: z.string().trim().min(1).max(1000) });
export type ProductionInput = z.infer<typeof Input>;
export const Stages = ['Story Director', 'Screenwriter', 'Visual Producer', 'Creative Critic'] as const;
export type Stage = typeof Stages[number];
export function validateScript(script: z.infer<typeof Script>) {
  if (script.scenes.length !== 3 || new Set(script.scenes.map(s => s.id)).size !== 3 || script.scenes.some(s => s.dialogue.length === 0 || s.dialogue.some(d => !d.text.trim()))) throw new Error('Invalid three-scene script');
}
export function validateManifest(manifest: z.infer<typeof Manifest>, script: z.infer<typeof Script>) {
  if (manifest.scenes.length !== 3) throw new Error('Expected exactly three scenes');
  manifest.scenes.forEach((scene, index) => {
    const source = script.scenes[index];
    if (scene.id !== source.id || scene.durationSeconds < 3 || scene.durationSeconds > 30 || !Number.isInteger(scene.durationSeconds) || JSON.stringify(scene.dialogue) !== JSON.stringify(source.dialogue) || scene.dialogue.some(d => !scene.characters.includes(d.characterId))) throw new Error('Manifest does not match approved script constraints');
  });
}
