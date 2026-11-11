import { features } from '@/lib/config/features';
import { notFound } from 'next/navigation';
import { Nav, Footer } from '@/components/nav';
import { Audience } from '@/components/audience';
import { DEMO_ROOM } from '@/lib/fixtures';
export default async function Watch({params}:{params:Promise<{roomId:string}>}) { const {roomId}=await params;if(!features.cinemai || roomId!==DEMO_ROOM)notFound();return <><Nav active="watch"/><main id="main" className="page-shell"><Audience/></main><Footer/></>; }
