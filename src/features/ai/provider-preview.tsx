import { z } from 'zod';
import { Manifest } from '@/server/production/schemas';
import { EpisodePreview } from '@/video/episode-preview';
const ResponseShape = z.object({ mode: z.string(), result: z.object({ manifest: Manifest.optional(), text: z.string().optional(), reply: z.string().optional(), events: z.array(z.object({ stage: z.string(), status: z.string(), timestamp: z.string() })).optional() }) });
export function ProviderPreview({ data }: { data: unknown }) {
  const parsed = ResponseShape.safeParse(data);
  if (!parsed.success) return null;
  const { result, mode } = parsed.data;
  const manifest = result.manifest;
  return <section className="panel"><div className="eyebrow">{mode === 'demo' ? 'DEMO-GENERATED CONTENT' : 'NEW MODEL OUTPUT'}</div>
    {manifest && <><h2>{manifest.title}</h2><p>Animated manifest preview</p><EpisodePreview manifest={manifest}/></>}
    {(result.text || result.reply) && <p className="character-reply">{result.text || result.reply}</p>}
    {result.events && <ol className="provider-timeline">{result.events.map((event, index) => <li key={index}><b>{event.stage}</b> · {event.status}<small>{event.timestamp}</small></li>)}</ol>}
  </section>;
}
