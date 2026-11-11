import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/layout/public-shell';
import { Audience } from '@/components/audience';
import { DEMO_ROOM } from '@/lib/fixtures';
import { features } from '@/lib/config/features';
export default async function LiveRoom({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  if (!features.live || !features.cinemai || roomId !== DEMO_ROOM) notFound();
  return <PublicShell active="live"><div className="notice">AIRL Live · Shared local room · Results update across participants.</div><Audience/></PublicShell>;
}
