import { z } from 'zod';

export const NextEpisodeOptions = z.object({
  options: z.array(z.object({
    title: z.string().trim().min(1).max(120),
    description: z.string().trim().min(1).max(240),
  })).length(3),
}).refine(value => new Set(value.options.map(option => option.title.toLowerCase())).size === 3,
  'Each story direction must be distinct.');

export type NextRoundOption = { id: string; title: string; description: string };
