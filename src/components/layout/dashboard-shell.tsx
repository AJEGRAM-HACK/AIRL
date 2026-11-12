'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Clapperboard, Globe2, LayoutGrid, Menu, Plus, Settings2, ShieldCheck, Users, X } from 'lucide-react';
import { useAccess } from '@/components/platform/access';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { ModeSwitcher } from '@/components/journey/mode-switcher';

// The existing route wrappers and APIs remain the authorization boundary.
export function DashboardShell({ children, universeId }: { children: React.ReactNode; universeId?: string }) {
  const access = useAccess();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const workspaceHref = access.canCreate ? '/studio' : '/studio/barangay-2099';
  const canManage = !!universeId && access.managedWorldIds.includes(universeId);
  const isProduction = !!universeId && pathname === `/studio/${universeId}`;
  const section = pathname === '/studio/ai' ? 'AI settings' : canManage && !isProduction ? 'Universe management' : isProduction ? 'Episode production' : 'Overview';
  return <div className="dashboard-shell">
    <aside className="dashboard-sidebar">
      <div className="dashboard-sidebar-top"><Link href="/" className="brand" aria-label="AIRL home">AIRL<span className="brand-period">.</span></Link><button type="button" className="dashboard-menu-toggle" aria-label="Workspace menu" aria-expanded={menuOpen} aria-controls="dashboard-navigation" onClick={() => setMenuOpen(open => !open)}>{menuOpen ? <X size={20} aria-hidden="true"/> : <Menu size={20} aria-hidden="true"/>}<span>Menu</span></button></div>
      <p className="dashboard-label">CREATOR WORKSPACE</p>
      <nav id="dashboard-navigation" aria-label="Dashboard navigation" data-open={menuOpen}>
        {access.canCreate && <>
          <Link href="/studio" aria-current={pathname === '/studio' ? 'page' : undefined}><LayoutGrid size={17} aria-hidden="true"/>Overview</Link>
          <Link href="/studio#my-universes"><Globe2 size={17} aria-hidden="true"/>My universes</Link>
          <Link href="/studio#create-universe"><Plus size={17} aria-hidden="true"/>Create a universe</Link>
        </>}
        {universeId && <>
          <span className="dashboard-label">THIS UNIVERSE</span>
          {canManage && <><Link href={`/studio/worlds/${universeId}`} aria-current={!isProduction ? 'page' : undefined}><Settings2 size={17} aria-hidden="true"/>World settings</Link><Link href={`/studio/worlds/${universeId}#world-cast`}><Users size={17} aria-hidden="true"/>Characters</Link></>}
          <Link href={`/studio/${universeId}`} aria-current={isProduction ? 'page' : undefined}><Clapperboard size={17} aria-hidden="true"/>Episodes & live</Link>
          <Link href={`/universes/${universeId}`}>View universe<ArrowUpRight size={15} aria-hidden="true"/></Link>
        </>}
        {access.canCreate && <><span className="dashboard-label">WORKSPACE</span><Link href="/studio/ai" aria-current={pathname === '/studio/ai' ? 'page' : undefined}><Settings2 size={17} aria-hidden="true"/>AI settings</Link></>}
        {access.account?.role === 'admin' && <Link href="/studio#account-permissions"><ShieldCheck size={17} aria-hidden="true"/>Account permissions</Link>}
        <Link href="/account">Your account<ArrowUpRight size={15} aria-hidden="true"/></Link>
      </nav>
      <div className="dashboard-sidebar-bottom"><p>{access.account ? `${access.account.role} workspace` : 'Room operator'}</p><Link href="/universes">Back to Explore <ArrowUpRight size={15} aria-hidden="true"/></Link></div>
    </aside>
    <div className="dashboard-body">
      <header className="dashboard-topbar"><span><Link href={workspaceHref}>Dashboard</Link><span aria-hidden="true"> / </span>{section}</span><ThemeSwitcher/></header>
      <main id="main" className="experience-shell dashboard-main">{children}</main>
      <footer className="dashboard-footer"><span>The real world is the prompt.</span><ModeSwitcher universeId={universeId}/></footer>
    </div>
  </div>;
}
