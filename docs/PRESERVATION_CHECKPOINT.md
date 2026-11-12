# Pre-redesign preservation checkpoint

Recorded November 12, 2026 for the documentation-first preservation sprint. This record preserves the current build before any subsequent UI redesign. The design and implementation phases in [REDESIGN_ROADMAP.md](REDESIGN_ROADMAP.md) await review.

## Git and application baseline

| Item | Recorded state before documentation edits |
| --- | --- |
| Repository | `/Users/ajegram/CinemAI` |
| Branch | `main` |
| Original HEAD | `fc48254f74262756c6a630fd1b83aac26bc7467d` |
| Source checkpoint branch | `checkpoint/pre-hackathon-ui-pivot-2026-11-12`, at original HEAD |
| Latest verified application | `1a7baf3a09233a3e43d01d89c93320a8e2b76a79` |
| Earlier baseline from request | `318b2f0`, an existing ancestor 20 commits behind original HEAD |
| Tracked modifications | None |
| Untracked project files | None |
| Preservation validation | Fingerprinted 145 tracked non-Markdown files and inventoried 528 ignored `.data` files outside the repository |

Recent preserved history is `fc48254` documentation, `1a7baf3` Manila Journey, `8446869` physical-device record, `5341cd6` Journey documentation and `05e1542` guided Journey. The new documentation commit is a descendant of the original HEAD. A separate documentation tag named `checkpoint/pre-hackathon-ui-pivot-docs-2026-11-12` identifies the completed documentation checkpoint. The source checkpoint branch remains pinned to the original code/documentation state.

All pre-existing project files were tracked at the start. Git protects the source, lockfile, existing documentation, reference font/license and tracked benchmark artifacts at the checkpoint. Ignored runtime data and configuration require separate backup. This sprint establishes the procedure below and performs read-only preservation checks. It does not create a private-data backup archive.

## Existing modules and evidence

AIRL foundation/Explore, AIRL Live, CinemAI, PersonaAI, owned universes and creator/admin Studio are implemented. Accounts, character profiles, relationships, canon, local voting, persisted four-stage jobs, review, atomic publication, Remotion playback, QR joining and the local recovery worker already exist. Journey adds a dedicated presenter layout over the same records.

Prior acceptance at `1a7baf3` passed typecheck, production build, 38 unit tests and nine production-browser cases. Real community Ollama production took 25.4 seconds in that run, with a maximum sampled audience API latency of 8 ms. The physical iPhone user confirmed clear mode distinction and working Exit. Fresh Manila sheet/playback device checks remain deferred. The earlier physical replay test and 35-session synthetic rehearsal remain historical evidence. No application tests or inference are rerun for this documentation sprint. Full failures, measurements and limits remain in [VERIFICATION.md](../VERIFICATION.md).

Browser acceptance uses `AIRL_LIVE_DB_PATH ||=` in playwright.config.ts. An inherited live database path defeats its temporary default, so README now supplies an explicit disposable path for future acceptance. This configuration behavior is documented and preserved, with no source fix in this sprint.

Hosted OpenAI/BYOK live paid execution remains unverified. SQLite needs a persistent filesystem. Anonymous sessions can be recreated. Accounts lack email verification/reset. Artwork storage has no creator upload UI or custom rendering. Browser compositions have no generated audio/voice or MP4 export. Hosted Supabase/Trigger.dev, forks and teams remain future decisions.

## Dependencies and scripts

The lockfile and `package.json` are preserved. Node is constrained to `>=24 <25`. The temporary development binary is `/tmp/node-v24.22.2-darwin-arm64/bin/node`; it is outside Git and may disappear. ngrok and Ollama are local system tools. Their clients/models are outside npm.

| Runtime dependency | Pinned version |
| --- | --- |
| `@next/env` | `16.4.6` |
| `@openai/agents` | `0.21.0` |
| `@radix-ui/react-slot` | `1.5.0` |
| `@remotion/player` | `4.0.542` |
| `class-variance-authority` | `0.7.1` |
| `clsx` | `2.1.1` |
| `lucide-react` | `1.72.0` |
| `next` | `16.4.6` |
| `openai` | `7.55.0` |
| `qrcode` | `1.5.4` |
| `react` | `19.3.1` |
| `react-dom` | `19.3.1` |
| `remotion` | `4.0.542` |
| `tailwind-merge` | `3.7.0` |
| `zod` | `4.6.7` |

Development dependencies include `@playwright/test` 1.65.0, `@tailwindcss/postcss` 4.3.5, `@types/node` 26.6.6, `@types/qrcode` 1.5.6, `@types/react` 19.3.0, `@types/react-dom` 19.3.0, `tailwindcss` 4.3.5, `tsx` 4.23.15, `typescript` 7.0.2.

| npm script | Actual command |
| --- | --- |
| `dev` | `next dev --webpack --hostname 127.0.0.1` |
| `build` | `next build --webpack` |
| `start` | `next start --hostname 127.0.0.1` |
| `typecheck` | `tsc --noEmit` |
| `production` | `tsx scripts/produce.ts` |
| `test:production` | `tsx --test tests/production.test.ts tests/demo-provider.test.ts` |
| `live:operator` | `tsx scripts/live-operator.ts` |
| `test:live` | `tsx --test tests/live.test.ts` |
| `test:providers` | `tsx --test tests/providers.test.ts` |
| `production:worker` | `tsx scripts/production-worker.ts --watch` |
| `production:drain` | `tsx scripts/production-worker.ts` |
| `test:room-production` | `tsx --test tests/room-production.test.ts` |
| `test:sprint` | `tsx --test tests/sprint.test.ts` |
| `test:browser` | `playwright test` |
| `demo:setup` | `node scripts/demo-lan.mjs --setup` |
| `demo:lan` | `NODE_ENV=production node scripts/demo-lan.mjs` |
| `account:admin` | `tsx scripts/account-admin.ts` |
| `migrate:universes` | `tsx scripts/migrate-universes.ts` |
| `test:platform` | `tsx --test tests/platform.test.ts` |
| `test` | `tsx --test tests/*.test.ts` |
| `benchmark:local` | `tsx scripts/benchmark-worlds.ts` |
| `demo:tunnel` | `NODE_ENV=production node scripts/demo-tunnel.mjs` |
| `demo:rehearse` | `tsx scripts/rehearse-audience.ts` |

## Data, assets and configuration outside Git

| Location | Preservation scope |
| --- | --- |
| `.data/airl-live.sqlite` | Shared accounts/sessions, universes/cast, votes, jobs, outputs, previews, approved episodes/canon and image BLOBs |
| `.data/airl-demo.sqlite`, `.data/airl-ollama.sqlite` | Standalone mode-specific CLI production/history |
| `.data/universe-migration-*.sqlite`, `.data/rehearsal-*.sqlite` | Existing backup/rehearsal copies, preserved in place |
| `.data/benchmarks/`, `.data/rehearsals/` | Local generated artifacts, metrics and isolated databases |
| `.data/demo-tls/` | Local CA certificate, server certificate and private TLS material, requiring private backup storage |
| `.data/pre-safari16-build-1794420868/` | Retained generated build, about 526 MB at inventory, preserved |
| Other `.data/` files | Diagnostics and traces, potentially sensitive, preserved as private local data |
| `.env*` except `.env.example` | Ignored private configuration when present. No root local env file was found at inventory |
| `~/Library/Application Support/ngrok/ngrok.yml` | Existing external ngrok configuration, private metadata recorded without reading its token |
| `~/.ollama/` | Local model/runtime storage. Preserve installed model identity and retain/reinstall intentionally |
| `/tmp/airl-*` | Ephemeral browser databases/screenshots/scripts, with selected paths cited in verification |
| `.next/`, `node_modules/` | Generated runtime/build installation, retained during this task |
| `public/fonts/` | Tracked local Schibsted Grotesk and license, covered by the source checkpoint |

The ignored inventory contained 28 root data files, eight benchmark files, seventeen rehearsal files, five TLS files and 470 retained-build files. Excluding that old build, the file-extension inventory found one PNG and no MP4/WebM/audio export. Approved episode media manifests and reference-image BLOBs live in SQLite. Do not infer an absence of assets from filesystem extensions alone. Any `AIRL_LIVE_DB_PATH` or `CINEMAI_DB_PATH` override outside the repository also needs backup. Runtime override values were not exposed or changed during this sprint.

## Safe backup procedure for a later operator action

1. Choose a private encrypted destination outside the repository. Stop the public launcher, web/dev servers, recovery workers, production CLIs and any other database writers before taking a complete file snapshot. Record the intended source commit, database paths, runtime versions and installed Ollama model ID. The current task does not stop running services.
2. Create a private backup directory. The following commands are a procedure for later execution, and were not run in this sprint.

   ```sh
   umask 077
   airl_backup_dir="$HOME/AIRL-backups/pre-ui-pivot-2026-11-12-$(date +%H%M%S)"
   mkdir -p "$airl_backup_dir"
   git bundle create "$airl_backup_dir/source.bundle" --all
   cp -pR .data "$airl_backup_dir/data"
   ```

3. Copy every overridden database and associated `-wal`, `-shm` or journal file while writers remain stopped. Copying the complete `.data` directory preserves its existing companions and assets. An online SQLite snapshot should use a tested backup API instead of an ordinary live file copy. Do not assume copying just a live `.sqlite` file captures WAL transactions.
4. Copy private `.env*` files only when present, plus ngrok configuration and TLS material, into the private destination with restricted access. Never print their contents, put them in Git, attach them to chat or include them in a public artifact. Preserve their existing permissions. An encrypted destination and secure storage are operator responsibilities.
5. Optionally preserve model files from `~/.ollama/` and ephemeral artifacts worth retaining. Document omitted caches rather than silently deleting them. The retained old build can be large.
6. Verify copies before relying on them. Check the bundle with `git bundle verify`. Use read-only SQLite integrity/foreign-key checks on each copied database and check artifacts/reference images. Expected integrity output is `ok`, with no foreign-key violations. Those backup checks have not been executed here.
7. Restart the current demo only after its intended paths and process ownership are understood. Keep backup data private and label the source commit/date.

## Isolated restoration and rollback

Inspect the source reference with `git show checkpoint/pre-hackathon-ui-pivot-2026-11-12`. For recovery testing, create a separate worktree at that reference or clone the bundle into a new directory. Use copies of the private data with explicit isolated `AIRL_LIVE_DB_PATH`/`CINEMAI_DB_PATH`, a separate port and paid gate disabled. Verify roles, existing IDs, votes, episodes, canon and assets before a cutover. A rollback of UI code should preserve the live database. Restore older data only as a separately reviewed recovery operation that accounts for subsequent votes and published canon.

Do not reset shared history, force-push, silently stash other work or overwrite the live data directory. Revert a future isolated UI commit where practical. The source checkpoint alone cannot recover ignored data that has not been backed up.

## Documentation audit and source ownership

| Reviewed source | Finding and disposition |
| --- | --- |
| `README.md` | Accurate broad functionality, lengthy operating detail. Consolidated onboarding and links, moved LAN instructions into the existing presenter runbook |
| `AGENTS.md` | Earlier implementation scope could authorize more work after this request. Made active Phase 0 preservation scope explicit and limited build/test requirements to relevant application changes |
| `HANDOFF.md` | Preserved verified application commit and physical limits. Added original HEAD, checkpoint and pending-review roadmap |
| `ARCHITECTURE_PLAN.md` | Correct local stack and scoped models, with an obsolete root-route description and future routes/hosted plans needing clearer status. Corrected route and added a current/proposed status matrix |
| `VERIFICATION.md` | Historical evidence is valuable. Added documentation-only evidence ahead of the existing body and retained its prior text |
| `CHANGELOG.md` | Existing chronology retained, with a new preservation entry |
| `PRESENTER_RUNBOOK.md` | Existing operational guide retained, with detailed LAN fallback moved from README |
| `benchmarks/README.md` and tracked JSON | Recorded benchmark preserved. Linked current planning without rerunning or replacing results |
| `playwright.config.ts` and test commands | Found inherited AIRL_LIVE_DB_PATH can select live data. Documented an explicit disposable-path override for future browser acceptance |
| `.env.example`, package/lockfile, source contracts and route handlers | Configuration names include future Supabase/Trigger placeholders. Installed adapters, current role enum, scoped schemas and guards were reviewed without changing code/configuration |
| `docs/` and design sources | No existing docs directory was present. Added the five requested planning documents and this checkpoint record. Current Manila CSS/font/sheets remain implemented baseline, while the attached pivot is a later proposal |

[ARCHITECTURE_PLAN.md](../ARCHITECTURE_PLAN.md) owns current runtime/API decisions. [UNIVERSE_MODEL.md](UNIVERSE_MODEL.md) owns current-field mappings and proposed data extensions. [PRODUCT_VISION.md](PRODUCT_VISION.md) owns product goals. [UI_UX_PIVOT.md](UI_UX_PIVOT.md) owns proposed navigation. [REDESIGN_ROADMAP.md](REDESIGN_ROADMAP.md) owns phase scope and review gates. [HACKATHON_MVP.md](HACKATHON_MVP.md) owns the presentation target. [PRESENTER_RUNBOOK.md](../PRESENTER_RUNBOOK.md) owns operational launch instructions. Verification and benchmark artifacts own observed results.

## Final preservation validation and live-data limitation

All 145 originally tracked non-Markdown file fingerprints matched, including application code, assets, schemas, package manifests, lockfile and configuration example. At the first comparison all 528 originally inventoried `.data` files matched their recorded content/metadata. A later comparison found `.data/airl-live.sqlite` had changed while the existing application was active. The other 527 original files and private configuration metadata matched. Installed package versions matched their declared pins and the selected Node binary reported 24.22.2. The original verification body remained byte-for-byte intact beneath the new preservation preface.

The still-running application created `.data/airl-live.sqlite-wal` and `.data/airl-live.sqlite-shm` after the initial inventory. At inspection the WAL was nonempty, and `lsof` showed the existing app process held the database/journal files. This sprint used filesystem reads and no database writer, migration, application request or inference. Its validation confirms unchanged source and configuration, with live database/journal activity explicitly observed. Database-file immutability across the task cannot be certified. It cannot certify a frozen logical database snapshot. The new sidecars were retained. Their contents are private and require inclusion in the operator's coherent backup procedure.

Documentation links, referenced paths, npm command names, Git references, code fences, whitespace and likely credential patterns were checked. The source checkpoint was verified and the intended Git diff contains Markdown only. No typecheck/build/unit/browser benchmark or model inference was rerun. A complete private-data backup and restore drill remain operator actions to perform with writers stopped before relying on a full runtime rollback.
