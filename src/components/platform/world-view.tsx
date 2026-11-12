"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Bot, Coffee, Glasses, UserRound } from "lucide-react";
import { CanManage } from "./access";
import { UniverseLinks } from "./worlds";
import { UniverseArt } from "@/components/universe-art";
import { api } from "./api";
import { StoryHelper } from "./story-helper";
import { EpisodePreview } from "@/video/episode-preview";
import { Button } from "@/components/ui/button";

function CharacterMark({ symbol }: { symbol?: string }) {
  const Icon = symbol === 'bot' ? Bot : symbol === 'coffee' ? Coffee : symbol === 'glasses' ? Glasses : UserRound;
  return <div className="character-mark" aria-hidden="true"><Icon size={44} strokeWidth={1.2} /></div>;
}
export function WorldView({ id, mode = "world", characterId, episodeId, initialSeconds = 0 }: {
  id: string; mode?: "world" | "characters" | "episodes"; characterId?: string; episodeId?: string; initialSeconds?: number;
}) {
  const [data, setData] = useState<any>(null), [error, setError] = useState(""), [seek, setSeek] = useState(initialSeconds * 30);
  const [sceneNotesOpen, setSceneNotesOpen] = useState(initialSeconds > 0);
  useEffect(() => { api(`/api/universes/${id}`).then(setData).catch(error => setError(error.message)); }, [id]);
  useEffect(() => {
    const revealSource = () => { if (window.location.hash.startsWith('#scene-')) setSceneNotesOpen(true); };
    revealSource();
    window.addEventListener('hashchange', revealSource);
    return () => window.removeEventListener('hashchange', revealSource);
  }, [data, episodeId]);
  if (!data) return <p className="empty-state" role={error ? 'alert' : 'status'}>{error || "Opening the universe…"}</p>;
  const character = characterId ? data.characters.find((item: any) => item.id === characterId) : null;
  const episode = episodeId ? data.episodes.find((item: any) => item.episode_id === episodeId) : null;
  if ((characterId && !character) || (episodeId && !episode)) return <p role="alert">Story item not found.</p>;
  const timeline = character ? data.timeline.filter((event: any) => event.character_id === character.id) : data.timeline;
  return <div className="world-experience">
    <div className="platform-heading world-heading">
      <div><p className="eyebrow">{data.universe.official ? "OFFICIAL CANON" : `CREATOR UNIVERSE · ${data.universe.visibility.toUpperCase()}`}</p><h1>{episode?.artifact.manifest?.title || character?.name || data.universe.title}</h1></div>
      {data.canManage && <CanManage id={id}><Button asChild variant="outline"><Link href={`/studio/worlds/${id}`}>Manage world</Link></Button></CanManage>}
    </div>
    <UniverseLinks id={id} />
    {episode ? <>
      <div className="episode-reveal-grid">
        <div className="episode-stage"><EpisodePreview manifest={episode.artifact.manifest} seekFrame={seek} universeId={id} episodeId={episode.episode_id} /></div>
        <aside className="episode-story"><p className="eyebrow">CHAPTER {episode.story_order} · APPROVED EPISODE</p><h2>{episode.artifact.manifest.title}</h2>{episode.artifact.script?.summary && <p className="episode-synopsis">{episode.artifact.script.summary}</p>}<p className="episode-choice"><span>THE AUDIENCE CHOSE</span>{episode.choice || "Standalone production"}</p>
          {episode.round_id && <Link className="text-link" href={`/live/${id}?round=${episode.round_id}#source-round`}>See the audience decision <ArrowRight size={15} aria-hidden="true" /></Link>}
          <div className="episode-cast"><span>IN THIS CHAPTER</span>{episode.artifact.manifest.cast?.map((item: any) => <Link key={item.id} href={`/universes/${id}/characters/${item.id}`}>{item.name}</Link>)}</div>
          <Button asChild><Link href={`/live/${id}#community-vote`}>Shape the next chapter <ArrowRight size={16} aria-hidden="true" /></Link></Button>
        </aside>
      </div>
      <nav className="episode-next" aria-label="More episodes"><Link className="text-link" href={`/universes/${id}/episodes`}>All episodes in {data.universe.title}</Link>{(() => {
        const position = data.episodes.findIndex((item: any) => item.episode_id === episodeId);
        const next = data.episodes[position + 1] || data.episodes[position - 1];
        return next ? <Link className="text-link" href={`/universes/${id}/episodes/${next.episode_id}`}>{position + 1 < data.episodes.length ? 'Next episode' : 'Previous episode'}: {next.artifact.manifest.title}<ArrowRight size={16} aria-hidden="true"/></Link> : null;
      })()}</nav>
      <details className="scene-transcript" open={sceneNotesOpen} onToggle={event => setSceneNotesOpen(event.currentTarget.open)}><summary>Scenes and characters</summary><section className="panel platform-form scene-notes">
        {episode.artifact.manifest.scenes.map((scene: any, index: number) => {
          const seconds = episode.artifact.manifest.scenes.slice(0, index).reduce((sum: number, item: any) => sum + item.durationSeconds, 0);
          return <article key={scene.id} id={`scene-${scene.id}`}><Button variant="outline" onClick={() => setSeek(seconds * 30)}>{scene.id} · {seconds}s</Button>
            {scene.dialogue.map((line: any, position: number) => <p key={position}><Link href={`/universes/${id}/characters/${line.characterId}`}>{episode.artifact.manifest.cast?.find((item: any) => item.id === line.characterId)?.name || line.characterId}</Link> — {line.text}</p>)}
          </article>;
        })}
      </section></details>
      <StoryHelper universeId={id} episodeId={episodeId} />
    </> : character ? <>
      <section className="panel platform-form character-profile"><CharacterMark symbol={character.symbol} /><p className="eyebrow">{character.role}</p><p>{character.backstory}</p>
        <dl><dt>Personality</dt><dd>{character.personality.join(", ")}</dd><dt>Voice</dt><dd>{character.voice}</dd><dt>Speaking style</dt><dd>{character.speakingStyle}</dd><dt>Motivations</dt><dd>{character.motivations.join(", ")}</dd><dt>Appearance</dt><dd>{character.appearance}</dd></dl>
        {character.assets.map((asset: string) => <a key={asset} href={`/api/assets/${asset}`}>Open appearance reference</a>)}
        <h2>Relationships</h2>
        {data.relationships.filter((item: any) => item.from === character.id || item.to === character.id).map((item: any) => <p key={`${item.from}-${item.to}`}><Link href={`/universes/${id}/characters/${item.from === character.id ? item.to : item.from}`}>{item.from} → {item.to}</Link> · {item.description}</p>)}
      </section><StoryHelper universeId={id} characterId={characterId} />
    </> : <>
      {mode === "world" && <section className="world-overview" aria-label="Universe story">
        <div className="world-overview-art"><UniverseArt id={id} title={data.universe.title} /></div>
        <div className="world-lore"><p className="eyebrow">A WORLD WORTH STEPPING INTO</p><h2>{data.universe.settings.premise || "A world taking shape"}</h2><p>{data.universe.settings.storyline}</p><p className="world-genre">{[data.universe.settings.setting, data.universe.settings.era, data.universe.settings.genre, data.universe.settings.tone].filter(Boolean).join(" · ")}</p>
          {data.universe.settings.rules.length > 0 && <details><summary>World rules</summary><ul>{data.universe.settings.rules.map((rule: string, index: number) => <li key={index}>{rule}</li>)}</ul></details>}
          <Button asChild><Link href={`/live/${id}`}>Watch and vote <ArrowRight size={16} aria-hidden="true" /></Link></Button>
        </div>
      </section>}
      {mode !== "characters" && <section className="story-section"><div className="story-section-heading"><div><p className="eyebrow">THE STORY SO FAR</p><h2>Episodes in story order</h2></div><Link className="text-link" href={`/live/${id}`}>Join the next chapter <ArrowRight size={15} aria-hidden="true" /></Link></div>
        {!data.episodes.length && <p className="empty-state">The first episode is waiting for its audience decision.</p>}
        <div className="platform-grid story-cards">{data.episodes.map((item: any) => <article className="panel story-card" key={item.episode_id}><small>CHAPTER {String(item.story_order).padStart(2, '0')}</small><h3><Link href={`/universes/${id}/episodes/${item.episode_id}`}>{item.artifact.manifest.title}</Link></h3><p>{item.choice}</p><Link className="text-link" href={`/universes/${id}/episodes/${item.episode_id}`}>Watch episode <ArrowRight size={15} aria-hidden="true" /></Link></article>)}</div>
      </section>}
      {mode !== "episodes" && <section className="story-section"><div className="story-section-heading"><div><p className="eyebrow">PERSISTENT CHARACTERS. SHARED HISTORY.</p><h2>Characters</h2></div></div>
        {!data.characters.length && <p className="empty-state">This universe’s cast is still taking shape.</p>}
        <div className="platform-grid story-cards">{data.characters.map((item: any) => <article className="panel story-card" key={item.id}><CharacterMark symbol={item.symbol} /><h3><Link href={`/universes/${id}/characters/${item.id}`}>{item.name}</Link></h3><small>{item.role}</small><p>{item.backstory}</p><Link className="text-link" href={`/universes/${id}/characters/${item.id}`}>Meet {item.name} <ArrowRight size={15} aria-hidden="true" /></Link></article>)}</div>
      </section>}
    </>}
    {!episode && <section className="panel platform-form canon-timeline"><p className="eyebrow">WHAT THE CHARACTERS REMEMBER</p><h2>The story they remember.</h2>{!timeline.length && <p>The first approved chapter will begin this universe’s shared history.</p>}<ol>{timeline.map((event: any) => <li key={event.id}><p>{event.content}</p><small>Story order {event.story_order}</small>{event.episode_id && <Link href={`/universes/${id}/episodes/${event.episode_id}${event.scene_id ? `#scene-${event.scene_id}` : ''}`}> · Source episode{event.scene_id ? ` / ${event.scene_id}` : ''}</Link>}</li>)}</ol></section>}
  </div>;
}
