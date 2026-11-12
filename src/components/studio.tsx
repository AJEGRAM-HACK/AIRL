'use client';
import { CanCreate, CanManage, useAccess } from '@/components/platform/access';
import Link from 'next/link';
import { useState } from 'react';
import { RoomJoin } from '@/features/live/room-join';
import { CommunityPanel } from '@/features/live/community-panel';
import { CharacterCards } from './shared/character-cards';
import { Button } from './ui/button';
export function Studio({roomId="barangay-2099"}:{roomId?:string}) {
  const access=useAccess();
  const [tab,setTab]=useState('Production');
  if(!access.managedWorldIds.includes(roomId)&&!(roomId==='barangay-2099'&&access.legacyOperator))return null;
  return <div className="studio-main production-workspace"><div className="page-heading"><div><div className="eyebrow">AIRL STUDIO · EPISODE PRODUCTION</div><h1>From choice to premiere.</h1></div><CanCreate><Link className="text-link" href="/studio/ai">Advanced AI settings ↗</Link></CanCreate></div>
    <nav className="creator-nav" aria-label="Creator workspace"><Link href="/studio">My universes</Link><CanManage id={roomId}><Link href={`/studio/worlds/${roomId}`}>World management</Link></CanManage><Link href={`/live/${roomId}`}>Audience view ↗</Link></nav>
    <div className="studio-tabs" role="group" aria-label="Studio sections">{['Production','Characters'].map(name=><Button key={name} variant={tab===name?'default':'outline'} aria-pressed={tab===name} onClick={()=>setTab(name)}>{name}</Button>)}</div>
    {tab==='Production'?<><RoomJoin roomId={roomId}/><CommunityPanel operatorView roomId={roomId}/></>:<><p className="notice">Character details include the latest approved canonical events.</p><Link className="button button-outline" href={`/universes/${roomId}/characters`}>View this universe’s characters</Link>{roomId==='barangay-2099'&&<CharacterCards/>}</>}
  </div>;
}
