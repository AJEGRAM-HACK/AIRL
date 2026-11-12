# AIRL development handoff

Updated November 12, 2026. Repository `/Users/ajegram/CinemAI`. Continue in this conversation. Read `AGENTS.md`, this file, `ARCHITECTURE_PLAN.md` and `VERIFICATION.md` before editing.

## Product and architecture

AIRL is a community-shaped storytelling platform. Live owns audience decisions, CinemAI owns episodes, PersonaAI owns scoped characters/canon, and Studio owns creator management and human review. Barangay 2099 remains the official public universe with its original IDs, cast, episodes, memories and compatible URLs. Authorized creators can create private worlds and explicitly publish them to Explore.

Explore mode at `/platform` retains the current app modules and direct links. Journey at `/journey?universe=barangay-2099` offers five guided stages driven by the same stored rounds/jobs/episodes. Header links preserve universe/round/episode context. Authorized presenters can select another configured universe. Journey uses Ollama `qwen3:4b-instruct` for live generation. A stored approved episode can play with zero inference while live status remains visible. See [PRESENTER_RUNBOOK.md](PRESENTER_RUNBOOK.md).

One Next.js App Router repository uses strict TypeScript, React, Tailwind v4, Zod, shadcn-style buttons, Lucide, Node 24 LTS and npm. Local SQLite through `node:sqlite` holds accounts, opaque sessions, universe ownership, cast, relationships, assets, votes, job snapshots, stage outputs, versioned previews, ordered episodes and canon events. SSE streams vote totals and content-free production-change notices. Clients fetch authorized job/episode data on notices, with fallback polling. Remotion plays browser compositions. The OpenAI Agents SDK adapter shares the four-stage contracts with local Ollama.

SQLite and the local recovery worker remain the active architecture. The approved ngrok public HTTPS tunnel exposes the Mac-hosted web app for the hackathon. Supabase, Trigger.dev, always-on cloud hosting, MP4 rendering, generated art/audio, universe forks and team collaboration remain future milestones requiring separate decisions.

## Implementation and checkpoint

The pre-expansion baseline was clean `6d4a170`, with verified application commit `cc5f690a738157ccab7a496051653adbfc763a1d`. The multi-universe foundation checkpoint is `2f37d3602ba2d619f38b8fb2ab07fd04739be5c3`. The public tunnel checkpoint is `01e710d2fe8bcbf5ff249b1c90278108882e6c05`. The role-aware interface checkpoint is `7989ccde15933ab6765cd28ceebaa85cd489d535`. Latest verified application checkpoint is `05e1542bcf02d191c07eee5e8e98a82915399125`, completing the guided Journey and saved episode fallback. Silent replay was verified at `8a8903fea7f216d4725304a814d93c0633162484`. The current-status section of `VERIFICATION.md` indexes the evidence. [CHANGELOG.md](CHANGELOG.md) summarizes the recent checkpoints. Check `git status` and `git log -3` when resuming.

Implemented functionality includes signup/signin/signout, viewer defaults, admin creator grants, private editable interests, personalized genre discovery, private/public/archive/restore worlds, settings/languages/rules, configurable cast, scoped relationships/assets and two creation paths. Script outlines and playable versioned previews are persisted before Critic review. Compatible retries retain provider/model/winner/snapshot and reuse validated stages. Canon proposals are correctable during review. Publication atomically commits episodes and approved canon, with replay protection.

Unavailable model failures persist a sanitized Connection reason and consume the three-attempt retry limit. The current workflow is audience vote → frozen winner/world/cast → Director → Screenwriter → Visual Producer → Critic → private human review → transactional publication/canon → audience playback and cited story answers. Model responses and manifests use Zod validation. Paid operations require explicit consent. Legacy operator codes provide official-room round management and draft inspection. Official publication requires an admin account. Custom publication requires the creator owner or admin.

### Role-aware presentation

`src/server/platform/page.ts` derives a request-scoped permission snapshot from the cookie session and existing world ownership rules. The root layout supplies only account ID/role, creation eligibility, managed world IDs and narrow legacy-operator access to `src/components/platform/access.tsx`. Cookie reads make the layout request-rendered. Navigation and management links use that snapshot, with client revocation on signout and server refresh after authentication. No extra audience permission polling was added.

Guest/viewer pages hide Studio links, creation CTA buttons, management actions and provider-gateway links. Signed-in viewers retain the story helper. Guests receive its sign-in link. Creators can manage their own worlds; official canon stays admin-only. Direct Studio/AI/world-editor pages use server guards and return 404 for unauthorized users. Existing API checks remain authoritative. Legacy operators with an already redeemed code retain their narrow room page. Code redemption remains at its existing API, while the unrestricted public code-entry form was removed. New operators should use authorized accounts.

The new production-browser role case covers guest/viewer/creator/admin UI, ownership, direct URL/API denials and sign-in/sign-out visibility. It also exposed and fixed a pre-existing sign-in payload bug that sent an empty optional name. The frontend now sends the name only during signup.

### Code ownership

- `src/server/platform/` handles migrations, profiles, universe access, assets, pitches and spoiler-scoped retrieval.
- `src/server/live/` handles session-bound votes, memberships, round closure and job enqueueing.
- `src/server/production/` handles orchestration, snapshots, previews, retries, review and publication.
- `src/ai/providers/` handles provider selection, shared live stage contracts and transport adapters.
- `src/components/platform/` handles accounts, discovery, world editing, story pages and the helper.
- `src/features/live/`, `src/features/production/` and `src/features/persona/` preserve existing module interfaces.
- `src/video/` handles reusable assets, composition and playback.

## Routes and APIs

UI routes include `/`, `/account`, `/universes`, `/universes/[id]`, `/universes/[id]/episodes`, `/universes/[id]/episodes/[episodeId]`, `/universes/[id]/characters`, `/universes/[id]/characters/[slug]`, `/studio`, `/studio/worlds/[id]` and `/live/[id]`. A scoped `?round=` query shows the source round's actual results. Navigation carries the selected universe. System/light/dark themes remain available.

Existing `/watch/barangay-2099`, `/universe/barangay-2099`, `/studio/barangay-2099`, `/cinemai/watch/barangay-2099`, `/cinemai/universe/barangay-2099`, `/persona/[officialCharacter]`, `/studio/ai` and `/discover` remain. Unknown/inaccessible private identifiers return 404.

| API | Function |
| --- | --- |
| `GET/POST /api/account` | Current profile, signup/signin/signout/interests |
| `GET/POST /api/admin` | Admin account list and viewer/creator grants |
| `GET/POST /api/universes` | Discovery/owned worlds and private creation |
| `GET/PATCH/DELETE /api/universes/[id]` | Accessible world, settings/visibility and recoverable archive |
| `POST /api/universes/[id]/{characters,relationships,assets,ask}` | Scoped cast, relationships, reference images and story answers |
| `DELETE /api/universes/[id]/characters` | Remove an unreferenced character |
| `GET /api/assets/[id]` | Visibility-protected image bytes |
| `GET /api/models`, `POST /api/pitches` | Installed/allowed models and three editable starting pitches |
| `/api/live/session`, `/api/live/operator` | Join/inspect and narrow official operator-code redemption |
| `/api/live/rooms/[id]/{state,events,join-qr,vote,close,next}` | Scoped voting, local QR and production enqueue |
| `GET/POST /api/production` | Scoped progress, protected drafts, publish/reject/retry |
| `GET/POST /api/ai` | Creator/admin provider gateway previews |

Story helpers default to This episode on episode pages and offer Through this episode and Latest canon. Visibility, universe, character and story-order limits apply before inference. Studio draft mode requires management permissions. Signed-in viewers can ask about accessible stories. Citation IDs must match retrieved sources, with scene/timestamp links where available. Semantic answer correctness still needs human evaluation.

## Local setup and migration

Use the existing dependency installation. The temporary Node runtime is available through the following PATH while it remains under `/tmp`.

```sh
export PATH=/tmp/node-v24.22.2-darwin-arm64/bin:$PATH
export AIRL_LIVE_DB_PATH="$PWD/.data/airl-live.sqlite"
npm run dev
```

Sign up at `/account`, then grant the first admin from the trusted local terminal. No default account password is provisioned.

```sh
npm run account:admin -- your-email@example.com
```

Admins grant creator access in `/studio`. Creator owners manage custom worlds. Official canon requires admin authority. Anonymous audience voting continues without an account.

The additive migration was verified on an ignored SQLite backup before being applied to the live database. Original six legacy-table projections, three characters, one published episode, original artifacts/IDs/memories and two votes were preserved. Backups remain under `.data/universe-migration-*.sqlite`. Use the migration utility for another legacy database, with writers stopped while taking and validating the snapshot.

```sh
npm run migrate:universes
npm run migrate:universes -- --apply
```

## Providers and development constraints

Local Ollama with `qwen3:4b-instruct` is the default. Ollama listens solely on `127.0.0.1:11434`. Do not expose it publicly. The registry discovers installed models and rejects unavailable selections without fallback. Use `ollama list` and `ollama ps` to inspect availability/residency.

The M2 Pro has 16 GB unified memory. Current bounds are one serialized inference, 8192-token context, temperature 0, 2400-token overall output cap and 110-second deadline. Stage-specific caps reduce episode output. Earlier measurement sampled llama-server at 1520.1 MiB RSS, production Node at 140.3 MiB and daemon at 25.3 MiB during a 30.45-second run. Ollama reported approximately 3.55 GiB model residency. These measurements overlap unified-memory accounting and should be interpreted independently. Long-duration memory pressure remains unverified. Avoid overlapping inference tests and heavy exports.

Demo is explicitly labeled deterministic/offline. Hosted OpenAI needs server `OPENAI_API_KEY`, `OPENAI_MODEL`, `AIRL_ALLOW_LIVE_REQUESTS=true`, and per-operation paid consent. `OPENAI_ALLOWED_MODELS` optionally replaces the default single-model allowlist. Legacy `AI_PROVIDER=openai` aliases hosted mode. All agents share one selected credential/model. Hosted live validation awaits credentials and separate paid-call authorization.

Session BYOK requires authenticated HTTPS requests and paid consent. Keys stay in page/request memory and remain outside jobs, persistence, usage records and logs. BYOK supports request-scoped pitches/answers/gateway previews. Background episodes accept Demo, Ollama or configured Hosted OpenAI. Cloud tracing is disabled. Environment variables are documented in `.env.example`; keep real credentials ignored.

## Tests and evidence

```sh
npm run typecheck
npm test
npm run build
npm run test:browser
npm run benchmark:local
```

Latest known-good results are strict typecheck, optimized build, 38 passing unit tests and eight production-browser cases passing in 2.0 minutes, including repeated rewind/replay at zero and exact scene boundaries. The real Ollama community production took 26.5 seconds, with maximum sampled audience API latency 23 ms. Its full case took 33.8 seconds. The Journey case took 54.3 seconds and verified two audience sessions, real four-stage Ollama execution, early preview, saved offline Demo playback with zero POST requests, refresh/mode persistence, authorized publication and a scene-linked local story answer. The silent-audio-resume regression passed in 4.5 seconds. The fixed-input benchmark completed official/private production in 38.569/27.498 seconds, pitches in 14.370 seconds and a cited answer in 4.195 seconds.

`npm test` runs focused unit/regression tests including roles, universe isolation, frozen snapshots, private previews, canon correction/idempotency, retrieval spoiler limits, malformed output, provider/consent/key isolation, concurrency and SQLite locks. Deterministic executor/transport doubles are explicitly identified. `test:browser` builds a production server on port 3100 with isolated SQLite, Chrome and genuine Ollama for its real-provider scenario. It also covers both creator creation paths in Demo. It rebuilds `.next`, so stop the presentation server before running it.

`benchmark:local` uses tracked fixed inputs, paid calls disabled, isolated databases and real Ollama for official/private episodes, three pitches and a grounded answer. See `benchmarks/README.md`, tracked results and the newest `VERIFICATION.md` section for exact timing, failures and output observations.

## Public hackathon tunnel

The approved demo setup is the Mac, existing SQLite/Ollama and an ngrok public HTTPS endpoint for at most 35 viewers. `npm run demo:tunnel` starts ngrok, a strict loopback web upstream on 3456, the recovery worker and macOS idle-sleep prevention. Paid hosted calls and agent traffic inspection are disabled. The user's ngrok token is stored by its CLI outside the repository with private file permissions. No token is included here. The last verified audience URL was `https://pope-java-fable.ngrok-free.dev/live/barangay-2099`. Use the launcher’s printed URL on restart. Original episodes and votes remain in the normal database. Process availability and the current round must be checked at launch.

Run `npm run build` with the demo stopped, then `npm run demo:tunnel`. Use its printed public URL/Studio QR. Free visitors tap Visit Site once. Public-origin account login is separate from LAN cookies. Keep the lid open, power/internet available and the launcher running. Ctrl+C stops its processes. `npm run demo:rehearse` uses an isolated SQLite database and actual public endpoint for 35 simulated HTTP/2 sessions, real Ollama and one mobile Chrome journey. Stop any existing tunnel first. Results live under `.data/rehearsals/`. The successful 35-session public run is `1794428411206`, with real Ollama production in 23.639 seconds, request latency p95 157 ms and mobile Chrome playback/seek/captions passing. Thirty-eight unit tests and all eight production-browser cases pass. Exact results and early failed attempts are recorded in the latest `VERIFICATION.md` section. The user confirmed public iPhone voting, initial generated playback and caption toggling. Rewinding revealed a blank frame at scene boundaries. The scene fade now affects background decoration while the characters/captions stay painted. A second issue stalled replay while the player waited for an unnecessary audio-context resume. Silent previews now start muted, with zero shared audio tags and hidden volume controls. Repeated replay passes in local/public mobile Chrome with a simulated unresolved audio resume. The user then confirmed repeated rewind and replay on the physical iPhone before the Journey expansion. The user has now confirmed Journey saved-episode playback, seeking, replay and captions on the physical iPhone at `05e1542`. The owner account has been bootstrapped as admin.

Production-change notices share the vote SSE connection. Audience fallback polling is 30 seconds, Studio fallback is five seconds, and hidden pages pause production fetching. A returned page refreshes its state. SSE sends changed room snapshots, content-free production notices and heartbeats, with five-minute reconnects. Public streams recheck world visibility/account expiry on every tick. New focused tests cover stream privacy/revocation and tunnel-origin/Ollama-port rejection.

## Demo launch and remaining work

Stop any presentation server before rebuilding. Use the existing Node 24 installation and normal database.

```sh
export PATH=/tmp/node-v24.22.2-darwin-arm64/bin:$PATH
export AIRL_LIVE_DB_PATH="$PWD/.data/airl-live.sqlite"
npm run build
npm run demo:tunnel
```

Open the printed presenter Journey URL. Use Account to sign in as the existing owner admin, then return to Journey. Every audience QR opens `/live/[id]` for focused phone joining/voting/playback. `/platform` opens Explore mode with the current universe context. On phones, tap Visit Site if ngrok displays its free-plan notice. Join, vote, close with Ollama, inspect actual stages and review, publish, then play and rewind on the phone. Confirm the selected round is open before inviting the audience. The launcher includes the recovery worker. Keep the Mac powered, lid open and internet available. The final built application and worker were restored on the normal database through ngrok. A running-process observation is time-sensitive and must be rechecked after restarts.

For the local-network fallback, follow README's certificate setup and `demo:lan` instructions. That launcher requires a separate `production:worker` terminal using the same database and paid gate disabled. Transfer only the public CA certificate when phone enrollment is needed. Keep private TLS keys on the Mac.

The worker polls every two seconds and recovers expired 150-second claims. Earlier genuine restart recovery took 178.3 seconds, preserving votes and single publication. Automated recovery coverage remains in place. Repeat the crash/restart rehearsal on the presentation build before the event.

The physical iPhone passed joining/voting after the Safari 16 build fix. Public-origin playback and captions subsequently passed. Two follow-ups corrected blank scene-boundary frames and replay blocked by audio resumption. The user confirmed repeated rewind/replay after the silent-player fix.

Next priorities are the owner-admin presentation rehearsal on the venue network, repeated-run reliability and memory/load measurement, then separately authorized hosted OpenAI/HTTPS BYOK validation. Account email verification/reset, hosted identity/rate-limit hardening, semantic grounding evaluation, broader accessibility/device QA, MP4/audio/custom artwork, forks and teams remain open. Reference-image storage/linking is implemented. A creator upload UI and artwork rendering remain follow-on work.
