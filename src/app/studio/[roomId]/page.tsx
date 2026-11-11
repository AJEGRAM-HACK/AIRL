import { PublicShell } from '@/components/layout/public-shell';
import { Studio } from '@/components/studio';
import { readableUniverse } from '@/server/platform/page';
export const dynamic='force-dynamic';
export default async function Page({params}:{params:Promise<{roomId:string}>}){const {roomId}=await params;await readableUniverse(roomId);return <PublicShell active="studio" universeId={roomId}><Studio roomId={roomId}/></PublicShell>;}
