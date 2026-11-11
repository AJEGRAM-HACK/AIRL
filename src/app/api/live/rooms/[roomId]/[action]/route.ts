import { after } from 'next/server';
import { drainRoomJobs } from '@/server/production/room-jobs';
import { RoomSnapshot, VoteInput, RoundInput } from '@/features/live/types';
import { DEMO_ROOM } from '@/lib/fixtures';
import { LiveError, LiveStore } from '@/server/live/store';
import { body, checkRequest, errorResponse, sessionToken, withStore } from '@/server/live/http';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
type Context = { params: Promise<{ roomId: string; action: string }> };
export async function GET(request: Request, context: Context) {
  const { roomId, action } = await context.params;
  if (roomId !== DEMO_ROOM || !['state', 'events'].includes(action)) return Response.json({ error: 'Room endpoint not found.' }, { status: 404 });
  if (action === 'state') return withStore(request, async store => ({ room: store.snapshot(), session: store.personal(await sessionToken()) }));
  try { checkRequest(request); } catch (error) { return errorResponse(error); }
  const encoder = new TextEncoder();
  let timer: ReturnType<typeof setInterval> | undefined;
  let stop = () => {};
  let cleanup = () => {};
  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      let ticks = 0;
      cleanup = () => {
        closed = true;
        clearInterval(timer);
        request.signal.removeEventListener('abort', stop);
      };
      stop = () => {
        if (closed) return;
        cleanup();
        controller.close();
      };
      function send() {
        if (closed) return;
        let store: LiveStore | undefined;
        try {
          store = new LiveStore();
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(RoomSnapshot.parse(store.snapshot()))}\n\n`));
          // Periodic reconnect bounds stream lifetime and recovers across workers.
          if (++ticks >= 60) stop();
        } catch { stop(); } finally { store?.dispose(); }
      }
      timer = setInterval(send, 1000);
      request.signal.addEventListener('abort', stop, { once: true });
      send();
    },
    cancel() { cleanup(); },
  });
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', 'X-Accel-Buffering': 'no' } });
}
export async function POST(request: Request, context: Context) {
  const { roomId, action } = await context.params;
  return withStore(request, async store => {
    if (roomId !== DEMO_ROOM) throw new LiveError(404, 'Room not found.');
    const token = await sessionToken();
    const input = await body(request);
    if (action === 'vote') {
      const vote = VoteInput.parse(input);
      store.vote(token, vote.roundId, vote.optionId);
    } else if (action === 'close' || action === 'next') {
      const { roundId } = RoundInput.parse(input);
      if (action === 'close') {
        store.closeRound(token, roundId);
        after(async () => { await drainRoomJobs(); });
      }
      else store.nextRound(token, roundId);
    } else throw new LiveError(404, 'Room action not found.');
    return { room: store.snapshot(), session: store.personal(token) };
  });
}
