"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Account,
  World,
  WorldDraft,
  WorldCharacter,
  WorldSettings,
  Interests,
} from "@/lib/domain";
import { Button } from "@/components/ui/button";
import { api } from "./api";
import { InterestFields } from "./account";
import { ProviderPicker, defaultProvider } from "./provider-picker";
import { CommunityPanel } from "@/features/live/community-panel";
import { RoomJoin } from "@/features/live/room-join";
export function UniverseLinks({ id }: { id: string }) {
  return (
    <nav className="universe-links" aria-label="Universe navigation">
      <Link href={`/universes/${id}`}>World</Link>
      <Link href={`/live/${id}`}>Live</Link>
      <Link href={`/universes/${id}/episodes`}>CinemAI</Link>
      <Link href={`/universes/${id}/characters`}>PersonaAI</Link>
      <Link href={`/studio/worlds/${id}`}>Studio</Link>
    </nav>
  );
}
function WorldCards({ worlds }: { worlds: World[] }) {
  return (
    <div className="platform-grid">
      {worlds.map((world) => (
        <article className="panel world-card" key={world.id}>
          <small>
            {world.official ? "Official universe" : world.visibility}
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
            <Button asChild variant="ghost">
              <Link href={`/studio/worlds/${world.id}`}>Open Studio</Link>
            </Button>
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
    [error, setError] = useState("");
  useEffect(() => {
    api("/api/universes")
      .then((data) => setWorlds(data.universes))
      .catch((error) => setError(error.message));
  }, []);
  return (
    <>
      <div className="platform-heading">
        <div>
          <h1>{title}</h1>
          <p>Choose a world. Help shape what happens next.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/studio">Creator Studio</Link>
        </Button>
      </div>
      {error && <p role="alert">{error}</p>}
      <WorldCards worlds={worlds} />
    </>
  );
}
export function CreatorStudio() {
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
  }, []);
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
  return (
    <>
      <div className="platform-heading">
        <div>
          <h1>Creator Studio</h1>
          <p>Build worlds. Invite an audience. Review what becomes canon.</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/account">Your profile</Link>
        </Button>
      </div>
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {!account ? (
        <p>
          <Link href="/account">Sign in or create a viewer profile</Link> to
          manage your worlds. Anonymous voting remains available in public Live
          rooms.
        </p>
      ) : account.role === "viewer" ? (
        <div className="notice">
          Your account is a viewer. An admin can grant creator access.{" "}
          <Link href="/universes">Explore public worlds</Link>
        </div>
      ) : (
        <>
          <section className="panel platform-form">
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
              <Button variant="outline" onClick={() => setDraft(null)}>
                Generate starting points
              </Button>
            </div>
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
          <WorldCards worlds={worlds} />
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
    </>
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
  if (!data) return <p role="status">{error || "Loading Studio…"}</p>;
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
    <>
      <div className="platform-heading">
        <h1>{data.universe.title}</h1>
        <span>
          {data.universe.official
            ? "Official · admin managed"
            : data.universe.visibility}
        </span>
      </div>
      <UniverseLinks id={id} />
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      <section className="panel platform-form">
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
      <section className="panel platform-form">
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
      <RoomJoin roomId={id} />
      <CommunityPanel operatorView roomId={id} />
    </>
  );
}
