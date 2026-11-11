import { requireStudioPage } from '@/server/platform/page';
import { PublicShell } from '@/components/layout/public-shell';
import { ProviderSettings } from '@/features/ai/provider-settings';
export default async function AISettings({ searchParams }: { searchParams: Promise<{ character?: string }> }) {
  await requireStudioPage();
  const { character } = await searchParams;
  return <PublicShell active="studio"><div className="airl-page-intro"><div className="eyebrow">AIRL STUDIO · AI GATEWAY</div><h1>Choose your<br/><em>creative intelligence.</em></h1><p>Connect a provider, test an inference, and run a three-scene workflow or a character conversation.</p></div><ProviderSettings initialCharacter={character}/></PublicShell>;
}
