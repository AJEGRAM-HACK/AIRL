import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Radio, ArrowRight } from 'lucide-react';
import { PublicShell } from '@/components/layout/public-shell';
import { WorldArt } from '@/components/world-art';
import { Button } from '@/components/ui/button';
import { features } from '@/lib/config/features';
export default function Live() {
  if (!features.live) notFound();
  return <PublicShell active="live"><div className="airl-page-intro"><div className="eyebrow"><Radio size={14}/> AIRL LIVE</div><h1>Step into<br/><em>something shared.</em></h1><p>Explore the first audience room. Shared voting and participant sessions are planned for Phase 2.</p></div><article className="room-directory-card"><WorldArt/><div><span className="fixture-badge">Sample room · Local interaction</span><h2>Barangay 2099</h2><p>The happiness ordinance has everyone talking. Explore the episode and preview your next story choice.</p>{features.cinemai ? <Button asChild><Link href="/live/barangay-2099">Open sample room <ArrowRight size={15}/></Link></Button> : <p>CinemAI is disabled in this build.</p>}</div></article></PublicShell>;
}
