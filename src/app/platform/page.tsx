import { CanCreate } from '@/components/platform/access';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Play, Radio } from 'lucide-react';
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
  const liveUrl = `/live/${world.id}${query.round ? `?round=${encodeURIComponent(query.round)}` : ''}`;
  return <>
    <Nav active="home" universeId={world.id}/>
    <main id="main" className="landing-page">
      <section className="landing-hero" aria-labelledby="landing-title">
        <div className="landing-copy">
          <p className="eyebrow"><span className="editorial-line"/>ARTIFICIAL IN REAL LIFE</p>
          <h1 id="landing-title">The real world<br/>is the <span>prompt.</span></h1>
          <p className="landing-description">Create universes. Shape stories.<br/>Watch AI bring them to life.</p>
          <div className="landing-actions">
            <Button asChild><Link href="/universes">Explore Universes <ArrowRight size={18} aria-hidden="true"/></Link></Button>
            <Button asChild variant="outline"><Link href={liveUrl}><Radio size={16} aria-hidden="true"/>Join Live</Link></Button>
          </div>
          <div className="landing-secondary"><Link className="landing-journey" href={experienceUrl('journey', context)}><Play size={13} aria-hidden="true"/>Launch Journey <ArrowUpRight size={13} aria-hidden="true"/></Link><CanCreate><Link href="/studio#create-universe">Create a Universe <ArrowUpRight size={13} aria-hidden="true"/></Link></CanCreate></div>
        </div>
        <article className="landing-feature">
          <UniverseArt id={world.id} title={world.title}/>
          <div className="landing-feature-top"><span>{world.official ? 'AN AIRL ORIGINAL' : 'SELECTED UNIVERSE'}</span><span>WORLD / {world.official ? '001' : 'CREATOR'}</span></div>
          <div className="landing-feature-copy"><p className="eyebrow">{world.official ? 'THE OFFICIAL AIRL UNIVERSE' : world.settings.genre}</p><h2><Link href={`/universes/${world.id}`}>{world.title}</Link></h2><p>{world.settings.premise}</p><Link className="feature-enter" href={`/universes/${world.id}`}>Enter universe <ArrowUpRight size={19} aria-hidden="true"/></Link></div>
        </article>
      </section>
      <section className="landing-how" aria-label="How AIRL works"><div className="landing-how-intro"><p className="eyebrow">A STORY WE MAKE TOGETHER</p><h2>Every world starts<br/>with a possibility.</h2></div><ol><li><span>01</span><div><h3>Discover a universe.</h3><p>Meet the characters. Find your world.</p></div></li><li><span>02</span><div><h3>Shape the story.</h3><p>Choose what happens next, together.</p></div></li><li><span>03</span><div><h3>Watch it come alive.</h3><p>AI creates. People review. The story continues.</p></div></li></ol></section>
    </main>
    <Footer universeId={world.id} roundId={query.round}/>
  </>;
}
