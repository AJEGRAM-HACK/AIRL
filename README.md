# AIRL — Artificial In Real Life

**The real world is the prompt.**

AIRL Phase 1 builds on the existing CinemAI prototype. AIRL Live supplies the future shared community layer, CinemAI hosts stories, and PersonaAI owns reusable fictional character definitions. All public experiences currently use labeled sample data or deterministic scripts.

## Start locally

Use Node.js 24 LTS and npm.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. No API credentials are required. The current session also has a temporary runtime available with:

```sh
export PATH=/tmp/node-v24.22.2-darwin-arm64/bin:$PATH
```

Production and validation commands:

```sh
npm run test:production
npm run typecheck
npm run build
npm run start
```

## Routes and availability

| Route | Experience |
| --- | --- |
| `/` | AIRL homepage |
| `/discover` | Available modules and four coming-soon concepts |
| `/live` | Sample room directory |
| `/live/barangay-2099` | Local audience participation preview |
| `/studio` | Shared studio entry page |
| `/studio/barangay-2099` | Existing sample room control panel |
| `/cinemai` | Preserved CinemAI landing experience |
| `/cinemai/watch/barangay-2099` | Episode player and local choice preview |
| `/cinemai/universe/barangay-2099` | Fictional universe |
| `/persona` | Shared character directory |
| `/persona/captain-bot` | Captain Bot profile and scripted interaction |
| `/persona/tita-nena` | Tita Nena profile and scripted interaction |
| `/persona/kuya-taho` | Kuya Taho profile and scripted interaction |

Legacy `/watch/barangay-2099` and `/universe/barangay-2099` URLs remain functional. Unknown room, character and universe identifiers return 404. `/profile` is deferred with participant identity.

The audience player provides captioned 15-second illustrated storyboards with seeking and episode selection. Local choices reset on refresh. Studio counts are labeled seeded examples. Persona interactions use selectable scripted prompts and stay in browser memory. QuestAI, RemixAI, WorldForge and AIRL Memories are discoverable coming-soon concepts.

## Configuration

Copy `.env.example` to `.env.local` if changing defaults. Environment files and local databases are ignored by Git.

- `AI_PROVIDER=demo` is the server-side default. It requires no key and makes no network requests.
- `NEXT_PUBLIC_ENABLE_CINEMAI`, `NEXT_PUBLIC_ENABLE_PERSONA`, `NEXT_PUBLIC_ENABLE_AIRL_LIVE` default to enabled. Set a value to `false` to disable the corresponding module routes and navigation. Public flags are build-time settings and require a rebuild in production.
- Future-module flags are declared for later implementation. Their cards stay marked Coming soon.
- Flags control availability. Future operator authorization must be enforced server-side.

## Deterministic creative provider

```sh
npm run production -- "Launch a mandatory karaoke night"
npm run production -- inspect RUN_ID
```

The CLI prints “Demo-generated content · Simulated agent workflow”. It runs deterministic Director → Screenwriter → Visual Producer → Critic steps with shared Zod schemas. The winning-choice input changes script dialogue and manifest content. The critic validates three-scene structure, approved scene vocabulary and verbatim dialogue. Schema failures have at most two attempts. A critic rejection permits one revision before human review.

Demo jobs persist in `.data/airl-demo.sqlite`. Live jobs retain the existing `.data/cinemai.sqlite` path. `CINEMAI_DB_PATH` overrides the path. A non-destructive migration adds `execution_mode` to existing production records. Mode-specific episode history prevents demo results from entering live continuity. Timestamps, stage events, validation classifications and outputs are persisted. Demo templates add no canonical memories.

The public studio is a foundation shell. CLI jobs are inspected locally, while browser-connected jobs and Remotion output belong to later phases. SQLite is the existing local development adapter. Hosted persistence will require Supabase. There are no Supabase migrations or connections yet.

## Live AI readiness

The installed OpenAI Agents SDK adapter remains unverified against real API calls. To deliberately enable a live run after credits and authorization are available, set server-only `AI_PROVIDER=openai`, `OPENAI_API_KEY`, `OPENAI_MODEL`, and `AIRL_ALLOW_LIVE_REQUESTS=true`. No model identifier is assumed. All four agents share one OpenAI client and key. Model access is checked before inference. Do not expose credentials through public environment variables.

The CLI permits one active run per room. A killed process can leave a running row. Inspect it and confirm the original process has stopped before manual recovery. Durable job recovery is deferred to the Trigger.dev integration.

## Architecture and migration

- `src/lib/config` contains module metadata and public feature flags.
- `src/features/persona` owns structured profiles and scripted scenarios. `src/lib/fixtures.ts` re-exports the same character library for CinemAI and production compatibility.
- Shared profiles include world, identity, approved pictogram references, traits, motivations, voice, relationships, seeded canonical memories, character knowledge and conversation rules. Temporary scenario selection stays local. User interaction history is not persisted or merged into canon.
- `src/ai/providers` defines the typed creative provider interface, demo and OpenAI implementations, and an adapter for the existing workflow engine.
- `src/server/production` retains orchestration, schema validation and local persistence.
- `src/components/layout` and `src/components/shared` provide reusable platform presentation.
- `src/app/globals.css` centralizes platform tokens, responsive layouts and reduced-motion support. Existing original CSS world artwork and ISC-licensed Lucide pictograms are reused.

Phase 1 preserves CinemAI and introduces AIRL routes and provider boundaries. Phase 2 will introduce shared authenticated community participation, transactional voting and realtime totals. Phase 3 will connect closed rounds to persisted production and Remotion previews. Stop after Phase 1 for product-direction verification.

See [VERIFICATION.md](VERIFICATION.md) for actual checks and limitations.
