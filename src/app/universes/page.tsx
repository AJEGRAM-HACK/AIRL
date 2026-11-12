import type { Metadata } from 'next';
import { PublicShell } from "@/components/layout/public-shell";
import { ExploreWorlds } from "@/components/platform/worlds";
export const metadata: Metadata = { title: 'Explore universes — AIRL' };

export default function Page() {
  return (
    <PublicShell active="discover">
      <ExploreWorlds />
    </PublicShell>
  );
}
