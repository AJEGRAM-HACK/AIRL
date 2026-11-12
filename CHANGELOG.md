# AIRL development changes

Updated November 12, 2026. Latest verified application commit is `da763cfa502cc1570397133439ec1bb271151e7a`. This file summarizes implemented changes. Detailed checks, earlier failures and remaining verification limits are in [VERIFICATION.md](VERIFICATION.md).

## Complete entertainment frontend — `da763cf`

- Unified public surfaces with local typography, restrained violet tokens, consistent controls/focus/states and responsive layouts.
- Refined universe lore, cast, episode/canon presentation and accurate Official canon / Creator universe labels.
- Simplified mobile voting with large native choices, recorded confirmation and actual counts; kept the original anonymous/session/SSE flow.
- Added a four-stage timeline from persisted stage/status/events, with accurate Demo provenance and private draft boundaries.
- Made the existing player the episode reveal, with winning choice, cast, source decision and continuation links.
- Simplified creator/private creation and Studio navigation; advanced providers and script/event detail remain accessible through disclosure. Preserved every backend/schema/provider/authentication/video contract.
- Passed 38 unit tests and 13 full-suite browser cases, then a fresh build/focused check for a final copy clarification. Reviewed/preserved ten real Chrome screenshots; physical-device/venue/human timing checks remain open. See [the full report](docs/HACKATHON_UI_REPORT.md).

## Hackathon UI/UX Optimization — `1731549`

- Made Explore Universes the main landing action, with featured-world artwork, a short participation story, permission-aware creation and a visible Journey entry.
- Simplified public navigation to Home, Explore, Live, Sign in/Profile and authorized Studio. Kept Episodes/Characters contextual and retained legacy routes and mode context.
- Added visual universe discovery with local search/genre filters and explicit loading, empty and error states over the existing API.
- Scoped responsive typography/colors/styles to the public surfaces; preserved the Manila Journey and all backend/schema/provider/authentication contracts.
- Passed typecheck/build, all 38 unit tests and all 11 production-browser cases on isolated databases, including real local Ollama. Preserved runtime-file fingerprints. No paid operation, deployment or remote push occurred. Physical-device/venue checks remain open.

## Preservation and next redesign planning

- Created local source branch `checkpoint/pre-hackathon-ui-pivot-2026-11-12` at clean original HEAD `fc48254`, preserving application baseline `1a7baf3` and all later documentation.
- Audited existing source/contracts/docs and ignored-data locations. Added a preservation record and private backup/isolated restore procedure.
- Added product vision, proposed UI information architecture, current/proposed universe and character mappings, credible hackathon demonstration and phased roadmap.
- Realigned documentation with already implemented accounts, roles, owned universes and scoped cast/canon. Corrected the obsolete configurable-root route description and mapped Member to the current viewer role.
- Consolidated onboarding and documentation links in README, retaining detailed LAN operation in the presenter runbook. Historical verification and benchmark outputs were preserved.
- Application tests and inference were not rerun. The next UI sprint awaits user review.

## Manila Journey presentation — `1a7baf3`

- Restored `/` as the everyday Explore entry with regular navigation. `/platform` remains an alias. Added prominent Launch Journey and dedicated Exit to Explore actions carrying universe, round, episode and selected chapter context.
- Rebuilt Journey around the supplied Manila Hack palette, oversized local Schibsted Grotesk, ambient CSS motion, slim chapter rail and a persistent winning decision. The font and SIL Open Font License are bundled locally.
- Made chapter changes presenter-controlled. Generation animates recorded agent events and reveals one validated excerpt or versioned preview at a time. Premiere uses the media stage with shared playback controls.
- Added native slide-up sheets for cast, transcripts, authorized review, presentation settings and saved selection. Tab stays in the sheet, Escape closes it and focus returns to its trigger. Reduced motion disables decorative and transition animations.
- Passed typecheck, production build, 38 unit tests and nine browser cases in 1.8 minutes. Public mobile Chrome and 1440 × 900 / 390 × 844 visual checks passed, including movie-control fit, saved replay, captions, sheets and exact QR decoding.
- The physical iPhone user confirmed clear mode distinction and working Exit. Fresh cast/transcript/playback device checks are deferred. Earlier physical playback remains recorded at its original checkpoint.

## Guided hackathon Journey — `05e1542`

- Preserved Copilot's Explore/Journey shells, public-root routing, responsive styling and improved room-join copy. Completed five stages around the existing persisted room/job/episode services.
- Added a visible mode switch with universe, round and episode context, configured-universe selection, recorded winner, genuine stage progress, early validated dialogue/preview, canon review, premiere and spoiler-scoped story helper.
- Added approved saved-episode playback with the Pre-generated rehearsal episode label and zero generation calls. Live status remains available and completed live episodes remain selectable.
- Kept QR links on the focused mobile `/live/[id]` route and added a separate presenter Journey address to the launcher. Journey uses local qwen3:4b-instruct. Studio retains explicitly gated Hosted OpenAI preparation.
- Passed typecheck, optimized build, 38 unit tests and eight browser cases, including two independent audience sessions, real Ollama, mode/refresh persistence, private drafts, saved playback, publication and a cited 12-second scene answer.
- Verified public HTTPS saved playback, rewind/captions, exact decoded QR destination, guest Studio 404 and light/dark projector/mobile layouts. The user also confirmed saved-episode playback, seeking, replay and captions on the physical iPhone. Actual Hosted OpenAI generation remains pending.
- Added [PRESENTER_RUNBOOK.md](PRESENTER_RUNBOOK.md) for launch, presentation, fallback and gated pre-generation.

## Viewer and admin interfaces — `7989ccd`

- Server-derived role and ownership data controls navigation and management links. Guests/viewers see audience features, signed-in viewers retain story questions, creators manage owned worlds, and admins manage official canon and creator grants.
- Studio pages enforce authorization on the server. Unauthorized direct URLs return 404. Existing API authorization remains enforced.
- Signing out clears privileged UI immediately. Authentication refreshes server permissions. Corrected the sign-in form's empty-name payload failure.
- Added browser coverage for guest/viewer/creator/admin visibility, ownership, direct page/API denials and sign-in/sign-out.
- Typecheck, production build, 38 unit tests and six browser cases passed. The real Ollama browser production took 22.4 seconds. Public guest mobile Chrome smoke passed. The earlier 35-session rehearsal was not repeated for this change.

## iPhone playback reliability — `62a389f`, `8a8903f`

- Preserved visible scene content while seeking to frame zero and exact scene boundaries. Decorative background fades remain available.
- Removed the silent player's dependency on Web Audio resumption by starting muted with zero shared audio tags and hidden volume controls.
- Added repeated seek/replay coverage, including a deliberately unresolved audio-resume promise.
- The user confirmed public iPhone playback, caption toggling and repeated rewind/replay. The owner account was granted admin locally. Account credentials remain outside documentation.

## Public hackathon demo — `01e710d`

- Added the approved ngrok HTTPS launcher, strict loopback upstream, automatic recovery worker and macOS idle-sleep prevention for an audience of up to 35.
- Added hostname/origin validation and canonical forwarding headers. Disabled agent request inspection and paid hosted calls in the demo launcher. Ollama remains loopback-only.
- Added content-free production-change notices to SSE, slower fallback polling and hidden-page fetch suppression.
- Added an isolated public rehearsal with 35 simulated HTTP/2 audience sessions, real Ollama and mobile Chrome. Verified vote totals, privacy, publication idempotency and playback. Production took 23.639 seconds, request p95 was 157 ms.
- Early HTTP/1.1 rehearsals encountered connection resets. Their exact cause remains unresolved. The successful HTTP/2 rehearsal and its limits remain recorded.

## Multi-universe foundation — `2f37d36`

- Added accounts, viewer/creator/admin roles, private interests and personalized discovery.
- Added private world creation from a blank draft or three editable AI pitches, explicit public visibility, archive/restore, settings, cast, relationships and protected reference-image storage.
- Added scoped rooms, episode/character routes, ordered canon and spoiler-scoped cited story answers.
- Added frozen production snapshots, early script outlines, versioned previews before Critic review, compatible stage reuse and correctable canon proposals. Publication atomically commits episodes and canon.
- Verified additive migration on a backup before applying it, preserving legacy official-world records and IDs. Added fixed-input real Ollama benchmarks.

## Earlier working foundation

- Built the AIRL modules, mobile audience UI, Studio, light/dark/system themes and compatible CinemAI routes.
- Connected opaque audience sessions and transactional SQLite voting to persisted jobs, sequential Director → Screenwriter → Visual Producer → Critic execution, private review and publication.
- Integrated Zod outputs, local recovery, bounded retries, approved character memory and silent portrait Remotion playback.
- Added labeled offline Demo, real loopback Ollama and OpenAI Agents SDK adapters. Hosted OpenAI and HTTPS request-only BYOK await authorized live validation.
- Added the local-network HTTPS/QR fallback and Safari 16 build compatibility. Genuine restart recovery preserved votes and idempotent publication.

## Remaining work

1. Rehearse the complete owner-admin presentation on the venue network using QR entry and the physical iPhone.
2. Repeat production and crash recovery on the presentation build while measuring memory pressure, latency and tunnel allowance.
3. Validate hosted OpenAI and HTTPS BYOK after credentials and explicit paid-call authorization.
4. Extend accessibility, device coverage and human-reviewed continuity/language evaluation.

Always-on hosting, hosted identity recovery, moderation, MP4 export, audio, generated artwork, forks and teams remain future scope. Reference images can be stored and linked, while upload UI and custom artwork rendering remain open.
