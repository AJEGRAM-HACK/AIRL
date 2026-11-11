import { z } from 'zod';
import { withStore, sessionToken, setSession, body } from '@/server/live/http';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  return withStore(request, async store => {
    const { code } = z.object({ code: z.string().min(16).max(128) }).strict().parse(await body(request));
    const token = store.redeemOperatorCode(await sessionToken(), code);
    await setSession(token, request);
    return store.personal(token);
  });
}
