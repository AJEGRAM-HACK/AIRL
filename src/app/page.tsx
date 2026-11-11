import Link from 'next/link';
import { ArrowRight, Play, Radio, Sparkles } from 'lucide-react';
import { Nav, Footer } from '@/components/nav';
import { Button } from '@/components/ui/button';
import { WorldArt } from '@/components/world-art';
import { ModuleCards } from '@/components/shared/module-cards';
import { CharacterCards } from '@/components/shared/character-cards';
import { features } from '@/lib/config/features';
export default function Home() {
  return <><Nav/><main id="main">
    <section className="airl-hero">
      <div className="airl-hero-copy"><div className="eyebrow">ARTIFICIAL IN REAL LIFE</div><h1>The real world<br/>is the <em>prompt.</em></h1><p>Stories you shape. Characters you meet.<br/>Creative experiences that begin with you.</p>
        <div className="hero-actions"><Button asChild><Link href="/discover">Explore experiences <ArrowRight size={17}/></Link></Button>{features.live && <Link className="text-link" href="/live"><Radio size={16}/> Find a room</Link>}</div>
        <div className="airl-mode"><Sparkles size={14}/><span>Demo mode · Explore without AI credits</span></div>
      </div>
      <div className="airl-featured"><WorldArt/><div className="airl-featured-copy"><span className="pill">FEATURED CINEMAI UNIVERSE</span><h2>Barangay 2099</h2><p>New kapitan. Same chismis.</p>{features.cinemai && <Link className="text-link" href="/cinemai/watch/barangay-2099"><Play size={14}/> Step into the story <ArrowRight size={15}/></Link>}</div></div>
    </section>
    <section className="section airl-experiences"><div className="section-heading"><div><div className="eyebrow">FIND YOUR WAY IN</div><h2>One platform. Many ways to play.</h2></div><Link className="text-link" href="/discover">All experiences <ArrowRight size={16}/></Link></div><ModuleCards/></section>
    {features.live && <section className="airl-room-feature"><div><div className="eyebrow">AIRL LIVE · SAMPLE ROOM</div><h2>The barangay is waiting.</h2><p>Watch a short story, explore the choices, and imagine the next chapter together.</p><small>Local participation preview · Shared voting arrives in Phase 2</small></div><Button asChild variant="outline"><Link href="/live/barangay-2099">Enter sample room <ArrowRight size={16}/></Link></Button></section>}
    {features.persona && <section className="section"><div className="section-heading"><div><div className="eyebrow">PERSONALITIES WITH A WORLD OF THEIR OWN</div><h2>Meet your next favorite character.</h2></div><Link className="text-link" href="/persona">Character library <ArrowRight size={16}/></Link></div><CharacterCards/></section>}
    <section className="section airl-how"><div><div className="eyebrow">HOW AIRL WORKS</div><h2>Bring an idea.<br/>See where it goes.</h2></div><div className="airl-how-steps"><article><h3>Join an experience</h3><p>Find a world, meet its characters, and explore a creative challenge.</p></article><article><h3>Shape the direction</h3><p>Try the local choice preview. Shared community participation is the next phase.</p></article><article><h3>Discover what follows</h3><p>Explore scripted stories and the deterministic demo production workflow.</p></article></div></section>
    <section className="universe-banner"><div><div className="eyebrow">SAMPLE COMMUNITY MOMENT</div><h2>“Mandatory karaoke? Pati problema ko kakanta?”</h2><p>Tita Nena has a few thoughts about Captain Bot’s next ordinance. A scripted glimpse into Barangay 2099.</p></div>{features.persona && <Button asChild variant="outline"><Link href="/persona/tita-nena">Meet Tita Nena</Link></Button>}</section>
  </main><Footer/></>;
}
