import { checkRequest, errorResponse, sessionToken } from "@/server/live/http";
import { LiveError } from "@/server/live/store";
import { ProviderError } from "@/ai/providers/registry";
import { safeFailure } from "@/server/production/workflow";
import { PlatformStore } from "./store";
export async function jsonBody(request: Request, maximum = 64000) {
  const text = await request.text();
  if (text.length > maximum) throw new LiveError(413, "Request is too large.");
  try {
    return JSON.parse(text);
  } catch {
    throw new LiveError(400, "Invalid JSON.");
  }
}
export async function platformRequest(
  request: Request,
  action: (store: PlatformStore, token: string | undefined) => Promise<unknown>,
) {
  let store: PlatformStore | undefined;
  try {
    checkRequest(request);
    store = new PlatformStore();
    const result = await action(store, await sessionToken());
    return result instanceof Response
      ? result
      : Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof ProviderError)
      return Response.json(
        { error: error.code },
        { status: 400, headers: { "Cache-Control": "no-store" } },
      );
    if (!(error instanceof LiveError)) {
      const failure = safeFailure(error);
      if (failure.code !== "execution_failed")
        return Response.json(
          { error: failure.code },
          { status: 502, headers: { "Cache-Control": "no-store" } },
        );
    }
    return errorResponse(error);
  } finally {
    store?.close();
  }
}
