'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { Manifest } from '@/server/production/schemas';
import { episodes } from '@/lib/fixtures';
import { Player } from '@/components/player';
import { EpisodePreview } from '@/video/episode-preview';
const Published = z.object({id:z.string(),run_id:z.string().nullable().optional(),status:z.string(),mode:z.string(),manifest:Manifest.nullable(),progress:z.object({stage:z.string(),status:z.string()}).nullable().optional()});
export function EpisodeGallery({roomId="barangay-2099"}:{roomId?:string}) {
  const [generated,setGenerated]=useState<z.infer<typeof Published>[]>([]);
  const [progress,setProgress]=useState('');
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
        if(active){setProgress(data.jobs[0]&&data.jobs[0].status!=='published'?`${data.jobs[0].status} · ${data.jobs[0].progress?.stage||'Waiting for a worker'}`:'');setGenerated(data.jobs.filter(job=>job.status==='published'&&job.manifest));setError('');}
      }catch(error){if(active)setError(error instanceof Error?error.message:'Unable to load episodes.');}finally{loading=false;if(active&&refreshAgain){refreshAgain=false;void refresh();}}
    }
    void refresh();const timer=setInterval(refresh,30000);
    window.addEventListener(`airl-production:${roomId}`,refresh);
    window.addEventListener('focus',refresh);
    document.addEventListener('visibilitychange',refresh);
    return()=>{active=false;clearInterval(timer);window.removeEventListener(`airl-production:${roomId}`,refresh);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh);};
  },[roomId]);
  if(roomId!=='barangay-2099'&&!generated.length)return <section id="episode-library" className="room-production episode-gallery" aria-label="Episode library"><h2>Community episodes</h2>{progress&&<p role="status">Production {progress}</p>}{error&&<p role="alert">{error}</p>}<p>The first published episode will appear here.</p></section>;
  const id=selected || generated[0]?.id || episodes[episodes.length-1].id;
  const job=generated.find(item=>item.id===id);
  const reference=episodes.find(item=>item.id===id)||episodes[episodes.length-1];
  return <section id="episode-library" className="room-production episode-gallery" aria-label="Episode library"><label className="job-picker">Episode library<select aria-label="Episode library" value={id} onChange={event=>setSelected(event.target.value)}>{generated.map(item=><option key={item.id} value={item.id}>{item.manifest?.title} · {item.mode}</option>)}{(roomId==='barangay-2099'?episodes:[]).map(item=><option key={item.id} value={item.id}>{item.title} · Reference fixture</option>)}</select></label>
    {progress&&<p role="status">Production {progress}</p>}{error&&<p role="alert">{error}</p>}
    <div className="episode-meta"><div className="eyebrow">{job ? `${job.mode} · APPROVED COMMUNITY EPISODE` : 'SEEDED REFERENCE EPISODE'}</div><h2>{job?.manifest?.title || reference.title}</h2></div>
    {job?.manifest?<><EpisodePreview manifest={job.manifest}/><Link className="text-link" href={`/universes/${roomId}/episodes/${job.run_id}`}>Episode details and story questions →</Link></>:roomId==='barangay-2099'?<Player key={reference.id} episode={reference}/>:<p>The first published episode will appear here.</p>}
  </section>;
}
