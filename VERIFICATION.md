# AIRL verification record

## Hackathon UI/UX Optimization — November 12, 2026

Verified frontend checkpoint: `1731549c43f82ca760a1b814c030c167831afe9f`, on local branch `ui/hackathon-discovery`, starting from clean `main` at preservation checkpoint `81e975e`. The user explicitly authorized this first frontend phase. The existing frontend and proposed direction were summarized before implementation. The source checkpoint branch remains at `fc48254`; the documentation checkpoint tag still resolves to `81e975e`.

The first increment makes Explore Universes primary, keeps a context-preserving Journey entry, exposes creation through existing permissions/Studio and simplifies public navigation. Discovery reuses the catalog API with visual cards, client-side search/genre filters and loading/empty/error states. The existing official illustration is reused only for Barangay 2099. Custom-world covers are abstract CSS placeholders, with no generated-art claim. Universe links use Overview/Episodes/Characters and retain their original routes. Journey implementation, backend/API/schema/provider/authentication contracts, dependencies, fixtures and Remotion code are unchanged.

- PASS — `npm run typecheck`, production `npm run build` through the normal browser launcher, and final `npm test`: all 38 unit/regression tests in 3.736 seconds. Provider/transport doubles remain identified in test names; these do not establish live paid-provider operation.
- PASS — final complete production-browser run: all 11 cases in 1.6 minutes. All nine existing cases remain, with two discovery/responsive regressions. Final storage was explicit `/tmp/airl-hackathon-acceptance-1794461878-58376.sqlite`, with `AIRL_ALLOW_LIVE_REQUESTS=false`. The final pass reused the unchanged production build via `/tmp/airl-hackathon-final.config.ts`, which imports repository configuration and overrides only test paths/output and the webServer command/cwd to start without rebuilding. Earlier normal browser launches built the same final application source.
- PASS — Demo and real loopback Ollama vote → four-stage production → review → publication → audience playback. Final community Ollama production took 22.7 seconds; maximum sampled audience API latency was 25 ms. Independent audience sessions, protected previews, idempotent publication, approved memory propagation, sign-in/sign-out, guest/viewer/creator/admin controls and private-world isolation passed.
- PASS — real Journey job `5dfa388d-b322-4bd8-a98e-27b460b1c5be` retained an early validated preview and source-round context. Stored fallback playback caused no generation request; live state stayed visible. Actual cited story answer, source-scene navigation, custom-world scoping, focus trapping/Escape restoration, keyboard chapter controls, reduced motion, captions and repeated silent replay/seek passed.
- PASS — landing/discovery at 390 × 844 and 1440 × 900 in light/dark themes: no horizontal overflow, persisted theme, visible keyboard focus, search, genre filters and clear-filter recovery. Loading, empty catalog and error presentation use explicit intercepted browser responses in the new state test, not a claim of a real service outage. Manual visual review used screenshots at `/tmp/airl-hackathon-final-*.png`. Primary-button computed contrast was 12.28:1 dark and 7.67:1 light. An additional independent 390-pixel creator browser check verified that navigation fits and Create a Universe reaches the existing Studio form in the viewport.
- PASS — `npm run start` local preview at `http://127.0.0.1:3110`, public root/alias/discovery/room routes, unknown universe/room 404s and guest Studio 404s. Full browser acceptance separately covers inaccessible private worlds and authorized Studio. The preview uses a private disposable SQLite backup copy of existing data, created with SQLite's backup API and checked with integrity/foreign-key checks; its path is retained locally in `/tmp/airl-hackathon-preview-path`. It does not use the live database.
- PASS — protected-source diff confirms no changes to `src/server`, `src/ai`, API routes, domain/fixtures, video, Journey implementation, package manifests or lockfile. Sixty existing runtime files outside the retained old build were fingerprinted after stopping the demo; final hashes/inventory match, with no additions/removals. Fingerprints remain outside Git. The historical preservation record is unchanged. No dependency installation, migration, paid call, remote push or deployment occurred.

Earlier acceptance attempts were interrupted after identifying an ambiguous genre label and test selectors: the genre now has an explicit accessible name, the discovery error assertion is scoped away from Next's route announcer, and the Journey action selector allows the new supporting copy. The mobile header inherited an old nav ordering rule; the scoped public styles correct it. Early screenshots captured a theme transition before settling; reduced-motion captures and computed contrast checks verified final colors. A temporary no-build test configuration initially used `/tmp` as npm's cwd; setting its cwd to the repository corrected the harness. Those attempts are not counted as successful full runs. The final 11-case run passed without failures.

The previous public tunnel launcher/recovery worker were stopped before rebuilding `.next` and remain stopped under the no-deployment constraint. Only the loopback preview was started. Physical-iPhone, venue/projector hardware, new load/crash rehearsal and sustained memory tests were not rerun. Their historical results below remain tied to the original application commits. No live paid-provider validation or full encrypted runtime backup/restore drill was performed. Later redesign phases remain separately scoped.

---

## Preservation-only documentation checkpoint — November 12, 2026

Original HEAD was `fc48254f74262756c6a630fd1b83aac26bc7467d` on clean branch `main`. Source branch `checkpoint/pre-hackathon-ui-pivot-2026-11-12` preserves that exact state. The older requested baseline `318b2f0` exists and is an ancestor 20 commits behind original HEAD. Latest verified application code remains `1a7baf3a09233a3e43d01d89c93320a8e2b76a79`.

This sprint reviews source contracts and documentation, creates the source reference and commits documentation/plans. Application source, dependency/lockfiles, databases and private configuration are preserved. Initial validation captured SHA-256 fingerprints for 145 tracked non-Markdown files and inventoried 528 ignored data files. Database/artifact contents use private fingerprints, while sensitive TLS/configuration files use metadata. Those comparison details stay outside the repository. Source fingerprints and configuration metadata matched. All original data files matched at the first comparison. A later check observed the main live SQLite file changing while the running application held a nonempty WAL and shared-memory file created after inventory. Those sidecars were retained. This read-only sprint cannot certify a frozen logical database snapshot. Full comparison limits and documentation checks are recorded in the preservation record and completion report.

No typecheck, build, application unit/browser suite, Ollama inference, paid API call or migration is rerun. Existing 38-unit/nine-browser results below are prior acceptance evidence. New UI design targets have no implementation or test result in this task. The current running demo was not restarted for documentation checks.

The original verification body below is retained verbatim, including failures, benchmark records, historical pending items and their later resolutions. The old Current verified status section describes the existing application baseline. The new [preservation record](docs/PRESERVATION_CHECKPOINT.md) owns source/data inventory and backup limits. The proposed [roadmap](docs/REDESIGN_ROADMAP.md) awaits user review.

---

## Current verified status — November 12, 2026

Latest verified application commit is `1a7baf3a09233a3e43d01d89c93320a8e2b76a79`. This summary describes recorded checks for the current application and identifies earlier evidence separately. Historical entries below retain the outcomes and limitations that applied at each checkpoint. Their pending items may have been completed in later entries.

| Area | Latest evidence | Limits |
| --- | --- | --- |
| Static checks | `npm run typecheck` and final `npm run build` passed at `1a7baf3` | Final public/visual smoke passed after presentation polish |
| Unit/regression suite | `npm test` passed all 38 tests, zero failures, 3.457 s | Includes identified transport/executor doubles |
| Production-browser suite | `npm run test:browser` passed nine cases in 1.8 min | Installed Chrome, isolated database, real Ollama in its provider case |
| Real creative workflow | Vote → frozen winner → four Ollama stages → preview → review → publication → audience playback passed | Latest community browser production 25.4 s, maximum sampled audience API latency 8 ms |
| Roles and ownership | Guest/viewer/creator/admin UI, direct page/API protection, owned-world controls and sign-in/sign-out passed | Request-time permission snapshot refreshes with authentication/navigation |
| Public HTTPS | Guest mobile Chrome Journey smoke passed at `1a7baf3`, saved playback/replay/captions worked, Studio returned 404, zero JS errors | Requires running Mac, internet and tunnel |
| Physical iPhone | User confirmed clear Explore/Journey distinction and working Exit at `1a7baf3`. Saved playback/seek/replay/captions were previously confirmed at `05e1542` | Fresh Manila cast/transcript/playback check deferred by the user. One device, venue and broader coverage remain open |
| 35-session public rehearsal | Earlier `01e710d` run passed, 23.639 s real production, 157 ms request p95 | Simulated HTTP/2 sessions, one mobile Chrome context, no 35-device claim, not rerun after role UI changes |
| Restart recovery | Earlier genuine interrupted job recovered after lease expiry in 178.3 s, publication stayed idempotent | Repeat crash/restart on the presentation build remains a priority |
| Local fixed-input benchmark | Official/private episodes 38.569/27.498 s, pitches 14.370 s, cited answer 4.195 s | Short measurements, model residency/load vary, semantic/style review remains necessary |
| Paid providers and media export | OpenAI/BYOK contracts and isolation tested with doubles, live paid inference unverified | No paid call made, no MP4/voice/art generation implemented |

See the chronological sections for failed attempts, corrections, source artifacts, measurements and exact test boundaries. [CHANGELOG.md](CHANGELOG.md) provides a concise implementation summary. [HANDOFF.md](HANDOFF.md) provides launch and continuation instructions.

## Manila Journey presentation — November 12, 2026

Application checkpoint is `1a7baf3a09233a3e43d01d89c93320a8e2b76a79`. The starting tree was clean at documentation commit `8446869`, with verified application `05e1542`. The existing Copilot-derived routes, shared workflow, scoped state and saved fallback were preserved as the foundation. The supplied Manila Hack HTML included its palette, typography and chapter/sheet CSS. Its external canvas bundle was outside the supplied file. Ambient motion was implemented in CSS, and Schibsted Grotesk was bundled locally with its SIL Open Font License.

Explore now always opens at `/`, including through the public tunnel. `/platform` remains a working alias. Launch Journey and Exit to Explore carry universe/round/episode/chapter context. Journey has independent full-screen chrome, a slim chapter rail, persistent recorded winning choice, manual Next/Previous controls and Left/Right or Page Up/Page Down shortcuts. Job events update the current chapter without automatically moving the presenter. The active agent animates from its recorded stage/status/timestamp. A single validated excerpt or last valid preview/version is displayed at a time. Cast, transcripts and authorized review use modal sheets, with Tab wrapping, Escape close and trigger focus restoration. Editable fields and player controls retain their native keyboard behavior. Reduced motion disables background, chapter, artifact and sheet animation.

- PASS — strict typecheck, production build through the production-browser launcher, and all 38 unit/regression tests in 3.457 seconds. No paid inference was performed.
- PASS — all nine production-browser cases in 1.8 minutes. Roles took 3.1 s, Demo community 7.6 s, real Ollama community 32.7 s including 25.4 s production, delayed session 483 ms, real Journey 44.5 s, custom Journey 770 ms, dedicated layout/keyboard/focus/reduced-motion 525 ms, creator flow 3.2 s and silent replay 4.2 s. Maximum sampled audience API latency during community Ollama production was 8 ms.
- PASS — the real Journey case used an admin presenter and two independent mobile audience contexts, real votes and qwen3:4b-instruct. Mode switching/refresh retained the same job/round and single attempt. Approved Demo playback incurred zero POST requests during fallback selection/playback/refresh. Draft fields remained private. An early preview was observed before Critic completion. Publication required explicit approval in the review sheet and left the presenter in the production chapter until the premiere action.
- PASS — isolated Journey job `0cc66457-0736-4dea-b676-0cb7327334be` recorded all four stages and a versioned preview. The actual Ollama story answer cited Tita Nena's recorded line in scene-003 at 12 seconds. The source episode and round context survived returning through Explore/Journey. Test storage was `/tmp/airl-browser-42383.sqlite`.
- PASS — the sheet regression exercised cast content, initial close-button focus, Tab containment, keyboard chapter suppression while modal, Escape close, restored trigger focus and unchanged chapter. The transcript check also preserved the paused playback frame. Next/Previous and arrow/Page shortcuts worked. Reduced-motion computed animation was none. Root Explore retained regular navigation and Journey displayed its own explicit mode/Exit chrome.
- PASS — public ngrok mobile Chrome, using the normal database, verified root Explore, Launch Journey, cast sheet close, saved playback, three seek/replay cycles, captions, transcript sheet close and Exit. There were zero page JavaScript errors or horizontal overflow. QR PNG decoded through macOS CoreImage to the exact existing `/live/barangay-2099` audience URL.
- PASS — final 1440 × 900 projector and 390 × 844 phone visual checks. Movie controls and transcript/watch links fit within the media stage, verified from element bounds. Intro, vote, generation, premiere and cast sheet screenshots remain under `/tmp/airl-manila-*.png`. Local reference font rendered successfully.
- USER CONFIRMED — on the physical iPhone, the stone Journey mode is clearly different from Explore and Exit returns to regular navigation. The user cannot check cast, transcript, playback/seek/replay/captions now. These remain fresh-device follow-ups for the Manila layout. Prior physical playback results remain attributed to `05e1542`.

The first visual check found an invisible chapter-label hit area intercepting the cast trigger and media controls extending below the stage. Rail hit areas and video sizing were corrected. The first full run exposed a navigation test refreshing before Next had entered Journey. That test now waits for the destination URL. A targeted run then passed the real Journey and custom-world cases but exposed Tab leaving a native sheet with a single focusable control. Explicit Tab wrapping corrected it. The earlier failing full run was interrupted during the creator case while diagnosing these issues. The final complete nine-case run passed, including the creator and replay regressions.

The final public launcher and recovery worker were restored on the normal database. The root stayed Explore even with the tunnel's public-origin environment. Existing votes, jobs, episodes and canon were preserved. Hosted OpenAI validation, venue hardware/network rehearsal, a new 35-session load run and sustained memory profiling remain open. The UI sprint used the existing Node/SQLite/Ollama/ngrok architecture and added no npm dependency or infrastructure service.

## Guided Journey completion — November 12, 2026

Application checkpoint is `05e1542bcf02d191c07eee5e8e98a82915399125`. The starting application baseline was `7989ccd`, with documentation HEAD `5d580d6`. Copilot's uncommitted changes included homepage mode routing, Journey and platform shells, responsive styling, room-join/QR destinations, launcher/rehearsal entry changes and documentation. Its initial Journey embedded the working Audience component. Its supplied verification notes recorded prior six-case acceptance and a loopback tunnel-style smoke. This continuation independently verified the completed implementation.

Preserved the useful shells, landing behavior, styling and room-join copy. Added five state-driven presentation stages, a shared context-preserving mode switch, configured-universe selection, real progress and validated dialogue, protected early previews/canon review, saved rehearsal playback and the episode-scoped story helper. Episode routes supply their stored source round to mode links. QR links target the existing focused `/live/[id]` audience route for every universe. The launcher prints a separate `/journey` presenter URL. Journey's live close action selects Ollama qwen3:4b-instruct. Studio retains the existing provider registry and paid-consent controls.

- PASS — strict typecheck, final optimized production build and `git diff --check`.
- PASS — all 38 unit/regression tests, zero failures, 4.492 seconds in the final run. Earlier run passed in 3.318 seconds.
- PASS — all eight production-browser cases in 2.0 minutes. Role interfaces took 2.9 s, Demo community 7.5 s, real Ollama community 33.8 s including 26.5 s production, delayed-session regression 593 ms, Journey 54.3 s, custom Journey 1.0 s, creator journey 3.6 s and silent replay 4.5 s. Maximum sampled audience API latency in the community Ollama case was 23 ms.
- PASS — an authorized presenter and two independent mobile audience sessions joined, cast two karaoke votes, observed the stored winner, closed using real Ollama, and published after all four stages succeeded. Journey job `9595a2f3-3508-45b9-944c-ed44ed5e4484` resides only in isolated `/tmp/airl-browser-25489.sqlite`. Connection and all stages succeeded on attempt one. A private versioned manifest was observed before Critic completed.
- PASS — switched Explore/Journey and refreshed during the same production. Job ID, round and single production attempt persisted. An approved offline Demo episode played with zero POST requests during saved selection/playback/refresh. Live status remained present. The public audience response omitted draft fields. Canon review and authorized publication exposed the new live episode to both audiences.
- PASS — repeated seeking/replay at frame zero and a scene boundary, captions and transcript. Story helper used This episode and actual Ollama to answer what Tita Nena said, citing the generated episode's scene-003 at 12 seconds. The answer matched her recorded line, “Pwede nang magkaraoke, pero may kumikita na ba ang tao?” Scene navigation and subsequent mode switches retained episode and stored source-round context.
- PASS — custom-universe premise, presenter selection and refresh, guest control hiding, no-saved-episode state, mobile overflow check and unknown-universe 404. Existing suite retains role/ownership and private-world access coverage.
- PASS — actual ngrok HTTPS mobile Chrome on the normal database. Saved playback advanced, seek/replay and captions worked, guest Studio returned 404 and there were zero page JavaScript errors. QR PNG was decoded with macOS CoreImage to exactly `https://pope-java-fable.ngrok-free.dev/live/barangay-2099`.
- PASS — 1440-pixel projector and 390-pixel mobile visual checks, light/dark themes, persisted theme on reload and configured-universe selection under reduced-motion emulation. Visual review found a saved-select/button width issue, corrected with bounded responsive widths. Final rebuild and public/isolated visual smoke passed afterward. Screenshots remain under `/tmp/airl-journey-*.png`.

The first complete browser run had six existing passes and two new failures because the new tests expected a visible QR URL on loopback, where RoomJoin intentionally hides phone-unreachable QR content. The corrected tests check loopback guidance and the PNG endpoint. The public smoke separately checks the displayed URL and decoded QR. Both new cases then passed in 50.4 seconds, followed by the final full eight-case pass. No application QR restriction was relaxed.

The server reports OpenAI key/model absent and paid gate disabled. Real Hosted OpenAI generation remains unverified. Existing unit tests verify hosted enablement, explicit consent, background BYOK rejection and provider isolation with identified doubles. The saved path used approved Demo locally and an existing approved Ollama episode publicly. No paid request was made. The public launcher continues to force paid hosted calls off. [PRESENTER_RUNBOOK.md](PRESENTER_RUNBOOK.md) records the gated pre-event Hosted OpenAI preparation path.

USER CONFIRMED — on the physical iPhone, Journey's saved-episode playback, seeking, replay and captions all work at application checkpoint `05e1542`. The requested check used `https://pope-java-fable.ngrok-free.dev/journey?step=premiere` and Play a saved episode. This closes the fresh Journey device check. Earlier phone joining/voting checks remain separately recorded. Venue/projector hardware, a repeat 35-session load test and long-duration memory pressure were not revalidated in this UI sprint. Mode/refresh persistence and existing recovery regression tests passed. A new process-kill rehearsal was not performed. The normal database's existing round, votes and approved episodes were preserved during this continuation. Automated production/publication used isolated test storage. The final public launcher and worker were restored using the normal database.

## Documentation reconciliation — November 12, 2026

Reviewed all tracked Markdown documentation against Git history, package scripts, current route files, permission guards, provider configuration and the silent Remotion player. Corrected obsolete single-room claims, public Studio descriptions, pending iPhone playback status and the handoff's active LAN launch instructions. Public ngrok is the approved hackathon path. Local-CA HTTPS remains a fallback. Clarified the optional hosted-model allowlist, API authorization, current versus proposed infrastructure, and historical benchmark scope. Added a consolidated changelog.

This refresh changes documentation only. Application acceptance and inference suites were not rerun. Documentation checks cover whitespace, repository-local Markdown links, referenced Git commits and npm command names. Existing evidence remains attributed to its application checkpoint. No application code, credentials, infrastructure or database records were changed.

---

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

# Public ngrok hackathon rehearsal for 35 audience members

The user approved a free ngrok HTTPS endpoint forwarding the existing Mac application for an audience of at most 35 people. The ngrok CLI 3.39.13 was installed, and the user created a free account and saved its authtoken locally. CLI configuration has owner-only permissions and remains outside source control. No paid API or paid tunnel upgrade was used.

## Changes and verification

- Added `npm run demo:tunnel` and its loopback upstream. The launcher starts ngrok with agent request inspection disabled, discovers its assigned HTTPS origin, starts the production application on 127.0.0.1:3456, starts the recovery worker with the same SQLite path and disables paid hosted inference. It also prevents macOS idle sleep while running. Stop with Ctrl+C. The configured public hostname, including equivalent default port 443, is validated and canonicalized before Next.js receives a request. Forwarding headers are overwritten from the configured origin. The Ollama port is excluded.
- Added content-free production-change notices to the existing room SSE connection. Audience clients fetch production only on those notices, focus/visibility changes and a 30-second fallback. Studio fallback is five seconds. Hidden pages pause production fetches. In-flight refreshes coalesce a subsequent notice instead of dropping it. SSE keeps its database handles for the connection, checks authorization/visibility each second, sends changed room snapshots, sends 15-second heartbeats and cleans up/reconnects after five minutes. Public streams still expose no drafts.
- PASS — strict typecheck and all 38 unit/regression tests. The two added regressions exercise live-stream vote/production notifications, access revocation/cleanup, invalid tunnel origins and rejection of the Ollama port. The initial stream-test fixture lacked the required cast; adding its guide corrected the fixture. Application validation was retained.
- PASS — optimized production build and all four existing production-browser scenarios in 59.1 seconds. Demo took 4.9 seconds, real Ollama took 38.5 seconds including 34.1 seconds production, delayed-session protection took 533 ms, and the creator journey took 3.2 seconds. Maximum sampled audience API latency was 22 ms in that real-model case.
- PASS — the repeatable `npm run demo:rehearse` test against the actual ngrok public endpoint, isolated SQLite, 35 independent simulated audience sessions and one mobile Chrome context. Results are `.data/rehearsals/1794428411206/results.json`; the database and screenshot are in the same ignored directory. The normal app's original episode and votes were preserved.

## Public rehearsal results

- All 35 session cookies were Secure, HttpOnly and SameSite=Strict. Twenty-three karaoke votes and twelve taho votes produced exactly 35 votes. An identical vote retry preserved the count and a conflicting retry returned 409. Every simulated audience stream observed all votes.
- Four real qwen3:4b-instruct stages completed on attempt one in 23.639 seconds. A playable preview was observed during Critic review. The resulting run was `4a223a5d-0c74-47a6-897a-4020a1adf2ec` in isolated storage. Private draft media remained absent from public production responses. Publication was repeated safely, and every audience session received the published episode through its production-change notice.
- The 50.697-second rehearsal recorded 401 API/SSE requests, plus the separately recorded browser requests. API response payloads totalled 223947 bytes and event payloads 64540 bytes, excluding protocol overhead. Mobile Chrome resource transfer reported 344465 bytes, which includes its measured resources and has browser caching/cross-origin measurement limits. These figures do not represent the account dashboard's exact billed traffic.
- HTTP request latency median was 102 ms, p95 was 157 ms and maximum was 279 ms. This sample includes request-body transfer and processing, using the Mac's current internet connection.
- Sampled per-process RSS peaks were web server 199.6 MiB, recovery worker 83.4 MiB, ngrok 39.2 MiB and model runner 657.2 MiB. One-second sampling and an already resident model limit interpretation. These are process RSS measurements, not total unified-memory allocation or long-duration capacity.
- Mobile Chrome entered through the normal free-plan Visit Site notice and verified generated episode touch playback, scene seeking and captions off/on. No horizontal overflow or page JavaScript error occurred. An idle 16-second window generated zero production API requests.
- A foreign-Origin mutation returned 403 and an untrusted Host returned 421. ngrok HTTPS used its normal publicly trusted certificate. No certificate-validation bypass was used in the public browser test.

## Failures found and limits

Two early HTTP/1.1 load-generator attempts recorded public connection resets after voting and real production had succeeded. They remain failed rehearsals under `.data/rehearsals/1794427970305/` and `1794428052663/`. Switching the simulator to reuse one HTTP/2 connection per session produced a successful 35-session run. This is consistent with reducing connection churn, but the exact source of the earlier resets was not established. The successful final run used 37 HTTP/2 connections including admin/public setup clients.

The HTTP/2 test first exposed a legitimate Host with an explicit default port 443. The upstream now accepts and canonicalizes that equivalent hostname while rejecting other ports/hosts. The first browser probe also checked Visit Site before its asynchronous notice was visible. Waiting for either the notice or app heading corrected the test, and a direct probe confirmed normal entry and playback. The final complete rehearsal passed all checks.

The free-plan documentation lists 20,000 requests and 1 GB outbound traffic per month, and 4,000 requests per minute. Current account usage and frontend downloads still matter. Thirty-five idle visible audience pages now use about 70 fallback production requests per minute, plus stream reconnects (about seven/minute averaged over five-minute connections), state refreshes and actual production notices. This is a planning estimate, not a quota or uptime guarantee. [ngrok free-plan limits](https://ngrok.com/docs/pricing-limits/free-plan-limits)

Physical iPhone playback/captions and venue-network reliability remain separate from simulated clients and Chrome touch emulation. The user has been asked to test the public URL and Studio QR. A short load rehearsal cannot establish an entire event's reliability. Keep the Mac plugged in, lid open, internet available and launcher running. No always-on hosted infrastructure migration was performed.

The normal database was restored as the live target after the isolated rehearsal. Its previous published episode remains available. A fresh audience voting round was opened for the phone check, preserving the prior closed round and votes. Current public audience URL is `https://pope-java-fable.ngrok-free.dev/live/barangay-2099`; Studio is the same origin at `/studio/barangay-2099`. Only the web app is forwarded. Listener inspection confirms loopback for the upstream, ngrok inspector and Ollama.

## Physical iPhone public follow-up and rewind fix

Tunnel implementation checkpoint is `01e710d2fe8bcbf5ff249b1c90278108882e6c05`. The user confirmed Vote recorded on the actual iPhone, followed by first playback and captions working through the public HTTPS origin. A current normal-database state check showed one taho vote in the new open round, with the original published episode retained.

The user then reported the entire picture disappearing after dragging the timeline backwards. A public mobile Chrome probe reproduced the blank canvas at frame zero and found the complete scene's inline opacity was zero. The composition faded the entire scene at each scene boundary. Commit `62a389f10bdf3a71999646cdbe6389323e93cf2a` limits that fade to the decorative background, keeping the base canvas, characters and captions painted while paused or seeking.

- PASS — strict typecheck and all 38 unit tests after the change.
- PASS — optimized build and all four production-browser scenarios, including new repeated rewind/replay checks at zero, the exact second-scene start and zero again. Demo case took 8.2 seconds, Ollama 42.7 seconds including 35.4 seconds generation, delayed-session regression 503 ms, and creator journey 3.3 seconds. Suite output reports 1.1 minutes. Maximum sampled audience API latency was 13 ms.
- PASS — repeated seek/play/pause cycles against the actual public HTTPS origin in mobile/touch Chrome. Frame-zero canvas opacity remained one, playback advanced each time, and no page JavaScript errors occurred. Before/after screenshots were visually inspected at `/tmp/airl-rewind-before.png` and `/tmp/airl-rewind-after.png`.
- PASS — native Core Image decoded the current Studio QR to the exact public HTTPS audience URL. The image is `/tmp/airl-public-room-qr.png`.
- PENDING — physical iPhone repeated rewind/replay confirmation after reloading the fixed version. This remains distinct from the user-confirmed first playback/captions.
- PENDING — the owner's AIRL profile email for local admin bootstrap. The normal database currently has no account, so publication by the owner still requires that setup. Anonymous audience participation already works.

The public launcher and worker were restarted on the normal database after rebuilding. The user's recorded vote and earlier episode were preserved. The public address remains `https://pope-java-fable.ngrok-free.dev/live/barangay-2099`. No paid call occurred.

## Physical iPhone replay and owner admin setup completed

Latest verified application checkpoint is `8a8903fea7f216d4725304a814d93c0633162484`.

After the visible-frame fix, the user confirmed the picture remained present but playback still failed to restart. Inspection of the installed Remotion playback loop showed it waits for audio-context resume while unmuted. A controlled public Chrome probe let initial playback run, then made the next AudioContext.resume promise stay pending after rewind. This reproduced the stalled frame-zero state with one attempted audio resume. The physical phone's internal audio state was not directly inspected.

The episode composition currently contains no audio. Its Player now starts muted, uses zero shared audio tags and hides volume controls. This lets the animation clock run without waiting for unused Web Audio resumption. Remotion documents the initial mute setting and shared audio-tag behavior in its Player API. [Remotion Player documentation](https://www.remotion.dev/docs/player/player)

- PASS — strict typecheck, optimized production build and all 38 unit tests, zero failures. The final unit run completed in 3.445 seconds.
- PASS — all five production-browser scenarios in 1.2 minutes. Demo case 7.8 seconds, real Ollama 43.7 seconds including 36.4 seconds production, delayed-session regression 552 ms, creator journey 3.3 seconds and the new silent-playback regression 4.2 seconds. Maximum sampled audience API latency was 29 ms.
- PASS — the added regression makes audio resume stay unresolved after first playback, then seeks/replays at zero, the second-scene boundary and zero again. Frames advance each time without requesting another audio resume. This is an explicit browser API test double.
- PASS — the same controlled test against the actual public HTTPS origin in mobile/touch Chrome. All three replays advanced, with zero blocked audio-resume calls after the change.
- USER CONFIRMED — repeated rewind and replay now work on the physical iPhone after loading the silent-replay version. This completes the previously pending phone replay check, alongside user-confirmed voting, first playback and captions.
- PASS — the owner's registered AIRL profile was granted admin through the trusted local CLI. A read-only role-count check confirmed one admin account. The account email and password are omitted from this report. Refresh Studio on the public origin to use the updated permissions.

The public launcher and recovery worker are running against the normal database with paid hosted calls disabled. The original episode and phone vote were preserved. The public audience URL remains `https://pope-java-fable.ngrok-free.dev/live/barangay-2099`. No paid API call or tunnel upgrade occurred. The 35-session rehearsal remains synthetic load evidence; the physical confirmation is one iPhone. A venue-network/full-presentation rehearsal and long-duration reliability remain follow-up work.

# Role-aware viewer and management interfaces

Application checkpoint is `7989ccde15933ab6765cd28ceebaa85cd489d535`.

The user requested hiding features unavailable to typical viewers. The root layout now derives permission data on the server from the authenticated session and existing ownership checks. Client gates consume account ID/role, creation permission, managed-world IDs and narrow existing operator access. Navigation uses request-time permissions, and authentication refreshes the server snapshot. Signout clears privileged UI immediately. Permission checks were added to Studio page entry points; API authorization remains enforced independently.

Viewer and guest interfaces hide Studio navigation, homepage/Explore/profile creation links, world-management links and creator-only character/provider-gateway links. Restricted controls are hidden instead of shown as disabled controls or an operator code form. Creators see their own world management; their global Studio link opens their own dashboard when viewing an official or another creator's world. Admins retain management and role-grant controls. Signed-in viewers retain authorized story questions. Guest story helpers show a sign-in link. Already-authorized legacy operator sessions retain narrow official-room access and the existing code-redemption API remains available.

The sign-in/sign-out regression also found an existing form bug: a fresh sign-in submitted an empty optional name and failed credential validation. The request now includes the name only for signup and sends only the relevant fields for each action. The first browser run failed on that real issue; the corrected complete run passed.

- PASS — strict typecheck and optimized production build.
- PASS — all 38 unit/regression tests, zero failures, 3.435 seconds.
- PASS — all six production-browser cases in 59.6 seconds. The new role case took 3.2 seconds. Demo took 7.6 seconds, actual Ollama took 29.7 seconds including 22.4 seconds production, delayed-session regression took 468 ms, creator journey took 3.2 seconds and silent replay took 4.2 seconds. Maximum sampled audience API latency during Ollama was 13 ms.
- PASS — guest and viewer pages omit management links across landing, discovery, world, character and account pages. Their direct Studio, provider-settings and world-editor URLs return 404. Viewer admin/gateway/private-production API requests remain rejected with 403. Guest voting remains usable, and signed-in viewer story questions remain visible.
- PASS — creator links appear for owned worlds and stay absent for other worlds and official canon. Creators retain creation/settings flows and have no admin role-grant interface. Admin controls remain visible. Signing out hides privileges, and a fresh sign-in restores the correct navigation.
- PASS — actual public HTTPS mobile Chrome smoke check against the normal database. Audience links remain available, management links stay hidden, protected Studio URLs return 404, and published playback advances without page JavaScript errors. Screenshot is `/tmp/airl-viewer-public.png`.

Changed areas are the root layout, shared access context/types, server page guards, navigation/home, world/profile/story-helper/Studio interfaces, the sign-in payload and focused browser coverage. No schema migration, paid API call or infrastructure change was performed. The public launcher and worker are running on the normal SQLite database with paid calls disabled. Existing stored episodes/votes and the physically verified silent-replay fix were retained. The prior 35-session load result was not rerun for this presentation change; role and workflow acceptance plus the public smoke check provide the current evidence.
