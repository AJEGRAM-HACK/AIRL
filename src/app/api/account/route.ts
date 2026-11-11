import { z } from "zod";
import { platformRequest, jsonBody } from "@/server/platform/http";
import { setSession } from "@/server/live/http";
import { LiveError, LiveStore } from "@/server/live/store";
import { Interests } from "@/lib/domain";
export const dynamic = "force-dynamic";
export function GET(request: Request) {
  return platformRequest(request, async (store, token) => ({
    account: store.account(token),
  }));
}
const credentials = z.object({
  email: z
    .email()
    .max(254)
    .transform((value) => value.trim().toLowerCase()),
  password: z.string().min(12).max(128),
  name: z.string().trim().min(1).max(80).optional(),
});
export function POST(request: Request) {
  return platformRequest(request, async (store, token) => {
    const input = z
      .object({
        action: z.enum(["signup", "signin", "signout", "interests"]),
        email: z.string().optional(),
        password: z.string().optional(),
        name: z.string().optional(),
        interests: Interests.optional(),
      })
      .strict()
      .parse(await jsonBody(request));
    if (input.action === "signout") {
      store.signout(token);
      await setSession("", request);
      return { account: null };
    }
    if (input.action === "interests") {
      const actor = store.requireAccount(token);
      store.interests(actor, input.interests || {});
      return { account: store.account(token) };
    }
    const protocol = new URL(request.url).protocol,
      host = request.headers.get("host")?.split(":")[0];
    if (
      protocol !== "https:" &&
      !["localhost", "127.0.0.1"].includes(host || "")
    )
      throw new LiveError(
        400,
        "Account access requires HTTPS or loopback development.",
      );
    const data = credentials.parse(input);
    const limiter = new LiveStore(store.path);
    try {
      limiter.limit(`account:${data.email}`, 12);
      limiter.limit("account-global", 100);
    } finally {
      limiter.dispose();
    }
    const next =
      input.action === "signup"
        ? store.signup(
            data.email,
            data.name || data.email.split("@")[0],
            data.password,
          )
        : store.signin(data.email, data.password);
    store.signout(token);
    await setSession(next, request);
    return { account: store.account(next) };
  });
}
