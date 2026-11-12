import { Nav, Footer } from '@/components/nav';
import { DashboardShell } from './dashboard-shell';
export function PublicShell({ children, active = '',universeId, roundId }: { children: React.ReactNode; active?: string;universeId?:string;roundId?:string|null }) {
  if (active === 'studio') return <DashboardShell universeId={universeId}>{children}</DashboardShell>;
  return <><Nav active={active} universeId={universeId} roundId={roundId}/><main id="main" className="page-shell airl-shell experience-shell">{children}</main><Footer universeId={universeId} roundId={roundId}/></>;
}
