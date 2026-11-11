import { after } from 'next/server';
import { z } from 'zod';
import { RoomJobs, drainRoomJobs } from '@/server/production/room-jobs';
import { LiveStore, LiveError } from '@/server/live/store';
import { platformRequest,jsonBody } from '@/server/platform/http';
import { CanonChanges } from '@/lib/domain';
export const runtime='nodejs';export const maxDuration=120;export const dynamic='force-dynamic';
export function GET(request:Request){return platformRequest(request,async(store,token)=>{
  const url=new URL(request.url),id=url.searchParams.get('universe')||'barangay-2099';
  const actor=store.account(token),world=store.getWorld(id,actor),operator=url.searchParams.get('operator')==='1';
  if(operator&&!store.canManage(world,actor)){const live=new LiveStore(store.path,id);try{if(id!=='barangay-2099')throw new LiveError(403,'Studio access required.');live.creator(token);}finally{live.dispose();}}
  const jobs=new RoomJobs(store.path);try{return {jobs:jobs.list(id,operator),canPublish:store.canManage(world,actor)};}finally{jobs.close();}
});}
export function POST(request:Request){return platformRequest(request,async(store,token)=>{
  const input=z.object({jobId:z.string().uuid(),action:z.enum(['publish','reject','retry']),corrections:CanonChanges.optional(),consent:z.boolean().optional()}).strict().parse(await jsonBody(request));
  const job=store.db.prepare('SELECT * FROM room_jobs WHERE id=?').get(input.jobId);if(!job)throw new LiveError(404,'Job not found.');
  const actor=store.requireAccount(token,true);store.getWorld(String(job.room_id),actor,true);
  if(input.action==='retry'&&job.mode==='hosted_openai'&&input.consent!==true)throw new LiveError(400,'Explicit consent is required for this paid retry.');
  const jobs=new RoomJobs(store.path);try{jobs.action(input.jobId,input.action,input.corrections);if(input.action==='retry')after(async()=>{await drainRoomJobs(store.path);});return {jobs:jobs.list(String(job.room_id),true)};}finally{jobs.close();}
});}
