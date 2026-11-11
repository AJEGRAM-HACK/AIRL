'use client';
import { Radio } from 'lucide-react';
import { CommunityPanel } from '@/features/live/community-panel';
import { EpisodeGallery } from '@/features/production/episode-gallery';
export function Audience() {
  return <><div className="page-heading"><div><div className="eyebrow"><Radio size={14}/> AIRL LIVE · BARANGAY 2099</div><h1>Choose the next chapter.</h1></div></div><div className="watch-grid"><EpisodeGallery/><CommunityPanel/></div></>;
}
