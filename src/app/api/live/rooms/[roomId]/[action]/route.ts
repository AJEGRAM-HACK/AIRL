import { after } from 'next/server';
import { z } from 'zod';
import { RoomProviderSelection } from '@/features/live/production-selection';
import { drainRoomJobs } from '@/server/production/room-jobs';
import { VoteInput, RoundInput } from '@/features/live/types';
import { LiveError, LiveStore } from '@/server/live/store';
import { checkRequest, errorResponse, sessionToken } from '@/server/live/http';
import { PlatformStore } from '@/server/platform/store';
import { jsonBody } from '@/server/platform/http';
export const runtime='nodejs';export const maxDuration=120;export const dynamic='force-dynamic';
type Context={params:Promise<{roomId:string;action:string}>};
export async function GET(request:Request,context:Context){
  const {roomId,action}=await context.params;let platform:PlatformStore|undefined;let live:LiveStore|undefined;
  try{
    checkRequest(request);if(!['state','events'].includes(action))throw new LiveError(404,'Endpoint not found.');
    const token=await sessionToken();platform=new PlatformStore();platform.getWorld(roomId,platform.account(token));
    if(action==='state'){live=new LiveStore(platform.path,roomId);return Response.json({room:live.snapshot(),session:live.personal(token)},{headers:{'Cache-Control':'no-store'}});}
    const path=platform.path,encoder=new TextEncoder();let timer:ReturnType<typeof setInterval>;let closed=false;let ticks=0;let stop=()=>{};
    const stream=new ReadableStream({start(controller){
      stop=()=>{if(closed)return;closed=true;clearInterval(timer);request.signal.removeEventListener('abort',stop);controller.close();};
      const send=()=>{let access:PlatformStore|undefined;let room:LiveStore|undefined;try{access=new PlatformStore(path);access.getWorld(roomId,access.account(token));room=new LiveStore(path,roomId);controller.enqueue(encoder.encode(`data: ${JSON.stringify(room.snapshot())}\n\n`));if(++ticks>=60)stop();}catch{stop();}finally{access?.close();room?.dispose();}};
      timer=setInterval(send,1000);request.signal.addEventListener('abort',stop,{once:true});send();
    },cancel(){closed=true;clearInterval(timer);request.signal.removeEventListener('abort',stop);}});
    return new Response(stream,{headers:{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','X-Accel-Buffering':'no'}});
  }catch(error){return errorResponse(error);}finally{platform?.close();live?.dispose();}
}
export async function POST(request:Request,context:Context){
  const {roomId,action}=await context.params;let platform:PlatformStore|undefined;let live:LiveStore|undefined;
  try{
    checkRequest(request);const token=await sessionToken();platform=new PlatformStore();platform.getWorld(roomId,platform.account(token));live=new LiveStore(platform.path,roomId);const input=await jsonBody(request);
    if(action==='vote'){const vote=VoteInput.parse(input);live.vote(token,vote.roundId,vote.optionId);}
    else if(action==='close'){const parsed=RoundInput.extend({provider:RoomProviderSelection.optional()}).parse(input);live.closeRound(token,parsed.roundId,parsed.provider||{mode:'ollama',model:'qwen3:4b-instruct',consent:false});const path=platform.path;after(async()=>{await drainRoomJobs(path);});}
    else if(action==='next'){const parsed=RoundInput.extend({options:z.array(z.object({id:z.string().regex(/^[a-z0-9-]+$/).max(80),title:z.string().min(1).max(200),description:z.string().max(300)})).min(2).max(6).optional()}).parse(input);if(parsed.options&&new Set(parsed.options.map(option=>option.id)).size!==parsed.options.length)throw new LiveError(400,'Choice IDs must be unique.');live.nextRound(token,parsed.roundId,parsed.options);}
    else throw new LiveError(404,'Endpoint not found.');
    return Response.json({room:live.snapshot(),session:live.personal(token)},{headers:{'Cache-Control':'no-store'}});
  }catch(error){return errorResponse(error);}finally{platform?.close();live?.dispose();}
}
