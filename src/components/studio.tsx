'use client';
import Link from 'next/link';
import { useState } from 'react';
import { RoomJoin } from '@/features/live/room-join';
import { CommunityPanel } from '@/features/live/community-panel';
import { CharacterCards } from './shared/character-cards';
import { Button } from './ui/button';
export function Studio() {
  const [tab,setTab]=useState('Production');
  return <div className="studio-main"><div className="page-heading"><div><div className="eyebrow">AIRL STUDIO · BARANGAY 2099</div><h1>Community control room.</h1></div><Button asChild variant="outline"><Link href="/studio/ai">AI provider settings</Link></Button></div>
    <div className="studio-tabs" role="group" aria-label="Studio sections">{['Production','Characters'].map(name=><Button key={name} variant={tab===name?'default':'outline'} aria-pressed={tab===name} onClick={()=>setTab(name)}>{name}</Button>)}</div>
    {tab==='Production'?<><RoomJoin/><CommunityPanel operatorView/></>:<><p className="notice">Character details include the latest approved canonical events.</p><CharacterCards/></>}
  </div>;
}
