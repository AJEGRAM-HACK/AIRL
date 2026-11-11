import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PublicShell } from '@/components/layout/public-shell';
import { characters } from '@/features/persona/characters';
import { CharacterInteraction } from '@/features/persona/interaction';
import { features } from '@/lib/config/features';
export default async function CharacterPage({ params }: { params: Promise<{ characterId: string }> }) {
  const { characterId } = await params;
  const character = characters.find(item => item.id === characterId);
  if (!features.persona || !character) notFound();
  return <PublicShell active="persona"><div className="airl-page-intro"><Link className="text-link" href="/persona">← Character library</Link><div className="eyebrow">PERSONAAI · BARANGAY 2099</div><h1>{character.name}<span className="accent">.</span></h1><p>{character.role}</p></div><div className="persona-detail"><section className="panel"><h2>Character profile</h2><h3>Personality</h3><p>{character.personality.join(' · ')}</p><h3>Voice</h3><p>{character.voice}</p><h3>Motivation</h3><p>{character.motivation}</p><h3>Backstory</h3><p>{character.backstory}</p><h3>Relationships</h3><ul>{character.relationships.map(item => <li key={item}>{item}</li>)}</ul><h3>Canonical memory · Seeded</h3><ul>{character.memories.map(item => <li key={item}>{item}</li>)}</ul><details><summary>Character knowledge and conversation rules</summary><ul>{[...character.knowledge, ...character.dialogueConstraints].map(item => <li key={item}>{item}</li>)}</ul></details></section><CharacterInteraction characterId={character.id} name={character.name}/></div></PublicShell>;
}
