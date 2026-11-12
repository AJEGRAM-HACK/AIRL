import JourneyPage from './journey/page';
import PlatformPage from './platform/page';

export default function Home(props: { searchParams: Promise<{ universe?: string; round?: string; episode?: string }> }) {
  const journey = Boolean(process.env.AIRL_PUBLIC_ORIGIN || process.env.NEXT_PUBLIC_EXPERIENCE_MODE === 'journey');
  return journey ? <JourneyPage {...props} /> : <PlatformPage {...props} />;
}
