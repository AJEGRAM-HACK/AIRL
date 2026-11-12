# AIRL project conventions

The November 12 audio follow-up additionally authorizes episode audio playback, published-story next-episode suggestions, the additive routes needed for those features, and one complete seeded-premise demo video with paid API usage capped at $6 for that run. Use isolated acceptance databases. Future paid operations continue to require the existing explicit consent and server gates. This exception supersedes the frontend-only API restriction below for these requested features.

## Scope
The active task is the user-authorized Hackathon UI/UX Optimization phase, starting from preservation checkpoint `81e975e`. The expanded user brief authorizes frontend refinement of the design system, landing/navigation, discovery/universe detail, live voting, recorded production timeline, episode reveal and existing creator Studio. Work incrementally; preserve the separate Journey flow. The latest user brief authorizes a shared blue theme across Explore and Journey, plus a lightweight 3D presentation. Preserve the existing accounts, creator-owned universes, scoped cast/canon, voting, four-stage jobs, providers, review, publication and Manila Journey. Do not change database schemas, backend APIs, authentication policy, AI providers or infrastructure. No paid API calls, deployment or remote pushes are authorized. Use explicit isolated databases for acceptance.

AIRL is a creator-driven, community-powered AI entertainment platform. The real world is the prompt. Product decisions support UI/UX, Community, Agent Use or Creative Content. Read docs/PRESERVATION_CHECKPOINT.md and docs/REDESIGN_ROADMAP.md with the existing handoff/architecture/verification documents before continuing.

Preserve other people's working-tree changes in place. Never silently stash or commit their work. Keep the checkpoint branch pinned, retain ignored databases/media/private configuration, and use the documented private backup procedure before future migrations. Avoid replacement scaffolds, dependency reinstall/upgrade, resets, force-pushes and unnecessary rebuilding. Keep all fixture and deterministic Demo labels accurate.

## Architecture
- One Next.js App Router repository, TypeScript strict mode, npm, Node.js 24 LTS.
- Routes live in src/app; reusable interactive components in src/components.
- src/lib/domain.ts owns current world/account/canon Zod contracts and retained UI-facing compatibility ports. src/server/production/schemas.ts owns current production artifacts. Follow actual contracts rather than legacy UI port status labels.
- src/lib/fixtures.ts owns validated seeded data. These are not database records.
- Components use the shadcn/ui Button pattern (Radix Slot, CVA, cn) and Lucide icons.
- Tailwind v4 is installed; globals.css owns the cinematic design system and responsive layouts.
- Server route wrappers validate universe visibility and ownership, returning 404 for unknown or inaccessible identifiers.
- Existing Agents SDK, Ollama and Remotion adapters retain explicit server/client boundaries. Supabase and Trigger.dev remain proposed hosted adapters.
- Derive UI permissions through src/server/platform/page.ts and src/components/platform/access.tsx. Hide unavailable viewer controls and guard Studio pages server-side. Preserve independent API authorization.

## Security and boundaries
No secrets in source or client bundles. Ignore environment files except .env.example. No paid provisioning, external pushes, or deployment without authorization. Enforce account roles, universe ownership, private access and official-admin publication server-side. Participants use opaque server-side sessions; never trust client identity claims.

## Verification
For application changes, run npm run typecheck, npm run build and npm test. Start npm run start and check public routes plus unknown/private-room 404 behavior. Verify Studio with authorized and unauthorized sessions. Browser QA includes mobile/desktop layouts, playback/captions, episode selection, voting, Studio and keyboard focus. Respect reduced motion. Use meaningful regression coverage.

For documentation-only work, use scoped diff/link/command checks and source/data preservation checks. Do not rebuild .next, restart services, run migrations or rerun inference solely for documentation edits. Record which application tests were not rerun. Historical results remain tied to their tested application commits.

## Changes
Preserve existing work. Record checks and limitations honestly. Checkpoint logical milestones if Git is available. Do not commit credentials, dependencies or build artifacts.

## Local production slice
Server-only code lives in src/server/production and is invoked through the CLI and persisted room jobs. SQLite requires the Mac’s persistent filesystem. Vercel hosting needs a persistence migration. Keep its data ignored. Run npm run test:production; doubles prove orchestration only, never actual OpenAI operation. A live run must use configured credentials and model, and complete all four stages before being reported operational.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## AIRL foundation
AIRL is the platform. CinemAI is a module. PersonaAI owns shared character definitions in src/features/persona/characters.ts, re-exported from fixtures for compatibility. AI_PROVIDER defaults to ollama with qwen3:4b-instruct. Demo uses deterministic templates with accurate labels and zero network calls. Hosted OpenAI and BYOK require credentials, a model and explicit paid-operation consent. Local Ollama uses its configured installed model and requires no API key. Keep provider configuration server-only. Feature flags in src/lib/config/features.ts control module availability, never authorization. Preserve legacy CinemAI URLs. New design tokens stay in globals.css.

## Provider gateway
Use src/ai/providers/registry.ts for provider selection. Preserve legacy AI_PROVIDER=openai as a hosted_openai alias. Never fall back between providers. BYOK keys exist only in page/request memory, require HTTPS and account authentication, with creator privileges for generation, and never enter jobs, usage tables, logs or storage. Paid model tests require explicit consent. Ollama is server-side loopback only, rejects Vercel, and uses the installed model list. Keep all cloud tracing disabled by default.

## Integrated room production
The integrated room pipeline connects closed rounds to persisted provider-selected jobs, review, publication, approved canonical memory and Remotion previews. Room jobs share AIRL_LIVE_DB_PATH with voting so enqueue and publication remain transactional. The integration sprint authorizes Demo and local Ollama room jobs. Hosted OpenAI jobs require explicit per-round consent and enabled server credentials. BYOK keys never enter jobs. Preserve ARCHITECTURE_PLAN.md as the current/proposed architecture and route inventory, and update README.md when runnable behavior changes. docs/UNIVERSE_MODEL.md maps current contracts to proposed extensions, docs/UI_UX_PIVOT.md owns proposed navigation, and docs/REDESIGN_ROADMAP.md owns implementation phase scope. VERIFICATION.md remains the observed evidence source and PRESENTER_RUNBOOK.md owns launch procedures.

## Acceptance testing
For approved application acceptance, set AIRL_LIVE_DB_PATH explicitly to a fresh temporary database and AIRL_ALLOW_LIVE_REQUESTS=false before npm run test:browser. Its default uses ||= and can inherit the live path. Use isolated production-build Chrome acceptance with two participant contexts and an operator. Tests exercise viewer/creator/admin visibility and ownership, sign-in/sign-out, actual playback, repeated seeking/replay, captions, publication and Ollama memory propagation. Stop the demo before rebuilding .next for browser acceptance. The latest verified application checkpoint is da763cfa502cc1570397133439ec1bb271151e7a, with 38 unit tests and 13 browser cases passing (plus a focused post-copy-change check). Fresh physical-device checks for this frontend increment remain open. See VERIFICATION.md for dated results. Use npm run test:sprint for atomic review races and canonical memory regression tests. Never run paid inference from acceptance tests.

## Journey presentation
Explore at / is the everyday entry. /platform remains an alias. Journey at /journey has independent full-screen chrome and shares existing persisted state. Use the shared blue semantic tokens from globals.css, the shared Light/Dark/System preference and the local Schibsted Grotesk font. Keep Journey layout and spatial presentation scoped in journey.css. Keep chapters presenter-controlled, animate actual event handoffs, and show one validated artifact at a time. Cast/transcript/review sheets must wrap Tab focus, close with Escape and restore focus. Respect reduced motion. Preserve universe, round and episode context through the mode switch and query parameters. Journey uses qwen3:4b-instruct for live production. Saved rehearsal playback must read an approved stored episode with no inference and retain live-job visibility. All audience QR codes target /live/[id]. Keep draft/review controls permission-based and official publication admin-only. Hosted preparation uses existing Studio consent and server gates, with live paid validation requiring explicit approval. Follow PRESENTER_RUNBOOK.md and record physical-device results separately from emulation.
