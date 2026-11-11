import { Nav, Footer } from '@/components/nav';
export function PublicShell({ children, active = '',universeId }: { children: React.ReactNode; active?: string;universeId?:string }) {
  return <><Nav active={active} universeId={universeId}/><main id="main" className="page-shell airl-shell">{children}</main><Footer/></>;
}
