'use client';
import Link from 'next/link';
import { ProductionTimeline } from './production-timeline';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { Manifest } from '@/server/production/schemas';
import { episodes } from '@/lib/fixtures';
import { Player } from '@/components/player';
import { useFirstProduction } from '@/components/first-production';
import { firstProduction, isFirstProduction } from '@/lib/first-production';
import { EpisodePreview } from '@/video/episode-preview';
const Published = z.object({id:z.string(),run_id:z.string().nullable().optional(),status:z.string(),mode:z.string(),choice:z.string().optional(),manifest:Manifest.nullable(),progress:z.object({stage:z.string(),status:z.string()}).nullable().optional()});
export function EpisodeGallery({roomId="barangay-2099"}:{roomId?:string}) {
  const demoAvailable = useFirstProduction(roomId);
  const [generated,setGenerated]=useState<z.infer<typeof Published>[]>([]);
  const [latest,setLatest]=useState<z.infer<typeof Published> | null>(null);
  const [loading,setLoading]=useState(true);
  const [selected,setSelected]=useState('');
  const [error,setError]=useState('');
  useEffect(()=>{
    let active=true;
    let loading=false;
    let refreshAgain=false;
    async function refresh(){
      if(document.hidden)return;
      if(loading){refreshAgain=true;return;}
      loading=true;
      try{
        const response=await fetch(`/api/production?universe=${roomId}`,{cache:'no-store'});
        if(!response.ok)throw new Error('Unable to load published episodes.');
        const data=z.object({jobs:z.array(Published)}).parse(await response.json());
        if(active){setLatest(data.jobs[0] || null);setGenerated(data.jobs.filter(job=>job.status==='published'&&job.manifest));setError('');}
      }catch(error){if(active)setError(error instanceof Error?error.message:'Unable to load episodes.');}finally{if(active)setLoading(false);loading=false;if(active&&refreshAgain){refreshAgain=false;void refresh();}}
    }
    void refresh();const timer=setInterval(refresh,30000);
    window.addEventListener(`airl-production:${roomId}`,refresh);
    window.addEventListener('focus',refresh);
    document.addEventListener('visibilitychange',refresh);
    return()=>{active=false;clearInterval(timer);window.removeEventListener(`airl-production:${roomId}`,refresh);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh);};
  },[roomId]);
  if(loading)return <section id="episode-library" className="room-production episode-gallery" aria-label="Episode library"><p role="status">Loading episodes…</p></section>;
  if(roomId!=='barangay-2099'&&!generated.length)return <section id="episode-library" className="room-production episode-gallery" aria-label="Episode library"><h2>Your story starts here.</h2>{latest && latest.status !== 'published' && <ProductionTimeline job={latest}/>}{error&&<p role="alert">{error}</p>}<p role="status">Cast a vote. The first approved episode will appear here.</p></section>;
  const references=roomId==='barangay-2099'&&!generated.length?episodes:[];
  const available=[...generated,...references];
  const id=available.some(item=>item.id===selected)?selected:generated[0]?.id || references[references.length-1].id;
  const job=generated.find(item=>item.id===id);
  const film = demoAvailable && isFirstProduction(roomId, job?.run_id || undefined, job?.id);
  const reference=episodes.find(item=>item.id===id)||episodes[episodes.length-1];
  return <section id="episode-library" className="room-production episode-gallery" aria-label="Episode library"><label className="job-picker">Episode library<select aria-label="Episode library" value={id} onChange={event=>setSelected(event.target.value)}>{generated.map(item=><option key={item.id} value={item.id}>{demoAvailable && isFirstProduction(roomId, item.run_id || undefined, item.id) ? `${firstProduction.title} · ${firstProduction.label}` : `${item.manifest?.title} · ${item.mode}`}</option>)}{references.map(item=><option key={item.id} value={item.id}>{item.title} · Reference fixture</option>)}</select></label>
    {latest && latest.status !== 'published' && <ProductionTimeline job={latest}/>}{error&&<p role="alert">{error}</p>}
    <div className="episode-meta"><div className="eyebrow">{film ? firstProduction.details : job ? `${job.mode} · APPROVED COMMUNITY EPISODE` : 'SEEDED REFERENCE EPISODE'}</div><h2>{job?.manifest?.title || reference.title}</h2>{film && <p>{firstProduction.synopsis}</p>}</div>
    {generated[0] && selected && selected !== generated[0].id && <Button variant="outline" onClick={() => setSelected(generated[0].id)}>Watch the latest community episode</Button>}
    {job?.manifest?<>{job.choice && <p className="episode-choice"><span>THE AUDIENCE CHOSE</span>{job.choice}</p>}<EpisodePreview manifest={job.manifest} universeId={roomId} jobId={job.id}/><div className="episode-cast"><span>IN THIS CHAPTER</span>{job.manifest.cast?.map(character => <Link key={character.id} href={`/universes/${roomId}/characters/${character.id}`}>{character.name}</Link>)}</div><Link className="text-link" href={`/universes/${roomId}/episodes/${job.run_id}`}>{film ? 'Open first production →' : 'Episode details and story questions →'}</Link></>:roomId==='barangay-2099'?<Player key={reference.id} episode={reference}/>:<p>The first published episode will appear here.</p>}
  </section>;
}
