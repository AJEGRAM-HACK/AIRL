import type { Metadata } from 'next';
import { requireStudioPage } from '@/server/platform/page';
import { PublicShell } from '@/components/layout/public-shell';
import { CreatorStudio } from '@/components/platform/worlds';
export const metadata: Metadata = { title: 'Creator Studio — AIRL' };

export default async function Page(){await requireStudioPage();return <PublicShell active="studio"><CreatorStudio/></PublicShell>;}
