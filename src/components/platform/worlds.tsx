"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { UniverseArt } from "@/components/universe-art";
import {
  Account,
  World,
  WorldDraft,
  WorldCharacter,
  WorldSettings,
  Interests,
} from "@/lib/domain";
import { CanCreate, CanManage, useAccess } from "./access";
import { Button } from "@/components/ui/button";
import { api } from "./api";
import { InterestFields } from "./account";
import { ProviderPicker, defaultProvider } from "./provider-picker";
import { CommunityPanel } from "@/features/live/community-panel";
import { RoomJoin } from "@/features/live/room-join";
export function UniverseLinks({ id }: { id: string }) {
  return (
    <nav className="universe-links" aria-label="Universe navigation">
      <Link href={`/universes/${id}`}>Overview</Link>
      <Link href={`/live/${id}`}>Live</Link>
      <Link href={`/universes/${id}/episodes`}>Episodes</Link>
      <Link href={`/universes/${id}/characters`}>Characters</Link>
      <CanManage id={id}><Link href={`/studio/worlds/${id}`}>Studio</Link></CanManage>
    </nav>
  );
}
function WorldCards({ worlds, discovery = false }: { worlds: World[]; discovery?: boolean }) {
  return (
    <div className={`platform-grid${discovery ? ' discovery-grid' : ''}`}>
      {worlds.map((world) => (
        <article className="panel world-card" key={world.id}>
          {discovery && <Link href={`/universes/${world.id}`} className="discovery-cover" aria-label={`Explore ${world.title}`}>
            <UniverseArt id={world.id} title={world.title} />
            <span><ArrowUpRight size={19} aria-hidden="true" /></span>
          </Link>}
          <small>
            {world.official ? "Official canon" : `Creator universe · ${world.visibility}`}
            {world.archived ? " · Archived" : ""}
          </small>
          <h2>
            <Link href={`/universes/${world.id}`}>{world.title}</Link>
          </h2>
          <p>
            {world.settings.premise || "A world waiting for its first story."}
          </p>
          <p className="fine-print">
            {[world.settings.genre, world.settings.era]
              .filter(Boolean)
              .join(" · ")}
          </p>
          <div className="provider-actions">
            <Button asChild variant="outline">
              <Link href={`/live/${world.id}`}>Join Live</Link>
            </Button>
            <Link
              className="text-link"
              href={`/universes/${world.id}/episodes`}
            >
              Watch episodes
            </Link>
            <Link
              className="text-link"
              href={`/universes/${world.id}/characters`}
            >
              Characters
            </Link>
            <CanManage id={world.id}><Button asChild variant="ghost">
              <Link href={`/studio/worlds/${world.id}`}>Open Studio</Link>
            </Button></CanManage>
          </div>
          {world.archived && (
            <Button
              onClick={async () => {
                await api(
                  `/api/universes/${world.id}`,
                  { restore: true },
                  "PATCH",
                );
                window.location.reload();
              }}
            >
              Restore world
            </Button>
          )}
        </article>
      ))}
    </div>
  );
}
export function ExploreWorlds({
  title = "Explore universes",
}: {
  title?: string;
}) {
  const [worlds, setWorlds] = useState<World[]>([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [search, setSearch] = useState(""),
    [genre, setGenre] = useState("");
  useEffect(() => {
    api("/api/universes")
      .then((data) => setWorlds(data.universes))
      .catch((error) => setError(error.message))
      .finally(() => setLoading(false));
  }, []);
  const genres = [...new Set(worlds.map(world => world.settings.genre).filter(Boolean))].sort();
  const visible = worlds.filter(world =>
    (!genre || world.settings.genre === genre) &&
    `${world.title} ${world.settings.premise} ${world.settings.genre}`.toLowerCase().includes(search.trim().toLowerCase())
  );
  return (
    <section className="universe-discovery" aria-label="Universe discovery">
      <div className="platform-heading">
        <div>
          <p className="eyebrow">FIND YOUR NEXT STORY</p>
          <h1>{title}</h1>
          <p>Choose a world. Help shape what happens next.</p>
        </div>
        <CanCreate><Button asChild variant="outline">
          <Link href="/studio">Creator Studio</Link>
        </Button></CanCreate>
      </div>
      <div className="discovery-toolbar">
        <label className="discovery-search"><Search size={18} aria-hidden="true" /><span className="sr-only">Search universes</span>
          <input type="search" placeholder="Search worlds, stories, genres…" value={search} onChange={event => setSearch(event.target.value)} />
        </label>
        <label className="discovery-genre">Genre
          <select aria-label="Genre" value={genre} onChange={event => setGenre(event.target.value)}><option value="">All genres</option>{genres.map(value => <option key={value}>{value}</option>)}</select>
        </label>
      </div>
      {error ? <p role="alert">{error}</p> : loading ? <p role="status" className="discovery-state">Finding your next story…</p> : <>
        <p role="status" className="discovery-count">{visible.length} {visible.length === 1 ? 'universe' : 'universes'} to explore</p>
        {visible.length ? <WorldCards worlds={visible} discovery /> : <div className="discovery-state"><h2>{worlds.length ? 'No worlds match just yet.' : 'The next story is still to come.'}</h2><p>{worlds.length ? 'Try another title or genre.' : 'Public universes will appear here when they are shared.'}</p>{worlds.length > 0 && <Button variant="outline" onClick={() => { setSearch(''); setGenre(''); }}>Clear filters</Button>}</div>}
      </>}
    </section>
  );
}
export function CreatorStudio() {
  const access=useAccess();
  const [pitchOpen, setPitchOpen] = useState(false);
  const [account, setAccount] = useState<Account | null>(null),
    [worlds, setWorlds] = useState<World[]>([]),
    [accounts, setAccounts] = useState<any[]>([]),
    [error, setError] = useState(""),
    [pending, setPending] = useState(false);
  const [provider, setProvider] = useState(defaultProvider),
    [interests, setInterests] = useState(Interests.parse({})),
    [pitches, setPitches] = useState<any[]>([]),
    [draft, setDraft] = useState<any>(null),
    [draftText, setDraftText] = useState("");
  useEffect(() => {
    if(!access.canCreate){setAccount(null);setWorlds([]);setAccounts([]);return;}
    api("/api/account")
      .then(async (data) => {
        setAccount(data.account);
        if (data.account) {
          setInterests(Interests.parse(data.account.interests));
          setWorlds((await api("/api/universes?owned=1")).universes);
          if (data.account.role === "admin")
            setAccounts((await api("/api/admin")).accounts);
        }
      })
      .catch((error) => setError(error.message));
  }, [access.canCreate]);
  async function run(action: () => Promise<void>) {
    setError("");
    setPending(true);
    try {
      await action();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setPending(false);
    }
  }
  async function create(value: unknown) {
    const data = await api("/api/universes", value);
    window.location.assign(`/studio/worlds/${data.universe.id}`);
  }
  if(!access.canCreate)return <p><Link href="/universes">Explore universes</Link></p>;
  return (
    <div className="creator-workspace">
      <div className="platform-heading">
        <div>
          <p className="eyebrow">YOUR CREATIVE SPACE</p>
          <h1>Creator Studio</h1>
          <p>Build worlds. Invite an audience. Review what becomes canon.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/account">Your profile</Link>
        </Button>
      </div>
      <nav className="creator-nav" aria-label="Creator workspace">
        <Link href="#my-universes">My universes</Link><Link href="#create-universe">Create a universe</Link><Link href="/studio/ai">Advanced AI settings</Link>
      </nav>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {!account ? (
        <p role="status">Opening your creative workspace…</p>
      ) : account.role === "viewer" ? (
        <div className="notice">
          Your account is a viewer. An admin can grant creator access.{" "}
          <Link href="/universes">Explore public worlds</Link>
        </div>
      ) : (
        <>
          <section id="create-universe" className="panel platform-form">
            <h2>Create a universe</h2>
            <div className="provider-actions">
              <Button
                disabled={pending}
                onClick={() =>
                  run(() =>
                    create({
                      title: "Untitled world",
                      settings: {},
                      characters: [],
                    }),
                  )
                }
              >
                Start from scratch
              </Button>
              <Button variant="outline" aria-expanded={pitchOpen} aria-controls="pitch-starting-points" onClick={() => setPitchOpen(value => !value)}>
                Generate starting points
              </Button>
            </div>
            <div id="pitch-starting-points" className="pitch-starting-points" hidden={!pitchOpen}>
            <p>Find a starting point with your selected provider. Review every pitch before saving a private world.</p>
            <details>
              <summary>Pitch interests and overrides</summary>
              <InterestFields value={interests} onChange={setInterests} />
            </details>
            <ProviderPicker value={provider} onChange={setProvider} />
            <Button
              disabled={pending}
              onClick={() =>
                run(async () => {
                  const result = await api("/api/pitches", {
                    provider,
                    overrides: interests,
                  });
                  setPitches(result.result.pitches);
                  setProvider((value) => ({ ...value, consent: false }));
                })
              }
            >
              {pending ? "Generating…" : "Generate three pitches"}
            </Button>
            </div>
          </section>
          {pitches.length > 0 && (
            <div className="platform-grid">
              {pitches.map((pitch, index) => (
                <article className="panel" key={index}>
                  <h2>{pitch.title}</h2>
                  <p>{pitch.settings.premise}</p>
                  <p>{pitch.conflict}</p>
                  <Button
                    onClick={() => {
                      setDraft(pitch);
                      setDraftText(JSON.stringify(pitch, null, 2));
                    }}
                  >
                    Edit this pitch
                  </Button>
                </article>
              ))}
            </div>
          )}
          {draft && (
            <section className="panel platform-form">
              <h2>Review your starting point</h2>
              <label>
                Title
                <input
                  value={draft.title}
                  onChange={(event) => {
                    const updated = { ...draft, title: event.target.value };
                    setDraft(updated);
                    setDraftText(JSON.stringify(updated, null, 2));
                  }}
                />
              </label>
              <label>
                Editable world, cast and first vote
                <textarea
                  className="json-editor"
                  aria-label="Pitch draft JSON"
                  value={draftText}
                  onChange={(event) => setDraftText(event.target.value)}
                />
              </label>
              <Button
                disabled={pending}
                onClick={() => run(() => create(JSON.parse(draftText)))}
              >
                Save private universe draft
              </Button>
            </section>
          )}
          <section id="my-universes" className="owned-universes"><p className="eyebrow">BUILD SOMETHING THAT LASTS</p><h2>My universes</h2>{!worlds.length && <p className="empty-state">Your first universe starts with an idea. Create a private world above, then invite an audience when it is ready.</p>}<WorldCards worlds={worlds} /></section>
        </>
      )}
      {account?.role === "admin" && (
        <section className="panel platform-form">
          <h2>Account permissions</h2>
          {accounts.map((user) => (
            <div className="account-row" key={user.id}>
              <span>
                {user.name} · {user.email}
              </span>
              {user.role === "admin" ? (
                <b>Admin</b>
              ) : (
                <select
                  aria-label={`Role for ${user.email}`}
                  value={user.role}
                  onChange={(event) =>
                    run(async () =>
                      setAccounts(
                        (
                          await api("/api/admin", {
                            accountId: user.id,
                            role: event.target.value,
                          })
                        ).accounts,
                      ),
                    )
                  }
                >
                  <option value="viewer">Viewer</option>
                  <option value="creator">Authorized creator</option>
                </select>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
function SettingsEditor({
  value,
  onChange,
}: {
  value: ReturnType<typeof WorldSettings.parse>;
  onChange: (value: ReturnType<typeof WorldSettings.parse>) => void;
}) {
  return (
    <div className="form-grid">
      {(
        ["setting", "era", "genre", "tone", "premise", "storyline"] as const
      ).map((key) => (
        <label key={key}>
          {key[0].toUpperCase() + key.slice(1)}
          <textarea
            value={value[key]}
            onChange={(event) =>
              onChange({ ...value, [key]: event.target.value })
            }
          />
        </label>
      ))}
      <label>
        Preferred languages, one per line
        <textarea
          value={value.languages.join("\n")}
          onChange={(event) =>
            onChange({ ...value, languages: event.target.value.split("\n") })
          }
        />
      </label>
      <label>
        World rules, one per line
        <textarea
          value={value.rules.join("\n")}
          onChange={(event) =>
            onChange({ ...value, rules: event.target.value.split("\n") })
          }
        />
      </label>
    </div>
  );
}
export function WorldEditor({ id }: { id: string }) {
  const access=useAccess();
  const [data, setData] = useState<any>(null),
    [title, setTitle] = useState(""),
    [settings, setSettings] = useState(WorldSettings.parse({})),
    [character, setCharacter] = useState(
      WorldCharacter.parse({ id: "new-character", name: "New character" }),
    ),
    [relation, setRelation] = useState({ from: "", to: "", description: "" }),
    [error, setError] = useState(""),
    [pending, setPending] = useState(false);
  async function load() {
    const value = await api(`/api/universes/${id}`);
    setData(value);
    setTitle(value.universe.title);
    setSettings(WorldSettings.parse(value.universe.settings));
  }
  useEffect(() => {
    load().catch((error) => setError(error.message));
  }, [id]);
  async function run(action: () => Promise<unknown>) {
    setError("");
    setPending(true);
    try {
      await action();
      await load();
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setPending(false);
    }
  }
  if(!access.managedWorldIds.includes(id))return <p><Link href="/universes">Explore universes</Link></p>;
  if (!data) return <p role={error ? "alert" : "status"}>{error || "Loading Studio…"}</p>;
  if (!data.canManage)
    return (
      <>
        <h1>Studio access</h1>
        <p>This world can be managed by its owner or an admin.</p>
        <UniverseLinks id={id} />
        <Link href="/account">Sign in</Link>
      </>
    );
  return (
    <div className="world-editor">
      <p className="eyebrow">CREATOR STUDIO · WORLD MANAGEMENT</p>
      <div className="platform-heading">
        <h1>{data.universe.title}</h1>
        <span>
          {data.universe.official
            ? "Official · admin managed"
            : data.universe.visibility}
        </span>
      </div>
      <UniverseLinks id={id} />
      <nav className="creator-nav" aria-label="World management"><a href="#world-settings">World settings</a><a href="#world-cast">Characters</a><a href="#world-production">Episode production</a></nav>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <section id="world-settings" className="panel platform-form">
        <h2>World Settings</h2>
        <label>
          Title
          <input
            value={title}
            maxLength={120}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        <SettingsEditor value={settings} onChange={setSettings} />
        <details open>
          <summary>Premise preview</summary>
          <p>
            {settings.premise ||
              "Define your premise in any order with the cast."}
          </p>
          <p>
            {[settings.setting, settings.era, settings.genre, settings.tone]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </details>
        <div className="provider-actions">
          <Button
            disabled={pending}
            onClick={() =>
              run(() =>
                api(`/api/universes/${id}`, { title, settings }, "PATCH"),
              )
            }
          >
            Save world settings
          </Button>
          <Button
            variant="outline"
            disabled={pending}
            onClick={() =>
              run(() =>
                api(
                  `/api/universes/${id}`,
                  {
                    visibility:
                      data.universe.visibility === "public"
                        ? "private"
                        : "public",
                  },
                  "PATCH",
                ),
              )
            }
          >
            {data.universe.visibility === "public"
              ? "Make private"
              : "Publish universe to Explore"}
          </Button>
          {!data.universe.official && (
            <Button
              variant="ghost"
              onClick={() =>
                run(async () => {
                  await api(`/api/universes/${id}`, undefined, "DELETE");
                  window.location.assign("/studio");
                })
              }
            >
              Archive universe
            </Button>
          )}
        </div>
      </section>
      <section id="world-cast" className="panel platform-form">
        <h2>Cast</h2>
        <div className="provider-actions">
          {data.characters.map((item: any) => (
            <Button
              key={item.id}
              variant="outline"
              onClick={() => setCharacter(WorldCharacter.parse(item))}
            >
              {item.name}
            </Button>
          ))}
          <Button
            variant="ghost"
            onClick={() =>
              setCharacter(
                WorldCharacter.parse({
                  id: "new-character",
                  name: "New character",
                }),
              )
            }
          >
            New character
          </Button>
        </div>
        <div className="form-grid">
          {(
            [
              "id",
              "name",
              "role",
              "voice",
              "appearance",
              "speakingStyle",
              "backstory",
              "color",
            ] as const
          ).map((key) => (
            <label key={key}>
              {key}
              <input
                value={character[key]}
                onChange={(event) =>
                  setCharacter({ ...character, [key]: event.target.value })
                }
              />
            </label>
          ))}
          {(
            [
              "personality",
              "motivations",
              "rules",
              "memories",
              "assets",
            ] as const
          ).map((key) => (
            <label key={key}>
              {key}, one per line
              <textarea
                value={character[key].join("\n")}
                onChange={(event) =>
                  setCharacter({
                    ...character,
                    [key]: event.target.value.split("\n").filter(Boolean),
                  })
                }
              />
            </label>
          ))}
          <label>
            Reusable appearance
            <select
              value={character.symbol}
              onChange={(event) =>
                setCharacter({
                  ...character,
                  symbol: event.target.value as typeof character.symbol,
                })
              }
            >
              {["person", "bot", "glasses", "coffee"].map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="provider-actions">
          <Button
            disabled={pending}
            onClick={() =>
              run(() => api(`/api/universes/${id}/characters`, character))
            }
          >
            Save character
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              run(() =>
                api(
                  `/api/universes/${id}/characters`,
                  { slug: character.id },
                  "DELETE",
                ),
              )
            }
          >
            Remove character
          </Button>
        </div>
        <p className="fine-print">
          Existing approved memories are revised through episode review.
        </p>
      </section>
      <section className="panel platform-form">
        <h2>Relationships</h2>
        {(["from", "to"] as const).map((key) => (
          <label key={key}>
            {key}
            <select
              value={relation[key]}
              onChange={(event) =>
                setRelation({ ...relation, [key]: event.target.value })
              }
            >
              <option value="">Select a character</option>
              {data.characters.map((item: any) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        ))}
        <label>
          Description
          <textarea
            value={relation.description}
            onChange={(event) =>
              setRelation({ ...relation, description: event.target.value })
            }
          />
        </label>
        <Button
          onClick={() =>
            run(() => api(`/api/universes/${id}/relationships`, relation))
          }
        >
          Save relationship
        </Button>
        <ul>
          {data.relationships.map((item: any) => (
            <li key={`${item.from}-${item.to}`}>
              {item.from} → {item.to} · {item.description}
            </li>
          ))}
        </ul>
      </section>
      <section id="world-production" className="world-production"><p className="eyebrow">FROM AN AUDIENCE CHOICE TO A NEW CHAPTER</p><h2>Episode production</h2><RoomJoin roomId={id} /><CommunityPanel operatorView roomId={id} /></section>
    </div>
  );
}
