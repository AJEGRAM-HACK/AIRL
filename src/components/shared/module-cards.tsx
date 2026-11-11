import Link from 'next/link';
import { ArrowUpRight, Clapperboard, Radio, Users, Orbit } from 'lucide-react';
import { modules } from '@/lib/config/modules';
export function ModuleCards({ all = false }: { all?: boolean }) {
  return <div className="module-grid">{modules.filter(module => all || module.available).map(module => {
    const Icon = module.kind === 'live' ? Radio : module.kind === 'cinema' ? Clapperboard : module.kind === 'persona' ? Users : Orbit;
    return <article className={`module-card module-${module.kind}`} key={module.id}>
      <div className="module-visual"><Icon size={64} strokeWidth={1}/><span className="orbital-ring"/></div>
      <div className="module-copy"><small>{module.href && !module.available ? 'Disabled in this build' : module.status}</small><h2>{module.name}</h2><p>{module.description}</p>
      {module.available && module.href && <Link className="text-link" href={module.href}>{module.action}<ArrowUpRight size={15}/></Link>}</div>
    </article>;
  })}</div>;
}
