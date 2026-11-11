import { z } from 'zod';
import { ModelId } from '@/ai/schemas/gateway';
export const RoomProviderSelection = z.object({
  mode: z.enum(['demo','ollama','hosted_openai']).default('demo'),
  model: ModelId.optional(),
  consent: z.boolean().default(false),
}).strict();
export type RoomProvider = z.infer<typeof RoomProviderSelection>;
