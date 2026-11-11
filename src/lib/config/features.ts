// Explicit public values allow Next.js to replace these flags in client bundles.
export const features = {
  cinemai: process.env.NEXT_PUBLIC_ENABLE_CINEMAI !== 'false',
  persona: process.env.NEXT_PUBLIC_ENABLE_PERSONA !== 'false',
  live: process.env.NEXT_PUBLIC_ENABLE_AIRL_LIVE !== 'false',
  quest: process.env.NEXT_PUBLIC_ENABLE_QUEST === 'true',
  remix: process.env.NEXT_PUBLIC_ENABLE_REMIX === 'true',
  worlds: process.env.NEXT_PUBLIC_ENABLE_WORLDS === 'true',
  memories: process.env.NEXT_PUBLIC_ENABLE_MEMORIES === 'true',
};
