import type { Metadata } from 'next';
import { PublicShell } from "@/components/layout/public-shell";
import { WorldView } from "@/components/platform/world-view";
import { readableUniverse } from "@/server/platform/page";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const world = await readableUniverse(id);
  return { title: `${world.title} — AIRL` };
}

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
