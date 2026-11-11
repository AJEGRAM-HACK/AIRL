# CinemAI project conventions

## Scope
Milestone 1 is the approved scope. Do not implement live voting, persistence, agent execution, production jobs, or deployment until the user approves the corresponding milestone. Fixture interactions must stay labeled. Never fabricate successful jobs or logs.

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
