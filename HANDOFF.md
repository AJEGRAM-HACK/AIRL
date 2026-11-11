# AIRL development handoff

Updated November 12, 2026. Repository location is `/Users/ajegram/CinemAI`.

This file is a durable checkpoint for continued work in the current Codex conversation. A new chat is optional if context compaction becomes problematic or the user requests one. Recheck Git status and local service availability when resuming; temporary runtimes, screenshots and running servers may have expired.

## Product and architecture

AIRL means Artificial In Real Life. “The real world is the prompt.” AIRL Live gathers community decisions, CinemAI produces fictional episodes, and PersonaAI maintains shared characters and approved story memory. The current universe is Barangay 2099 with Captain Bot, Tita Nena and Kuya Taho. QuestAI, RemixAI, WorldForge and AIRL Memories remain Coming Soon.

One Next.js App Router application uses React, strict TypeScript, Tailwind v4, Zod, shadcn-style controls and Lucide. Node.js 24 LTS and npm are required. Local SQLite through `node:sqlite` stores sessions, votes, jobs, artifacts and canon. SSE delivers voting snapshots. The production UI polls persisted job progress. Server-only provider adapters select Demo, Ollama or OpenAI. Remotion renders browser previews.

The intended hosted architecture adds Supabase Auth/PostgreSQL/RLS/Realtime/Storage and durable Trigger.dev jobs. These integrations remain future work. SQLite requires a persistent writable filesystem. Hosted functions cannot reach this Mac's loopback Ollama server.

Read `AGENTS.md` before development, `ARCHITECTURE_PLAN.md` for current/proposed architecture and routes, and `VERIFICATION.md` for evidence and limitations. Preserve existing work and labeled fixtures. Paid calls, provisioning, deployment and external pushes require authorization.

## Current status and verified commit

Latest verified application commit is `e0c0155` — `Make audience voting accessible and preserve joined session state`. LAN/recovery fixes are in `1e34cbb`; the preceding baseline was `318b2f0`.

Full application commit ID is `e0c015568a2ba0e0265bc2bc98c6e36c3a7359bf`. Later documentation commits may follow it. Check Git status when resuming. Verification records include the integration sprint and LAN rehearsal.

The complete local workflow passed production-browser acceptance using both Demo and genuine Ollama inference.

1. Independent audience sessions vote once per round.
2. An authenticated operator closes the round and atomically enqueues its winning decision.
3. Story Director → Screenwriter → Visual Producer → Creative Critic generate validated structured outputs.
4. The successful artifact becomes a private draft for operator review.
5. Approval atomically publishes the episode and canonical character memories.
6. Audience members select and play the generated Remotion episode.

Sessions use opaque HttpOnly cookies and server-side roles. Repeated closure/publication is protected against duplicates. Ties use displayed option order. Persisted jobs retain provider/model/consent metadata and real events. Claims, retries and Critic revision are bounded. Next.js `after` starts work locally, and a recovery worker handles pending or expired claims. Creator BYOK stays outside background jobs.

System/Light/Dark themes are implemented. Generated and reference episodes share one selector. PersonaAI profiles and prompts read approved canon. Provider previews use request-local memory. CLI production retains separate mode-specific storage.

### Main implementation locations

- `src/server/live/` owns sessions, roles, voting and shared SQLite storage.
- `src/server/production/` owns orchestration, artifacts, room jobs and publication.
- `src/ai/providers/` owns provider selection, configuration and inference adapters.
- `src/ai/memory/canonical.ts` owns approved character-memory reads.
- `src/features/live/`, `src/features/production/`, `src/features/persona/` and `src/features/ai/` own module interfaces.
- `src/video/` owns validated reusable assets, composition and Player.
- `scripts/` contains production, worker and operator commands. `tests/` contains regression and browser coverage.

## Working routes and APIs

Implemented UI routes include `/`, `/discover`, `/live`, `/live/barangay-2099`, `/studio`, `/studio/barangay-2099`, `/studio/ai`, `/cinemai`, `/cinemai/watch/barangay-2099`, `/cinemai/universe/barangay-2099`, `/persona` and `/persona/{captain-bot,tita-nena,kuya-taho}`. Braced character names describe three individual routes. Legacy `/watch/barangay-2099` and `/universe/barangay-2099` remain available. Unknown room/world/character IDs return 404.

| API | Behavior |
| --- | --- |
| `GET/POST /api/live/session` | Session inspection/join |
| `POST /api/live/operator` | One-time operator-code redemption |
| `GET /api/live/rooms/[roomId]/state` | Public aggregate state |
| `GET /api/live/rooms/[roomId]/events` | SSE aggregate updates |
| `GET /api/live/rooms/[roomId]/join-qr` | Same-origin audience QR generated locally |
| `POST /api/live/rooms/[roomId]/vote` | Session-bound vote |
| `POST /api/live/rooms/[roomId]/close` | Protected closure and provider-selected enqueue |
| `POST /api/live/rooms/[roomId]/next` | Protected next round |
| `GET /api/production` | Public status and published manifests |
| `GET /api/production?operator=1` | Protected drafts and internal events |
| `POST /api/production` | Protected publish/reject/retry using job ID and action |
| `GET/POST /api/ai` | Creator-protected provider metadata, tests, generation and replies |

## Providers, BYOK and Ollama

Use `.env.example` as the configuration inventory. At the latest integration verification, application credentials and hosted enablement were absent, with only `.env.example` present. No secret values belong in this document or source control.

| Mode | Configuration and verification |
| --- | --- |
| `demo` | Default `AI_PROVIDER=demo`. Deterministic offline templates, explicitly labeled. Full local loop verified. |
| `ollama` | Server-only loopback on port 11434. Installed `qwen3:4b-instruct` completed all four stages and browser playback. |
| `hosted_openai` | Requires server `OPENAI_API_KEY`, `OPENAI_MODEL`, `AIRL_ALLOW_LIVE_REQUESTS=true` and explicit paid-request consent. Live integration awaits credentials and authorization. Legacy `openai` aliases this mode. |
| `creator_byok` | HTTPS, same-origin creator/operator session and explicit consent required. Key stays in page/request memory and clears on disconnect. Isolation/security tests passed with doubles. Real HTTPS inference remains untested. |

All four hosted agents share the configured OpenAI credential through the OpenAI Agents SDK with Zod output schemas. Model choice is configurable. Providers never silently fall back, and cloud trace export is disabled. Keys never enter jobs or usage records. Room jobs freeze their explicit provider/model selection independently of the CLI's `AI_PROVIDER` default. Plain HTTP localhost rejects BYOK.

Verified local settings follow. Use the exact name returned by Ollama's installed-model list.

```dotenv
AI_PROVIDER=ollama
OLLAMA_MODEL=qwen3:4b-instruct
OLLAMA_CONTEXT_WINDOW=8192
AIRL_AI_REQUEST_TIMEOUT_MS=110000
AIRL_AI_MAX_OUTPUT_TOKENS=2400
AIRL_AI_DAILY_REQUEST_LIMIT=20
```

Local inference is serialized with compact per-stage output limits. Optional rate/spend estimate settings are documented in `.env.example`. The web app, operator CLI and worker must share `AIRL_LIVE_DB_PATH`, default `.data/airl-live.sqlite`. `CINEMAI_DB_PATH` overrides standalone CLI storage. Keep environment files and SQLite artifacts ignored.

## M2 Pro / 16 GB development constraints

The integration sprint verified Apple M2 Pro hardware with 16 GiB unified memory. Ollama reported one resident `qwen3:4b-instruct` model at an 8192-token context and approximately 3.55 GiB model residency. Model residency is only part of total system memory use. System swap was approximately 5.75 GiB during inspection; attribution to AIRL remains unresolved, and the process sampler did not establish useful Ollama CPU/RSS measurements.

A corrected sampler covered a genuine four-stage CLI run completed in 30.45 seconds. llama-server peaked at approximately 1.48 GiB RSS and 397.4% CPU across cores; production Node peaked at 140.3 MiB RSS. System swap stayed at 6040.88 MiB during that run. These sampled peaks and model residency overlap in unified memory and cannot be summed as independent allocations. Long-duration capacity remains unverified.

Keep the known-good local demo on this single model with serialized inference, the bounded context above and compact stage outputs. Avoid simultaneous large-model inference and heavy media exports during rehearsal. Use a production build for acceptance and presentation, since development recompilation previously caused transient manifest-loading errors. Repeated-run performance and memory-pressure testing remain pending.

## Run and verify

Use an existing Node 24 installation. The previous session used `/tmp/node-v24.22.2-darwin-arm64/bin`, which may disappear. Open `http://127.0.0.1:3000` after starting the app. Generate an operator code locally, join the room studio and redeem it there.

```sh
npm run dev
npm run live:operator
npm run production:drain
npm run production:worker
AI_PROVIDER=ollama OLLAMA_MODEL=qwen3:4b-instruct npm run production -- "Ban Monday meetings"
```

Run these checks when implementing changes.

```sh
npm run test:production
npm run test:live
npm run test:providers
npm run test:room-production
npm run test:sprint
npm run typecheck
npm run build
npm run start
npm run test:browser
```

Latest recorded results at `e0c0155` were 29 passing unit/regression tests, successful typecheck/build and three passing browser cases across separate runs. The final two full-flow cases passed with Demo in 6.7 seconds and Ollama in 36.5 seconds, including a 31.5-second production and maximum sampled audience API latency of 28 ms. A focused delayed-session regression passed separately in 692 ms after correcting a test assumption about a previously closed round. Browser checks covered voting, review, publication, advancing playback, seeking, captions, selection and approved memory. Database-lock and canonical-memory isolation regressions passed.

An actual HTTPS app kill during Story Director inference recovered through the normal worker after natural 150-second lease expiry. Recovery took 178.3 seconds and two attempts. Votes, idempotent publication and the single published episode survived further restarts. See the LAN rehearsal section in `VERIFICATION.md` for failures found, fixes and resource measurements.

Browser acceptance builds and serves on port 3100 using temporary SQLite storage. It requires installed Chrome and Ollama serving `qwen3:4b-instruct`, and performs real local inference without OpenAI calls. Temporary screenshots/databases may disappear. These checks were rerun during the reliability rehearsal.

For physical phones, export the assigned private IPv4 address as `AIRL_DEMO_HOST`, run `npm run demo:setup`, build, then run `npm run demo:lan`. README.md has exact commands and iPhone trust instructions. Studio displays a same-origin QR code. Keep `npm run production:worker` running with the same database for crash recovery. The iPhone CA trust is user-confirmed. Screenshots show the HTTPS room page opened from Camera but stuck at Loading room / Connecting, including after the Vote shortcut appeared. Participant joining, voting and physical playback remain blocked. Direct API JSON and Play-button checks are pending user feedback. WebKit automation crashed at launch and native Safari automation was unavailable.

## Known issues and limitations

- One earlier real Critic run exceeded the 110-second deadline. Context/output compaction enabled subsequent passes. Long-session load, resource use and repeated-run durability still need measurement.
- Real Critic approval is verified. Rejection/revision control flow currently has deterministic-double coverage.
- HTTPS LAN transport and QR decoding are verified locally. The iPhone page opens but its room panel remains Loading room / Connecting. Direct API and JavaScript-execution checks are pending. Physical participant joining, voting and playback remain unverified. Default scripts bind to loopback; the dedicated demo launcher binds the configured private address. Broader accessibility QA and hosting remain pending.
- Clearing cookies creates another anonymous identity. Multi-room management, moderation and hardened hosted identity remain future work.
- Local scheduling depends on process lifetime and recovery workers. Supabase and Trigger.dev adapters remain pending.
- Video is a portrait browser composition using reusable pictograms and CSS scenes. MP4 rendering, generated artwork, audio and voice synthesis remain pending. Confirm Remotion commercial license eligibility before commercial hosting.
- Hosted OpenAI and real HTTPS BYOK remain unverified. Preserve explicit authorization gates and credential isolation.

## Next priorities

1. Diagnose the reported physical-iPhone voting failure, then verify camera QR joining, publication and playback. HTTPS transport and actual restart recovery have passed.
2. Run repeated local productions and measure failures, latency and memory under presentation conditions.
3. Perform a minimal Hosted OpenAI smoke test once credentials/model and explicit paid-call authorization are supplied. Verify real BYOK separately over HTTPS.
4. Complete keyboard, theme, caption and reduced-motion QA across mobile and desktop.
5. Choose hosted persistence/scheduling and media-export milestones according to demo needs and available resources.

Recommended next task is diagnosing the physical-iPhone room-loading failure, then finishing voting and device playback. Keep application changes scoped to rehearsal findings.
