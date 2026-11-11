'use client';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { Manifest } from '@/server/production/schemas';
import { episodes } from '@/lib/fixtures';
import { Player } from '@/components/player';
import { EpisodePreview } from '@/video/episode-preview';
const Published = z.object({id:z.string(),status:z.string(),mode:z.string(),manifest:Manifest.nullable()});
export function EpisodeGallery() {
  const [generated,setGenerated]=useState<z.infer<typeof Published>[]>([]);
  const [selected,setSelected]=useState('');
  const [error,setError]=useState('');
  useEffect(()=>{
    let active=true;
    async function refresh(){
      try{
        const response=await fetch('/api/production',{cache:'no-store'});
        if(!response.ok)throw new Error('Unable to load published episodes.');
        const data=z.object({jobs:z.array(Published)}).parse(await response.json());
        if(active){setGenerated(data.jobs.filter(job=>job.status==='published'&&job.manifest));setError('');}
      }catch(error){if(active)setError(error instanceof Error?error.message:'Unable to load episodes.');}
    }
    void refresh();const timer=setInterval(refresh,1500);
    return()=>{active=false;clearInterval(timer);};
  },[]);
  const id=selected || generated[0]?.id || episodes[episodes.length-1].id;
  const job=generated.find(item=>item.id===id);
  const reference=episodes.find(item=>item.id===id)||episodes[episodes.length-1];
  return <section className="room-production episode-gallery" aria-label="Episode library"><label className="job-picker">Episode library<select aria-label="Episode library" value={id} onChange={event=>setSelected(event.target.value)}>{generated.map(item=><option key={item.id} value={item.id}>{item.manifest?.title} · {item.mode}</option>)}{episodes.map(item=><option key={item.id} value={item.id}>{item.title} · Reference fixture</option>)}</select></label>
    {error&&<p role="alert">{error}</p>}
    <div className="episode-meta"><div className="eyebrow">{job ? `${job.mode} · APPROVED COMMUNITY EPISODE` : 'SEEDED REFERENCE EPISODE'}</div><h2>{job?.manifest?.title || reference.title}</h2></div>
    {job?.manifest?<EpisodePreview manifest={job.manifest}/>:<Player key={reference.id} episode={reference}/>}
  </section>;
}
