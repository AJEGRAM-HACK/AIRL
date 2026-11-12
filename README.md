# AIRL — Don't just watch the story. Shape it.

AIRL is an interactive entertainment platform for creator-built universes and stories shaped by their audiences. Discover a world in the **AIRL Multiverse**, watch an episode, and vote on a decision that could change what happens next. Creators design the choices and use AI-assisted production to turn the winning direction into an episode they can review and publish.

A universe gives a creator's characters, lore, and stories a home that can grow across episodes. Imagine watching a neighborhood council in **Barangay 2099** run out of options, then joining the audience to decide whether its next move should be to make taho legal tender, mandate karaoke, or send Captain Bot offline. The vote gives the next episode its direction. The creator decides what becomes canon.

## The AIRL experience

| Product area | In the hackathon build | Planned capabilities |
| --- | --- | --- |
| **AIRL Multiverse** | Explore and the universe library at `/universes` are the first version of the discovery experience. Browse, search, and filter public worlds, then open a universe to explore its lore, characters, and published episodes. | Featured collections and a personal library of followed universes. |
| **AIRL Watch** | Watch published episodes from a universe's library. CinemAI's Remotion player supports seeking, replay, captions, and transcripts, with dialogue audio on supported previews. | A dedicated streaming home organized around series and seasons, with watchlists and Continue Watching. |
| **AIRL Studio** | Authorized creators can manage their own universes, cast, relationships, and canon. Studio supports AI-assisted episode production, draft review, and publication. PersonaAI supplies shared character profiles and continuity. | Series and season planning, richer story-branch authoring, and publishing tools for external channels. |
| **AIRL Community** | AIRL Live lets audiences join a room by link or QR code, vote on creator-defined story directions, and follow live results. After publication, operators can generate and edit suggestions for the next voting round. | Fan discussions, creator announcements, and notifications for episodes and votes. |
| **Distribution** | Episodes are available through AIRL's own web experience. | TikTok is one planned distribution channel alongside other platforms. Short clips can introduce a world and bring viewers to AIRL to watch, explore, and vote. |

## Hackathon demo · Barangay 2099

1. **Discover the world.** Open Explore at `/` or browse public universes at `/universes`. Enter Barangay 2099 to meet the cast and explore its story.
2. **Vote on the next chapter.** Open the guided presenter experience at `/journey?universe=barangay-2099`. For an open round, audience members can scan the QR code or visit `/live/barangay-2099` to cast their votes.
3. **Follow the winning choice into production.** An authorized operator closes the round. The production job carries the winner through Director → Screenwriter → Visual Producer → Critic and prepares a playable preview. An authorized reviewer approves the episode and its canon changes before publication.
4. **Watch the premiere.** In the configured showcase, choose **Play first production** in Journey or open `/universes/barangay-2099/episodes/efbdba79-9564-4de1-8ca0-984c26d284f5` to watch **Taho Tender**.

**Taho Tender** is a saved, four-shot Flow/Veo export of about 32 seconds. The video, poster, and replay fixture are included in the repository.

### Play the saved showcase from a fresh clone

Use Node.js 24 LTS and npm.

```sh
npm ci
npm run demo
```

Open [Journey](http://127.0.0.1:3000/journey?universe=barangay-2099) and choose **Play first production**, or go straight to the [published episode](http://127.0.0.1:3000/universes/barangay-2099/episodes/efbdba79-9564-4de1-8ca0-984c26d284f5). Each launch creates a separate local SQLite database with the saved episode and closed voting round, including the recorded totals of seven votes for taho, three for karaoke, and two for sending Captain Bot offline. Saved playback requires no API key or Ollama. The [presenter runbook](PRESENTER_RUNBOOK.md) covers the separate live setup with audience phones and a new voting round.

## Run locally

Use Node.js 24 LTS and npm. From a fresh checkout:

```sh
node --version
npm ci
AIRL_LIVE_DB_PATH="$PWD/.data/airl-local.sqlite" AIRL_ALLOW_LIVE_REQUESTS=false npm run dev
```

Open `http://127.0.0.1:3000`. The command uses a separate local SQLite file for development. Sign up at `/account` to create a viewer account. If you need the first admin in that database, run the following with the email you registered:

```sh
AIRL_LIVE_DB_PATH="$PWD/.data/airl-local.sqlite" npm run account:admin -- your-email@example.com
```

Admins can grant creator access in `/studio`. Creators manage owned worlds at `/studio/worlds/[id]` and operate room production at `/studio/[roomId]`. Official Barangay 2099 publication requires an admin.

- **Offline production rehearsal.** Select **Demo** in Studio for deterministic generation without a model or API key. Use `AI_PROVIDER=demo` for the standalone production CLI.
- **Local model.** Ollama is the default provider. With Ollama installed and running on loopback, use `ollama list` to check for `qwen3:4b-instruct` and `ollama pull qwen3:4b-instruct` if it is missing.
- **Hosted and creator-key options.** Use [the environment example](.env.example) to configure ignored `.env.local` settings. Hosted OpenAI requires server credentials, an enabled paid-request gate, and explicit consent for the operation. The authenticated HTTPS creator-key adapter keeps keys request-scoped. Live paid validation of that adapter remains pending.
- **Presentation.** The [presenter runbook](PRESENTER_RUNBOOK.md) covers the production build, HTTPS tunnel, LAN fallback, and saved premiere. A standalone recovery worker started with `npm run production:worker` must use the same `AIRL_LIVE_DB_PATH` as the web app. The tunnel launcher starts its own worker.

## Architecture

- **Application and storage.** One Next.js 16 App Router application with React 19, TypeScript, and local SQLite. Explore and Journey share account, universe, voting, and production state. Server-side access checks enforce private-world visibility, ownership, and publication roles.
- **Voting and production.** Room updates stream via server-sent events. Closing a round freezes the winning choice and story context in a persisted production job. The four stages validate outputs with Zod and produce a versioned preview for review. Publication commits the approved episode and canon together.
- **AI and playback.** The server-side provider gateway supports deterministic Demo, local Ollama, and gated OpenAI requests through the OpenAI SDK and Agents SDK. Remotion composes previews from validated manifests. PersonaAI provides universe-scoped character profiles, approved memories, and source-grounded story questions.
- **Interface and tooling.** Tailwind CSS 4, Radix UI Slot, Class Variance Authority, clsx, tailwind-merge, Lucide, and QRCode support the web experience. Playwright and tsx support tests and scripts. Dependencies are listed in [package.json](package.json) and pinned in [package-lock.json](package-lock.json).

See the [architecture plan](ARCHITECTURE_PLAN.md) for runtime boundaries and proposed hosted infrastructure, the [universe model](docs/UNIVERSE_MODEL.md) for ownership and continuity, and the [verification log](VERIFICATION.md) for dated demo and test results.

### Application checks

```sh
npm run typecheck
npm test
npm run build
AIRL_LIVE_DB_PATH="/tmp/airl-browser-$(date +%s)-$$.sqlite" AIRL_ALLOW_LIVE_REQUESTS=false npm run test:browser
```

Run browser checks with the presentation stopped. They rebuild the application, use installed Chrome and local Ollama, and should run against a fresh disposable SQLite path.
