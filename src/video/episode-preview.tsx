'use client';
import { Player, type PlayerRef } from '@remotion/player';
import { useEffect, useRef, useState } from 'react';
import { FirstProductionPlayer, useFirstProduction } from '@/components/first-production';
import { Manifest } from '@/server/production/schemas';
import { Button } from '@/components/ui/button';
import { EpisodeComposition, compositionFrames, FPS, type EpisodeManifest } from './composition';

type PreviewProps = {
  manifest: unknown;
  seekFrame?: number;
  externalTranscript?: boolean;
  universeId?: string;
  episodeId?: string;
  jobId?: string;
};

export function EpisodePreview(props: PreviewProps) {
  const film = useFirstProduction(props.universeId, props.episodeId, props.jobId);
  if (film) return <FirstProductionPlayer seekFrame={props.seekFrame} />;
  const parsed = Manifest.safeParse(props.manifest);
  if (!parsed.success || parsed.data.scenes.length !== 3 || parsed.data.scenes.some(scene =>
    scene.durationSeconds < 3 || scene.durationSeconds > 30 || !Number.isInteger(scene.durationSeconds) || !scene.dialogue.length)) {
    return <p role="alert">Episode manifest is unavailable.</p>;
  }
  const source = props.universeId && (props.episodeId || props.jobId)
    ? `/api/universes/${encodeURIComponent(props.universeId)}/audio?${new URLSearchParams(props.episodeId ? { episodeId: props.episodeId } : { jobId: props.jobId! })}`
    : undefined;
  return <ValidatedPreview key={`${source || ''}:${JSON.stringify(parsed.data)}`} manifest={parsed.data}
    source={source} seekFrame={props.seekFrame} externalTranscript={props.externalTranscript} />;
}

function ValidatedPreview({ manifest, source, seekFrame, externalTranscript = false }: {
  manifest: EpisodeManifest;
  source?: string;
  seekFrame?: number;
  externalTranscript?: boolean;
}) {
  const player = useRef<PlayerRef>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const playing = useRef(false);
  const [frame, setFrame] = useState(0);
  const [captions, setCaptions] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>();
  const [audioError, setAudioError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const preparingAudio = !!source && !audioUrl && !audioError;

  useEffect(() => {
    if (seekFrame !== undefined && Number.isFinite(seekFrame)) {
      player.current?.seekTo(Math.max(0, Math.min(compositionFrames(manifest) - 1, Math.floor(seekFrame))));
    }
  }, [seekFrame]);

  useEffect(() => {
    const current = player.current;
    const update = (event: { detail: { frame: number } }) => {
      setFrame(event.detail.frame);
      const media = audio.current;
      const seconds = event.detail.frame / FPS;
      if (media && playing.current && Math.abs(media.currentTime - seconds) > 0.2) media.currentTime = seconds;
    };
    const play = () => {
      playing.current = true;
      const media = audio.current;
      if (!media) return;
      media.currentTime = (current?.getCurrentFrame() || 0) / FPS;
      setAudioError('');
      void media.play().catch(() => {
        current?.pause();
        setAudioError('Audio playback was blocked. Tap Play to try again.');
      });
    };
    const pause = () => { playing.current = false; audio.current?.pause(); };
    const seek = (event: { detail: { frame: number } }) => {
      if (audio.current) audio.current.currentTime = event.detail.frame / FPS;
    };
    setFrame(current?.getCurrentFrame() || 0);
    current?.addEventListener('frameupdate', update);
    current?.addEventListener('play', play);
    current?.addEventListener('pause', pause);
    current?.addEventListener('ended', pause);
    current?.addEventListener('seeked', seek);
    return () => {
      pause();
      current?.removeEventListener('frameupdate', update);
      current?.removeEventListener('play', play);
      current?.removeEventListener('pause', pause);
      current?.removeEventListener('ended', pause);
      current?.removeEventListener('seeked', seek);
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReducedMotion(media.matches);
    change();
    media.addEventListener('change', change);
    return () => media.removeEventListener('change', change);
  }, []);

  useEffect(() => {
    if (!source) return;
    const controller = new AbortController();
    let objectUrl: string | undefined;
    setAudioError('');
    async function prepare() {
      try {
        const response = await fetch(source!, { signal: controller.signal });
        if (!response.ok) {
          const failure = await response.json();
          throw new Error(failure.error || 'Dialogue audio is unavailable.');
        }
        const wave = await response.blob();
        if (controller.signal.aborted) return;
        objectUrl = URL.createObjectURL(wave);
        setAudioUrl(objectUrl);
      } catch (error) {
        if (!controller.signal.aborted) setAudioError(error instanceof Error ? error.message : 'Dialogue audio is unavailable.');
      }
    }
    void prepare();
    return () => {
      controller.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [source, attempt]);

  return <div className="remotion-preview" data-frame={frame} data-audio={audioUrl ? 'ready' : preparingAudio ? 'preparing' : 'unavailable'}>
    <Player ref={player} component={EpisodeComposition} inputProps={{ manifest, captions, reducedMotion }}
      durationInFrames={compositionFrames(manifest)} compositionWidth={720} compositionHeight={1280} fps={FPS}
      controls={!preparingAudio} initiallyMuted showVolumeControls={false} numberOfSharedAudioTags={0}
      clickToPlay={!reducedMotion && !preparingAudio} spaceKeyToPlayOrPause={!preparingAudio}
      style={{ width: '100%', aspectRatio: '9 / 16' }} />
    {audioUrl && <><audio ref={audio} src={audioUrl} preload="auto" muted={muted}
      onLoadedMetadata={() => { if (audio.current) audio.current.volume = volume; }}
      onError={() => { player.current?.pause(); setAudioError('Dialogue audio could not be played. Please retry.'); }} />
      <div className="episode-audio-controls"><Button variant="outline" aria-pressed={muted} onClick={() => setMuted(value => !value)}>
        {muted ? 'Unmute dialogue' : 'Mute dialogue'}
      </Button><label>Volume<input aria-label="Dialogue volume" type="range" min="0" max="1" step="0.05" value={volume}
        onChange={event => { const value = Number(event.target.value); setVolume(value); if (audio.current) audio.current.volume = value; }} /></label></div>
    </>}
    {preparingAudio && <p role="status">Preparing dialogue audio…</p>}
    {audioError && <div role="status"><p>{audioError}</p><Button variant="outline" onClick={() => { player.current?.pause(); setAudioUrl(undefined); setAttempt(value => value + 1); }}>Retry audio</Button></div>}
    <label className="episode-seek">Seek episode<input aria-label="Seek episode" type="range" min={0}
      max={compositionFrames(manifest) - 1} value={frame} aria-valuetext={`${(frame / FPS).toFixed(1)} seconds`}
      onChange={event => player.current?.seekTo(Number(event.target.value))} /></label>
    <label className="caption-toggle"><input type="checkbox" checked={captions} onChange={event => setCaptions(event.target.checked)} /> Captions</label>
    <p className="fine-print">{compositionFrames(manifest) / FPS} seconds · Animated composition{audioUrl ? ' · Character voices' : ''}</p>
    {!externalTranscript && <details><summary>Episode transcript</summary>{manifest.scenes.map(scene => <div key={scene.id}>
      {scene.dialogue.map((line, index) => <p key={index}><b>{line.characterId}</b> {line.text}</p>)}
    </div>)}</details>}
  </div>;
}
