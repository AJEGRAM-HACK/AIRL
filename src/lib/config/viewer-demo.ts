export const viewerDemoEnabled = () => process.env.AIRL_VIEWER_DEMO === 'true';

const viewerReads = new Set([
  '/api/universes',
  '/api/universes/barangay-2099',
  '/api/live/session',
  '/api/live/rooms/barangay-2099/state',
  '/api/live/rooms/barangay-2099/events',
  '/api/live/rooms/barangay-2099/join-qr',
  '/api/production',
]);

const viewerWrites = new Set([
  '/api/live/session',
  '/api/live/rooms/barangay-2099/vote',
]);

export function viewerApiAllowed(request: Request) {
  const url = new URL(request.url);
  if (request.method === 'POST') return viewerWrites.has(url.pathname);
  return (request.method === 'GET' || request.method === 'HEAD') &&
    viewerReads.has(url.pathname) &&
    !url.searchParams.has('operator') &&
    (!url.searchParams.has('universe') || url.searchParams.get('universe') === 'barangay-2099');
}
