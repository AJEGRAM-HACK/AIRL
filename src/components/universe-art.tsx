import { WorldArt } from './world-art';

// Only the official world uses its existing Barangay illustration.
export function UniverseArt({ id, title }: { id: string; title: string }) {
  if (id === 'barangay-2099') return <WorldArt />;
  return <div className="universe-abstract" role="img" aria-label={`Abstract cover for ${title}`}>
    <span aria-hidden="true">{title.slice(0, 1).toUpperCase()}</span>
  </div>;
}
