import PlatformPage from './platform/page';

export default function Home(props: {
  searchParams: Promise<{ universe?: string; round?: string; episode?: string }>;
}) {
  return <PlatformPage {...props} />;
}
