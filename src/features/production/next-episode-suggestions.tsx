'use client';
import { useEffect, useRef, useState } from 'react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { api } from '@/components/platform/api';
import { ProviderPicker, defaultProvider, type ProviderChoice } from '@/components/platform/provider-picker';
import { RoomSnapshot, type RoomState, type SessionState } from '@/features/live/types';
import { NextEpisodeOptions, type NextRoundOption } from './suggestion-schema';

const Library = z.object({ episodes: z.array(z.object({ episode_id: z.string(), artifact: z.object({ manifest: z.object({ title: z.string() }) }) })) });
const Suggestions = z.object({ episodeId: z.string(), mode: z.string(), model: z.string(), result: NextEpisodeOptions });

export function NextEpisodeSuggestions({ roomId, roundId, pending = false, onStarted }: {
  roomId: string;
  roundId: string;
  pending?: boolean;
  onStarted: (result: { room: RoomState; session: SessionState }) => void;
}) {
  const [latest, setLatest] = useState<z.infer<typeof Library>['episodes'][number]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [provider, setProvider] = useState(defaultProvider);
  const [options, setOptions] = useState<NextRoundOption[]>([]);
  const [provenance, setProvenance] = useState('');
  const revision = useRef(0);

  useEffect(() => {
    let active = true;
    async function refresh() {
      try {
        const library = Library.parse(await api(`/api/universes/${roomId}`));
        if (active) { setLatest(library.episodes.at(-1)); setLoading(false); }
      } catch (failure) {
        if (active) { setError(failure instanceof Error ? failure.message : 'Unable to load the published story.'); setLoading(false); }
      }
    }
    void refresh();
    window.addEventListener(`airl-production:${roomId}`, refresh);
    window.addEventListener('focus', refresh);
    return () => { active = false; revision.current++; window.removeEventListener(`airl-production:${roomId}`, refresh); window.removeEventListener('focus', refresh); };
  }, [roomId]);

  useEffect(() => {
    revision.current++;
    setOptions([]); setProvenance(''); setBusy(false);
    setProvider(current => ({ ...current, consent: false }));
  }, [latest?.episode_id, roundId]);

  function chooseProvider(value: ProviderChoice) {
    setProvider(current => ({ ...value, consent: current.mode === value.mode && current.model === value.model ? value.consent : false }));
  }

  async function generate() {
    if (!latest) return;
    const requestRevision = ++revision.current;
    setBusy(true); setError('');
    try {
      const result = Suggestions.parse(await api(`/api/universes/${roomId}/suggestions`, { episodeId: latest.episode_id, provider }));
      if (revision.current !== requestRevision) return;
      setOptions(result.result.options.map((option, index) => ({ id: `next-${index + 1}`, ...option })));
      setProvenance(result.mode === 'demo' ? 'Demo suggestions · Deterministic templates' : `${result.mode} · ${result.model}`);
    } catch (failure) {
      if (revision.current === requestRevision) setError(failure instanceof Error ? failure.message : 'Suggestions could not be generated.');
    } finally {
      if (revision.current === requestRevision) { setBusy(false); setProvider(current => ({ ...current, consent: false })); }
    }
  }

  async function start() {
    setBusy(true); setError('');
    try {
      const result = await api(`/api/live/rooms/${roomId}/next`, { roundId, ...(options.length ? { options, sourceEpisodeId: latest?.episode_id } : {}) });
      onStarted({ room: RoomSnapshot.parse(result.room), session: result.session });
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'The next round could not be opened.'); }
    finally { setBusy(false); }
  }

  const paid = provider.mode === 'hosted_openai' || provider.mode === 'creator_byok';
  const invalid = options.length > 0 && !NextEpisodeOptions.safeParse({ options }).success;
  return <section className="next-episode-suggestions" aria-label="Next episode suggestions" aria-busy={busy}>
    {latest && <><h3>Continue the story</h3><p>Build the next audience choice from <b>{latest.artifact.manifest.title}</b>.</p>
      <details className="advanced-settings"><summary>Suggestion settings</summary><fieldset disabled={busy || pending}>
        <ProviderPicker labelPrefix="Suggestion" value={provider} onChange={chooseProvider} />
      </fieldset></details>
      <Button variant="outline" disabled={busy || pending || (paid && !provider.consent)} onClick={generate}>
        {busy ? 'Working…' : options.length ? 'Regenerate suggestions' : 'Generate next-episode suggestions'}
      </Button>
    </>}
    {loading && <p role="status">Loading published story…</p>}
    {error && <p className="form-error" role="alert">{error}</p>}
    {options.length > 0 && <><p className="fine-print">{provenance}</p><div className="next-episode-options">
      {options.map((option, index) => <fieldset key={option.id} disabled={busy || pending}>
        <legend>Direction {index + 1}</legend>
        <label>Title<input aria-label={`Direction ${index + 1} title`} maxLength={120} value={option.title}
          onChange={event => setOptions(current => current.map((item, position) => position === index ? { ...item, title: event.target.value } : item))} /></label>
        <label>Description<textarea aria-label={`Direction ${index + 1} description`} maxLength={240} value={option.description}
          onChange={event => setOptions(current => current.map((item, position) => position === index ? { ...item, description: event.target.value } : item))} /></label>
      </fieldset>)}
    </div>{invalid && <p role="status">Give each direction a different title and a description.</p>}</>}
    <Button variant="outline" disabled={busy || pending || loading || !!(latest && !options.length) || invalid} onClick={start}>
      {options.length ? 'Open voting with these suggestions' : 'Start next round'}
    </Button>
  </section>;
}
