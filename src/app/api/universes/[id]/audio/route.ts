import { z } from 'zod';
import { platformRequest } from '@/server/platform/http';
import { LiveError, LiveStore } from '@/server/live/store';
import { RoomJobs } from '@/server/production/room-jobs';
import { Manifest } from '@/server/production/schemas';
import { episodeAudio } from '@/server/production/audio';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  return platformRequest(request, async (store, token) => {
    const { id } = await context.params;
    const actor = store.account(token);
    const world = store.getWorld(id, actor);
    const source = z.object({ episodeId: z.string().uuid().optional(), jobId: z.string().uuid().optional() })
      .refine(value => !!value.episodeId !== !!value.jobId)
      .parse(Object.fromEntries(new URL(request.url).searchParams));
    let manifest: unknown;
    if (source.episodeId) {
      manifest = store.episodes(id, actor).find(episode => episode.episode_id === source.episodeId)?.artifact.manifest;
    } else {
      let inspect = store.canManage(world, actor);
      if (!inspect && id === 'barangay-2099' && token) {
        const live = new LiveStore(store.path, id);
        try { live.creator(token); inspect = true; } catch {} finally { live.dispose(); }
      }
      const jobs = new RoomJobs(store.path);
      try {
        const job = jobs.list(id, inspect).find(item => item.id === source.jobId);
        if (inspect || job?.status === 'published') manifest = job?.manifest;
      } finally { jobs.close(); }
    }
    if (!manifest) throw new LiveError(404, 'Episode audio not found.');
    if (process.platform !== 'darwin') throw new LiveError(503, 'Local dialogue audio requires the Mac presentation server.');
    const parsed = Manifest.parse(manifest);
    if (parsed.scenes.length !== 3 || parsed.scenes.some(scene => !scene.dialogue.length || scene.durationSeconds < 3 || scene.durationSeconds > 30)) {
      throw new LiveError(422, 'The episode timing is unavailable.');
    }
    try {
      const wave = await episodeAudio(parsed, store.path);
      return new Response(new Uint8Array(wave), { headers: {
        'Content-Type': 'audio/wav', 'Content-Length': String(wave.length),
        'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff',
      } });
    } catch {
      throw new LiveError(503, 'Dialogue audio could not be prepared. Please retry.');
    }
  });
}
