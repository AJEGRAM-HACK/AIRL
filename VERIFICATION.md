# Milestone 1 verification

Verified on November 11, 2026 using Node.js 24.22.2 and npm.

## Passed

- `npm install`: installed dependencies; npm audit reported zero vulnerabilities.
- `npm run typecheck`: TypeScript strict checks passed.
- `npm run build`: production compilation, TypeScript, page generation and build traces passed using Webpack.
- `npm run start`: production server started at http://127.0.0.1:3000.
- HTTP smoke checks returned 200 and expected page content for `/`, `/watch/barangay-2099`, `/studio/barangay-2099`, `/universe/barangay-2099`.
- Unknown watch room, studio room and universe returned 404 with the custom error content.

## Environment recovery

- Node.js was absent from PATH. Downloaded the official Node 24 macOS ARM64 archive into `/tmp` and verified its SHA-256 against the official manifest.
- Network installation and local server access required sandbox escalation.
- Turbopack failed on an internal port binding even after an escalated retry. The standard Next.js Webpack path passed; project scripts explicitly use it for development and build.

## Verification limits

Computer-use inventory reported “browser access host is unavailable” and a native service startup failure. Browser screenshots, visual desktop/mobile checks, keyboard walkthroughs and client interaction tests could not be performed. HTTP checks verify server rendering, not browser interaction. The production server was stopped after checks.

No Supabase, OpenAI, Trigger.dev or Remotion calls were made. No real votes were recorded, no AI agents ran, and nothing was deployed or pushed. These are outside the approved milestone.

# Authorized local production slice — November 11, 2026

## Repository/environment inspection

Existing Milestone 1 code was preserved. The initial working tree was clean. Next.js, React, TypeScript, Tailwind, Zod, Lucide and UI utilities were already installed. OpenAI Agents SDK, Supabase, Trigger.dev and Remotion were not installed. Node 24.22.2 is present in the session's temporary runtime directory but not on the default shell PATH.

Only `.env.example` was present. OPENAI_API_KEY, OPENAI_MODEL, Supabase URL/keys and Trigger secret were absent from the process and no populated application environment file was found. Secret values were never displayed.

## Added and verified

- Installed pinned @openai/agents, openai, @next/env and tsx dependencies; npm reported zero vulnerabilities.
- Six production unit tests passed using explicit executor doubles: four-stage persistence across reopen, approved memory updates, bounded critic revisions, malformed output retries, manifest dialogue rejection, sanitized model-access failure and active-room locking.
- `npm run typecheck` passed.
- `npm run build` passed.
- Production server started; the four existing pages returned HTTP 200 and an invalid watch room returned HTTP 404.

## Live execution blocker

`npm run production -- "Launch a mandatory karaoke night"` exited with status 1 and the message “Configure OPENAI_API_KEY and OPENAI_MODEL in .env.local. No API request was made.”

There is **no verified successful OpenAI connection, model inference, or four-agent episode**. Unit test artifacts were temporary test data and were removed; they are not production results. The command deliberately checks configuration before creating a production database or run. Once credentials are configured, a real run must complete and its database events and episode artifact must be inspected.

## Remaining boundaries

Persistence is local SQLite, not Supabase. The workflow is a CLI, not a durable Trigger.dev task. Existing studio statistics and the audience experience remain fixture-based; no real voting, browser-connected production progress, Remotion rendering, deployment or external push was introduced. Browser interaction QA was not repeated for this server-only slice. Character memory and episode continuity are tested locally but not evaluated against real model outputs.

# AIRL Phase 1 — November 11, 2026

- Preserved CinemAI route implementations, original art, episodes, character identities and production tests.
- Added AIRL homepage, discovery, module navigation, live room directory, sample room, studio entry, CinemAI-prefixed routes, PersonaAI directory and three profiles with scripted interactions.
- Moved shared character source data into PersonaAI and retained fixture re-exports for existing callers. Added structured character metadata and shared flags/tokens.
- Added typed demo and OpenAI creative providers. Demo is the default. Live requires configured credentials, model and explicit paid-call authorization. No live request was attempted.
- Nine tests passed. Three added tests verify deterministic, choice-sensitive output with network access replaced by a failing function, provider configuration rejection, manifest mismatch rejection and repeatable character responses. Existing six workflow tests continue passing.
- Strict TypeScript and production Webpack build passed.
- The real local demo CLI completed and persisted run `83eb0b5f-213e-4f8d-a59f-83f07dff2c23`, labeled demo with a validated three-scene manifest. It required no API credentials.
- Production HTTP checks passed for 15 route instances, including legacy CinemAI URLs and all three personas. Five invalid room/character/universe URLs returned 404.
- Browser inspection was attempted. The browser access host remains unavailable, so visual mobile/desktop QA and browser click/keyboard checks remain unverified.
- No new dependencies, services, paid calls, infrastructure provisioning, deployment or push were introduced. Phase 2 shared voting, participant identity, realtime, browser-connected job status and Remotion integration remain pending.
- Local data uses SQLite. The additive production mode migration preserves existing records. Public studio metrics remain labeled fixtures. Character interaction scripts do not save user conversations.


# AIRL Phase 2 local community engine and themes — November 11, 2026

- Four live-store tests passed for independent votes, idempotency, persistence across connections, operator-only closure, deterministic ties, one-time code redemption, token rotation, closed-round rejection, safe round restart, forged-identity rejection, schema validation and persisted rate limits. All nine prior creative workflow tests passed.
- Strict TypeScript and the production build passed.
- Production HTTP checks used an isolated SQLite database and two independently issued session cookies. Concurrent votes aggregated correctly. The SSE stream delivered the updated two-vote result. Checks passed for duplicate submission, changed vote conflict, invalid option, unauthorized closure, missing authentication, foreign-origin rejection, operator redemption, finalization, closure retry, late vote rejection and next-round reset.
- Eleven public page responses returned 200 and included the theme selector.
- HTTP testing exposed a same-origin comparison mismatch between the server's internal localhost URL and the incoming Host header. The mutation guard now compares Origin with the incoming Host and request protocol. The production HTTP checks passed after the fix.
- Theme modes support System, Light and Dark, with pre-paint selection, local persistence, system-change and cross-tab listeners, and centralized light palette overrides.
- Browser inspection was attempted again and the browser access host was unavailable. Visual theme contrast, theme persistence through browser interactions, mobile layout and keyboard interaction checks remain unverified.
- Shared local voting is operational through the tested HTTP paths. Supabase authentication/persistence and hosted deployment remain pending. The local adapter uses the existing Node SQLite setup. The current room is predefined Barangay 2099. Joined sessions are cumulative, and anonymous cookie identities can be recreated.
- Storyboard media and production examples remain labeled fixtures. Connecting finalized votes to the demo production workflow and Remotion previews is pending the next phase. No paid AI endpoint was called.

# Provider gateway directive — November 11, 2026

## Audit and migration

The working tree was clean. Existing foundation, community voting, server sessions, operator roles, themes, persona library, structured agents, deterministic provider and SQLite stores were reused. Only .env.example was present. Application OpenAI key/model settings were absent. Ollama's actual local /api/tags response reported qwen3:4b-instruct installed. No paid test was authorized or attempted.

Implemented the shared provider registry, installed-model Ollama adapter, request-scoped BYOK pathway, creator-protected /api/ai endpoint, /studio/ai settings, provider-aware character replies, new storyboard previews, usage metadata, quotas and optional estimated-spend gating. Existing openai mode remains a hosted_openai alias. No packages were added. SQLite schemas were extended additively.

## Actual outcomes

- PASS — 19 unit tests across provider (6), production (9) and voting (4) suites.
- PASS — strict TypeScript and production build.
- PASS — Demo provider works offline with network access replaced by a failing test function.
- PASS — BYOK uses the supplied synthetic creator key with a mocked 401, without falling back to the synthetic hosted key.
- PASS — real Ollama four-stage CLI run 51406238-a7dc-45f1-9dc4-f8deba8b86f1 completed with a validated three-scene, 18-second manifest. Original failed run baf2e835-64fe-414a-94fc-d9174c27f1f9 remains accurately failed in local storage.
- The first Ollama Visual Producer attempt failed immutable script/manifest validation. The adapter now asks the model for visual properties and deterministically copies scene IDs and original dialogue when assembling the validated manifest. Subsequent full local inference passed.
- PASS — production HTTP checks on an isolated database verified creator authorization, foreign-origin rejection, demo connection inference, complete demo workflow, character reply, HTTPS rejection of BYOK, hosted consent rejection, actual Ollama inference and nonzero reported token usage.
- PASS — seven main page HTTP responses including /studio/ai returned 200.
- PASS — usage records excluded the synthetic BYOK credential used in the rejected HTTP request.
- BLOCKED — hosted OpenAI actual inference requires configured application credentials, model and approval.
- NOT TESTED — real BYOK inference over HTTPS, paid model access, exact billing accuracy, long-session local performance, browser layout and keyboard interactions.
- BLOCKED — browser preview host remained unavailable when /studio/ai visual inspection was attempted.

## Remaining scope

Settings previews use request-local memory and return actual stage events to the initiating creator. CLI production remains persisted. Public winning-vote production handoff, durable job recovery, Supabase/RLS, Remotion, QR joins, submissions/moderation, deadlines and MP4 export remain pending. Paid providers require explicit per-request consent and hosted environment enablement. Session-only BYOK has no background execution or permanent credential storage. Creator access currently reuses the local operator role. Token usage is measured when available; cost figures require configured rates and are estimates.

- PASS — regression test confirms hosted_openai reads existing openai production history while Ollama history remains separate.

# Integrated room production and architecture documentation — November 11, 2026

## Deliverables

- Updated README.md with current setup, operator demonstration, worker recovery, provider boundaries, media behavior and next milestones.
- Added ARCHITECTURE_PLAN.md covering product boundaries, component flow, local and hosted data models, state transitions, idempotency, privacy, provider isolation, media, current routes, candidate routes, deployment options, migration sequence and risks.
- Added atomic round-to-job enqueueing and persisted Demo job execution. A private draft is saved after Critic approval. Operator publication validates the artifact again and commits the public episode and status transition transactionally.
- Added recovery commands and bounded claims/attempts. A saved draft can be reused after interrupted job finalization. Public reads exclude draft manifests and internal stage events.
- Added Remotion 4.0.542 and @remotion/player 4.0.542. npm reported zero vulnerabilities. Packages are used for local evaluation and browser preview. Commercial license eligibility remains a deployment prerequisite.
- Added a portrait 720 × 1280, 30 FPS composition using existing licensed character pictograms and approved CSS backgrounds. Default Demo scenes total 18 seconds. Captions, transcript and reduced-motion behavior are implemented. No MP4 export or audio was produced.

## Actual results

- PASS — all 23 automated tests across production, providers, voting and integrated room production.
- PASS — four new integrated tests cover unique enqueueing, winning-choice propagation, private drafts, recorded stage events, idempotent publication, rejection, expired claims, saved-draft recovery, bounded retries, invalid artifact rejection, scene timing and approved asset IDs.
- PASS — TypeScript and optimized Next.js production build.
- PASS — production HTTP flow on an isolated test database completed vote → closure/enqueue → automatic Demo workflow → private review → protected publication → public 18-second manifest → next round. Replayed closure and publication created no duplicates. Unauthorized draft and publication access was rejected.
- PASS — six main route HTTP responses returned 200 during the integrated check.
- PASS — Remotion Player server-rendered with a real generated manifest, caption control and transcript.
- BLOCKED — browser visual/playback inspection could not run because the browser access host was unavailable. Frame calculations, SSR and HTTP outcomes do not establish successful interactive playback in a browser.
- NOT TESTED — hosted durable execution, Supabase/RLS, MP4/audio export and commercial Remotion license eligibility.

Automatic room jobs select Demo explicitly and make no paid inference requests. Existing CLI provider adapters and database files were preserved. No services were provisioned and no external push or deployment occurred. The local queue and Next.js after callback are not substitutes for hosted durable scheduling. The documented recovery worker is required after process interruptions when callbacks cannot finish.

# Critical integration and Demo readiness sprint — November 12, 2026

## Actual completed browser acceptance

Playwright was added as a development dependency and used the installed Google Chrome browser. Acceptance runs start a production build on port 3100 with a separate temporary SQLite database. Tests use two independent mobile audience contexts and a separate operator context. The application still uses the existing SQLite, SSE, provider registry and Remotion composition.

- PASS — initial Demo UI flow created real votes, selected the winner, executed all stages, published the episode and displayed it in the audience page.
- PASS — actual Remotion frames advanced in Chrome. Seeking entered second and third scenes, captions toggled, and reference/generated episodes switched in one selector.
- PASS — final Demo scenario passed in 10.6 seconds.
- PASS — final real Ollama scenario used installed qwen3:4b-instruct. A new winning karaoke decision produced an AI-generated story and validated manifest through all four stages, operator approval, audience playback and published PersonaAI memory. The browser scenario passed in 49.3 seconds, including a 40.9-second production run.
- PASS — a preceding real Ollama scenario also completed in 36 seconds with maximum sampled audience API latency of 56 ms. The final karaoke scenario's maximum sampled audience API latency was 157 ms.
- PASS — no page JavaScript errors were recorded in the successful scenarios. The mobile audience document had no horizontal overflow.
- PASS — the browser test confirmed exactly one resident Ollama model, 8192-token context and 3,806,582,538 reported model-residency bytes, approximately 3.55 GiB.
- PASS — hardware inspection reported Apple M2 Pro and 17,179,869,184 bytes of unified memory.

Screenshots of the successful final audience views were saved at /tmp/airl-demo-audience.png and /tmp/airl-ollama-audience.png. They are local QA artifacts and are not committed. Temporary browser databases preserve their independent test runs without changing the normal demonstration database.

## Failures encountered and resolved

- Initial acceptance locators matched duplicate character names and an identically named region/select. The tests now scope controls by their actual roles and use manifest-derived scene text.
- Added an accessible explicit seek control and frame observation to validate the actual Player through UI interactions.
- One integrated local-model run reached the Critic and exceeded the 110-second total timeout. Its state remained failed. Compact canonical review context, concise scene instructions and per-stage generation limits brought subsequent complete runs within the configured bound. Model validation and Critic approval remain required.
- Development-server recompilation produced transient manifest-loading errors during a test run. Acceptance now uses a production build and server, with source edits kept outside active builds.
- The hardware process sampler did not capture useful Ollama RSS/CPU values. No zero-memory or zero-CPU performance conclusion is drawn. System swap use was approximately 5.75 GiB during inspection and cannot be attributed solely to AIRL. Long-session stress testing remains pending.

## Automated and security results

- PASS — all 26 unit/regression tests.
- PASS — TypeScript checks and production build.
- PASS — two final production-browser scenarios, Demo and genuine Ollama.
- PASS — two independent workers raced approval and rejection against the same SQLite job. Exactly one final decision succeeded and a later decision could not reverse it.
- PASS — canonical-memory tests covered all three characters, subsequent production context and exclusion of unpublished/rejected artifacts. Provider prompts and PersonaAI detail pages now use the approved memory boundary.
- PASS — existing mocked invalid-key and BYOK-isolation tests, hosted consent checks, rejection of background BYOK configuration, schema tests, bounded Critic revision tests, voting persistence, duplicate protection and queue recovery tests.
- NOT TESTED — a real Critic rejection/revision conversation in this sprint. Rejection and revision control flow is verified using deterministic test doubles. Actual local Critic approval completed in browser runs.
- BLOCKED — Hosted OpenAI live smoke testing. OPENAI_API_KEY, OPENAI_MODEL and hosted enablement remain absent from the application environment, with only .env.example present. No paid request was made.
- NOT TESTED — real Creator BYOK over HTTPS, physical phones/LAN/QR joins, MP4/audio export, commercial license eligibility and hosted deployment.

## Implementation boundaries

Non-destructive room-job migrations add provider/model selection, explicit paid consent and requester attribution. Jobs may select Demo, Ollama or enabled and explicitly authorized Hosted OpenAI. Creator keys remain request-scoped and outside workers. Background inference uses the registry and usage/budget checks. Publication validates artifact/job/provider consistency and updates episode, status and canonical memories in one transaction. Rejection and retry use conditional state transitions.

Legacy fixture counts, static disconnected agents and obsolete Studio messages were removed. The audience has one library for reference and generated episodes. Genuine modes, model IDs, attempts, stage events, sanitized failures and review feedback are displayed. No Supabase/Trigger.dev migration, expensive media integration, deployment or external push was performed.
