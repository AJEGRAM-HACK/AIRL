import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicShell } from '@/components/layout/public-shell';
import { Audience } from '@/components/audience';
import { readableUniverse } from '@/server/platform/page';
import { LiveStore } from '@/server/live/store';
export const dynamic='force-dynamic';
export async function generateMetadata({ params }: {
  params: Promise<{ roomId: string }>;
}): Promise<Metadata> {
  const { roomId } = await params;
  const world = await readableUniverse(roomId);
  return { title: `Vote in ${world.title} — AIRL` };
}

export default async function Page({params,searchParams}:{params:Promise<{roomId:string}>;searchParams:Promise<{round?:string}>}){
  const {roomId}=await params;
  const world=await readableUniverse(roomId);
  const {round:roundId}=await searchParams;
  let sourceRound=null;
  if(roundId){
    const store=new LiveStore(undefined,roomId);
    try{sourceRound=store.snapshot(roundId);}catch{notFound();}finally{store.dispose();}
  }
  return <PublicShell active="live" universeId={roomId}>
    <p className="notice">{world.title} · Shared audience room</p>
    {sourceRound&&<section id="source-round" className="panel platform-form"><h1>Source audience decision</h1><p>{sourceRound.status} · {sourceRound.totalVotes} votes</p><ul>{sourceRound.options.map(option=><li key={option.id}>{option.title} · {option.votes} votes{option.id===sourceRound.winner?' · Winning direction':''}</li>)}</ul><a href="#community-vote">Open current round</a></section>}
    <Audience roomId={roomId}/>
  </PublicShell>;
}
