import { z } from "zod";
import { platformRequest, jsonBody } from "@/server/platform/http";
import { Selection, answerStory } from "@/server/platform/ai";
import { LiveError } from "@/server/live/store";
type Context = { params: Promise<{ id: string; resource: string }> };
export const dynamic = "force-dynamic";
export function POST(request: Request, context: Context) {
  return platformRequest(request, async (store, token) => {
    const { id, resource } = await context.params;
    if (resource === "ask") {
      const actor = store.account(token);
      store.getWorld(id, actor);
      const input = z
        .object({
          question: z.string().trim().min(1).max(1000),
          episodeId: z.string().optional(),
          characterId: z.string().optional(),
          scope: z.enum(["episode", "through", "latest"]),
          draft: z.boolean().optional(),
          runId: z.string().optional(),
          provider: Selection,
        })
        .strict()
        .parse(await jsonBody(request));
      if (
        input.provider.mode === "creator_byok" &&
        new URL(request.url).protocol !== "https:"
      )
        throw new LiveError(400, "BYOK requires HTTPS.");
      return answerStory(store, id, actor, input.provider, input);
    }
    const actor = store.requireAccount(token, true);
    if (resource === "characters")
      return {
        character: store.saveCharacter(actor, id, await jsonBody(request)),
      };
    if (resource === "relationships") {
      store.relationship(actor, id, await jsonBody(request));
      return { relationships: store.relationships(id, actor) };
    }
    if (resource === "assets") {
      const input = z
        .object({
          name: z.string().max(100),
          mime: z.string(),
          base64: z.string().max(2_700_000),
        })
        .strict()
        .parse(await jsonBody(request, 2_800_000));
      return {
        id: store.addAsset(
          actor,
          id,
          input.name,
          input.mime,
          Buffer.from(input.base64, "base64"),
        ),
      };
    }
    throw new LiveError(404, "Universe action not found.");
  });
}
export function DELETE(request: Request, context: Context) {
  return platformRequest(request, async (store, token) => {
    const { id, resource } = await context.params;
    if (resource !== "characters")
      throw new LiveError(404, "Action not found.");
    const input = z
      .object({ slug: z.string() })
      .strict()
      .parse(await jsonBody(request));
    store.deleteCharacter(store.requireAccount(token, true), id, input.slug);
    return { deleted: true };
  });
}
