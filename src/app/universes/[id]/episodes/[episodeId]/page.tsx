import type { Metadata } from 'next';
import { PublicShell } from "@/components/layout/public-shell";
import { WorldView } from "@/components/platform/world-view";
import { readableStoryItem } from "@/server/platform/page";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: {
  params: Promise<{ id: string; episodeId: string }>;
}): Promise<Metadata> {
  const { id, episodeId } = await params;
  const episode = await readableStoryItem(id, episodeId, 'episode');
  const title = 'artifact' in episode ? episode.artifact.manifest.title : 'Episode';
  return { title: `${title} — AIRL` };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; episodeId: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { id, episodeId } = await params;
  const episode = await readableStoryItem(id, episodeId, "episode");
  const seconds = Number((await searchParams).t || 0);
  return (
    <PublicShell universeId={id} roundId={"round_id" in episode ? episode.round_id : null}>
      <WorldView
        id={id}
        mode="episodes"
        episodeId={episodeId}
        initialSeconds={Number.isFinite(seconds) ? Math.max(0, seconds) : 0}
      />
    </PublicShell>
  );
}
