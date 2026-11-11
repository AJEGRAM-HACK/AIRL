import { Nav, Footer } from '@/components/nav';
export function PublicShell({ children, active = '' }: { children: React.ReactNode; active?: string }) {
  return <><Nav active={active}/><main id="main" className="page-shell airl-shell">{children}</main><Footer/></>;
}
