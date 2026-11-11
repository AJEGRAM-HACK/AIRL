import { withStore, sessionToken, setSession } from '@/server/live/http';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  return withStore(request, async store => store.personal(await sessionToken()));
}
export async function POST(request: Request) {
  return withStore(request, async store => {
    store.limit('session-creation', 200);
    const token = store.join(await sessionToken());
    await setSession(token, request);
    return store.personal(token);
  });
}
