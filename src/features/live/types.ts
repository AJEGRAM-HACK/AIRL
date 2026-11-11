import { z } from 'zod';
export const VoteInput = z.object({ roundId: z.string().uuid(), optionId: z.enum(['karaoke', 'taho', 'offline']) }).strict();
export const RoundInput = z.object({ roundId: z.string().uuid() }).strict();
export const RoomSnapshot = z.object({
  roomId: z.string(), roundId: z.string(), status: z.enum(['open', 'closed']), winner: z.string().nullable(),
  participantCount: z.number(), totalVotes: z.number(),
  options: z.array(z.object({ id: z.string(), title: z.string(), description: z.string(), votes: z.number() })),
});
export type RoomState = z.infer<typeof RoomSnapshot>;
export type SessionState = { joined: boolean; operator: boolean; vote: string | null };
