import { z } from "zod";
import { platformRequest, jsonBody } from "@/server/platform/http";
import { WorldSettings } from "@/lib/domain";
type Context = { params: Promise<{ id: string }> };
export const dynamic = "force-dynamic";
export function GET(request: Request, context: Context) {
  return platformRequest(request, async (store, token) => {
    const { id } = await context.params;
    const actor = store.account(token);
    const world = store.getWorld(id, actor);
    return {
      universe: world,
      canManage: store.canManage(world, actor),
      characters: store.characters(id, actor),
      relationships: store.relationships(id, actor),
      episodes: store.episodes(id, actor),
      timeline: store.timeline(id, actor),
    };
  });
}
export function PATCH(request: Request, context: Context) {
  return platformRequest(request, async (store, token) => {
    const { id } = await context.params;
    const input = z
      .object({
        title: z.string().trim().min(1).max(120).optional(),
        settings: WorldSettings.optional(),
        visibility: z.enum(["private", "public"]).optional(),
        restore: z.boolean().optional(),
      })
      .strict()
      .parse(await jsonBody(request));
    return {
      universe: store.update(store.requireAccount(token, true), id, input),
    };
  });
}
export function DELETE(request: Request, context: Context) {
  return platformRequest(request, async (store, token) => {
    const { id } = await context.params;
    store.remove(store.requireAccount(token, true), id);
    return { archived: true };
  });
}
