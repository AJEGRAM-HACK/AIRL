import type { NextRequest } from 'next/server';
import { viewerApiAllowed, viewerDemoEnabled } from '@/lib/config/viewer-demo';

export function proxy(request: NextRequest) {
  if (!viewerDemoEnabled()) return;
  if (request.nextUrl.pathname.startsWith('/api/') && viewerApiAllowed(request)) return;
  return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
}

export const config = {
  matcher: ['/api/:path*', '/account/:path*', '/studio/:path*'],
};
