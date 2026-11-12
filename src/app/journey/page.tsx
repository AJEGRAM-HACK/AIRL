import type { Metadata } from 'next';
import './journey.css';
import { notFound } from 'next/navigation';
import JourneyDemo from '@/components/journey-demo';
import { readableUniverse } from '@/server/platform/page';
import { sessionToken } from '@/server/live/http';
import { LiveStore } from '@/server/live/store';
import { PlatformStore } from '@/server/platform/store';

export const metadata: Metadata = { title: 'Journey — AIRL' };

export default async function JourneyPage({ searchParams }: {
  searchParams: Promise<{ universe?: string; round?: string }>;
}) {
  const query = await searchParams;
  const id = query.universe || 'barangay-2099';
  const world = await readableUniverse(id);
  const store = new PlatformStore();
  const live = new LiveStore(store.path, id);
  try {
    const actor = store.account(await sessionToken());
    const rooms = [...store.list(actor), ...store.list(actor, true)]
      .filter((item, index, all) => !item.archived && all.findIndex(other => other.id === item.id) === index)
      .filter(item => store.db.prepare('SELECT room_id FROM universe_rooms WHERE universe_id=?').get(item.id))
      .map(item => ({ id: item.id, title: item.title }));
    let round;
    try { round = live.snapshot(query.round); } catch { notFound(); }
    return <JourneyDemo key={id} world={world} characters={store.characters(id, actor)} rooms={rooms} initialRound={round} />;
  } finally { live.dispose(); store.close(); }
}
