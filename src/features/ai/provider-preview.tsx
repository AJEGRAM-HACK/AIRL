import { z } from 'zod';
import { Manifest } from '@/server/production/schemas';
import { Player } from '@/components/player';
import { characters } from '@/features/persona/characters';
const ResponseShape = z.object({ mode: z.string(), result: z.object({ manifest: Manifest.optional(), text: z.string().optional(), reply: z.string().optional(), events: z.array(z.object({ stage: z.string(), status: z.string(), timestamp: z.string() })).optional() }) });
export function ProviderPreview({ data }: { data: unknown }) {
  const parsed = ResponseShape.safeParse(data);
  if (!parsed.success) return null;
  const { result, mode } = parsed.data;
  const manifest = result.manifest;
  return <section className="panel"><div className="eyebrow">{mode === 'demo' ? 'DEMO-GENERATED CONTENT' : 'NEW MODEL OUTPUT'}</div>
    {manifest && <><h2>{manifest.title}</h2><p>Illustrated storyboard preview · 15 seconds · Captions · No audio</p><Player episode={{ id: 'provider-preview', number: 1, title: manifest.title, description: 'New provider storyboard', scenes: manifest.scenes.map(scene => ({ id: scene.id, style: scene.style, speaker: characters.find(character => character.id === scene.dialogue[0]?.characterId)?.name || 'Narrator', caption: scene.dialogue.map(line => line.text).join(' ') })) }}/></>}
    {(result.text || result.reply) && <p className="character-reply">{result.text || result.reply}</p>}
    {result.events && <ol className="provider-timeline">{result.events.map((event, index) => <li key={index}><b>{event.stage}</b> · {event.status}<small>{event.timestamp}</small></li>)}</ol>}
  </section>;
}
