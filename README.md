# AIRL — Artificial In Real Life

**The real world is the prompt.**

AIRL is a creator-driven, community-powered AI entertainment platform. Creators build fictional universes and persistent characters. Communities shape story decisions, and four AI agents turn those decisions into episodes with human review and approved continuity.

## Current checkpoint

The preservation source branch is `checkpoint/pre-hackathon-ui-pivot-2026-11-12`, pinned to original HEAD `fc48254f74262756c6a630fd1b83aac26bc7467d`. Latest verified application code is `da763cfa502cc1570397133439ec1bb271151e7a`. Typecheck, production build, 38 unit tests and 13 production-browser cases passed for the expanded frontend sprint; a focused check also passed after final failure-copy clarification. Detailed evidence and historical results remain in VERIFICATION.md. Ignored databases/configuration require a separate backup. [Preservation record and procedure](docs/PRESERVATION_CHECKPOINT.md)

Hackathon UI/UX Optimization is authorized from preservation checkpoint `81e975e`. The first increment adds an Explore-led cinematic landing, simplified Home/Explore/Live navigation, permission-aware creation/profile access and visual universe discovery with local search and genre filters. Episodes and Characters remain contextual universe links, all legacy routes remain available, and Manila Journey is preserved. The expanded sprint unifies universe lore/cast, mobile voting, recorded four-stage progress, episode reveal and existing creator Studio with subtle violet styling. Advanced provider/raw event detail is disclosed when needed. Backend APIs, schemas, authentication and providers are unchanged. [Screen report, changed files and real browser screenshots](docs/HACKATHON_UI_REPORT.md). [UI strategy](docs/UI_UX_PIVOT.md), [phase roadmap](docs/REDESIGN_ROADMAP.md)

## Unified frontend

The public interface now uses a dark-first editorial theme and a minimal Explore / Live / Profile header, with the AIRL wordmark returning home. The rebuilt landing presents the required product story, Explore Universes / Join Live actions and the official universe. Existing creator tools share a responsive Dashboard at the retained `/studio` URLs; owner/admin permissions are unchanged. Theme choices and the contextual Journey mode switch remain available in the footer. Public story questions use the local provider default; advanced provider settings remain in protected creator tools and Journey. [Complete screen/feature map, screenshots, checks and rollback](docs/UNIFIED_FRONTEND_REPORT.md).

## Working capabilities

- AIRL Live provides session-bound community voting, persistent rounds and SSE updates.
- CinemAI connects a winning vote to Director → Screenwriter → Visual Producer → Critic, typed outputs, a versioned preview, protected review and transactional episode/canon publication.
- PersonaAI provides scoped character profiles, relationships, approved memories and episode-scoped story questions with source links.
- Profiles start as viewers. Admin-granted creators manage owned private/public universes. Official Barangay 2099 canon requires an admin.
- Remotion browser playback supports seek, captions, transcripts and repeat replay. The labeled saved-episode path performs zero inference.
- Demo runs offline. Local Ollama is verified. Hosted OpenAI and HTTPS request-only BYOK have guarded adapters, with actual paid validation pending.

Media is currently a silent animated portrait composition using reusable original story content, approved CSS backgrounds and Lucide character pictograms. Reference-image storage/linking exists, while custom artwork rendering, generated voices and MP4 export remain future work.

## Local setup

Use Node.js 24 LTS and npm. Reuse the existing dependency installation. On a fresh checkout, install the pinned dependencies with `npm ci`. Check `node --version` before starting. The temporary development runtime, when present, can be selected with the following command.

```sh
export PATH=/tmp/node-v24.22.2-darwin-arm64/bin:$PATH
```

Install Ollama separately if needed, start its local service, and ensure the exact selected model is installed. Run `ollama serve` only if a service is not already listening. Ollama must remain on loopback.

```sh
ollama list
# Only if the selected model is missing
ollama pull qwen3:4b-instruct
npm run dev
```

Open `http://127.0.0.1:3000`. `AI_PROVIDER=ollama` with `OLLAMA_MODEL=qwen3:4b-instruct` is the default. Demo needs no model or key. `AI_PROVIDER=demo` selects offline CLI generation, and Studio has an explicit provider selector. Journey live generation stays on Ollama. Module flags in `src/lib/config/features.ts` control availability independently from authorization. The future WorldForge flag does not disable implemented owned universes.

Copy `.env.example` to ignored `.env.local` only when changing configuration. Keep credentials server-side. Hosted OpenAI requires a server key/model, enabled paid gate and explicit operation consent. BYOK credentials stay in page/request memory and never enter background jobs. Supabase/Trigger placeholders in the example are planned integrations. [Current architecture and provider boundaries](ARCHITECTURE_PLAN.md)

## Routes and operating the demo

`/` is everyday Explore. `/platform` is its alias. `/universes` discovers public worlds. `/live/[id]` is the audience phone route. `/journey?universe=barangay-2099` is the separate presenter experience. Universe episode and character routes carry scoped content. Existing CinemAI, PersonaAI, watch and universe deep links remain available.

Sign up at `/account`. Accounts start as viewers. Use the trusted local `npm run account:admin -- your-email@example.com` bootstrap when an initial admin is needed. Admins grant creator access in `/studio`. `/studio/worlds/[id]` manages owned worlds and `/studio/[roomId]` operates production. Unauthorized Studio pages return 404 and APIs retain independent role/ownership checks.

The approved hackathon setup uses the Mac, SQLite, local Ollama and an ngrok public HTTPS web tunnel for up to 35 viewers. `npm run demo:tunnel` starts the web upstream and recovery worker with paid hosted calls disabled. Build first with presentation servers stopped. The local-network certificate path remains a fallback. [Complete presenter launch, review, fallback and LAN instructions](PRESENTER_RUNBOOK.md)

SQLite defaults to ignored `.data/airl-live.sqlite`. The web app and recovery worker must share its path. `CINEMAI_DB_PATH` can override standalone CLI storage. Use `npm run production:worker` for a separate local recovery worker or `npm run production:drain` for one pass. The tunnel launcher includes its worker. The local scheduler and filesystem are current demo dependencies. [Backup and isolated restore procedure](docs/PRESERVATION_CHECKPOINT.md)

## Verification commands

Run these for a future application change with the presentation stopped. Browser tests rebuild `.next`, use installed Chrome and include actual local Ollama. The harness uses a temporary SQLite default only when `AIRL_LIVE_DB_PATH` is unset. Set an explicit disposable path to avoid inheriting the demo database. They require `qwen3:4b-instruct`. Paid OpenAI requests are excluded.

```sh
npm run typecheck
npm test
npm run build
AIRL_LIVE_DB_PATH="/tmp/airl-browser-rehearsal-$(date +%s)-$$.sqlite" AIRL_ALLOW_LIVE_REQUESTS=false npm run test:browser
```

For documentation-only work, use Git diff, link/command checks and preservation validation. The fixed-input benchmark and 35-session rehearsal have separate commands and consume local/public resources. Their recorded results and failure limits remain in [VERIFICATION.md](VERIFICATION.md) and [benchmarks/README.md](benchmarks/README.md).

## Documentation map

| Document | Owns |
| --- | --- |
| [AGENTS.md](AGENTS.md) | Session scope, preservation, security and verification conventions |
| [HANDOFF.md](HANDOFF.md) | Current status and continuation instructions |
| [ARCHITECTURE_PLAN.md](ARCHITECTURE_PLAN.md) | Actual runtime, APIs and future hosted options |
| [VERIFICATION.md](VERIFICATION.md) | Observed outcomes and historical limits |
| [PRESERVATION_CHECKPOINT.md](docs/PRESERVATION_CHECKPOINT.md) | Checkpoint, inventory, audit and backup/restore procedure |
| [PRODUCT_VISION.md](docs/PRODUCT_VISION.md) | Vision, audiences and judging criteria |
| [UI_UX_PIVOT.md](docs/UI_UX_PIVOT.md) | Proposed minimalist experience and navigation |
| [UNIVERSE_MODEL.md](docs/UNIVERSE_MODEL.md) | Current schema mappings, ownership and proposed extensions |
| [HACKATHON_MVP.md](docs/HACKATHON_MVP.md) | Credible three-minute presentation and reliability target |
| [REDESIGN_ROADMAP.md](docs/REDESIGN_ROADMAP.md) | Review gates and incremental implementation phases |
| [PRESENTER_RUNBOOK.md](PRESENTER_RUNBOOK.md) | Current launch and operation procedure |
| [CHANGELOG.md](CHANGELOG.md) | Existing implementation history |
