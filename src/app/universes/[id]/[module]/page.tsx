import { notFound } from "next/navigation";
import { PublicShell } from "@/components/layout/public-shell";
import { WorldView } from "@/components/platform/world-view";
import { readableUniverse } from "@/server/platform/page";
export const dynamic = "force-dynamic";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string; module: string }>;
}) {
  const { id, module } = await params;
  if (module !== "characters" && module !== "episodes") notFound();
  await readableUniverse(id);
  return (
    <PublicShell universeId={id}>
      <WorldView id={id} mode={module} />
    </PublicShell>
  );
}
