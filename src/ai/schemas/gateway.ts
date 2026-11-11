import { z } from 'zod';
export const ProviderMode = z.enum(['demo', 'hosted_openai', 'creator_byok', 'ollama']);
export type Mode = z.infer<typeof ProviderMode>;
export const ModelId = z.string().trim().min(1).max(100).regex(/^[a-zA-Z0-9_.:/-]+$/).refine(value => !value.startsWith('sk-'), 'Enter a model identifier.');
export const ReplyInput = z.object({ characterId: z.enum(['captain-bot', 'tita-nena', 'kuya-taho']), message: z.string().trim().min(1).max(500) });
export const ReplyOutput = z.object({ text: z.string().min(1).max(2000) });
export type CharacterReplyInput = z.infer<typeof ReplyInput>;
export const GatewayRequest = z.object({
  mode: ProviderMode,
  model: ModelId.optional(),
  apiKey: z.string().min(10).max(256).optional(),
  operation: z.enum(['test', 'generate', 'reply']),
  consent: z.boolean().default(false),
  choice: z.string().trim().min(1).max(500).optional(),
  reply: ReplyInput.optional(),
}).strict();
export type ProviderSelection = Pick<z.infer<typeof GatewayRequest>, 'mode' | 'model' | 'apiKey' | 'consent'>;
export type Usage = { inputTokens: number | null; outputTokens: number | null };
