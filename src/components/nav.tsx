import { ModeSwitcher } from './journey/mode-switcher';
import { AccountNavigation, StudioNavigation } from './platform/access';
import { ThemeSwitcher } from './theme-switcher';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { features } from '@/lib/config/features';
export function Nav({ active = '', universeId, roundId }: { active?: string; universeId?:string; roundId?:string|null }) {
  return <header className="nav airl-nav public-nav">
    <Link href="/" className="brand" aria-label="AIRL home"><Sparkles aria-hidden="true"/><span>AIRL<span className="brand-period">.</span></span></Link>
    <nav aria-label="Main navigation">
      <Link aria-current={active === 'home' ? 'page' : undefined} href="/">Home</Link>
      <Link aria-current={active === 'discover' ? 'page' : undefined} href="/universes">Explore</Link>
      {features.live && <Link aria-current={active === 'live' ? 'page' : undefined} href={universeId?`/live/${universeId}`:"/live"}>Live</Link>}
      <StudioNavigation active={active === 'studio'} universeId={universeId}/>
      <AccountNavigation active={active === 'account'}/>
    </nav>
    <div className="public-nav-tools">
      <ModeSwitcher universeId={universeId} roundId={roundId}/>
      <ThemeSwitcher/>
    </div>
  </header>;
}
export function Footer() {
  return <footer className="public-footer"><Link href="/" className="brand">AIRL.</Link><span>Artificial In Real Life · The real world is the prompt.</span><Link href="/discover">All experiences ↗</Link></footer>;
}
