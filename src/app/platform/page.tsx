import { CanCreate } from '@/components/platform/access';
import Link from 'next/link';
import { Nav, Footer } from '@/components/nav';
import { Button } from '@/components/ui/button';
import { WorldArt } from '@/components/world-art';
import { readableUniverse } from '@/server/platform/page';
import { experienceUrl } from '@/lib/journey';

export default async function PlatformPage({ searchParams }: {
  searchParams: Promise<{ universe?: string; round?: string; episode?: string }>;
}) {
  const query = await searchParams;
  const world = await readableUniverse(query.universe || 'barangay-2099');
  const context = { ...query, universe: world.id };
  return (
    <>
      <Nav universeId={world.id} />
      <main id="main">
        <section className="platform-hero">
          <div>
            <p className="eyebrow">ARTIFICIAL IN REAL LIFE</p>
            <h1>Stories shaped<br />by everyone.</h1>
            <p>
              Explore living universes. Decide what happens next.
              <CanCreate>
                <br />Build a world of your own.
              </CanCreate>
            </p>
            <div className="provider-actions">
              <Button asChild><Link href={experienceUrl('journey', context)}>Launch Journey</Link></Button>
              <Button asChild variant="outline">
                <Link href="/universes">Explore Universes</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/live/${world.id}`}>Live</Link>
              </Button>
              <CanCreate>
                <Button asChild variant="ghost">
                  <Link href="/studio">Creator Studio</Link>
                </Button>
              </CanCreate>
            </div>
          </div>
          <article className="platform-feature">
            <WorldArt />
            <div>
              <small>{world.official ? 'Official universe' : 'Selected universe'}</small>
              <h2>{world.title}</h2>
              <p>{world.settings.premise}</p>
              <div className="provider-actions">
                <Link href={query.episode ? `/universes/${world.id}/episodes/${query.episode}` : `/live/${world.id}#episode-library`}>Watch episodes →</Link>
                <Link href={`/live/${world.id}${query.round ? `?round=${query.round}` : ''}#community-vote`}>Vote on the next chapter →</Link>
              </div>
            </div>
          </article>
        </section>
      </main>
      <Footer />
    </>
  );
}
