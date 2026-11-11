import { features } from './features';
export const modules = [
  { id: 'live', name: 'AIRL Live', description: 'Step into a shared room and explore the next community decision.', href: '/live', action: 'Explore rooms', available: features.live, status: 'Room preview', kind: 'live' },
  { id: 'cinemai', name: 'CinemAI', description: 'Watch Barangay 2099 and choose the next twist in a community-directed story.', href: '/cinemai', action: 'Enter the story', available: features.cinemai, status: 'Interactive prototype', kind: 'cinema' },
  { id: 'persona', name: 'PersonaAI', description: 'Meet fictional personalities with their own voices, relationships, and memories.', href: '/persona', action: 'Meet the characters', available: features.persona, status: 'Scripted demo', kind: 'persona' },
  { id: 'quest', name: 'QuestAI', description: 'Creative missions that take your imagination into the real world.', href: null, action: '', available: false, status: 'Coming soon', kind: 'future' },
  { id: 'remix', name: 'RemixAI', description: 'New creative variations from opt-in community contributions.', href: null, action: '', available: false, status: 'Coming soon', kind: 'future' },
  { id: 'worlds', name: 'WorldForge', description: 'Build the worlds, characters, and rules behind the next shared experience.', href: null, action: '', available: false, status: 'Coming soon', kind: 'future' },
  { id: 'memories', name: 'AIRL Memories', description: 'Community recaps and highlights from authorized contributions.', href: null, action: '', available: false, status: 'Coming soon', kind: 'future' },
];
