'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { experienceUrl } from '@/lib/journey';

export function ModeSwitcher({ universeId, roundId }: { universeId?: string; roundId?: string | null }) {
  const pathname = usePathname();
  const query = useSearchParams();
  const segments = pathname.split('/');
  const scoped = ['universes', 'live', 'watch', 'universe'].includes(segments[1])
    ? segments[2]
    : segments[1] === 'studio'
      ? segments[2] === 'worlds' ? segments[3] : segments[2] !== 'ai' ? segments[2] : undefined
      : undefined;
  const context = {
    universe: universeId || scoped || query.get('universe') || 'barangay-2099',
    round: roundId || query.get('round') || undefined,
    episode: segments[1] === 'universes' && segments[3] === 'episodes' && segments[4]
      ? segments[4] : query.get('episode') || undefined,
    step: query.get('step') || undefined,
    saved: query.get('saved') || undefined,
    film: query.get('film') || undefined,
  };
  return <nav className="experience-switch" aria-label="Experience mode">
    <Link href={experienceUrl('explore', context)} aria-current={pathname !== '/journey' ? 'page' : undefined}>Explore mode</Link>
    <Link href={experienceUrl('journey', context)} aria-current={pathname === '/journey' ? 'page' : undefined}>Journey mode</Link>
  </nav>;
}
