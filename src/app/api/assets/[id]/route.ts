import { platformRequest } from "@/server/platform/http";
export const dynamic = "force-dynamic";
export function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  return platformRequest(request, async (store, token) => {
    const row = store.asset((await context.params).id, store.account(token));
    return new Response(new Uint8Array(row.content as Uint8Array), {
      headers: {
        "Content-Type": String(row.mime),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'",
      },
    });
  });
}
