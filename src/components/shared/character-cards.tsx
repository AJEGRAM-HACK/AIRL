import Link from 'next/link';
import { Bot, Glasses, Coffee, ArrowUpRight } from 'lucide-react';
import { characters } from '@/features/persona/characters';
export function CharacterCards() {
  const icons = [Bot, Glasses, Coffee];
  return <div className="persona-grid">{characters.map((character, index) => {
    const Icon = icons[index];
    return <Link href={`/persona/${character.id}`} className={`persona-tile ${character.color}`} key={character.id}>
      <div className="character-portrait"><Icon size={92} strokeWidth={1}/></div>
      <div className="persona-tile-copy"><small>Barangay 2099</small><h3>{character.name}</h3><p>{character.role}</p><span>Meet the character <ArrowUpRight size={14}/></span></div>
    </Link>;
  })}</div>;
}
