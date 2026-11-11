'use client';
import { StoryHelper } from '@/components/platform/story-helper';
import { useEffect, useState } from 'react';
import { z } from 'zod';
import { Manifest } from '@/server/production/schemas';
import { EpisodePreview } from '@/video/episode-preview';
import { Button } from '@/components/ui/button';
const Job = z.object({mode:z.string().default('demo'),model:z.string().nullable().optional(),id:z.string(),choice:z.string(),status:z.string(),attempts:z.number(),manifest:Manifest.nullable(),events:z.array(z.object({stage:z.string(),status:z.string(),attempt:z.number(),timestamp:z.string(),failure:z.object({code:z.string()}).optional()})),run_id:z.string().nullable().optional(),script:z.unknown().optional(),previewVersion:z.number().nullable().optional(),feedback:z.unknown().optional()});
export function RoomProduction({ operator = false,roomId="barangay-2099" }: { operator?: boolean;roomId?:string }) {
  const [canPublish,setCanPublish]=useState(false);
  const [corrections,setCorrections]=useState('');
  const [retryConsent,setRetryConsent]=useState(false);
  const [jobs,setJobs] = useState<z.infer<typeof Job>[]>([]);
  const [error,setError] = useState('');
  const [pending,setPending] = useState(false);
  const [selected,setSelected] = useState('');
  useEffect(()=>{
    let active=true;
    async function refresh() {
      try {
        const response=await fetch(`/api/production?universe=${roomId}${operator?'&operator=1':''}`,{cache:'no-store'});
        if(!response.ok) throw new Error('Production status is unavailable.');
        const data=z.object({jobs:z.array(Job),canPublish:z.boolean().optional()}).parse(await response.json());
        if(active) {setCanPublish(!!(data as any).canPublish);setJobs(data.jobs);setError('');}
      } catch(error) {if(active)setError(error instanceof Error?error.message:'Unable to load jobs.');}
    }
    void refresh();const timer=setInterval(refresh,1500);
    return()=>{active=false;clearInterval(timer);};
  },[operator,roomId]);
  async function action(jobId:string, action:string) {
    setPending(true);setError('');
    try {
      const response=await fetch('/api/production',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({jobId,action,consent:retryConsent,...(action==='publish'&&corrections.trim()?{corrections:JSON.parse(corrections)}:{})})});
      if(!response.ok)throw new Error('The production action could not be completed.');
      setJobs(z.object({jobs:z.array(Job),canPublish:z.boolean().optional()}).parse(await response.json()).jobs);
    } catch(error){setError(error instanceof Error?error.message:'Action failed.');}finally{setPending(false);setRetryConsent(false);}
  }
  const visible=operator?jobs:jobs.filter(job=>job.status==='published');
  const current=visible.find(job=>job.id===selected)||visible[0];
  useEffect(()=>{setCorrections('');setRetryConsent(false);},[current?.id]);
  return <section className="room-production"><div className="eyebrow">CINEMAI · PERSISTED ROOM PRODUCTION</div><h3>{operator?'Production & review':'Community episodes'}</h3><p className="fine-print">{current?.mode === 'demo' ? 'Demo-generated content · Deterministic workflow' : `${current?.mode || 'Production'} · ${current?.model || 'Model selected at execution'}`}</p>
    {error&&<p role="alert" className="form-error">{error}</p>}
    {!visible.length?<p className="fine-print">{jobs.length?'An episode is being prepared or awaiting operator review.':'A finalized vote will start the next production.'}</p>:<>
      <label className="job-picker">Episode history<select value={current?.id||''} onChange={event=>setSelected(event.target.value)}>{visible.map(job=><option value={job.id} key={job.id}>{job.choice} · {job.status}</option>)}</select></label>
      {current&&<><p className="job-status" role="status">{current.status} · {current.attempts} production attempt{current.attempts===1?'':'s'}</p>{current.manifest&&<EpisodePreview manifest={current.manifest}/>}
      {operator&&<>{current.script!==undefined&&<details open><summary>Validated script and proposed canon</summary><pre className="provider-output">{JSON.stringify(current.script,null,2)}</pre></details>}{current.previewVersion&&<p className="fine-print">Last valid preview · version {current.previewVersion}</p>}{current.status==='review'&&canPublish&&<label>Correct approved canon changes (optional JSON)<textarea aria-label="Approved canon changes" placeholder={JSON.stringify({memoryUpdates:(current.script as any)?.memoryUpdates||[],relationshipUpdates:(current.script as any)?.relationshipUpdates||[]})} value={corrections} onChange={event=>setCorrections(event.target.value)}/></label>}{!canPublish&&<p className="notice">Publication and canon changes require the universe owner or an admin. Official canon requires an admin account.</p>}<div className="provider-actions">{current.status==='review'&&canPublish&&<><Button disabled={pending} onClick={()=>action(current.id,'publish')}>Approve & publish</Button><Button variant="outline" disabled={pending} onClick={()=>action(current.id,'reject')}>Reject draft</Button></>}{current.status==='failed'&&canPublish&&<>{current.mode==='hosted_openai'&&<label className="check-label"><input type="checkbox" checked={retryConsent} onChange={event=>setRetryConsent(event.target.checked)}/>I authorize this paid retry.</label>}<Button disabled={pending||current.attempts>=3||(current.mode==='hosted_openai'&&!retryConsent)} onClick={()=>action(current.id,'retry')}>Retry production</Button></>}</div><ol className="provider-timeline">{current.events.map((event,index)=><li key={index}><b>{event.stage}</b> · {event.status} · attempt {event.attempt}<small>{event.timestamp}{event.failure ? ` · ${event.failure.code}` : ''}</small></li>)}</ol>{current.run_id&&canPublish&&<StoryHelper universeId={roomId} draftRun={current.run_id}/>} {current.feedback!==null&&<details><summary>Creative review</summary><pre className="provider-output">{JSON.stringify(current.feedback,null,2)}</pre></details>}</>}
      </>}
    </>}
  </section>;
}
