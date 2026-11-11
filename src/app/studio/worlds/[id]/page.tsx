import { requireStudioPage } from '@/server/platform/page';
import { PublicShell } from "@/components/layout/public-shell";
import { WorldEditor } from "@/components/platform/worlds";
import { readableUniverse } from "@/server/platform/page";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await readableUniverse(id);
  await requireStudioPage(id);
  return (
    <PublicShell active="studio" universeId={id}>
      <WorldEditor id={id} />
    </PublicShell>
  );
}
