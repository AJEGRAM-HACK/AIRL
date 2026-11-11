# AIRL — Artificial In Real Life

**The real world is the prompt.**

AIRL combines community participation, fictional characters and creative production in one Next.js application. AIRL Live owns voting, CinemAI owns episodes, and PersonaAI supplies the shared characters of Barangay 2099.

The current local milestone connects real votes to a persisted deterministic production job, operator review and a portrait Remotion preview. Existing hosted OpenAI, request-scoped BYOK and local Ollama adapters remain available through creator settings and the CLI.

For system design, data ownership, migration options and candidate routes, read [ARCHITECTURE_PLAN.md](ARCHITECTURE_PLAN.md). Actual test outcomes and verification limits are recorded in [VERIFICATION.md](VERIFICATION.md).

## Run locally

Use Node.js 24 LTS and npm. No credentials are required for Demo mode or community participation.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. The temporary runtime used in this development session is available through:

```sh
export PATH=/tmp/node-v24.22.2-darwin-arm64/bin:$PATH
```

Install Node 24 normally for ongoing work because files under `/tmp` can disappear.

## Demonstrate the community loop

1. Open `/live/barangay-2099` in a normal window and a separate browser profile or private window.
2. Join the room and cast a vote from each session. Aggregated results stream through the local server.
3. Open `/studio/barangay-2099`, join and unlock operator access. Generate a one-time code in your own terminal with `npm run live:operator` and enter it in the studio.
4. Choose Close voting & produce. The winner is frozen and one Demo job is persisted for the round. The response schedules local execution using Next.js `after`.
5. Inspect the production panel for actual stage timestamps, attempts and critic feedback. A successful draft enters review.
6. Choose Approve & publish. The audience's Community episodes panel receives the published manifest and can play the new composition. Rejected drafts remain private.
7. Start next round when ready. Existing votes and published episodes remain in storage.

Anonymous identities belong to sessions. Clearing cookies can create another identity. Ties, including an empty round, use displayed option order. Votes, closure, queued jobs and publication have database-backed idempotency protections.

## Worker and recovery

Room jobs use the existing local Live database. The default runner explicitly selects Demo and requires no AI credits. Job states are queued, running, review, failed, published and rejected. Stage-level schema retries and one critic revision are bounded. Operators can retry failed room jobs up to three production attempts.

If a process stops before an `after` callback completes, recover persisted work with:

```sh
# Execute one available job
npm run production:drain

# Poll for queued work and expired claims until interrupted
npm run production:worker
```

Worker claims are serialized and have a bounded lease. Completed drafts are reused during recovery. An interrupted inference may need another attempt, while published episodes remain protected by unique run references and transactional publication. This local scheduler is limited by process lifetime. Trigger.dev remains the planned hosted durable execution adapter.

## Main routes

| Route | Experience |
| --- | --- |
| `/` | AIRL homepage |
| `/discover` | Available modules and coming-soon concepts |
| `/live` | Room directory |
| `/live/barangay-2099` | Voting, streamed results and published community episodes |
| `/studio` | Studio entry and provider settings link |
| `/studio/barangay-2099` | Room controls, job events, review and publication |
| `/studio/ai` | Creator-protected provider tests and previews |
| `/cinemai` | CinemAI landing page |
| `/cinemai/watch/barangay-2099` | Existing storyboards and shared community panel |
| `/cinemai/universe/barangay-2099` | Fictional universe |
| `/persona` | Shared character library |
| `/persona/captain-bot` | Character profile, scripted scenarios and AI conversation entry |
| `/persona/tita-nena` | Tita Nena profile |
| `/persona/kuya-taho` | Kuya Taho profile |

Legacy `/watch/barangay-2099` and `/universe/barangay-2099` routes remain available. Unknown IDs return 404. The architecture plan distinguishes implemented routes from proposed series, episode, job, moderation, asset and account routes.

## AI modes

| Mode | Behavior | Verification |
| --- | --- | --- |
| `demo` | Offline deterministic templates and scripted replies | Unit and HTTP workflows tested |
| `ollama` | Server-only local inference using installed-model discovery | Real `qwen3:4b-instruct` inference and four-stage pipeline tested |
| `hosted_openai` | Server key, configured model and explicit consent | Awaiting application credentials and authorized live test |
| `creator_byok` | Creator's OpenAI key in page/request memory | Mocked key-isolation and security rejection tests passed. Real HTTPS inference pending |

`AI_PROVIDER=demo` is the safe CLI default. The legacy `openai` identifier maps to `hosted_openai`. Automatic room production currently uses Demo independently of provider preview selection. It does not use creator keys or automatically make paid requests.

```sh
npm run production -- "Ban Monday meetings"
AI_PROVIDER=ollama OLLAMA_MODEL=qwen3:4b-instruct npm run production -- "Ban Monday meetings"
npm run production -- inspect RUN_ID
```

Use the exact model name returned by your Ollama installation. A hosted function cannot reach the Mac's loopback Ollama endpoint. The adapter rejects Vercel execution and serializes local inference through a shared lease.

## Provider settings and security

Creator settings currently reuse the local operator role. Join and unlock the room studio, then open `/studio/ai`. Test connection performs a real structured character inference for the selected model. A successful Demo test is labeled deterministic.

BYOK requires HTTPS, same-origin requests, authenticated creator access and explicit paid-request consent. Plain HTTP localhost rejects BYOK. Keys stay in page/request memory, clear when disconnected or the provider changes, and never enter cookies, web storage, URLs, logs, usage records or background jobs. Hosted OpenAI additionally requires server environment enablement. Providers never silently fall back.

Gateway previews use request-local memory and do not publish canon. CLI production and room production persist artifacts according to their separate review/publication paths. Usage records contain creator-scoped metadata, timestamps, reported tokens, sanitized failures and optional estimates rather than prompts or keys. Cloud trace export is disabled by default.

## Configuration and storage

Copy `.env.example` to ignored `.env.local` only when changing defaults. Never commit real credentials.

- Module flags in `src/lib/config/features.ts` control availability, independently of authorization. Public flag changes require a production rebuild.
- `AIRL_LIVE_DB_PATH` defaults to `.data/airl-live.sqlite`. The web app, operator CLI and recovery worker must use the same path.
- The shared Live database also stores room jobs, drafts, publication records and room story memory. Existing mode-specific CLI databases remain intact.
- `CINEMAI_DB_PATH` optionally changes the standalone production CLI database.
- `AIRL_AI_REQUEST_TIMEOUT_MS`, `AIRL_AI_MAX_OUTPUT_TOKENS` and `OLLAMA_CONTEXT_WINDOW` configure bounded inference limits.
- `AIRL_AI_DAILY_REQUEST_LIMIT` caps creator requests. Optional model rates and estimated daily spend reservations provide approximate budget gating. Provider-side billing controls remain authoritative.
- Hosted OpenAI requires `OPENAI_API_KEY`, `OPENAI_MODEL` and `AIRL_ALLOW_LIVE_REQUESTS=true`, plus explicit request consent in the gateway.

SQLite uses Node 24's built-in implementation and needs a persistent writable filesystem. Supabase Auth/PostgreSQL/RLS/Realtime/Storage remains the intended hosted integration. Vercel's ephemeral filesystem cannot serve as the shared production database.

## Media and themes

New manifests play through Remotion at 720 × 1280 and 30 FPS. The default Demo composition lasts 18 seconds across three scenes. It uses approved CSS backgrounds, reusable Lucide character pictograms, camera/entrance presets, timed captions, transcript access and reduced-motion handling. Asset IDs and animations are validated enums. Model output cannot execute code or choose filesystem paths.

Legacy storyboard fixtures remain labeled and available. MP4 export, audio, voice synthesis and higher-resolution artwork remain later milestones.

Remotion packages are pinned to matching versions for this local evaluation. Confirm license eligibility before commercial hosting. Its documented free-license criteria include noncommercial evaluation. [Remotion license FAQ](https://www.remotion.dev/docs/license/faq)

The Color theme selector supports System, Light and Dark, preserves preference locally and responds to system changes. Browser visual QA remains pending if the computer-use host is unavailable.

## Tests and production build

```sh
npm run test:production
npm run test:live
npm run test:providers
npm run test:room-production
npm run typecheck
npm run build
npm run start
```

Queue tests cover one job per round, private review drafts, idempotent publication, rejection, lease recovery, bounded retries and invalid media rejection. Media tests verify scene boundaries, timing, asset references and selected-choice content. These checks do not replace real-browser playback and accessibility testing.

## Next development milestones

1. Complete browser playback, mobile voting, keyboard, caption and theme QA.
2. Migrate shared data and identity to Supabase with transaction and RLS tests.
3. Move hosted scheduling to durable jobs with renewable leases and an outbox.
4. Add QR access, room management, deadlines and moderation for audience suggestions.
5. Extend approved art and implement bounded MP4/audio export after license and performance verification.

QuestAI, RemixAI, WorldForge and AIRL Memories remain discoverable Coming Soon entries. The architecture plan records possible routes and the prerequisites for each.
