'use client';
import { Player, type PlayerRef } from '@remotion/player';
import { useEffect, useRef, useState } from 'react';
import { Manifest } from '@/server/production/schemas';
import { EpisodeComposition, compositionFrames, FPS } from './composition';
export function EpisodePreview({ manifest: raw, seekFrame }: { manifest: unknown; seekFrame?:number }) {
  const player = useRef<PlayerRef>(null);
  useEffect(()=>{if(seekFrame!==undefined&&Number.isFinite(seekFrame))player.current?.seekTo(Math.max(0,Math.floor(seekFrame)));},[seekFrame]);
  const [frame,setFrame] = useState(0);
  useEffect(() => {
    const current = player.current;
    const update = (event: { detail: { frame: number } }) => setFrame(event.detail.frame);
    current?.addEventListener('frameupdate',update);
    return () => current?.removeEventListener('frameupdate',update);
  },[raw]);
  const [captions,setCaptions] = useState(true);
  const [reducedMotion,setReducedMotion] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = () => setReducedMotion(media.matches);
    change(); media.addEventListener('change',change);
    return () => media.removeEventListener('change',change);
  },[]);
  const parsed = Manifest.safeParse(raw);
  if (!parsed.success || parsed.data.scenes.length !== 3 || parsed.data.scenes.some(scene => scene.durationSeconds < 3 || scene.durationSeconds > 30 || !Number.isInteger(scene.durationSeconds) || !scene.dialogue.length)) return <p role="alert">Episode manifest is unavailable.</p>;
  const manifest = parsed.data;
  // Silent compositions must advance without waiting for Web Audio to resume.
  return <div className="remotion-preview" data-frame={frame}><Player ref={player} key={JSON.stringify(manifest)} component={EpisodeComposition} inputProps={{manifest,captions,reducedMotion}} durationInFrames={compositionFrames(manifest)} compositionWidth={720} compositionHeight={1280} fps={FPS} controls initiallyMuted showVolumeControls={false} numberOfSharedAudioTags={0} clickToPlay={!reducedMotion} style={{width:'100%',aspectRatio:'9 / 16'}}/><label className="episode-seek">Seek episode<input aria-label="Seek episode" type="range" min={0} max={compositionFrames(manifest)-1} value={frame} aria-valuetext={`${(frame/FPS).toFixed(1)} seconds`} onChange={event => player.current?.seekTo(Number(event.target.value))}/></label><label className="caption-toggle"><input type="checkbox" checked={captions} onChange={event=>setCaptions(event.target.checked)}/> Captions</label><p className="fine-print">{compositionFrames(manifest)/FPS} seconds · Animated composition · No audio</p><details><summary>Episode transcript</summary>{manifest.scenes.map(scene=><div key={scene.id}>{scene.dialogue.map((line,index)=><p key={index}><b>{line.characterId}</b> {line.text}</p>)}</div>)}</details></div>;
}
