import { platformRequest,jsonBody } from '@/server/platform/http';
import { LiveStore } from '@/server/live/store';
import { setSession } from '@/server/live/http';
import { z } from 'zod';
export const runtime='nodejs';export const dynamic='force-dynamic';
export function GET(request:Request){return platformRequest(request,async(store,token)=>{const id=new URL(request.url).searchParams.get('universe')||'barangay-2099';store.getWorld(id,store.account(token));const live=new LiveStore(store.path,id);try{return live.personal(token);}finally{live.dispose();}});}
export function POST(request:Request){return platformRequest(request,async(store,token)=>{const input=z.object({universe:z.string().max(80).optional()}).strict().parse(await jsonBody(request));const id=input.universe||'barangay-2099';store.getWorld(id,store.account(token));const live=new LiveStore(store.path,id);try{live.limit('session-creation',200);const next=live.join(token);await setSession(next,request);return live.personal(next);}finally{live.dispose();}});}
