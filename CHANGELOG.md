# AIRL development changes

Updated November 12, 2026. Latest verified application commit is `7989ccde15933ab6765cd28ceebaa85cd489d535`. This file summarizes implemented changes. Detailed checks, earlier failures and remaining verification limits are in [VERIFICATION.md](VERIFICATION.md).

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
