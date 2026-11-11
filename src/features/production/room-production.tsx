'use client';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { Manifest } from '@/server/production/schemas';
import { EpisodePreview } from '@/video/episode-preview';
import { Button } from '@/components/ui/button';
const Job = z.object({id:z.string(),choice:z.string(),status:z.string(),attempts:z.number(),manifest:Manifest.nullable(),events:z.array(z.object({stage:z.string(),status:z.string(),attempt:z.number(),timestamp:z.string()})),feedback:z.unknown().optional()});
export function RoomProduction({ operator = false }: { operator?: boolean }) {
  const [jobs,setJobs] = useState<z.infer<typeof Job>[]>([]);
  const [error,setError] = useState('');
  const [pending,setPending] = useState(false);
  const [selected,setSelected] = useState('');
  useEffect(()=>{
    let active=true;
    async function refresh() {
      try {
        const response=await fetch(`/api/production${operator?'?operator=1':''}`,{cache:'no-store'});
        if(!response.ok) throw new Error('Production status is unavailable.');
        const data=z.object({jobs:z.array(Job)}).parse(await response.json());
        if(active) {setJobs(data.jobs);setError('');}
      } catch(error) {if(active)setError(error instanceof Error?error.message:'Unable to load jobs.');}
    }
    void refresh();const timer=setInterval(refresh,1500);
    return()=>{active=false;clearInterval(timer);};
  },[operator]);
  async function action(jobId:string, action:string) {
    setPending(true);setError('');
    try {
      const response=await fetch('/api/production',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jobId,action})});
      if(!response.ok)throw new Error('The production action could not be completed.');
      setJobs(z.object({jobs:z.array(Job)}).parse(await response.json()).jobs);
    } catch(error){setError(error instanceof Error?error.message:'Action failed.');}finally{setPending(false);}
  }
  const visible=operator?jobs:jobs.filter(job=>job.status==='published');
  const current=visible.find(job=>job.id===selected)||visible[0];
  return <section className="room-production"><div className="eyebrow">CINEMAI · PERSISTED ROOM PRODUCTION</div><h3>{operator?'Production & review':'Community episodes'}</h3><p className="fine-print">Demo-generated content · Deterministic workflow</p>
    {error&&<p role="alert" className="form-error">{error}</p>}
    {!visible.length?<p className="fine-print">{jobs.length?'An episode is being prepared or awaiting operator review.':'A finalized vote will start the next production.'}</p>:<>
      <label className="job-picker">Episode history<select value={current?.id||''} onChange={event=>setSelected(event.target.value)}>{visible.map(job=><option value={job.id} key={job.id}>{job.choice} · {job.status}</option>)}</select></label>
      {current&&<><p className="job-status" role="status">{current.status} · {current.attempts} production attempt{current.attempts===1?'':'s'}</p>{current.manifest&&<EpisodePreview manifest={current.manifest}/>}
      {operator&&<><div className="provider-actions">{current.status==='review'&&<><Button disabled={pending} onClick={()=>action(current.id,'publish')}>Approve & publish</Button><Button variant="outline" disabled={pending} onClick={()=>action(current.id,'reject')}>Reject draft</Button></>}{current.status==='failed'&&<Button disabled={pending||current.attempts>=3} onClick={()=>action(current.id,'retry')}>Retry production</Button>}</div><ol className="provider-timeline">{current.events.map((event,index)=><li key={index}><b>{event.stage}</b> · {event.status} · attempt {event.attempt}<small>{event.timestamp}</small></li>)}</ol>{current.feedback!==null&&<details><summary>Creative review</summary><pre className="provider-output">{JSON.stringify(current.feedback,null,2)}</pre></details>}</>}
      </>}
    </>}
  </section>;
}
