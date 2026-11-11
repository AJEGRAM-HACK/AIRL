import { platformRequest, jsonBody } from "@/server/platform/http";
export const dynamic = "force-dynamic";
export function GET(request: Request) {
  return platformRequest(request, async (store, token) => ({
    universes: store.list(
      store.account(token),
      new URL(request.url).searchParams.get("owned") === "1",
    ),
  }));
}
export function POST(request: Request) {
  return platformRequest(request, async (store, token) => ({
    universe: store.create(
      store.requireAccount(token, true),
      await jsonBody(request),
    ),
  }));
}
