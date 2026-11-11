import { cookies } from 'next/headers';
import { ZodError } from 'zod';
import { features } from '@/lib/config/features';
import { LiveError, LiveStore } from './store';
export const SESSION_COOKIE = 'airl-session';
export async function sessionToken() { return (await cookies()).get(SESSION_COOKIE)?.value; }
export async function setSession(token: string, request: Request) {
  (await cookies()).set(SESSION_COOKIE, token, { httpOnly: true, sameSite: 'strict', secure: new URL(request.url).protocol === 'https:', path: '/', maxAge: 7 * 86400 });
}
export function checkRequest(request: Request) {
  if (!features.live || !features.cinemai) throw new LiveError(404, 'Live experience unavailable.');
  if (request.method !== 'GET' && request.headers.get('origin') !== `${new URL(request.url).protocol}//${request.headers.get('host')}`) throw new LiveError(403, 'A same-origin request is required.');
}
export async function body(request: Request) {
  const text = await request.text();
  if (text.length > 2048) throw new LiveError(413, 'Request is too large.');
  try { return JSON.parse(text); } catch { throw new LiveError(400, 'Invalid JSON.'); }
}
export async function withStore(request: Request, action: (store: LiveStore) => Promise<unknown>) {
  let store: LiveStore | undefined;
  try {
    checkRequest(request);
    store = new LiveStore();
    return Response.json(await action(store), { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return errorResponse(error); } finally { store?.dispose(); }
}
export function errorResponse(error: unknown) {
  if (error instanceof LiveError) return Response.json({ error: error.message }, { status: error.status, headers: { 'Cache-Control': 'no-store' } });
  if (error instanceof ZodError) return Response.json({ error: 'Invalid request fields.' }, { status: 400 });
  return Response.json({ error: 'The room service is unavailable. Please retry.' }, { status: 500 });
}
