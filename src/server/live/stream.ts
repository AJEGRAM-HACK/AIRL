import { PlatformStore } from "@/server/platform/store";
import { LiveStore } from "./store";

// A connection carries public changes only. Drafts remain behind production API authorization.
export function roomEventStream(
  path: string,
  roomId: string,
  token: string | undefined,
  signal: AbortSignal,
) {
  const encoder = new TextEncoder();
  let dispose = () => {};
  return new ReadableStream<Uint8Array>({
    start(controller) {
      let platform: PlatformStore | undefined;
      let room: LiveStore | undefined;
      let timer: ReturnType<typeof setInterval> | undefined;
      let closed = false;
      let ticks = 0;
      let previousRoom = "";
      let previousProduction = "";
      const close = (endStream: boolean) => {
        if (closed) return;
        closed = true;
        clearInterval(timer);
        signal.removeEventListener("abort", stop);
        room?.dispose();
        platform?.close();
        if (endStream) controller.close();
      };
      const stop = () => close(true);
      dispose = () => close(false);
      try {
        platform = new PlatformStore(path);
        room = new LiveStore(path, roomId);
        const send = () => {
          if (closed) return;
          try {
            platform!.getWorld(roomId, platform!.account(token));
            const snapshot = JSON.stringify(room!.snapshot());
            if (snapshot !== previousRoom) {
              controller.enqueue(encoder.encode(`data: ${snapshot}\n\n`));
              previousRoom = snapshot;
            }
            const revision = JSON.stringify(
              platform!.db
                .prepare(
                  `
              SELECT j.id,j.status,j.updated,
                (SELECT MAX(sequence) FROM events WHERE run_id=j.run_id) AS event
              FROM room_jobs j WHERE j.room_id=? ORDER BY j.created DESC LIMIT 20
            `,
                )
                .all(roomId),
            );
            if (revision !== previousProduction) {
              // Only a change notice crosses the stream. Consumers fetch authorized content.
              controller.enqueue(
                encoder.encode("event: production\ndata: {}\n\n"),
              );
              previousProduction = revision;
            }
            if (++ticks % 15 === 0)
              controller.enqueue(encoder.encode(": heartbeat\n\n"));
            if (ticks >= 300) stop();
          } catch {
            stop();
          }
        };
        signal.addEventListener("abort", stop, { once: true });
        if (signal.aborted) {
          stop();
          return;
        }
        timer = setInterval(send, 1000);
        send();
      } catch {
        stop();
      }
    },
    cancel() {
      dispose();
    },
  });
}
