import { SpatialWorld } from './spatial-world';

// The shared architectural illustration is a designed treatment, not generated artwork.
export function UniverseArt({ id, title }: { id: string; title: string }) {
  if (id === 'barangay-2099') return <SpatialWorld title={title} official/>;
  return <div className="universe-abstract" role="img" aria-label={`Abstract cover for ${title}`}>
    <span aria-hidden="true">{title.slice(0, 1).toUpperCase()}</span>
  </div>;
}
