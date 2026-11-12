import { Nav, Footer } from '@/components/nav';
export function PublicShell({ children, active = '',universeId, roundId }: { children: React.ReactNode; active?: string;universeId?:string;roundId?:string|null }) {
  return <><Nav active={active} universeId={universeId} roundId={roundId}/><main id="main" className="page-shell airl-shell">{children}</main><Footer/></>;
}
