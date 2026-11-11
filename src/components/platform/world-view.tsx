"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { UniverseLinks } from "./worlds";
import { api } from "./api";
import { StoryHelper } from "./story-helper";
import { EpisodePreview } from "@/video/episode-preview";
import { Button } from "@/components/ui/button";
export function WorldView({
  id,
  mode = "world",
  characterId,
  episodeId,
  initialSeconds = 0,
}: {
  id: string;
  mode?: "world" | "characters" | "episodes";
  characterId?: string;
  episodeId?: string;
  initialSeconds?: number;
}) {
  const [data, setData] = useState<any>(null),
    [error, setError] = useState(""),
    [seek, setSeek] = useState(initialSeconds * 30);
  useEffect(() => {
    api(`/api/universes/${id}`)
      .then(setData)
      .catch((error) => setError(error.message));
  }, [id]);
  if (!data) return <p role="status">{error || "Loading universe…"}</p>;
  const character = characterId
    ? data.characters.find((item: any) => item.id === characterId)
    : null;
  const episode = episodeId
    ? data.episodes.find((item: any) => item.episode_id === episodeId)
    : null;
  if ((characterId && !character) || (episodeId && !episode))
    return <p role="alert">Story item not found.</p>;
  const timeline = character
    ? data.timeline.filter((event: any) => event.character_id === character.id)
    : data.timeline;
  return (
    <>
      <div className="platform-heading">
        <div>
          <p className="eyebrow">
            {data.universe.official
              ? "OFFICIAL UNIVERSE"
              : data.universe.visibility.toUpperCase()}
          </p>
          <h1>
            {episode?.artifact.manifest?.title ||
              character?.name ||
              data.universe.title}
          </h1>
        </div>
        {data.canManage && (
          <Button asChild variant="outline">
            <Link href={`/studio/worlds/${id}`}>Manage world</Link>
          </Button>
        )}
      </div>
      <UniverseLinks id={id} />
      {episode ? (
        <>
          <p>
            Story order {episode.story_order} · Winning choice —{" "}
            {episode.choice || "Standalone production"}
          </p>
          {episode.round_id && (
            <p>
              <Link href={`/live/${id}?round=${episode.round_id}#source-round`}>
                Open source round {episode.round_id}
              </Link>
            </p>
          )}
          <EpisodePreview
            manifest={episode.artifact.manifest}
            seekFrame={seek}
          />
          <section className="panel platform-form">
            <h2>Scenes and characters</h2>
            {episode.artifact.manifest.scenes.map(
              (scene: any, index: number) => {
                const seconds = episode.artifact.manifest.scenes
                  .slice(0, index)
                  .reduce(
                    (sum: number, item: any) => sum + item.durationSeconds,
                    0,
                  );
                return (
                  <article key={scene.id} id={`scene-${scene.id}`}>
                    <Button
                      variant="outline"
                      onClick={() => setSeek(seconds * 30)}
                    >
                      {scene.id} · {seconds}s
                    </Button>
                    {scene.dialogue.map((line: any, position: number) => (
                      <p key={position}>
                        <Link
                          href={`/universes/${id}/characters/${line.characterId}`}
                        >
                          {episode.artifact.manifest.cast?.find(
                            (item: any) => item.id === line.characterId,
                          )?.name || line.characterId}
                        </Link>{" "}
                        — {line.text}
                      </p>
                    ))}
                  </article>
                );
              },
            )}
          </section>
          <StoryHelper universeId={id} episodeId={episodeId} />
        </>
      ) : character ? (
        <>
          <section className="panel platform-form">
            <p>{character.role}</p>
            <p>{character.backstory}</p>
            <dl>
              <dt>Personality</dt>
              <dd>{character.personality.join(", ")}</dd>
              <dt>Voice</dt>
              <dd>{character.voice}</dd>
              <dt>Speaking style</dt>
              <dd>{character.speakingStyle}</dd>
              <dt>Motivations</dt>
              <dd>{character.motivations.join(", ")}</dd>
              <dt>Appearance</dt>
              <dd>{character.appearance}</dd>
            </dl>
            {character.assets.map((asset: string) => (
              <a key={asset} href={`/api/assets/${asset}`}>
                Open appearance reference
              </a>
            ))}
            <h2>Relationships</h2>
            {data.relationships
              .filter(
                (item: any) =>
                  item.from === character.id || item.to === character.id,
              )
              .map((item: any) => (
                <p key={`${item.from}-${item.to}`}>
                  <Link
                    href={`/universes/${id}/characters/${item.from === character.id ? item.to : item.from}`}
                  >
                    {item.from} → {item.to}
                  </Link>{" "}
                  · {item.description}
                </p>
              ))}
          </section>
          <StoryHelper universeId={id} characterId={characterId} />
        </>
      ) : (
        <>
          {mode === "world" && (
            <section className="panel platform-form">
              <h2>
                {data.universe.settings.premise || "A world taking shape"}
              </h2>
              <p>{data.universe.settings.storyline}</p>
              <p>
                {[
                  data.universe.settings.setting,
                  data.universe.settings.era,
                  data.universe.settings.genre,
                  data.universe.settings.tone,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <ul>
                {data.universe.settings.rules.map(
                  (rule: string, index: number) => (
                    <li key={index}>{rule}</li>
                  ),
                )}
              </ul>
              <Button asChild>
                <Link href={`/live/${id}`}>Watch and vote</Link>
              </Button>
            </section>
          )}
          {mode !== "characters" && (
            <section className="platform-form">
              <h2>Episodes in story order</h2>
              {!data.episodes.length && (
                <p>The first episode is waiting for its audience decision.</p>
              )}
              <div className="platform-grid">
                {data.episodes.map((item: any) => (
                  <article className="panel" key={item.episode_id}>
                    <small>Chapter {item.story_order}</small>
                    <h2>
                      <Link
                        href={`/universes/${id}/episodes/${item.episode_id}`}
                      >
                        {item.artifact.manifest.title}
                      </Link>
                    </h2>
                    <p>{item.choice}</p>
                  </article>
                ))}
              </div>
            </section>
          )}
          {mode !== "episodes" && (
            <section className="platform-form">
              <h2>Characters</h2>
              <div className="platform-grid">
                {data.characters.map((item: any) => (
                  <article className="panel" key={item.id}>
                    <h2>
                      <Link href={`/universes/${id}/characters/${item.id}`}>
                        {item.name}
                      </Link>
                    </h2>
                    <p>{item.role}</p>
                    <p>{item.backstory}</p>
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}
      {!episode && (
        <section className="panel platform-form">
          <h2>Approved story timeline</h2>
          <ol>
            {timeline.map((event: any) => (
              <li key={event.id}>
                <p>{event.content}</p>
                <small>Story order {event.story_order}</small>
                {event.episode_id && (
                  <Link
                    href={`/universes/${id}/episodes/${event.episode_id}${event.scene_id ? `#scene-${event.scene_id}` : ""}`}
                  >
                    {" "}
                    · Source episode
                    {event.scene_id ? ` / ${event.scene_id}` : ""}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}
    </>
  );
}
