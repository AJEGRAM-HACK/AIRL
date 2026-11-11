import Link from 'next/link';
import { Clapperboard, Users, Workflow, ArrowUpRight } from 'lucide-react';
import { PublicShell } from '@/components/layout/public-shell';
import { Button } from '@/components/ui/button';
import { features } from '@/lib/config/features';
export default function StudioHome() {
  return <PublicShell active="studio"><div className="airl-page-intro"><div className="eyebrow">AIRL STUDIO</div><h1>Where ideas<br/><em>take shape.</em></h1><p>A shared workspace for experiences, characters, and creative production.</p></div><div className="notice">Foundation preview · Room metrics are seeded. The local production CLI uses a deterministic demo provider by default.</div><div className="studio-entry-grid">
    {features.cinemai && <section className="panel"><Clapperboard/><h2>Barangay 2099</h2><p>Explore the sample control room, script, and storyboard.</p><Button asChild variant="outline"><Link href="/studio/barangay-2099">Open room studio <ArrowUpRight size={15}/></Link></Button></section>}
    {features.persona && <section className="panel"><Users/><h2>Character library</h2><p>Shared personas used by CinemAI and the creative engine.</p><Button asChild variant="outline"><Link href="/persona">Browse characters <ArrowUpRight size={15}/></Link></Button></section>}
    <section className="panel"><Workflow/><h2>Creative workflow</h2><p>Director → Screenwriter → Visual Producer → Critic.</p><small>Simulated agent workflow · Demo-generated content</small><p>Run locally with <code>npm run production -- "Your story choice"</code>. Persisted jobs can be inspected through the CLI.</p></section>
  </div></PublicShell>;
}
