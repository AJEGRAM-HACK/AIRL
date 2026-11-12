'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { ArrowLeft, ArrowRight, BookOpen, ChevronLeft, ChevronRight, SlidersHorizontal, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JourneySheet } from '@/components/journey/sheet';
import { useChapterGestures } from '@/components/journey/use-chapter-gestures';
import { SpatialWorld } from '@/components/spatial-world';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { useAccess } from '@/components/platform/access';
import { StoryHelper } from '@/components/platform/story-helper';
import { api } from '@/components/platform/api';
import { ProviderPicker, defaultProvider, type ProviderChoice } from '@/components/platform/provider-picker';
import { RoomJoin } from '@/features/live/room-join';
import { Job, RoomProduction } from '@/features/production/room-production';
import { RoomSnapshot, type RoomState, type SessionState } from '@/features/live/types';
import { Manifest, Script, Stages } from '@/server/production/schemas';
import { EpisodePreview } from '@/video/episode-preview';
import { type World, WorldCharacter } from '@/lib/domain';
import { experienceUrl, journeySteps, type JourneyStep } from '@/lib/journey';

const Episode = z.object({
  episode_id: z.string(), round_id: z.string().nullable(), story_order: z.number(),
  artifact: z.object({ manifest: Manifest, executionMode: z.string().optional() }),
});
const Production = z.object({ jobs: z.array(Job) });
const WorldEpisodes = z.object({ episodes: z.array(Episode) });
const stepTitles = ['Enter the world', 'Let the audience decide', 'Watch the episode take shape', 'Review and premiere', 'Ask what happened'];

export default function JourneyDemo({ world, characters, rooms, initialRound }: {
  world: World;
  characters: z.infer<typeof WorldCharacter>[];
  rooms: { id: string; title: string }[];
  initialRound: RoomState;
}) {
  const router = useRouter();
  const query = useSearchParams();
  const access = useAccess();
  const canManage = access.managedWorldIds.includes(world.id);
  const canInspect = canManage || (world.id === 'barangay-2099' && access.legacyOperator);
  const [room, setRoom] = useState(initialRound);
  const [jobs, setJobs] = useState<z.infer<typeof Job>[]>([]);
  const [episodes, setEpisodes] = useState<z.infer<typeof Episode>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const [session, setSession] = useState<SessionState>({ joined: false, operator: false, vote: null });
  const sessionRevision = useRef(0);
  const [pending, setPending] = useState(false);
  const [provider, setProvider] = useState<ProviderChoice>(defaultProvider);
  const [sheet, setSheet] = useState<'cast' | 'transcript' | 'review' | 'settings' | 'saved' | null>(null);
  const [transcriptSource, setTranscriptSource] = useState<'episode' | 'preview'>('episode');
  const [artifactChoice, setArtifactChoice] = useState<'excerpt' | 'preview' | null>(null);
  const [excerptIndex, setExcerptIndex] = useState(0);
  const stageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let active = true;
    setProvider(defaultProvider);
    if (canManage) void api('/api/models').then(catalog => {
      if (active && catalog.hostedConfigured && catalog.hosted?.[0]) {
        setProvider(current => current === defaultProvider ? { mode: 'hosted_openai', model: catalog.hosted[0], consent: false } : current);
      }
    }).catch(() => {});
    return () => { active = false; };
  }, [canManage, access.account?.id]);

  useEffect(() => {
    setProvider(current => current.consent ? { ...current, consent: false } : current);
  }, [room.roundId]);

  function chooseProvider(next: ProviderChoice) {
    setProvider(current => ({ ...next, consent: current.mode === next.mode && current.model === next.model ? next.consent : false }));
  }

  useEffect(() => {
    let active = true;
    let fetching = false;
    let refreshAgain = false;
    async function refresh() {
      if (document.hidden) return;
      if (fetching) { refreshAgain = true; return; }
      fetching = true;
      try {
        const [production, library] = await Promise.all([
          api(`/api/production?universe=${world.id}${canInspect ? '&operator=1' : ''}`),
          api(`/api/universes/${world.id}`),
        ]);
        const parsed = Production.parse(production);
        const published = WorldEpisodes.parse(library);
        if (active) { setJobs(parsed.jobs); setEpisodes(published.episodes); setError(''); setLoading(false); }
      } catch (failure) {
        if (active) { setError(failure instanceof Error ? failure.message : 'Unable to load the journey.'); setLoading(false); }
      } finally {
        fetching = false;
        if (active && refreshAgain) { refreshAgain = false; void refresh(); }
      }
    }
    // Remove privileged data immediately when authentication changes.
    setJobs([]);
    setEpisodes([]);
    setLoading(true);
    void refresh();
    const source = new EventSource(`/api/live/rooms/${world.id}/events`);
    source.onopen = () => {
      if (!active) return;
      setConnected(true);
      const revision = sessionRevision.current;
      void api(`/api/live/rooms/${world.id}/state`).then(value => {
        if (active) {
          setRoom(RoomSnapshot.parse(value.room));
          if (revision === sessionRevision.current) setSession(value.session);
        }
      }).catch(() => { if (active) setConnected(false); });
      void refresh();
    };
    source.onmessage = event => {
      try { if (active) setRoom(RoomSnapshot.parse(JSON.parse(event.data))); }
      catch { if (active) setError('Room update could not be read. Reconnect to retry.'); }
    };
    source.addEventListener('production', () => window.dispatchEvent(new CustomEvent(`airl-production:${world.id}`)));
    source.onerror = () => { if (active) setConnected(false); };
    const timer = setInterval(refresh, canInspect ? 5000 : 30000);
    window.addEventListener(`airl-production:${world.id}`, refresh);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      active = false;
      source.close();
      clearInterval(timer);
      window.removeEventListener(`airl-production:${world.id}`, refresh);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [world.id, canInspect, access.account?.id]);

  const roundId = query.get('round') || room.roundId;
  const recordedRound = roundId === room.roundId ? room : initialRound;
  const job = jobs.find(item => item.round_id === roundId);
  const liveEpisode = episodes.find(item => item.episode_id === job?.run_id);
  const selectedEpisode = episodes.find(item => item.episode_id === query.get('episode')) ||
    (!query.get('episode') ? liveEpisode : undefined);
  const saved = query.get('saved') === '1';
  const explicitStep = query.get('step');
  const step: JourneyStep = journeySteps.includes(explicitStep as JourneyStep) ? explicitStep as JourneyStep : 'world';
  const stepIndex = journeySteps.indexOf(step);
  const selectedId = query.get('episode') || undefined;
  const context = { universe: world.id, round: roundId, episode: selectedId, saved: saved ? '1' : undefined, step };
  const go = useCallback((next: JourneyStep, episode?: string | null, rehearsal = saved) => {
    setSheet(null);
    router.push(experienceUrl('journey', {
      universe: world.id, round: roundId, step: next,
      episode: episode === null ? undefined : episode || selectedId,
      saved: rehearsal ? '1' : undefined,
    }), { scroll: false });
  }, [router, world.id, roundId, selectedId, saved]);
  const chapterMotion = useChapterGestures({
    stageRef, index: stepIndex, count: journeySteps.length, disabled: sheet !== null || pending,
    onNavigate: next => go(journeySteps[next]),
  });

  useEffect(() => {
    function keydown(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (sheet || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey ||
        target.closest('input, select, textarea, [contenteditable="true"], .remotion-preview')) return;
      const direction = ['ArrowRight', 'PageDown'].includes(event.key) ? 1 : ['ArrowLeft', 'PageUp'].includes(event.key) ? -1 : 0;
      const next = journeySteps[stepIndex + direction];
      if (direction && next) { event.preventDefault(); go(next); }
    }
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [sheet, stepIndex, go]);

  useEffect(() => {
    if (sheet === 'review' && !canInspect) setSheet(null);
  }, [sheet, canInspect]);

  useEffect(() => {
    setArtifactChoice(null);
    setExcerptIndex(0);
  }, [job?.id]);

  const winner = recordedRound.options.find(option => option.id === recordedRound.winner);
  const winningChoice = winner?.title || job?.choice;
  const script = Script.safeParse(canInspect ? job?.script : undefined);
  const lines = script.success ? script.data.scenes.flatMap(scene => scene.dialogue.map(line => ({ ...line, sceneId: scene.id }))) : [];
  const excerpt = lines[Math.min(excerptIndex, Math.max(0, lines.length - 1))];
  const stageEvents = job?.events.filter(event => Stages.some(stage => stage === event.stage)) || [];
  const lastEvent = canInspect ? stageEvents.at(-1) : undefined;
  const activeStage = lastEvent?.stage || job?.progress?.stage || 'Story Director';
  const activeStatus = lastEvent?.status || job?.progress?.status || job?.status || 'Waiting for a closed vote';
  const handoffKey = `${job?.id}-${activeStage}-${activeStatus}-${lastEvent?.timestamp || ''}-${stageEvents.length}`;
  const artifact = artifactChoice || (job?.manifest ? 'preview' : 'excerpt');
  const featured = characters.find(character => character.id === 'tita-nena') || characters[0];
  const fallback = episodes.find(item => item.episode_id === selectedId)
    || episodes.find(item => item.episode_id !== liveEpisode?.episode_id) || episodes[0];
  const watchUrl = selectedEpisode ? `/universes/${world.id}/episodes/${selectedEpisode.episode_id}` : undefined;
  const transcript = transcriptSource === 'preview' && canInspect ? job?.manifest : selectedEpisode?.artifact.manifest;
  const liveStatus = loading ? 'Loading stored job status' : job ? `${job.status} · ${job.mode} · ${job.model || 'Model recorded at execution'}` : 'Waiting for a closed vote';
  const sheetTitles = { cast: 'Meet the cast', transcript: 'Episode transcript', review: 'Production review', settings: 'Presentation settings', saved: 'Saved episodes' };

  async function roomAction(action: 'join' | 'close' | 'next') {
    sessionRevision.current++;
    setPending(true);
    setError('');
    try {
      const data = action === 'join'
        ? await api('/api/live/session', { universe: world.id })
        : await api(`/api/live/rooms/${world.id}/${action}`, {
          roundId: room.roundId,
          ...(action === 'close' ? { provider } : {}),
        });
      sessionRevision.current++;
      setSession(data.session || data);
      if (data.room) setRoom(RoomSnapshot.parse(data.room));
      window.dispatchEvent(new CustomEvent(`airl-production:${world.id}`));
      if (action === 'next') {
        setSheet(null);
        router.push(experienceUrl('journey', { universe: world.id, round: data.room.roundId, step: 'vote' }));
      }
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Unable to complete this action.');
    } finally {
      setPending(false);
      if (action === 'close') setProvider(current => ({ ...current, consent: false }));
    }
  }

  function openTranscript(source: 'episode' | 'preview') {
    setTranscriptSource(source);
    setSheet('transcript');
  }

  function primaryAction() {
    if (step === 'world') return <Button onClick={() => go('vote')}>{recordedRound.status === 'open' ? 'Open the voting stage' : 'Resume this audience decision'} <ArrowRight size={18} /></Button>;
    if (step === 'vote') {
      if (recordedRound.status === 'closed') return <Button onClick={() => go('production', null, false)}>Follow the production <ArrowRight size={18} /></Button>;
      if (!canInspect) return <Button asChild><Link href={`/live/${world.id}`}>Open audience voting <ArrowRight size={18} /></Link></Button>;
      if (!session.joined) return <Button disabled={pending} onClick={() => roomAction('join')}>Join room to vote</Button>;
      if (canManage && provider.mode === 'hosted_openai' && (!provider.model || !provider.consent)) return <Button onClick={() => setSheet('settings')}>Set up OpenAI production <ArrowRight size={18} /></Button>;
      return <Button disabled={pending || roundId !== room.roundId} onClick={() => roomAction('close')}>{pending ? 'Closing the round…' : 'Close voting & produce'} <ArrowRight size={18} /></Button>;
    }
    if (step === 'production' || (step === 'premiere' && !selectedEpisode)) {
      if (job?.status === 'published' && liveEpisode) return <Button onClick={() => go('premiere', liveEpisode.episode_id, false)}>Premiere the live episode <ArrowRight size={18} /></Button>;
      if (canInspect && job) return <Button onClick={() => setSheet('review')}>{job.status === 'review' ? 'Review before the premiere' : 'Inspect live production'} <ArrowRight size={18} /></Button>;
      return <Button variant="outline" onClick={() => go('vote')}>Return to voting</Button>;
    }
    if (step === 'premiere' && selectedEpisode) return <Button onClick={() => go('ask', selectedEpisode.episode_id)}>Ask about this episode <ArrowRight size={18} /></Button>;
    return null;
  }

  return (
    <div className="journey-experience" data-chapter={step} data-transition={chapterMotion.phase} data-direction={chapterMotion.direction}>
      <div className="journey-atmosphere" aria-hidden="true"><i /><i /><i /></div>
      <header className="journey-chrome">
        <Link className="journey-brand" href={experienceUrl('explore', context)}>AIRL<span>/ Journey</span></Link>
        <div className="journey-chrome-actions">
          <ThemeSwitcher/>
          {canManage && <button className="journey-icon-button" aria-label="Presentation settings" onClick={() => setSheet('settings')}><SlidersHorizontal size={18} /></button>}
          <Link className="journey-exit" href={experienceUrl('explore', context)}>Exit to Explore <ArrowRight size={16} /></Link>
        </div>
      </header>
      <div className="journey-decision journey-winner" aria-live="polite">
        <span>{world.title}</span>
        <p>{winningChoice ? <><span>Audience decision</span> {winningChoice}</> : `${recordedRound.status === 'open' ? 'Voting open' : 'Voting closed'} · ${recordedRound.totalVotes} votes`}</p>
        <span className="journey-connection" data-connected={connected}>{connected ? 'Live' : 'Reconnecting'}</span>
      </div>
      <nav className="journey-rail" aria-label="Journey steps">
        {journeySteps.map((item, index) => <Link key={item} href={experienceUrl('journey', { ...context, step: item })} aria-current={step === item ? 'step' : undefined} aria-label={stepTitles[index]}><span className="journey-rail-marker" /><span className="journey-rail-label">{stepTitles[index]}</span></Link>)}
      </nav>
      <p className="sr-only" role="status">Chapter {stepIndex + 1} of {journeySteps.length}: {stepTitles[stepIndex]}</p>
      <main ref={stageRef} id="main" className="journey-stage" tabIndex={-1} aria-busy={chapterMotion.phase === 'out'}>
        {error && <div role="alert" className="journey-error">{error} <button onClick={() => window.dispatchEvent(new Event('focus'))}>Reconnect</button></div>}
        {roundId !== room.roundId && <p className="journey-recorded">Recorded round · <Link href={experienceUrl('journey', { universe: world.id, round: room.roundId, step: 'vote' })}>Open the current voting round</Link></p>}
        <section className={`journey-chapter journey-chapter-${step}`} aria-label={stepTitles[stepIndex]} key={step}>
          {step === 'world' && <div className="journey-intro">
            <div className="journey-intro-copy">
            <p className="journey-kicker">A story shaped by its audience</p>
            <h1>{world.title}<span className="journey-period">.</span></h1>
            <p className="journey-premise">{world.settings.premise || world.settings.storyline}</p>
            <button className="journey-text-button" onClick={() => setSheet('cast')}><Users size={18} /> Meet the cast</button>
            </div>
            <div className="journey-world-view"><SpatialWorld title={world.title} official={world.official}/></div>
          </div>}
          {step === 'vote' && <div className="journey-vote-stage">
            <div className="journey-vote-heading"><p className="journey-kicker">The audience writes the next turn</p><h1>Let the audience decide.</h1><p className="community-stats">{recordedRound.totalVotes} votes · {recordedRound.participantCount} joined sessions</p></div>
            <RoomJoin roomId={world.id} />
            <ol className="journey-vote-options">{recordedRound.options.map(option => <li key={option.id} data-winner={option.id === recordedRound.winner}><div><h2>{option.title}</h2><span>{option.votes}</span></div><p>{option.description}</p><div className="journey-vote-track"><i style={{ width: `${recordedRound.totalVotes ? option.votes / recordedRound.totalVotes * 100 : 0}%` }} /></div></li>)}</ol>
          </div>}
          {step === 'production' && <div className="journey-production-stage">
            {!job ? <div><p className="journey-kicker">Waiting for the audience decision</p><h1>The next chapter is yours.</h1><p>Close the voting round to begin production.</p></div> : <>
              <div className="journey-agent-stage" key={handoffKey} data-event-sequence={stageEvents.length}>
                <p className="journey-kicker">{job.mode === 'demo' ? 'Demo · deterministic workflow' : `${job.mode} · ${job.model || 'Selected model'}`}</p>
                <p className="journey-agent-state">{activeStatus}{lastEvent ? ` · attempt ${lastEvent.attempt}` : ''}</p>
                <h1>{activeStage}<span className="journey-period">.</span></h1>
                <ol className="journey-agents" aria-label="Recorded agent progress">{Stages.map(stage => {
                  const event = canInspect ? stageEvents.filter(event => event.stage === stage).at(-1) : undefined;
                  const status = event?.status || (job.progress?.stage === stage ? job.progress.status : 'Waiting');
                  return <li key={stage} data-active={stage === activeStage}><span>{stage}</span><small>{status}</small></li>;
                })}</ol>
              </div>
              <div className="journey-artifact">
                {canInspect ? <>
                  <div className="journey-artifact-tabs">
                    <button disabled={!lines.length} aria-pressed={artifact === 'excerpt'} onClick={() => setArtifactChoice('excerpt')}>Validated dialogue</button>
                    <button disabled={!job.manifest} aria-pressed={artifact === 'preview'} onClick={() => setArtifactChoice('preview')}>Preview{job.previewVersion ? ` v${job.previewVersion}` : ''}</button>
                  </div>
                  {artifact === 'preview' && job.manifest ? <>
                    <EpisodePreview manifest={job.manifest} externalTranscript />
                    <button className="journey-text-button" onClick={() => openTranscript('preview')}><BookOpen size={16} /> Open transcript</button>
                    <p className="journey-kicker">Last valid preview · version {job.previewVersion}</p>
                  </> : excerpt ? <div className="journey-excerpt" key={`${job.id}-${excerpt.sceneId}-${excerptIndex}`}>
                    <blockquote>{excerpt.text}</blockquote>
                    <p>{characters.find(character => character.id === excerpt.characterId)?.name || excerpt.characterId} · {excerpt.sceneId}</p>
                    <div className="journey-excerpt-controls"><button className="journey-icon-button" aria-label="Previous excerpt" disabled={excerptIndex === 0} onClick={() => setExcerptIndex(value => value - 1)}><ChevronLeft size={18} /></button><span>{excerptIndex + 1} / {lines.length}</span><button className="journey-icon-button" aria-label="Next excerpt" disabled={excerptIndex >= lines.length - 1} onClick={() => setExcerptIndex(value => value + 1)}><ChevronRight size={18} /></button></div>
                  </div> : <p className="journey-artifact-wait">The first validated artifact will appear here.</p>}
                </> : <p>Draft dialogue, previews and review are available to the authorized presenter.</p>}
              </div>
            </>}
          </div>}
          {step === 'premiere' && <div className="journey-premiere">
            {selectedEpisode ? <>
              <div className="journey-film-heading"><p className="journey-kicker">{saved ? 'Pre-generated rehearsal episode' : 'Approved episode'}</p><h1>{selectedEpisode.artifact.manifest.title}</h1></div>
              <div className="journey-film" aria-label="Premiere player"><EpisodePreview key={selectedEpisode.episode_id} manifest={selectedEpisode.artifact.manifest} externalTranscript /></div>
              <div className="journey-film-links"><button className="journey-text-button" onClick={() => openTranscript('episode')}><BookOpen size={16} /> Episode transcript</button><Link href={watchUrl!}>Audience watch link <ArrowRight size={16} /></Link></div>
            </> : <div className="journey-premiere-wait"><p className="journey-kicker">{job?.status === 'review' ? 'A chapter ready for approval' : 'The premiere'}</p><h1>{job?.status === 'review' ? 'Ready for review.' : 'A story worth waiting for.'}</h1><p>{selectedId ? 'This approved episode is unavailable in the selected universe.' : 'Review the live production or play an approved saved episode.'}</p></div>}
          </div>}
          {step === 'ask' && <div className="journey-question">
            <p className="journey-kicker">{selectedEpisode?.artifact.manifest.title || 'The story so far'}</p><h1>Ask what happened.</h1>
            {selectedEpisode ? <StoryHelper key={selectedEpisode.episode_id} universeId={world.id} episodeId={selectedEpisode.episode_id} characterId={featured?.id} suggestedQuestion={featured ? `How did ${featured.name} react to the audience’s decision in this episode?` : 'What happened in this episode?'} /> : <p>Choose an approved episode in the premiere chapter to ask about it.</p>}
          </div>}
        </section>
      </main>
      <footer className="journey-controls">
        <div className="journey-status"><p className="journey-gesture-hint">Scroll or swipe between chapters</p><p data-testid="journey-live-status">Live production · {liveStatus}</p>{saved && job?.progress && <small>{job.progress.stage} · {job.progress.status}</small>}<button className="journey-text-button" disabled={!fallback} onClick={() => fallback && go('premiere', fallback.episode_id, true)}>Play a saved episode</button>{episodes.length > 0 && <button className="journey-text-button" onClick={() => setSheet('saved')}>Choose saved episode</button>}</div>
        <div className="journey-primary">{primaryAction()}</div>
        <div className="journey-page-controls"><button className="journey-icon-button" aria-label="Previous chapter" disabled={stepIndex === 0} onClick={() => go(journeySteps[stepIndex - 1])}><ArrowLeft size={18} /></button><span>{String(stepIndex + 1).padStart(2, '0')} / 05</span><button className="journey-icon-button" aria-label="Next chapter" disabled={stepIndex === journeySteps.length - 1} onClick={() => go(journeySteps[stepIndex + 1])}><ArrowRight size={18} /></button></div>
        {saved && job && <div className="journey-live-return">{liveEpisode ? <button onClick={() => go('premiere', liveEpisode.episode_id, false)}>Open the completed live episode <ArrowRight size={15} /></button> : <button onClick={() => go('production', null, false)}>Return to live production <ArrowRight size={15} /></button>}</div>}
      </footer>
      <JourneySheet open={sheet !== null} title={sheet ? sheetTitles[sheet] : ''} onClose={() => setSheet(null)}>
        {sheet === 'cast' && <div className="journey-sheet-cast">{characters.map(character => <article key={character.id}><p className="journey-kicker">{character.role}</p><h3>{character.name}</h3><p>{character.backstory}</p><p>{character.personality.join(' · ')}</p></article>)}</div>}
        {sheet === 'transcript' && transcript && <div className="journey-transcript"><h3>{transcript.title}</h3>{transcript.scenes.map(scene => <article key={scene.id}><p className="journey-kicker">{scene.id}</p>{scene.dialogue.map((line, index) => <p key={index}><b>{characters.find(character => character.id === line.characterId)?.name || line.characterId}</b> {line.text}</p>)}</article>)}</div>}
        {sheet === 'review' && canInspect && job && <RoomProduction key={job.id} operator roomId={world.id} jobId={job.id} presentation />}
        {sheet === 'settings' && canManage && <div className="journey-settings"><label>Presentation universe<select aria-label="Presentation universe" value={world.id} onChange={event => router.push(experienceUrl('journey', { universe: event.target.value }))}>{rooms.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label><fieldset disabled={pending}><ProviderPicker value={provider} onChange={chooseProvider} background /></fieldset><p>{provider.mode === 'hosted_openai' ? 'OpenAI production is paid. Authorize each round before closing voting.' : provider.mode === 'demo' ? 'Demo uses deterministic templates without inference.' : 'Live production uses the selected local Ollama model.'} Saved playback uses no inference.</p>{room.status === 'closed' && <Button disabled={pending} onClick={() => roomAction('next')}>Start next round</Button>}<Link href={`/studio/worlds/${world.id}`}>Open world Studio <ArrowRight size={16} /></Link></div>}
        {sheet === 'saved' && <div className="journey-settings"><label>Approved saved episode<select aria-label="Approved saved episode" value={fallback?.episode_id || ''} onChange={event => router.replace(experienceUrl('journey', { ...context, episode: event.target.value }), { scroll: false })}>{episodes.map(item => <option key={item.episode_id} value={item.episode_id}>{item.artifact.manifest.title}</option>)}</select></label><p>Approved episodes from {world.title} play immediately from storage.</p><Button disabled={!fallback} onClick={() => fallback && go('premiere', fallback.episode_id, true)}>Use this episode <ArrowRight size={18} /></Button></div>}
      </JourneySheet>
    </div>
  );
}
