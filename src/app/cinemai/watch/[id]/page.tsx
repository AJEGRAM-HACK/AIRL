import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/layout/public-shell';
import { Audience } from '@/components/audience';
import { DEMO_ROOM } from '@/lib/fixtures';
import { features } from '@/lib/config/features';
export default async function Watch({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!features.cinemai || id !== DEMO_ROOM) notFound();
  return <PublicShell active="watch"><Audience/></PublicShell>;
}
