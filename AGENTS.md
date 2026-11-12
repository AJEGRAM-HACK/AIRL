# AIRL project conventions

## Scope
The authoritative updated directive authorizes foundation and multi-provider integration, including multi-universe profiles/permissions, worlds, canon, story retrieval, Demo, local Ollama, Hosted OpenAI and session-only BYOK. Paid requests require explicit approval. Keep SQLite for this milestone. The ngrok hackathon tunnel for up to 35 viewers is authorized and implemented. Always-on hosted infrastructure requires separate authorization. The local production slice remains available. Fixture interactions must stay labeled. Never fabricate successful jobs or logs.

## Architecture
- One Next.js App Router repository, TypeScript strict mode, npm, Node.js 24 LTS.
- Routes live in src/app; reusable interactive components in src/components.
- src/lib/domain.ts owns shared Zod schemas and future integration ports.
- src/lib/fixtures.ts owns validated seeded data. These are not database records.
- Components use the shadcn/ui Button pattern (Radix Slot, CVA, cn) and Lucide icons.
- Tailwind v4 is installed; globals.css owns the cinematic design system and responsive layouts.
- Server route wrappers validate universe visibility and ownership, returning 404 for unknown or inaccessible identifiers.
- Existing Agents SDK, Ollama and Remotion adapters retain explicit server/client boundaries. Supabase and Trigger.dev remain proposed hosted adapters.
- Derive UI permissions through src/server/platform/page.ts and src/components/platform/access.tsx. Hide unavailable viewer controls and guard Studio pages server-side. Preserve independent API authorization.

## Security and boundaries
No secrets in source or client bundles. Ignore environment files except .env.example. No paid provisioning, external pushes, or deployment without authorization. Enforce account roles, universe ownership, private access and official-admin publication server-side. Participants use opaque server-side sessions; never trust client identity claims.

## Verification
Run npm run typecheck and npm run build. Run npm test. Start npm run start and check public routes plus unknown/private-room 404 behavior. Verify Studio routes with authorized and unauthorized sessions, including viewer 404 responses. Browser QA should include mobile and desktop layouts, playback/captions, episode selection, choice/reset behavior, studio tabs and keyboard focus. Respect reduced motion. Do not add tests that merely mirror CSS or low-impact markup.

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
The integrated room pipeline connects closed rounds to persisted provider-selected jobs, review, publication, approved canonical memory and Remotion previews. Room jobs share AIRL_LIVE_DB_PATH with voting so enqueue and publication remain transactional. The integration sprint authorizes Demo and local Ollama room jobs. Hosted OpenAI jobs require explicit per-round consent and enabled server credentials. BYOK keys never enter jobs. Preserve ARCHITECTURE_PLAN.md as the current/proposed architecture and route inventory, and update README.md when runnable behavior changes.

## Acceptance testing
Use npm run test:browser for isolated production-build Chrome acceptance with two participant contexts and an operator. Tests exercise viewer/creator/admin visibility and ownership, sign-in/sign-out, actual playback, repeated seeking/replay, captions, publication and Ollama memory propagation. Stop the demo before rebuilding .next for browser acceptance. The latest verified application checkpoint is 05e1542bcf02d191c07eee5e8e98a82915399125, with 38 unit tests and eight browser cases passing. See VERIFICATION.md for dated results. Use npm run test:sprint for atomic review races and canonical memory regression tests. Never run paid inference from acceptance tests.

## Journey presentation
Explore at /platform and Journey at /journey share existing persisted state. Preserve universe, round and episode context through the mode switch and query parameters. Journey uses qwen3:4b-instruct for live production. Saved rehearsal playback must read an approved stored episode with no inference and retain live-job visibility. All audience QR codes target /live/[id]. Keep draft/review controls permission-based and official publication admin-only. Hosted preparation uses existing Studio consent and server gates, with live paid validation requiring explicit approval. Follow PRESENTER_RUNBOOK.md and record physical-device results separately from emulation.
