import { CanCreate } from '@/components/platform/access';
import Link from 'next/link';
import { ArrowDown, ArrowRight, ArrowUpRight, Play } from 'lucide-react';
import { Nav, Footer } from '@/components/nav';
import { Button } from '@/components/ui/button';
import { UniverseArt } from '@/components/universe-art';
import { readableUniverse } from '@/server/platform/page';
import { experienceUrl } from '@/lib/journey';

export default async function PlatformPage({ searchParams }: {
  searchParams: Promise<{ universe?: string; round?: string; episode?: string }>;
}) {
  const query = await searchParams;
  const world = await readableUniverse(query.universe || 'barangay-2099');
  const context = { ...query, universe: world.id };
  return <>
    <Nav active="home" universeId={world.id} />
    <main id="main" className="landing-page">
      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-copy">
          <p className="eyebrow">ARTIFICIAL IN REAL LIFE</p>
          <h1 id="landing-title">The real world<br />is the <span>prompt.</span></h1>
          <p className="landing-description">Living universes. Unforgettable characters.<br />AI brings the story to life. You decide what happens next.</p>
          <div className="landing-actions">
            <Button asChild><Link href="/universes">Explore Universes <ArrowRight size={18} aria-hidden="true" /></Link></Button>
            <CanCreate><Button asChild variant="outline"><Link href="/studio#create-universe">Create a Universe</Link></Button></CanCreate>
          </div>
          <Link className="landing-journey" href={experienceUrl('journey', context)}><Play size={15} aria-hidden="true" /> Launch Journey <span>A guided look inside AIRL</span></Link>
        </div>
        <article className="landing-feature">
          <UniverseArt id={world.id} title={world.title} />
          <div className="landing-feature-top"><span>{world.official ? 'FEATURED · OFFICIAL UNIVERSE' : 'SELECTED UNIVERSE'}</span><ArrowUpRight size={18} aria-hidden="true" /></div>
          <div className="landing-feature-copy">
            <p className="eyebrow">{world.settings.genre || 'A world of possibilities'}</p>
            <h2><Link href={`/universes/${world.id}`}>{world.title}</Link></h2>
            <p>{world.settings.premise}</p>
            <div className="landing-feature-actions">
              <Link href={query.episode ? `/universes/${world.id}/episodes/${encodeURIComponent(query.episode)}` : `/live/${world.id}#episode-library`}><Play size={14} aria-hidden="true" /> Watch episodes</Link>
              <Link href={`/live/${world.id}${query.round ? `?round=${encodeURIComponent(query.round)}` : ''}#community-vote`}>Join the story <ArrowRight size={15} aria-hidden="true" /></Link>
            </div>
          </div>
        </article>
        <a className="landing-scroll" href="#how-it-works">A story we make together <ArrowDown size={14} aria-hidden="true" /></a>
      </section>
      <section id="how-it-works" className="landing-how" aria-label="How AIRL works">
        <div><span>01 / EXPLORE</span><h2>Find your universe.</h2><p>Meet the cast. Discover their world.</p></div>
        <div><span>02 / DECIDE</span><h2>Your choice moves the story.</h2><p>Vote with the community on what happens next.</p></div>
        <div><span>03 / WATCH</span><h2>See it become canon.</h2><p>AI creates. Humans review. Characters remember.</p></div>
      </section>
    </main>
    <Footer />
  </>;
}
