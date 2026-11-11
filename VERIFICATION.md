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


# LAN demo reliability rehearsal — November 12, 2026

Application checkpoint is `1e34cbb16a49b07441e06919dfd94aac97d3fd4b`, following verified baseline `318b2f0`.

## Changes driven by rehearsal

- Added a dedicated production HTTPS launcher bound to one explicitly assigned private IPv4 address. It rejects wildcard/public/unassigned bind addresses, validates Host and overwrites forwarded headers. Ignored local certificates protect transport. Ollama remains bound to 127.0.0.1:11434.
- Added locally generated audience QR images and a Studio join panel. Added pinned qrcode 1.5.4 and development types 1.5.6; npm reported zero vulnerabilities. No third-party QR service receives room URLs.
- Rehearsal reproduced a worker exit, an after-callback failure and a browser-side server error from SQLite locks. The busy timeout previously followed journal-mode initialization, and canonical reads had no timeout. Connections now configure the five-second timeout in their constructors. An independent-process exclusive-lock regression passed for all four storage entry points.
- Real recovery inference exposed Screenwriter output repeating until the 1400-token limit, leaving invalid JSON. Local script input now carries structured compact continuity, concept and revision feedback. The local output schema constrains three scenes and one dialogue line each. Incomplete JSON is classified as a Zod validation failure and receives the existing bounded retry. Failed rehearsal records remain failed.

## Verified outcomes

- PASS — all 29 unit/regression tests, including the previous 26 and new bind, malformed-output/context and database-lock coverage.
- PASS — typecheck and optimized production build. Final production Chrome acceptance passed both cases in 46.9 seconds. Demo took 6.7 seconds; genuine Ollama took 29.1 seconds with a 23.5-second production and maximum sampled audience API latency of 20 ms. The final run emitted no SQLite-lock server error.
- PASS — CA-verified HTTPS requests, expected Host rejection (421), foreign-origin rejection (403), public room state and unknown room/world/QR 404 responses.
- PASS — native Core Image QR decoding matched the exact HTTPS audience URL. Chrome mobile-viewport checks covered QR image/link, room joining, no horizontal overflow, no page JS errors and a Secure/HttpOnly/SameSite=Strict session cookie. Chrome automation bypassed certificate validation; separate curl checks verified the CA and server identity.
- PASS — an isolated HTTPS app was killed during an actual Ollama Story Director stage. Restart preserved the vote and closed round. The normal watch worker waited for the original 150-second claim expiry and produced a Critic-approved draft on attempt two. Recovery took 178.298 seconds, with maximum sampled audience API latency of 13 ms. Publication was replayed and survived another app restart. SQLite held exactly one episode and the interrupted run remained failed.
- PASS — listener inspection confirmed HTTPS on the assigned LAN IP and Ollama solely on loopback. Existing macOS firewall was disabled; its configuration was preserved.
- USER CONFIRMED — the iPhone installed the demo CA and enabled full trust. The user reported that the page opens but voting fails. Exact error and physical QR/playback verification remain pending investigation.

## Measurement limits and remaining work

The crash rehearsal collected 89 two-second samples. Its HTTPS app instances reached 147.1 and 116.0 MiB sampled RSS; the recovery worker reached 122.6 MiB and its launcher reached 44.6 MiB. The Ollama daemon reached 21.3 MiB RSS. That sampler's case-sensitive filter omitted the llama-server process, so these measurements do not establish inference-server peak memory. A corrected follow-up sampler includes that process. Ollama independently reported one model, 8192-token context and approximately 3.55 GiB residency. Unified-memory model residency and process RSS must not be added as independent allocations. System swap decreased from 6560.88 to 6408.88 MiB during the recovery sample and cannot be attributed solely to AIRL.

Temporary recovery databases, diagnostic scripts, private TLS material and screenshots remain ignored or under /tmp. The public CA certificate was copied to Downloads to help the user install it. No paid calls, public Ollama listener, infrastructure migration, deployment or external push occurred. Real physical-phone voting/playback, broader device coverage and long-duration load remain open. Hosted OpenAI and HTTPS BYOK validation remain pending separate authorization/configuration.


A corrected one-second sampler then covered a successful genuine four-stage Ollama CLI run in an isolated temporary database. It completed in 30.45 seconds across 29 samples. llama-server peaked at 1520.1 MiB RSS and 397.4% CPU, the production Node process at 140.3 MiB RSS and 27.8% CPU, and the Ollama daemon at 25.3 MiB RSS and 3.9% CPU. CPU values use macOS per-core percentages. System swap remained 6040.88 MiB. These are sampled peaks from one run, with other applications active, and do not establish long-duration capacity.

The physical iPhone screenshots show a persistent initial Loading room / Connecting state, including after refreshing the new Vote shortcut. The initial discoverability diagnosis was incomplete. Direct API connectivity and JavaScript execution checks were requested. Native Safari automation was unavailable and downloaded Playwright WebKit crashed at launch with a bus error on the Mac's supported frozen build; neither attempt verified Safari behavior. A later Chrome run also exposed operator unlock becoming disabled during a fast join. Session reads now ignore responses superseded by mutations, and joining no longer clears a code entered during that request. Browser regression coverage holds an old anonymous session response until after a successful join.


Final application checkpoint is `e0c015568a2ba0e0265bc2bc98c6e36c3a7359bf`. Audience pages now have Vote/Watch anchors, joining precedes the choices, and selection instructions are visible after join. Session mutation revisions protect joined state from late anonymous reads. Operator codes clear only after redemption, preserving a code entered while joining. Final Demo/Ollama browser cases passed in 6.7/36.5 seconds with a 31.5-second genuine production and maximum sampled API latency of 28 ms. The focused delayed-session regression passed separately in 692 ms. Its first assertion incorrectly required enabled radios after the preceding scenario had closed the round; the assertion now verifies retained joined controls directly. Final root typecheck, 29 unit tests and production build passed.

Acceptance during the phone investigation used a disposable source snapshot to keep the live HTTPS build stable. The snapshot was removed after testing. The final HTTPS app and recovery worker were restarted on the normal shared database, with paid requests disabled for the worker. Physical-phone completion remains blocked at initial room loading. A stale page or disabled/failed JavaScript is a hypothesis, awaiting direct API/Play-button results; no cause is yet confirmed. Do not describe the physical vote-to-playback rehearsal as passed.


# Safari 16 physical-device follow-up — November 12, 2026

The real iPhone reached the public state API with HTTP 200 and displayed JSON. The user confirmed JavaScript was enabled while the reference Play button did nothing. A temporary local diagnostic bootstrap captured SyntaxError: Unexpected token '{' in the Next client bundle, line 52. The bundle contained a class static block, unsupported by the phone's reported Safari 16.0. Installed Next.js documentation defaults to Safari 16.4 and documents explicit Browserslist targets.

Application commit `cc5f690a738157ccab7a496051653adbfc763a1d` adds an explicit Safari 16 target alongside the existing default Chrome/Edge/Firefox targets. A fresh isolated build removed the static blocks. The first root rebuild reused old generated output; preserving the previous .next under ignored local data and performing a clean build removed all static blocks from the live client chunks. Some phone connection errors overlapped those restarts. The demo server was then kept stable.

- PASS — 29 unit tests, strict typecheck and clean production build.
- PASS — all three production Chrome browser scenarios in one run, 57.4 seconds total. Demo took 7.2 seconds, Ollama 41.3 seconds including 34.9 seconds production, and the delayed-session regression 541 ms. Maximum sampled audience API latency during Ollama was 24 ms.
- USER CONFIRMED — the iPhone joined and displayed Vote recorded after the clean Safari 16 build. Actual stored votes were two for Declare taho the official currency; that winning decision was preserved.
- PASS — the normal room pipeline executed all four real Ollama stages successfully on attempt one in approximately 28.3 seconds. The Critic-approved three-scene, 18-second episode Taho as Currency: The Great Taho Revolution was reviewed through Studio and published. Job b913c366-489a-45a4-adce-96723b6b59e6 references production 7cfe613f-75ee-4605-ba4f-db5365a3cc75. Exactly one episode exists for that run.
- USER REPORTED — the generated episode appears on the iPhone, but playback or captions fail. A new diagnostic capture was requested. Physical playback/caption completion is still pending.

Temporary diagnostics run through ignored local Node preload files and keep bounded error/path metadata on the Mac. They are separate from application source and must be disabled after diagnosis. No key or credential values were collected. A leftover isolated rehearsal worker was stopped. No paid inference or infrastructure change occurred.

A follow-up Chrome check used actual touch input with isMobile and hasTouch enabled. Tapping Play advanced from frame 73 to frame 194 across subsequent production polling. Captions toggled off and on, with no page JavaScript errors. This checks touch controls in Chrome and leaves the reported physical Safari playback failure unresolved.

# Multi-universe platform acceptance — November 12, 2026

The starting repository was clean at documentation commit `6d4a170`, following verified application `cc5f690`. The current directive authorized accounts, universe ownership/settings/cast, shared-module navigation, early previews, canon review, story retrieval and real local inference. Original application work and stored IDs were preserved. Verified application checkpoint is `2f37d3602ba2d619f38b8fb2ab07fd04739be5c3`.

## Implemented and exercised

- Accounts use salted scrypt hashes, opaque HttpOnly sessions, viewer defaults, server-side admin creator grants and signout invalidation. Private optional interests support genre-based discovery and per-request pitch overrides. Anonymous voting remains available.
- Universes start private, have owned settings/languages/rules/cast/relationships and can be published or archived/restored. Official edits/publication require admin. Composite character IDs and access checks isolate assets, episodes, canon, drafts and helper sources. Characters referenced by frozen production snapshots remain retained.
- The migration utility backed up and verified original table projections, IDs, artifact contents and memories before applying additive transactional migrations. Final copy `.data/universe-migration-1794426202054.sqlite` and live verification retained three characters, one episode, one production, one job, one round and two votes. Foreign-key checks were empty and integrity returned ok. Private backup files remain ignored.
- Closing a round freezes world/cast/history/winner/model/story order. Validated script outlines and versioned playable manifests persist before Critic review. A later Critic failure retains its preview. Compatible retries reuse saved validated stages and preserve selection. Model-selection failures retain sanitized Connection reasons and count toward the three-attempt bound.
- Human review can correct memory/relationship proposals. Publication commits the episode and approved canon transactionally and idempotently. Public job responses omit draft script/preview content. Published episodes link to their actual source round and ordered character canon.
- Episode pages provide playback/seek/captions, readable dialogue transcripts, featured-character links and story answers. Character pages provide definitions, relationships and source-linked timelines. Helper scope filters universe/visibility/character/story order before inference. Citation IDs are restricted to retrieved sources. Draft mode requires Studio access.
- Creator Studio supports blank drafts and three generated editable pitches. World settings, cast and relationship editing use scoped APIs. Original deep links remain compatible. Narrow-screen audience voting now precedes playback, avoiding a layout shift that hid join controls after an episode loaded.

## Verification record

- PASS — `npm run typecheck`.
- PASS — `npm test`, all 36 tests, zero failures, 1.911 seconds in the final combined run.
- PASS — optimized `npm run build`, also executed by production-browser acceptance.
- PASS — `npm run test:browser`, all four cases in 51.2 seconds. Demo case 6.8 s, genuine Ollama case 29.0 s, delayed-session regression 482 ms and creator journey 3.8 s. Genuine generation took 23.0 s, with maximum sampled audience API latency 11 ms. These are one-run samples.
- PASS — copy-first live migration verification and a subsequent repeatable copy check at `.data/universe-migration-1794426421952.sqlite`, including the original publication's source-round link.
- PASS — `npm run benchmark:local`, both real universe episodes, three pitches and a cited answer. Complete timing/output details follow.

OpenAI/BYOK network tests remain mocked, and Demo cases remain deterministic. Actual local Ollama is used in the real browser case and benchmark.

The four browser cases cover independent mobile audience sessions with Demo, the same journey with genuine Ollama, delayed-session mutation protection, and signup/interests/admin creator grants/both creation paths/private asset-and-helper rejection/canon publication/playback in a custom universe. Tests use isolated SQLite and Chrome. Account/admin fixture setup uses synthetic identities and the trusted local bootstrap. Demo-generated content remains labeled.

The real local benchmark used `qwen3:4b-instruct`, 8192 context, temperature 0, 110000 ms deadline and 2400 maximum output tokens. Its final fixed-input run completed official production in 38.569 s, three pitches in 14.370 s, private production in 27.498 s and a cited story answer in 4.195 s. Both episodes succeeded on attempt one with zero failed stage events. A playable preview was observed while Critic ran in both universes. Pitches/answers had zero schema-validation retries. Publication replay preserved one episode per run. Exact outputs and observations are in `benchmarks/qwen3-4b-instruct-2026-11-12.json` and `benchmarks/README.md`.

The first pitch benchmark timed out with the expanded full schema. Bounded compact pitch fields expanded server-side resolved that failure. A browser run failed because its provider selector matched the production and story-helper pickers. Scoping the selector to round controls corrected the test. Another run reproduced the mobile Vote-anchor layout shift after async episode loading. Moving the mobile vote panel first corrected the application behavior. Earlier failures remain failures in this record.

## Files and boundaries

New platform code lives in `src/server/platform/`, `src/components/platform/`, `src/app/account/`, `src/app/universes/`, `src/app/studio/worlds/` and their account/admin/universe/assets/models/pitches API handlers. Shared live stage contracts live in `src/ai/providers/stage-contracts.ts`. Existing live/session/production handlers, stores, providers, domain schemas, navigation, audience/studio views and video composition were extended. New scripts cover admin bootstrap, migration verification and repeatable benchmarks. Focused platform tests and production/browser regression tests were added or updated. README, handoff, architecture, project conventions and environment examples were updated. Git commit manifests provide the complete file list.

No application dependencies or infrastructure services were added for this expansion. No paid API request, deployment or external push occurred. No credentials were added to source, benchmark outputs or documentation. Hosted OpenAI uses a server model allowlist and explicit consent, including paid retry consent. Session BYOK remains authenticated HTTPS request/page memory and stays outside background jobs and persistence. Both live adapters share bounded stage contracts, instructions and validated deterministic visual assembly.

## Remaining limits

- Physical iPhone joining/voting remains user-confirmed from the prior checkpoint. Its generated playback/caption failure remains unresolved. Chrome mobile/touch coverage provides separate evidence. This expansion has not completed a physical-phone or Safari acceptance pass.
- Hosted OpenAI and real HTTPS BYOK await credentials and separate paid-call authorization. Transport/consent/isolation tests use doubles. Model capability errors are sanitized and surfaced, while real compatibility remains unverified.
- Browser video uses reusable pictograms and CSS backgrounds. Protected reference-image storage and profile links are available. Upload UI, custom artwork rendering, generated images/audio/voices, MP4 export, forks and collaboration remain follow-on work.
- Initial admin setup requires a signed-up account and local bootstrap. Email verification, password reset, deletion workflows and stronger hosted anti-abuse controls remain open.
- Canon/story citation IDs and spoiler boundaries are validated. Human semantic grounding, preference fidelity and long-history continuity evaluation remain limited. The benchmark official dialogue is English despite its Taglish tone.
- SQLite requires persistent local disk, and scheduling requires a running process/recovery worker. Earlier actual crash recovery passed with a natural 150-second lease. The new expansion retains regression coverage and still needs another long-duration/crash rehearsal under presentation conditions. No new memory-peak claim is made from the benchmark.

## Final committed-build smoke check

Application commit `2f37d3602ba2d619f38b8fb2ab07fd04739be5c3` was rebuilt successfully and served using the normal HTTPS launcher with diagnostic preloads removed and paid requests disabled. A smoke check initially encountered the previous build's QR alternative text. Rebuilding the committed source resolved the stale artifact.

- PASS — nine existing/new routes returned 200, including account, universe, episode/character directories and compatible watch/studio/universe routes.
- PASS — unknown world, room and episode returned 404.
- PASS — the original stored episode retained its source round. Its historical results displayed two votes and the winning direction.
- PASS — locally generated Studio QR displayed on the HTTPS origin.
- PASS — desktop 1440-pixel and mobile 390-pixel landing/discovery checks, light/dark selection, no horizontal overflow and zero page JavaScript errors. Screenshots were visually inspected and remain under `/tmp/airl-home-*.png`.
- PASS — curl verified the local CA and returned HTTP 200 from the room-state API. Listener inspection showed HTTPS bound to `192.168.88.9:3443` and Ollama only `127.0.0.1:11434`.

The normal HTTPS demo and refreshed recovery worker were left running against `.data/airl-live.sqlite`, with paid requests disabled. No new persistent demo account was provisioned. Sign up on the HTTPS origin and use the local admin bootstrap to administer creator access or official publication. Physical iPhone playback remains pending.
