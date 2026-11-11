import { z } from "zod";
import { platformRequest, jsonBody } from "@/server/platform/http";
import { Selection, pitches } from "@/server/platform/ai";
import { Interests } from "@/lib/domain";
import { LiveError } from "@/server/live/store";
export const dynamic = "force-dynamic";
export const maxDuration = 120;
export function POST(request: Request) {
  return platformRequest(request, async (store, token) => {
    const actor = store.requireAccount(token, true);
    const input = z
      .object({
        provider: Selection,
        overrides: Interests.partial().optional(),
      })
      .strict()
      .parse(await jsonBody(request));
    if (
      input.provider.mode === "creator_byok" &&
      new URL(request.url).protocol !== "https:"
    )
      throw new LiveError(400, "BYOK requires HTTPS.");
    return pitches(store, actor, input.provider, input.overrides);
  });
}
