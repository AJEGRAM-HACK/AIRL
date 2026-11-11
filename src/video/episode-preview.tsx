'use client';
import { Player } from '@remotion/player';
import { useEffect, useState } from 'react';
import { Manifest } from '@/server/production/schemas';
import { EpisodeComposition, compositionFrames, FPS } from './composition';
export function EpisodePreview({ manifest: raw }: { manifest: unknown }) {
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
  return <div className="remotion-preview"><Player key={JSON.stringify(manifest)} component={EpisodeComposition} inputProps={{manifest,captions,reducedMotion}} durationInFrames={compositionFrames(manifest)} compositionWidth={720} compositionHeight={1280} fps={FPS} controls clickToPlay={!reducedMotion} style={{width:'100%',aspectRatio:'9 / 16'}}/><label className="caption-toggle"><input type="checkbox" checked={captions} onChange={event=>setCaptions(event.target.checked)}/> Captions</label><p className="fine-print">{compositionFrames(manifest)/FPS} seconds · Animated composition · No audio</p><details><summary>Episode transcript</summary>{manifest.scenes.map(scene=><div key={scene.id}>{scene.dialogue.map((line,index)=><p key={index}><b>{line.characterId}</b> {line.text}</p>)}</div>)}</details></div>;
}
