import { after } from 'next/server';
import { z } from 'zod';
import { RoomJobs, drainRoomJobs } from '@/server/production/room-jobs';
import { LiveStore, LiveError } from '@/server/live/store';
import { checkRequest, sessionToken, errorResponse, body } from '@/server/live/http';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  const live = new LiveStore();
  let jobs: RoomJobs | undefined;
  try {
    checkRequest(request);
    const operator = new URL(request.url).searchParams.get('operator') === '1';
    if (operator) live.creator(await sessionToken());
    jobs = new RoomJobs();
    return Response.json({ jobs: jobs.list('barangay-2099',operator) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return errorResponse(error); } finally { live.dispose(); jobs?.close(); }
}
export async function POST(request: Request) {
  const live = new LiveStore();
  let jobs: RoomJobs | undefined;
  try {
    checkRequest(request);
    const owner = live.creator(await sessionToken());
    live.limit(`production:${owner}`,20);
    const input = z.object({ jobId: z.string().uuid(), action: z.enum(['publish','reject','retry']) }).strict().parse(await body(request));
    jobs = new RoomJobs();
    try { jobs.action(input.jobId,input.action); } catch { throw new LiveError(409,'This job cannot perform the requested action.'); }
    if (input.action === 'retry') after(async () => { await drainRoomJobs(); });
    return Response.json({ jobs: jobs.list('barangay-2099',true) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return errorResponse(error); } finally { live.dispose(); jobs?.close(); }
}
