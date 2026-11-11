'use client';
import { CanCreate } from '@/components/platform/access';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { scenarioLabels, scriptedResponse, type Scenario } from './scenarios';
export function CharacterInteraction({ characterId, name, memories }: { characterId: string; name: string; memories?: string[] }) {
  const [scenario, setScenario] = useState<Scenario>('greeting');
  return <section className="panel persona-interaction"><div className="eyebrow">SCRIPTED CHARACTER DEMO</div><h2>Say hello to {name}.</h2><p>Choose a conversation prompt. Replies are deterministic scripts and stay in this page’s memory.</p><div className="scenario-buttons">{(Object.keys(scenarioLabels) as Scenario[]).map(id => <Button key={id} variant={id === scenario ? 'default' : 'outline'} aria-pressed={id === scenario} onClick={() => setScenario(id)}>{scenarioLabels[id]}</Button>)}</div><CanCreate><p><Link className="text-link" href={`/studio/ai?character=${characterId}`}>Talk using your selected AI provider →</Link></p></CanCreate><div className="character-reply" role="status"><b>{name}</b><p>{scenario === 'memory' && memories ? memories.join(' ') : scriptedResponse(characterId, scenario)}</p><small>Scripted response · Demo content</small></div></section>;
}
