import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/layout/public-shell';
import { CharacterCards } from '@/components/shared/character-cards';
import { features } from '@/lib/config/features';
export default function Persona() {
  if (!features.persona) notFound();
  return <PublicShell active="persona"><div className="airl-page-intro"><div className="eyebrow">PERSONAAI · CHARACTER LIBRARY</div><h1>A little artificial.<br/><em>A lot of personality.</em></h1><p>Three fictional neighbors from Barangay 2099. Explore their motivations, canonical memories, and scripted conversations.</p></div><CharacterCards/></PublicShell>;
}
