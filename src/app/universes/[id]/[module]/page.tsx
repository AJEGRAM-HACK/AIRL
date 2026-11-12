import type { Metadata } from 'next';
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/layout/public-shell";
import { WorldView } from "@/components/platform/world-view";
import { readableUniverse } from "@/server/platform/page";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: {
  params: Promise<{ id: string; module: string }>;
}): Promise<Metadata> {
  const { id, module } = await params;
  if (module !== 'characters' && module !== 'episodes') notFound();
  const world = await readableUniverse(id);
  const section = module === 'characters' ? 'Characters' : 'Episodes';
  return { title: `${section} in ${world.title} — AIRL` };
}

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
