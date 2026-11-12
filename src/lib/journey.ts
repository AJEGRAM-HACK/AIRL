export const journeySteps = ['world', 'vote', 'production', 'premiere', 'ask'] as const;
export type JourneyStep = typeof journeySteps[number];

export type ExperienceContext = {
  universe: string;
  round?: string;
  episode?: string;
  step?: string;
  saved?: string;
  film?: string;
};

export function experienceUrl(mode: 'journey' | 'platform' | 'explore', context: ExperienceContext) {
  const query = new URLSearchParams({ universe: context.universe });
  for (const key of ['round', 'episode', 'step', 'saved', 'film'] as const) {
    if (context[key]) query.set(key, context[key]);
  }
  const path = mode === 'explore' ? '/' : `/${mode}`;
  return `${path}?${query}`;
}
