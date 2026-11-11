import { StudioNavigation } from './platform/access';
import { ThemeSwitcher } from './theme-switcher';
import Link from 'next/link';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { features } from '@/lib/config/features';
import { Button } from './ui/button';
export function Nav({ active = '', universeId }: { active?: string; universeId?:string }) {
  return <header className="nav airl-nav">
    <Link href="/" className="brand" aria-label="AIRL home"><Sparkles aria-hidden="true"/><span>AIRL<span className="brand-period">.</span></span></Link>
    <nav aria-label="Main navigation">
      <Link aria-current={active === 'discover' ? 'page' : undefined} href="/universes">Explore</Link>
      {features.live && <Link aria-current={active === 'live' ? 'page' : undefined} href={universeId?`/live/${universeId}`:"/live"}>Live</Link>}
      {features.cinemai && <Link aria-current={['watch', 'universe', 'cinemai'].includes(active) ? 'page' : undefined} href={universeId?`/universes/${universeId}/episodes`:"/cinemai"}>CinemAI</Link>}
      {features.persona && <Link aria-current={active === 'persona' ? 'page' : undefined} href={universeId?`/universes/${universeId}/characters`:"/persona"}>PersonaAI</Link>}
      <StudioNavigation active={active === 'studio'} universeId={universeId}/>
      <Link href="/account">Account</Link>
    </nav>
    <ThemeSwitcher/>
    <Button asChild variant="outline" size="sm"><Link href="/discover">Find your experience <ArrowUpRight size={14}/></Link></Button>
  </header>;
}
export function Footer() {
  return <footer><Link href="/" className="brand">AIRL.</Link><span>Artificial In Real Life · The real world is the prompt.</span><small>Demo experience</small></footer>;
}
