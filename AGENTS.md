# AIRL project conventions

## Scope
The authoritative updated directive authorizes foundation and multi-provider integration, including Demo, local Ollama, Hosted OpenAI and session-only creator BYOK. Paid requests require explicit approval. Shared local voting uses the existing SQLite adapter until hosted Supabase credentials are available. The local production slice remains available. Fixture interactions must stay labeled. Never fabricate successful jobs or logs.

## Architecture
- One Next.js App Router repository, TypeScript strict mode, npm, Node.js 24 LTS.
- Routes live in src/app; reusable interactive components in src/components.
- src/lib/domain.ts owns shared Zod schemas and future integration ports.
- src/lib/fixtures.ts owns validated seeded data. These are not database records.
- Components use the shadcn/ui Button pattern (Radix Slot, CVA, cn) and Lucide icons.
- Tailwind v4 is installed; globals.css owns the cinematic design system and responsive layouts.
- Server route wrappers validate the known room/universe and return 404 for unknown identifiers.
- Add future Supabase, Agents SDK, Trigger.dev and Remotion adapters behind explicit server/client boundaries, only when in scope.

## Security and boundaries
No secrets in source or client bundles. Ignore environment files except .env.example. No paid provisioning, external pushes, or deployment without authorization. Future operator authorization must be server-side and role based. Future participants must use authenticated anonymous sessions; never trust client identity claims.

## Verification
Run npm run typecheck and npm run build. Start npm run start and check /, /watch/barangay-2099, /studio/barangay-2099, /universe/barangay-2099 plus unknown-room 404 behavior. Browser QA should include mobile and desktop layouts, playback/captions, episode selection, choice/reset behavior, studio tabs and keyboard focus. Respect reduced motion. Do not add tests that merely mirror CSS or low-impact markup.

## Changes
Preserve existing work. Record checks and limitations honestly. Checkpoint logical milestones if Git is available. Do not commit credentials, dependencies or build artifacts.

## Local production slice
Server-only code lives in src/server/production and is invoked through the local CLI. SQLite is a local development adapter, not Vercel persistence. Keep its data ignored. Run npm run test:production; doubles prove orchestration only, never actual OpenAI operation. A live run must use configured credentials and model, and complete all four stages before being reported operational.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## AIRL foundation
AIRL is the platform. CinemAI is a module. PersonaAI owns shared character definitions in src/features/persona/characters.ts, re-exported from fixtures for compatibility. AI_PROVIDER defaults to demo. Demo uses deterministic templates with accurate labels and zero network calls. Live AI requires credentials, a model and explicit authorization. Keep provider configuration server-only. Feature flags in src/lib/config/features.ts control module availability, never authorization. Preserve legacy CinemAI URLs. New design tokens stay in globals.css.

## Provider gateway
Use src/ai/providers/registry.ts for provider selection. Preserve legacy AI_PROVIDER=openai as a hosted_openai alias. Never fall back between providers. BYOK keys exist only in page/request memory, require HTTPS and operator/creator authentication, and never enter jobs, usage tables, logs or storage. Paid model tests require explicit consent. Ollama is server-side loopback only, rejects Vercel, and uses the installed model list. Keep all cloud tracing disabled by default.
