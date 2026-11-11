import QRCode from 'qrcode';
import { DEMO_ROOM } from '@/lib/fixtures';
import { checkRequest, errorResponse } from '@/server/live/http';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request, context: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await context.params;
  if (roomId !== DEMO_ROOM) return new Response('Room not found', { status: 404 });
  try {
    checkRequest(request);
    const origin = `${new URL(request.url).protocol}//${request.headers.get('host')}`;
    const image = await QRCode.toBuffer(`${origin}/live/${roomId}`, { width: 320, margin: 4, errorCorrectionLevel: 'M' });
    return new Response(new Uint8Array(image), { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
  } catch (error) { return errorResponse(error); }
}
