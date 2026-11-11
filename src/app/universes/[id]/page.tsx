import { PublicShell } from "@/components/layout/public-shell";
import { WorldView } from "@/components/platform/world-view";
import { readableUniverse } from "@/server/platform/page";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await readableUniverse(id);
  return (
    <PublicShell universeId={id}>
      <WorldView id={id} />
    </PublicShell>
  );
}
