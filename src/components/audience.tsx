'use client';
import { Button } from '@/components/ui/button';
import { Radio } from 'lucide-react';
import { CommunityPanel } from '@/features/live/community-panel';
import { EpisodeGallery } from '@/features/production/episode-gallery';
export function Audience({roomId="barangay-2099"}:{roomId?:string}) {
  return <div className="audience-experience"><div className="page-heading"><div><div className="eyebrow"><Radio size={14} aria-hidden="true"/> AIRL LIVE · THE COMMUNITY WRITES NEXT</div><h1>One choice.<br />A new chapter.</h1><p>Pick a direction. Make it part of the story.</p></div><nav className="room-actions" aria-label="Room actions"><Button asChild><a href="#community-vote">Vote on next chapter</a></Button><Button asChild variant="outline"><a href="#episode-library">Watch episodes</a></Button></nav></div><div className="watch-grid"><EpisodeGallery roomId={roomId}/><CommunityPanel roomId={roomId}/></div></div>;
}
