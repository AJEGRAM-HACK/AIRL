import type { Metadata } from 'next';
import { PublicShell } from '@/components/layout/public-shell';
import { ExploreWorlds } from '@/components/platform/worlds';
export const metadata: Metadata = { title: 'Live rooms — AIRL' };

export default function Page(){return <PublicShell active="live"><ExploreWorlds title="Join the story." live/></PublicShell>;}
