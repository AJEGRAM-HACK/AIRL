'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { firstProduction, firstProductionUrl, isFirstProduction } from '@/lib/first-production';

const FirstProductionContext = createContext(false);

export function FirstProductionProvider({ available, children }: { available: boolean; children: React.ReactNode }) {
  return <FirstProductionContext.Provider value={available}>{children}</FirstProductionContext.Provider>;
}

export function useFirstProduction(universeId?: string, episodeId?: string, jobId?: string) {
  const available = useContext(FirstProductionContext);
  return available && universeId === firstProduction.universeId &&
    ((!episodeId && !jobId) || isFirstProduction(universeId, episodeId, jobId));
}

export function FirstProductionPlayer({ seekFrame }: { seekFrame?: number }) {
  const video = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const element = video.current;
    if (!element || seekFrame === undefined || !Number.isFinite(seekFrame)) return;
    const seek = () => { element.currentTime = Math.max(0, Math.min(element.duration, seekFrame / 30)); };
    if (element.readyState >= 1) seek();
    else element.addEventListener('loadedmetadata', seek, { once: true });
    return () => element.removeEventListener('loadedmetadata', seek);
  }, [seekFrame]);
  return <div className="first-production-player">
    <video ref={video} controls playsInline preload="metadata" poster={firstProduction.poster}
      aria-label={`${firstProduction.title} — ${firstProduction.label}`} onError={() => setError(true)}>
      <source src={firstProduction.video} type="video/mp4" />
      <a href={firstProduction.video}>Download {firstProduction.title}</a>
    </video>
    {error && <p role="alert">The video could not load. <button onClick={() => { setError(false); video.current?.load(); }}>Retry playback</button></p>}
  </div>;
}

export function FirstProductionSpotlight({ universeId }: { universeId: string }) {
  const available = useFirstProduction(universeId);
  if (!available) return null;
  return <section className="first-production-spotlight" aria-label="First production">
    <div><p className="eyebrow">{firstProduction.details}</p><h2>{firstProduction.title}</h2><p>{firstProduction.synopsis}</p>
      <Button asChild variant="outline"><Link href={firstProductionUrl}>Open episode</Link></Button>
    </div>
    <FirstProductionPlayer />
  </section>;
}
