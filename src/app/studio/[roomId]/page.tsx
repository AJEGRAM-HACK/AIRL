import { notFound } from 'next/navigation';
import { Nav, Footer } from '@/components/nav';
import { Studio } from '@/components/studio';
import { DEMO_ROOM } from '@/lib/fixtures';
export default async function StudioPage({params}:{params:Promise<{roomId:string}>}) {const {roomId}=await params;if(roomId!==DEMO_ROOM)notFound();return <><Nav active="studio"/><main id="main"><Studio/></main><Footer/></>;}
