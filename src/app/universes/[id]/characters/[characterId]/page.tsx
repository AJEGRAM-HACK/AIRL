import { PublicShell } from "@/components/layout/public-shell";
import { WorldView } from "@/components/platform/world-view";
import { readableUniverse, readableStoryItem } from "@/server/platform/page";
export const dynamic = "force-dynamic";
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
