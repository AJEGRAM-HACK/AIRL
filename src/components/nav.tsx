import { ModeSwitcher } from './journey/mode-switcher';
import { AccountNavigation, StudioNavigation } from './platform/access';
import { ThemeSwitcher } from './theme-switcher';
import Link from 'next/link';
import { features } from '@/lib/config/features';
export function Nav({ active = '', universeId, roundId }: { active?: string; universeId?:string; roundId?:string|null }) {
  return <header className="nav airl-nav public-nav">
    <Link href="/" className="brand" aria-label="AIRL home">AIRL<span className="brand-period">.</span></Link>
    <nav aria-label="Main navigation">
      <Link aria-current={active === 'discover' ? 'page' : undefined} href="/universes">Explore</Link>
      {features.live && <Link aria-current={active === 'live' ? 'page' : undefined} href={universeId?`/live/${universeId}`:"/live"}>Live</Link>}
      <StudioNavigation active={active === 'studio'} universeId={universeId}/>
      <AccountNavigation active={active === 'account'}/>
    </nav>
  </header>;
}
export function Footer({ universeId, roundId }: { universeId?: string; roundId?: string | null }) {
  return <footer className="public-footer"><div><Link href="/" className="brand">AIRL.</Link><p>Artificial In Real Life</p></div><div className="footer-links"><Link href="/discover">All experiences ↗</Link><ModeSwitcher universeId={universeId} roundId={roundId}/><ThemeSwitcher/></div></footer>;
}
