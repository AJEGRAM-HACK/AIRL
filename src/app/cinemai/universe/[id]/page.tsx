import Universe from '@/app/universe/[slug]/page';
export default async function CinemaiUniverse({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Universe params={Promise.resolve({ slug: id })}/>;
}
