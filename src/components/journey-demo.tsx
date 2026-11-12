'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { z } from 'zod';
import { Radio, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Footer } from '@/components/nav';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { ModeSwitcher } from '@/components/journey/mode-switcher';
import { useAccess } from '@/components/platform/access';
import { StoryHelper } from '@/components/platform/story-helper';
import { api } from '@/components/platform/api';
import { CommunityPanel } from '@/features/live/community-panel';
import { RoomJoin } from '@/features/live/room-join';
import { Job, RoomProduction } from '@/features/production/room-production';
import { RoomSnapshot, type RoomState } from '@/features/live/types';
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
      void api(`/api/live/rooms/${world.id}/state`).then(value => {
        if (active) setRoom(RoomSnapshot.parse(value.room));
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
  const automaticStep = job ? job.status === 'published' ? 'premiere' : 'production' : 'world';
  const step: JourneyStep = journeySteps.includes(explicitStep as JourneyStep) ? explicitStep as JourneyStep : automaticStep;
  const context = { universe: world.id, round: roundId, episode: query.get('episode') || undefined, saved: saved ? '1' : undefined };
  const go = useCallback((next: JourneyStep, episode?: string | null, rehearsal = saved) => {
    router.push(experienceUrl('journey', { ...context, step: next, episode: episode === null ? undefined : episode || context.episode, saved: rehearsal ? '1' : undefined }), { scroll: false });
  }, [router, world.id, roundId, context.episode, saved]);
  const winner = recordedRound.options.find(option => option.id === recordedRound.winner);
  const script = Script.safeParse(canInspect ? job?.script : undefined);
  const featured = characters.find(character => character.id === 'tita-nena') || characters[0];
  const fallback = episodes.find(item => item.episode_id === query.get('episode'))
    || episodes.find(item => item.episode_id !== liveEpisode?.episode_id) || episodes[0];
  const watchUrl = selectedEpisode ? `/universes/${world.id}/episodes/${selectedEpisode.episode_id}` : undefined;

  return <>
    <header className="journey-nav">
      <Link href="/" className="brand" aria-label="AIRL home"><Sparkles aria-hidden="true"/><span>AIRL<span className="brand-period">.</span></span></Link>
      <ModeSwitcher universeId={world.id}/>
      <Link href="/account">Account</Link>
      <ThemeSwitcher/>
    </header>
    <main id="main" className="journey-shell">
      <div className="journey-heading">
        <div><p className="eyebrow"><Radio size={15}/> {world.title}</p><p role="status" className="fine-print">{connected ? 'Connected to the shared room' : 'Connecting · retrying automatically'}</p></div>
        {canManage && <label>Presentation universe<select aria-label="Presentation universe" value={world.id} onChange={event => router.push(experienceUrl('journey', { universe: event.target.value }))}>{rooms.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>}
      </div>
      <nav className="journey-progress" aria-label="Journey steps">{journeySteps.map((item, index) => <Link key={item} href={experienceUrl('journey', { ...context, step: item })} aria-current={step === item ? 'step' : undefined}>{stepTitles[index]}</Link>)}</nav>
      {error && <p className="form-error" role="alert">{error} <Button variant="outline" onClick={() => window.dispatchEvent(new Event('focus'))}>Reconnect</Button></p>}
      {loading && <p role="status">Loading saved production and episodes…</p>}
      {roundId !== room.roundId && <p className="notice">Viewing a recorded round. <Link href={experienceUrl('journey', { universe: world.id, round: room.roundId, step: 'vote' })}>Open the current voting round</Link></p>}
      <section className="journey-stage" aria-label={stepTitles[journeySteps.indexOf(step)]}>
        <h1>{stepTitles[journeySteps.indexOf(step)]}</h1>
        {step === 'world' && <>
          <p className="journey-premise">{world.settings.premise || world.settings.storyline}</p>
          <div className="journey-cast">{characters.map(character => <article className="journey-card" key={character.id}><h2>{character.name}</h2><p>{character.role}</p></article>)}</div>
          <div className="journey-actions"><Button onClick={() => go('vote')}>{recordedRound.status === 'open' ? 'Open the voting stage' : 'Resume this audience decision'}</Button></div>
        </>}
        {step === 'vote' && <>
          <div className="journey-voting">
            <RoomJoin roomId={world.id}/>
            {roundId === room.roundId ? <CommunityPanel operatorView={canInspect} showProduction={false} fixedOllama roomId={world.id}/> : <div className="journey-card"><p>{recordedRound.totalVotes} recorded votes</p>{recordedRound.options.map(option => <p key={option.id}>{option.title} · {option.votes}</p>)}</div>}
          </div>
          {winner && <div className="journey-winner"><h2>Winning direction</h2><p>{winner.title}</p><Button onClick={() => go('production', null, false)}>Follow the production</Button></div>}
          {!canInspect && <p>The presenter opens or closes voting from an authorized account.</p>}
        </>}
        {step === 'production' && <>
          {!job ? <p>A closed audience round creates the production. <Link href={experienceUrl('journey', { ...context, step: 'vote' })}>Return to voting</Link></p> : <>
            <p className="journey-premise">{job.choice}</p>
            <p className="notice">{job.mode === 'demo' ? 'Demo · offline deterministic workflow' : `${job.mode} · ${job.model || 'Model recorded at execution'}`}</p>
            <ol className="journey-agents" aria-label="Recorded agent progress">{Stages.map(stage => {
              const event = canInspect ? job.events.filter(event => event.stage === stage).at(-1) : undefined;
              const state = event?.status || (job.progress?.stage === stage ? job.progress.status : 'No recorded update');
              return <li key={stage}><h2>{stage}</h2><p>{state}</p>{event && <small>Attempt {event.attempt} · {new Date(event.timestamp).toLocaleTimeString()}</small>}</li>;
            })}</ol>
            {script.success && <section className="journey-dialogue"><h2>Validated dialogue</h2>{script.data.scenes.map(scene => <article key={scene.id}>{scene.dialogue.map((line, index) => <p key={index}><b>{characters.find(character => character.id === line.characterId)?.name || line.characterId}</b> {line.text}</p>)}</article>)}</section>}
            {canInspect ? <RoomProduction key={job.id} operator roomId={world.id} jobId={job.id} presentation allowReview={false}/> : <p>Draft dialogue, previews and review are available to the authorized presenter.</p>}
            {job.status === 'review' && canManage && <Button onClick={() => go('premiere', null, false)}>Review before the premiere</Button>}
            {job.status === 'published' && liveEpisode && <Button onClick={() => go('premiere', liveEpisode.episode_id, false)}>Premiere the live episode</Button>}
          </>}
        </>}
        {step === 'premiere' && <>
          {!saved && job && job.status !== 'published' && canInspect && <RoomProduction key={job.id} operator roomId={world.id} jobId={job.id} presentation/>}
          {selectedEpisode ? <section className="journey-premiere" aria-label="Premiere player">
            <p className="eyebrow">{saved ? 'Pre-generated rehearsal episode' : 'Approved episode'}</p>
            <h2>{selectedEpisode.artifact.manifest.title}</h2>
            <EpisodePreview key={selectedEpisode.episode_id} manifest={selectedEpisode.artifact.manifest}/>
            <p><Link href={watchUrl!}>Audience watch link</Link></p>
            <Button onClick={() => go('ask', selectedEpisode.episode_id)}>Ask about this episode</Button>
          </section> : <p>{query.get('episode') ? 'The selected approved episode is unavailable in this universe.' : 'Publish the draft or choose a saved episode for the premiere.'}</p>}
        </>}
        {step === 'ask' && (selectedEpisode ? <>
          <p className="journey-premise">{selectedEpisode.artifact.manifest.title}</p>
          <StoryHelper key={selectedEpisode.episode_id} universeId={world.id} episodeId={selectedEpisode.episode_id} characterId={featured?.id} suggestedQuestion={featured ? `How did ${featured.name} react to the audience’s decision in this episode?` : 'What happened in this episode?'}/>
          <Link href={watchUrl!}>Return to the episode and scenes</Link>
        </> : <p>Choose an approved episode in the premiere stage to ask about it.</p>)}
      </section>
      <aside className="journey-saved journey-card" aria-label="Live production and saved episode">
        <div><h2>Keep the story moving</h2><p data-testid="journey-live-status">Live production · {loading ? 'Loading stored job status' : job ? `${job.status} · ${job.mode} · ${job.model || 'Model recorded at execution'}` : 'Waiting for a closed vote'}</p>{job?.progress && <p>{job.progress.stage} · {job.progress.status}</p>}</div>
        <div className="journey-fallback-controls">
          {episodes.length > 0 && <label>Approved saved episode<select aria-label="Approved saved episode" value={fallback?.episode_id || ''} onChange={event => router.push(experienceUrl('journey', { ...context, step, episode: event.target.value }))}>{episodes.map(item => <option key={item.episode_id} value={item.episode_id}>{item.artifact.manifest.title}</option>)}</select></label>}
          <Button variant="outline" disabled={!fallback} onClick={() => fallback && go('premiere', fallback.episode_id, true)}>Play a saved episode</Button>
          {!episodes.length && !loading && <p>Publish one rehearsal episode in Studio before the presentation.</p>}
          {job && saved && !liveEpisode && <Button variant="outline" onClick={() => go('production', null, false)}>Return to live production</Button>}
          {liveEpisode && saved && <Button onClick={() => go('premiere', liveEpisode.episode_id, false)}>Open the completed live episode</Button>}
        </div>
      </aside>
    </main>
    <Footer/>
  </>;
}
