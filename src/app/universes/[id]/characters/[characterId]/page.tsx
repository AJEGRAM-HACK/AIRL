import type { Metadata } from 'next';
import { PublicShell } from "@/components/layout/public-shell";
import { WorldView } from "@/components/platform/world-view";
import { readableStoryItem } from "@/server/platform/page";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: {
  params: Promise<{ id: string; characterId: string }>;
}): Promise<Metadata> {
  const { id, characterId } = await params;
  const character = await readableStoryItem(id, characterId, 'character');
  const title = 'name' in character ? character.name : 'Character';
  return { title: `${title} — AIRL` };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; characterId: string }>;
}) {
  const { id, characterId } = await params;
  await readableStoryItem(id, characterId, "character");
  return (
    <PublicShell universeId={id}>
      <WorldView id={id} mode="characters" characterId={characterId} />
    </PublicShell>
  );
}
