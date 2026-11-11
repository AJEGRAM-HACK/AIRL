# AIRL — Artificial In Real Life

**The real world is the prompt.**

AIRL builds on the existing CinemAI prototype. Phase 2 adds shared local community voting and persistent color themes. AIRL Live supplies the future shared community layer, CinemAI hosts stories, and PersonaAI owns reusable fictional character definitions. Episode media and character conversations use labeled sample data or deterministic scripts. Community votes are persisted by the local server.

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
| `/live/barangay-2099` | Shared audience voting |
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

The audience player provides captioned 15-second illustrated storyboards with seeking and episode selection. Community votes persist across page reloads. The studio shows real room voting alongside labeled production examples. Persona interactions use selectable scripted prompts and stay in browser memory. QuestAI, RemixAI, WorldForge and AIRL Memories are discoverable coming-soon concepts.

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

Phase 1 preserves CinemAI and introduces AIRL routes and provider boundaries. Phase 2 supplies shared local community participation, transactional voting and streamed totals. Phase 3 will connect closed rounds to persisted production and Remotion previews.

See [VERIFICATION.md](VERIFICATION.md) for actual checks and limitations.


## Shared local voting and operator access

Open `/live/barangay-2099` in two separate browser profiles or a normal and private window. Each participant chooses Join room, then casts one vote. Totals stream to the audience and room studio through Server-Sent Events. The server snapshots SQLite once per second and reconnects streams periodically. Each session can record one immutable vote per round. Retrying the same vote is idempotent.

Open `/studio/barangay-2099` for the live community panel. Join the room and generate a one-time operator code in your local terminal:

```sh
npm run live:operator
```

Enter the code in the studio's operator form. Codes expire after ten minutes and are consumed on use. The server rotates the session token and grants an eight-hour operator session. Close voting & finalize winner selects the option with the most votes. Ties, including an empty round, select the first tied option in displayed order. Start next round preserves prior votes and creates a fresh round. Both operations tolerate retries. Production handoff remains pending Phase 3.

Local data lives in ignored `.data/airl-live.sqlite`. Set server-only `AIRL_LIVE_DB_PATH` to change it. The server and operator CLI must use the same path. This adapter uses the existing Node 24 SQLite dependency and needs a writable persistent filesystem. Hosted Vercel execution requires a Supabase adapter and anonymous-auth integration, which are pending credentials. Current room support is limited to Barangay 2099.

Session tokens are random, hashed in storage, and sent in HttpOnly, SameSite=Strict cookies. Identity and operator roles come from server records. Mutations require same-origin requests. The database enforces a unique participant vote per round and uses immediate transactions to serialize voting, closure and round creation. Session creation, voting and operator login have persisted rate limits. Aggregate streams expose counts without participant tokens or individual votes. Joined-session counts are cumulative for this local room. Anonymous sessions can be recreated by clearing cookies, so they do not establish unique real-world people.

```sh
npm run test:live
```

## Light and dark themes

Use Color theme in the navigation to choose System, Light or Dark. The selection persists in local storage, follows system appearance changes when set to System, and synchronizes across tabs. A small pre-paint script applies the selected theme before hydration. Semantic tokens control platform surfaces, typography, borders and accents. Illustrated scene media retains a cinematic palette. No account or credentials are needed.

## Multi-provider gateway

The updated provider gateway preserves the AIRL UI, shared voting, light/dark themes, character definitions and production engine. Its registry is `src/ai/providers/registry.ts`. Four modes are available in `/studio/ai`.

| Mode | Credential and execution behavior | Verified status |
| --- | --- | --- |
| `demo` | Deterministic local templates, zero network inference | PASS offline tests and HTTP pipeline |
| `ollama` | Server-only loopback, installed-model discovery, shared local inference lease | PASS real `qwen3:4b-instruct` character inference and four-stage CLI workflow |
| `hosted_openai` | Server key, configured model, environment authorization and explicit request consent | BLOCKED pending application credentials and authorized live test |
| `creator_byok` | Request-scoped OpenAI key, creator access, HTTPS and explicit request consent | PASS mocked credential-isolation tests and HTTP security rejection. Live inference NOT TESTED |

Existing `AI_PROVIDER=openai` settings remain compatible as an alias for `hosted_openai`. No provider silently falls back to another provider. Model identifiers come from configuration or the actual Ollama installed-model response. No additional dependencies were introduced.

### Creator access and usage

1. Open the room studio, join the room, and unlock operator access using `npm run live:operator` as described above. This local operator role currently also grants creator access.
2. Open `/studio/ai`, select a mode and model, and explicitly test the connection. A successful connection test includes structured character inference.
3. Run a four-stage workflow preview or a character conversation. PersonaAI profile pages link to this interface with the selected character.
4. Inspect usage metadata and actual timestamped stage events. Generated manifests can be viewed through the existing illustrated storyboard player. This is a 15-second storyboard preview. Remotion rendering remains pending.

The settings-page workflow uses an in-memory production store and returns a preview. It does not publish canon. The CLI continues to persist approved production results and character memory to mode-specific local databases. The settings gateway persists usage metadata in the existing local Live database, including owner, provider, model, operation, status, timestamps, token counts when reported, optional cost estimate and sanitized failure code. It excludes request bodies, prompt text and keys.

The daily request cap defaults to 20 per creator session. `AIRL_AI_DAILY_ESTIMATED_USD_LIMIT` optionally gates additional paid requests using recorded cost estimates and a configurable reservation for pending or unknown-cost requests. Configure the input/output model rates and reservation conservatively. Estimates and reservations can differ from provider invoices, especially when a request fails after partial usage. Provider-side spend controls remain authoritative for account billing.

`AIRL_AI_REQUEST_TIMEOUT_MS` is bounded to 1–110 seconds and `AIRL_AI_MAX_OUTPUT_TOKENS` to 256–4000. Ollama context is bounded to 4096–8192 tokens. Local inference uses sequential calls, temperature zero, one shared inference lease and a fixed loopback endpoint. Vercel mode explicitly rejects this localhost provider.

### BYOK security

Creator keys stay in React memory while the settings page is active and in the protected request's server memory. Disconnect clears the page credential and aborts the active request. Changes to provider clear the key. Keys are never placed in cookies, web storage, URLs, databases, usage events or job payloads. The backend checks creator identity, same-origin requests, size limits, rate limits, consent and HTTPS. Plain HTTP localhost rejects BYOK. Demo and Ollama work on the existing local HTTP development server.

The hosted OpenAI and creator adapters use the installed Agents SDK, the same typed output schemas, bounded SDK calls and disabled cloud tracing. Anthropic, Gemini and background BYOK execution remain future extensions. The BYOK isolation test uses a mocked transport with synthetic credentials and a forced 401. A real creator-key request still needs authorized verification over HTTPS.

### Local commands

```sh
# Defaults to the deterministic provider
npm run production -- "Ban Monday meetings"

# Use the exact installed Ollama model name verified on this machine
AI_PROVIDER=ollama OLLAMA_MODEL=qwen3:4b-instruct npm run production -- "Ban Monday meetings"

npm run test:providers
npm run test:production
npm run test:live
npm run typecheck
npm run build
```

Next milestone is connecting a finalized audience round to a persistent production job and playable output in the room. Hosted Supabase/RLS, Trigger.dev, QR access, submission moderation, voting deadlines, Remotion/export and browser visual QA remain pending. A live paid-provider smoke test requires explicit approval.

The adapters follow [official OpenAI agent definitions](https://developers.openai.com/api/docs/guides/agents/define-agents) and the [Ollama chat API](https://docs.ollama.com/api/chat).
