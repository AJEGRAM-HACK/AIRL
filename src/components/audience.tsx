'use client';
import { useState } from 'react';
import { ArrowRight, Radio } from 'lucide-react';
import { CommunityPanel } from '@/features/live/community-panel';
import { episodes } from '@/lib/fixtures';
import { Player } from './player';
export function Audience() {
  const [episodeIndex, setEpisodeIndex] = useState(1);
  const episode = episodes[episodeIndex];
  return <>
    <div className="page-heading"><div><div className="eyebrow"><Radio size={14}/> THE STORY IS A GROUP PROJECT</div><h1>Welcome back, <em>director.</em></h1></div><span className="fixture-badge">Seeded episodes · Shared local voting</span></div>
    <div className="watch-grid"><section>
      <Player key={episode.id} episode={episode}/>
      <div className="episode-meta"><span className="eyebrow">SEASON 01 · EPISODE {String(episode.number).padStart(2, '0')}</span><h2>{episode.title}</h2><p>{episode.description}</p><div className="tag-row"><span>Taglish</span><span>Comedy / Sci-fi</span><span>Captioned storyboard · No audio</span></div></div>
      <div className="section-heading small-heading"><h3>The story so far</h3><span>2 seeded episodes</span></div>
      <div className="episode-list">{episodes.map((item, index) => <button key={item.id} aria-pressed={episodeIndex === index} onClick={() => setEpisodeIndex(index)} className={`episode-item ${episodeIndex === index ? 'selected' : ''}`}>
        <span className="episode-thumb">{String(item.number).padStart(2, '0')}</span><span><small>EPISODE {item.number}</small><b>{item.title}</b><small>15 sec · Storyboard fixture</small></span><ArrowRight size={17}/>
      </button>)}</div>
    </section><CommunityPanel/></div>
  </>;
}
