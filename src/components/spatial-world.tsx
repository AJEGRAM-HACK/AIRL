'use client';

import { useEffect, useRef, type CSSProperties, type PointerEvent } from 'react';

const buildings = [
  [38, 38, 42, 46, 58], [98, 24, 36, 38, 86], [214, 42, 48, 42, 72],
  [30, 122, 54, 44, 40], [116, 100, 62, 58, 132], [224, 126, 42, 52, 96],
  [82, 192, 48, 36, 48], [164, 190, 56, 42, 60],
];

/** Decorative CSS geometry; no scene assets, camera access or rendering dependency. */
export function SpatialWorld({ title, official = false }: { title: string; official?: boolean }) {
  const scene = useRef<HTMLDivElement>(null);
  const frame = useRef<number | undefined>(undefined);
  const motion = useRef<MediaQueryList | null>(null);
  function reset() {
    if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    scene.current?.style.removeProperty('--view-x');
    scene.current?.style.removeProperty('--view-y');
  }
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    motion.current = media;
    const update = () => { if (media.matches) reset(); };
    media.addEventListener('change', update);
    return () => { media.removeEventListener('change', update); if (frame.current !== undefined) cancelAnimationFrame(frame.current); };
  }, []);
  function move(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== 'mouse' || motion.current?.matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - .5) * 12;
    const y = ((event.clientY - bounds.top) / bounds.height - .5) * -8;
    if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      scene.current?.style.setProperty('--view-x', `${x.toFixed(2)}deg`);
      scene.current?.style.setProperty('--view-y', `${y.toFixed(2)}deg`);
    });
  }
  return <div ref={scene} className="spatial-world" role="img" aria-label={`3D illustration of ${title}`} onPointerMove={move} onPointerLeave={reset}>
    <div className="spatial-stars" aria-hidden="true"/>
    <div className="spatial-planet" aria-hidden="true"><i/><i/></div>
    <div className="spatial-rig" aria-hidden="true">
      <div className="spatial-city">
        <div className="spatial-ground"/>
        <div className="spatial-road spatial-road-one"/><div className="spatial-road spatial-road-two"/>
        {buildings.map(([x, y, width, depth, height], index) => <div key={index} className={`spatial-building${index === 4 ? ' spatial-building-center' : ''}`} style={{ '--block-x': `${x}px`, '--block-y': `${y}px`, '--block-w': `${width}px`, '--block-d': `${depth}px`, '--block-h': `${height}px` } as CSSProperties}>
          <i className="spatial-face-front"/><i className="spatial-face-side"/><i className="spatial-face-roof"/>
        </div>)}
        <div className="spatial-beacon"><i/><span>AIRL</span></div>
      </div>
      <div className="spatial-orbit"><i/><i/><i/></div>
    </div>
    <div className="spatial-world-label" aria-hidden="true"><span>{official ? 'AIRL ORIGINAL' : 'CREATOR UNIVERSE'}</span><b>{title}</b><span>A WORLD SHAPED TOGETHER</span></div>
  </div>;
}
