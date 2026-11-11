import { z } from "zod";
import { platformRequest, jsonBody } from "@/server/platform/http";
export const dynamic = "force-dynamic";
export function GET(request: Request) {
  return platformRequest(request, async (store, token) => ({
    accounts: store.accounts(store.requireAccount(token)),
  }));
}
export function POST(request: Request) {
  return platformRequest(request, async (store, token) => {
    const actor = store.requireAccount(token);
    const input = z
      .object({
        accountId: z.string().uuid(),
        role: z.enum(["viewer", "creator"]),
      })
      .strict()
      .parse(await jsonBody(request));
    store.grant(actor, input.accountId, input.role);
    return { accounts: store.accounts(actor) };
  });
}
