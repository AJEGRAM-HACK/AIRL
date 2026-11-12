# AIRL — Artificial In Real Life

**The real world is the prompt.**

AIRL combines community participation, fictional characters and creative production in one Next.js application. AIRL Live owns voting, CinemAI owns episodes, and PersonaAI maintains universe-scoped characters and approved canon. Barangay 2099 is the official public universe. Creators can build private worlds and publish them to Explore.

The current local milestone connects real votes to a persisted provider-selected production job, role-protected human review and a portrait Remotion preview. Profiles, private interests, world settings, character/relationship editing, three AI-generated starting pitches and spoiler-scoped story answers are available. Existing hosted OpenAI, request-scoped BYOK and local Ollama adapters remain available through creator settings and the CLI.

For system design, data ownership, migration options and candidate routes, read [ARCHITECTURE_PLAN.md](ARCHITECTURE_PLAN.md). Actual test outcomes and verification limits are recorded in [VERIFICATION.md](VERIFICATION.md). [CHANGELOG.md](CHANGELOG.md) summarizes implementation checkpoints, and [HANDOFF.md](HANDOFF.md) provides the development handoff.

Latest verified application commit is `05e1542bcf02d191c07eee5e8e98a82915399125`. Typecheck, production build, 38 unit tests and eight production-browser cases passed. Physical iPhone voting, playback, captions and repeated rewind/replay were user-confirmed on the public tunnel. The earlier 35-session simulated rehearsal passed. Full evidence and measurement limits remain in the verification record.

## Run locally

Use Node.js 24 LTS and npm. No credentials are required for Demo mode or community participation.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. The temporary runtime used in this development session is available through:

```sh
export PATH=/tmp/node-v24.22.2-darwin-arm64/bin:$PATH
```

Install Node 24 normally for ongoing work because files under `/tmp` can disappear.

## Demonstrate the community loop

1. Open `/live/barangay-2099` in a normal window and a separate browser profile or private window.
2. Join the room and cast a vote from each session. Aggregated results stream through the local server.
3. Sign up at `/account`. Bootstrap your existing account as admin using the local command below, then open `/studio/barangay-2099` and join. Admins manage official canon. Creator owners manage their custom worlds.
4. Select Demo or Ollama, then choose Close voting & produce. The winner is frozen and one provider-tagged job is persisted for the round. The response schedules local execution using Next.js `after`.
5. Inspect the production panel for actual stage timestamps, attempts and critic feedback. A successful draft enters review.
6. Choose Approve & publish. The audience's Community episodes panel receives the published manifest and can play the new composition. Rejected drafts remain private.
7. Start next round when ready. Existing votes and published episodes remain in storage.

Anonymous identities belong to sessions. Clearing cookies can create another identity. Ties, including an empty round, use displayed option order. Votes, closure, queued jobs and publication have database-backed idempotency protections.

## Profiles and custom universes

Accounts start as viewers. Interests are optional, private and editable. Anonymous voting remains available. An admin grants creator access from `/studio`. Initialize the first admin from the trusted local terminal after signing up.

```sh
npm run account:admin -- your-email@example.com
```

Studio links, creation tools, provider-gateway links and management controls are visible only with the corresponding server-validated permissions. Viewers keep audience navigation, voting, published playback, their profile and signed-in story questions. Creators see management links for their own worlds. Admins can manage all worlds. Direct unauthorized Studio URLs return 404. Signing out clears privileged navigation immediately.

Creators use `/studio` to start from scratch or generate three editable pitches. Save a private world, edit its settings and cast, join its room, select a provider and close the vote. A validated script appears first, followed by a versioned playable preview while the Critic runs. Review and optionally correct proposed canon JSON before publication. Publish the universe separately to make its episodes and characters visible in Explore.

| Route | Experience |
| --- | --- |
| `/account` | Signup, signin, signout and private interests |
| `/universes` | Personalized public discovery |
| `/universes/[id]` | Accessible world, episodes and timeline |
| `/universes/[id]/episodes/[episodeId]` | Playback, seeking, captions, transcript, winning round and cited story helper |
| `/universes/[id]/characters/[slug]` | Profile, relationships, canon timeline and story helper |
| `/studio/worlds/[id]` | Owner/admin world settings, cast, relationships and production review |
| `/live/[id]?round=[roundId]` | Scoped source-round results plus current room |

The helper defaults to This episode on episode pages. Through this episode and Latest canon retrieve sources before inference. Studio draft sources require management permissions. Asking requires a signed-in profile. Hosted OpenAI and session BYOK require explicit consent for each operation. BYOK is supported for request-scoped pitches, answers and gateway previews. Background episodes support Demo, Ollama and configured Hosted OpenAI.

### Existing data migration

```sh
npm run migrate:universes
# After the preserved copy passes verification
npm run migrate:universes -- --apply
```

The script backs up the existing database under ignored `.data/`, applies additive transactional migrations to the copy and checks legacy rows, IDs, memories, foreign keys and integrity. At the migration checkpoint, copy verification preserved three original characters, one published episode and both original votes. Later account and rehearsal activity adds records to that baseline. Retain backups. New installations initialize the same schema automatically.

### Verification and benchmark

```sh
npm run typecheck
npm test
npm run build
npm run test:browser
npm run benchmark:local
```

The benchmark uses fixed inputs in `benchmarks/local-inputs.json`, isolated SQLite, genuine local inference and disabled paid calls. It records model/settings, elapsed time, stage failures, attempts, preview availability, output artifacts and citations. Results and quality observations are recorded in `benchmarks/README.md`. Run inference checks sequentially on the M2 Pro / 16 GB Mac.

## Worker and recovery

Room jobs use the existing local Live database. Room production defaults to Ollama with `qwen3:4b-instruct`. Operators can select installed Ollama inference, or explicitly consent to Hosted OpenAI when server credentials are enabled. No creator key enters a job. Job states are queued, running, review, failed, published and rejected. Stage-level schema retries and one critic revision are bounded. Operators can retry failed room jobs up to three production attempts.

If a process stops before an `after` callback completes, recover persisted work with:

```sh
# Execute one available job
npm run production:drain

# Poll for queued work and expired claims until interrupted
npm run production:worker
```

Worker claims are serialized and have a bounded lease. Completed drafts are reused during recovery. An interrupted inference may need another attempt, while published episodes remain protected by unique run references and transactional publication. This local scheduler is limited by process lifetime. Trigger.dev remains the planned hosted durable execution adapter.

## Main routes

| Route | Experience |
| --- | --- |
| `/` | AIRL homepage |
| `/discover` | Available modules and coming-soon concepts |
| `/live` | Room directory |
| `/live/barangay-2099` | Voting, streamed results and published community episodes |
| `/studio` | Owned worlds, both creation paths and admin creator grants |
| `/studio/barangay-2099` | Room controls, job events, review and publication |
| `/studio/ai` | Creator-protected provider tests and previews |
| `/cinemai` | CinemAI landing page |
| `/cinemai/watch/barangay-2099` | Existing storyboards and shared community panel |
| `/cinemai/universe/barangay-2099` | Fictional universe |
| `/persona` | Universe directory for character libraries |
| `/persona/captain-bot` | Character profile, scripted scenarios and AI conversation entry |
| `/persona/tita-nena` | Tita Nena profile |
| `/persona/kuya-taho` | Kuya Taho profile |

Legacy `/watch/barangay-2099` and `/universe/barangay-2099` routes remain available. Unknown IDs return 404. The architecture plan records the implemented universe/account routes and candidate hosted features.

## Experience modes

Explore mode at `/platform` retains Live, CinemAI, PersonaAI, authorized Studio and the existing deep links. Journey mode at `/journey?universe=barangay-2099` guides a presenter through the world, audience decision, genuine production, review/premiere and an episode-scoped story question. The header switch carries universe, round and episode context. Journey steps and saved selection are shareable URL parameters. Switching and refreshing reuse the persisted pipeline.

The presenter can select another accessible universe with a configured room. Server wrappers validate visibility and recorded round ownership. Draft dialogue, previews, canon proposals and publication controls retain account and ownership checks. Official publication requires an admin. Journey live production uses Ollama `qwen3:4b-instruct`. Studio retains the existing provider options for separately authorized preparation.

Play a saved episode opens an approved stored episode from the selected universe, labeled Pre-generated rehearsal episode. It makes zero inference calls. Live job status stays visible, with links back to the pending production or completed live episode. A world without an approved episode explains that preparation is needed. The saved path was rehearsed using an explicitly generated offline Demo episode alongside actual Ollama production.

The root uses Journey when `AIRL_PUBLIC_ORIGIN` or `NEXT_PUBLIC_EXPERIENCE_MODE=journey` is set. The tunnel prints a presenter Journey address and an audience `/live/barangay-2099` address. QR codes target the focused `/live/[id]` phone experience in every universe. The existing layout and responsive work from the initial Copilot changes are retained.

Follow [PRESENTER_RUNBOOK.md](PRESENTER_RUNBOOK.md) for launch, QR entry, review, saved fallback and the gated Hosted OpenAI rehearsal preparation procedure. Actual hosted generation awaits server configuration and explicit paid-run approval.

## AI modes

| Mode | Behavior | Verification |
| --- | --- | --- |
| `demo` | Offline deterministic templates and scripted replies | Unit and HTTP workflows tested |
| `ollama` | Server-only local inference using installed-model discovery | Real `qwen3:4b-instruct` inference and four-stage pipeline tested |
| `hosted_openai` | Server key, configured model and explicit consent | Awaiting application credentials and authorized live test |
| `creator_byok` | Creator's OpenAI key in page/request memory | Mocked key-isolation and security rejection tests passed. Real HTTPS inference pending |

`AI_PROVIDER=ollama` is the CLI default. Set `AI_PROVIDER=demo` for an offline rehearsal. The legacy `openai` identifier maps to `hosted_openai`. Room production has its own explicit provider selector. The selected mode/model is frozen on the round job. Hosted runs require per-round paid consent and server enablement. Creator BYOK remains request-only.

```sh
npm run production -- "Ban Monday meetings"
AI_PROVIDER=ollama OLLAMA_MODEL=qwen3:4b-instruct npm run production -- "Ban Monday meetings"
npm run production -- inspect RUN_ID
```

Use the exact model name returned by your Ollama installation. A hosted function cannot reach the Mac's loopback Ollama endpoint. The adapter rejects Vercel execution and serializes local inference through a shared lease.

## Provider settings and security

Creator settings require an account with admin or authorized creator role. Sign in, then open `/studio/ai`. Test connection performs a real structured character inference for the selected model. A successful Demo test is labeled deterministic.

BYOK requires HTTPS, same-origin requests, authenticated creator access and explicit paid-request consent. Plain HTTP localhost rejects BYOK. Keys stay in page/request memory, clear when disconnected or the provider changes, and never enter cookies, web storage, URLs, logs, usage records or background jobs. Hosted OpenAI additionally requires server environment enablement. Providers never silently fall back.

Gateway previews use request-local memory and do not publish canon. CLI production and room production persist artifacts according to their separate review/publication paths. Approved room memory updates now commit atomically with publication, and PersonaAI prompts and profile pages read this canonical memory. Settings previews receive current approved profiles without changing public canon. Usage records contain creator-scoped metadata, timestamps, reported tokens, sanitized failures and optional estimates rather than prompts or keys. Cloud trace export is disabled by default.

## Configuration and storage

Copy `.env.example` to ignored `.env.local` only when changing defaults. Never commit real credentials.

- Module flags in `src/lib/config/features.ts` control availability, independently of authorization. Public flag changes require a production rebuild.
- `AIRL_LIVE_DB_PATH` defaults to `.data/airl-live.sqlite`. The web app, operator CLI and recovery worker must use the same path.
- The shared Live database also stores room jobs, drafts, publication records and room story memory. Existing mode-specific CLI databases remain intact.
- `CINEMAI_DB_PATH` optionally changes the standalone production CLI database.
- `AIRL_AI_REQUEST_TIMEOUT_MS`, `AIRL_AI_MAX_OUTPUT_TOKENS` and `OLLAMA_CONTEXT_WINDOW` configure bounded inference limits.
- `AIRL_AI_DAILY_REQUEST_LIMIT` caps creator requests. Optional model rates and estimated daily spend reservations provide approximate budget gating. Provider-side billing controls remain authoritative.
- Hosted OpenAI requires `OPENAI_API_KEY`, `OPENAI_MODEL` and `AIRL_ALLOW_LIVE_REQUESTS=true`, plus explicit operation consent. `OPENAI_ALLOWED_MODELS` optionally overrides the allowlist, which otherwise contains `OPENAI_MODEL`. The public demo launcher disables paid hosted calls.

SQLite uses Node 24's built-in implementation and needs a persistent writable filesystem. Supabase Auth/PostgreSQL/RLS/Realtime/Storage remains the intended hosted integration. Vercel's ephemeral filesystem cannot serve as the shared production database.

## Media and themes

New manifests play through Remotion at 720 × 1280 and 30 FPS. The default Demo composition lasts 18 seconds across three scenes. It uses approved CSS backgrounds, reusable Lucide character pictograms, camera/entrance presets, timed captions, transcript access and reduced-motion handling. Asset IDs and animations are validated enums. Model output cannot execute code or choose filesystem paths.

Generated episodes and labeled reference fixtures share one audience episode selector. Studio shows genuine job modes, model IDs, attempts, events and critic results. Legacy disconnected agent cards and seeded dashboard counters have been removed. MP4 export, audio, voice synthesis and higher-resolution artwork remain later milestones.

Remotion packages are pinned to matching versions for this local evaluation. Confirm license eligibility before commercial hosting. Its documented free-license criteria include noncommercial evaluation. [Remotion license FAQ](https://www.remotion.dev/docs/license/faq)

The Color theme selector supports System, Light and Dark, preserves preference locally and responds to system changes. Chrome acceptance is available through Playwright using the locally installed browser.

## Tests and production build

```sh
npm run test:production
npm run test:live
npm run test:providers
npm run test:room-production
npm run test:sprint
npm run test:browser
npm run typecheck
npm run build
npm run start
```

Queue tests cover one job per round, private review drafts, idempotent publication, rejection, lease recovery, bounded retries and invalid media rejection. Media tests verify scene boundaries, timing, asset references and selected-choice content. These checks do not replace real-browser playback and accessibility testing.

## Next development priorities

1. Rehearse the owner-admin presentation on the venue network, including QR entry, voting, publication and repeated iPhone playback.
2. Rehearse repeated world productions and restart recovery under presentation load, monitoring memory pressure and ngrok allowance.
3. Validate hosted OpenAI and HTTPS BYOK after credentials and paid-call approval.
4. Extend device, keyboard, reduced-motion and accessibility coverage.
5. Plan universe forks, creator-supplied art/audio and team collaboration. Hosted storage, scheduling and exports require a separate milestone.

## Integration sprint acceptance

The browser suite starts an isolated production server on port 3100 and a temporary SQLite database. It runs Demo and real Ollama scenarios with two independent mobile audience contexts plus an operator. Tests use real voting controls, provider selection, review, approval, advancing Remotion frames, scene seeking, captions, unified episode selection and published PersonaAI memory. Chrome must be installed. Ollama must serve `qwen3:4b-instruct` for the real-model scenario. No OpenAI test is executed automatically.

Review rejection now uses a conditional SQL transition, while publication reads and commits under an immediate transaction. Racing decisions cannot overwrite a finalized state. Concurrent-worker regression tests exercise this behavior. Provider jobs retain mode/model/consent metadata and creator attribution, but no credential. Usage quota and estimated budget checks also apply to room inference.

Local inference uses compact story/review context and bounded per-stage output limits within the configured total timeout. A timed-out or critic-rejected run remains failed or in review as appropriate. Retrying never switches providers. Actor memories and history become canonical only through approval. Demo replies and real-model prompts use the same approved memory reader.


## Hackathon public demo for up to 35 viewers

Run AIRL and local Ollama on the Mac, with an ngrok HTTPS endpoint forwarding only the web application. Audience phones open the public URL without enrolling the local demo CA. The recovery worker starts with the launcher. Ollama stays on `127.0.0.1:11434`.

The ngrok CLI is installed on this Mac. Create a free ngrok account and save its authtoken using the dashboard command in your own terminal. Its configuration stays outside the repository. Keep the token out of chat, source and environment examples.

```sh
export PATH=/tmp/node-v24.22.2-darwin-arm64/bin:$PATH
npm run build
npm run demo:tunnel
```

The launcher prints the public audience and Studio addresses. Open Studio at that public origin for the QR code. Free ngrok visitors first tap **Visit Site** on its browser notice. Keep the Mac plugged in with the lid open, its internet connection available and the launcher terminal running. The launcher prevents idle sleep on macOS. Ctrl+C stops the tunnel, web app and its recovery worker.

The launcher binds its upstream to loopback port 3456, accepts only the assigned ngrok hostname, normalizes its HTTPS identity and replaces visitor-supplied forwarding headers. Agent request inspection is disabled. Paid Hosted OpenAI requests are disabled for the launcher and worker. Existing account roles and private-world boundaries still apply. Sign in on the public origin before operating Studio, since LAN cookies belong to a different origin. Bootstrap an existing account locally with `npm run account:admin -- your-email@example.com` when needed.

Audience production updates use notices over the existing SSE connection, with a 30-second fallback poll and refresh after returning to the page. Studio also has a five-second fallback. Idle SSE connections send heartbeats and reconnect after five minutes. Voting and publication notices remain live without the previous 1.5-second audience polling.

```sh
# A separate isolated database, 35 simulated public audience sessions,
# genuine Ollama production and one mobile Chrome playback check
npm run demo:rehearse
```

Stop an existing tunnel before rehearsal. The command uses the account's actual public ngrok endpoint and saves results under ignored `.data/rehearsals/<timestamp>/`. It spends some free-plan request/bandwidth allowance. It verifies 35 distinct votes, stream delivery, draft privacy, real four-stage generation, idempotent publication, Secure cookies, origin/Host rejection and Chrome touch playback/captions/seek. It uses HTTP/2 connection reuse to represent browser traffic. Physical-device results remain separately recorded in `VERIFICATION.md`.

The free-plan limits recorded during the November 12, 2026 rehearsal include 20,000 HTTP requests and 1 GB outbound traffic per month, with a 4,000-request/minute limit. Existing account usage, frontend downloads, audience reconnects and rehearsal traffic count toward those allowances. Check the dashboard before judging. [ngrok free-plan limits](https://ngrok.com/docs/pricing-limits/free-plan-limits)

## Local-network HTTPS fallback

Use the Mac and phones on the same trusted Wi-Fi. The dedicated launcher binds only to a private IPv4 address assigned to the Mac, validates the Host header and terminates TLS in the application process. Ollama remains on `127.0.0.1:11434`. Room QR images are generated locally with `qrcode` and contain only the public audience URL.

```sh
# Use Node 24. The temporary development runtime may require this PATH.
export PATH=/tmp/node-v24.22.2-darwin-arm64/bin:$PATH
export AIRL_DEMO_HOST="$(ipconfig getifaddr en0)"
export AIRL_LIVE_DB_PATH="$PWD/.data/airl-live.sqlite"
npm run demo:setup
npm run build
npm run demo:lan
```

If Wi-Fi uses another interface, select its assigned private IPv4 address. Setup creates an ignored local CA and a 30-day server certificate under `.data/demo-tls/`. Rerun setup after the IP changes or the server certificate expires. Preserve the CA for phones already enrolled. Private keys stay on the Mac with restricted permissions. Transfer only `root.crt` to the iPhone through AirDrop or USB, install the profile in Settings, then enable AIRL Local Demo CA under Settings → General → About → Certificate Trust Settings. Remove the demo CA profile after the event. [Apple certificate trust instructions](https://support.apple.com/en-ph/102390)

Open the printed `https://<LAN-IP>:3443/studio/barangay-2099` address on the Mac. Its room-joining panel displays a QR code and clickable audience URL. Scan it using the iPhone camera after trusting the CA. At the top of the audience room, Vote on next chapter jumps directly to joining and choices; Watch episodes returns to playback. The normal loopback Studio instead explains how to get a phone-accessible QR. Port 3443 is configurable using `AIRL_DEMO_PORT`. If access fails, check the IP, Wi-Fi client isolation, certificate trust and macOS incoming-connection prompt. Keep router port forwarding disabled.

Sign in as an admin on the HTTPS origin to publish official canon. Bootstrap the signed-up account locally using `npm run account:admin -- your-email@example.com` with the same database. Legacy operator codes provide official-room round controls and draft inspection. Publication requires the admin account. Select Ollama and `qwen3:4b-instruct`, collect phone votes, close voting, inspect actual stage events, then approve and play the episode on the phone. Test captions, scene seeking and locking/unlocking Safari. Operator sessions belong to the chosen HTTPS origin; a localhost login does not transfer.

For crash recovery, restart `npm run demo:lan` with the same database and start `npm run production:worker` in another terminal with that database. A killed running job becomes claimable after its 150-second lease expires. The worker polls every two seconds. Recovery can repeat inference, reuses completed drafts when available and preserves publication idempotency. Failed jobs require operator retry and retain the three-attempt limit. Keep the worker running during the presentation.

For acceptance, run `npm run test:browser` separately from the presentation; it rebuilds `.next` and uses an isolated port/database. Run `node_modules/.bin/tsx --test tests/*.test.ts` for all unit regressions, including the LAN bind restrictions. Browser emulation and local certificate checks supplement the physical-phone rehearsal.


The build explicitly targets Safari 16 after the physical iPhone exposed an unsupported class static block in the default Next client bundle. When changing browser targets, use a clean generated build because the existing cache retained older output during verification. Physical iPhone joining and voting now pass. A real winning taho vote completed all four Ollama stages and publication in 28.3 seconds. On the public ngrok origin, the user confirmed voting, initial playback and caption toggling. A blank frame after rewind was reproduced and fixed by preserving visible episode content at scene boundaries. A second fix makes silent playback independent of audio-context resumption. The user confirmed repeated rewind/replay on the physical iPhone through the public URL. See VERIFICATION.md for exact evidence and limits.
