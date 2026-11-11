import { PublicShell } from '@/components/layout/public-shell';
import { ModuleCards } from '@/components/shared/module-cards';
export default function Discover() {
  return <PublicShell active="discover"><div className="airl-page-intro"><div className="eyebrow">THE AIRL EXPERIENCE COLLECTION</div><h1>Follow your <em>curiosity.</em></h1><p>Start a story, meet a personality, or explore a shared room. Available experiences run in transparent demo mode.</p></div><ModuleCards all/></PublicShell>;
}
