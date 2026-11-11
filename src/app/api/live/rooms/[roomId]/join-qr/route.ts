import QRCode from 'qrcode';
import { platformRequest } from '@/server/platform/http';
export const runtime='nodejs';export const dynamic='force-dynamic';
export function GET(request:Request,context:{params:Promise<{roomId:string}>}){return platformRequest(request,async(store,token)=>{const {roomId}=await context.params;store.getWorld(roomId,store.account(token));const origin=`${new URL(request.url).protocol}//${request.headers.get('host')}`;const png=await QRCode.toBuffer(`${origin}/live/${roomId}`,{width:320,margin:4,errorCorrectionLevel:'M'});return new Response(new Uint8Array(png),{headers:{'Content-Type':'image/png','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});});}
