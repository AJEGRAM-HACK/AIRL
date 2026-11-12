export const firstProduction = {
  universeId: 'barangay-2099',
  episodeId: 'efbdba79-9564-4de1-8ca0-984c26d284f5',
  jobId: 'a74e1393-1260-4a13-a8a7-ffa3c13335bd',
  title: 'Taho Tender',
  label: 'First production',
  details: 'First production · 4 shots · 32 seconds',
  synopsis: 'Captain Bot declares taho the barangay’s official currency.',
  video: '/demo-media/Taho-Tender.mp4',
  poster: '/demo-media/Taho-Tender.jpg',
} as const;

export const firstProductionUrl = `/universes/${firstProduction.universeId}/episodes/${firstProduction.episodeId}`;

export function isFirstProduction(universeId?: string, episodeId?: string, jobId?: string) {
  return universeId === firstProduction.universeId &&
    (episodeId === firstProduction.episodeId || jobId === firstProduction.jobId);
}
