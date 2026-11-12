# Unified AIRL frontend

Implemented November 12, 2026 on `ui/unified-airl`, starting at `aeb84927ea19f76aabf6a5def41651c1cacdfdf6`. The brief authorizes a frontend replacement while preserving the existing platform. Original preservation references remain pinned: source branch `checkpoint/pre-hackathon-ui-pivot-2026-11-12` at `fc48254`, documentation checkpoint at `81e975e`.

## Motion and theme follow-up

The next frontend increment makes the existing Light / Dark / System theme selector visible in the public header, retaining the Dashboard topbar control and saved preferences. Phones use a 44 px theme icon with the native accessible selector. Selection changes the entire shared palette; Journey retains its independent presentation.

Shared CSS motion tokens define 160 ms interaction, 260 ms color and 560 ms page transitions. The hero and actual catalog entries use short staggered entrances; buttons/covers respond to interaction; real vote totals transition between recorded values; vote confirmation and episode reveal enter once. Production headlines/updates animate only when their real status/stage changes. Completed checkmarks use one brief entrance, while the existing working-stage indicator remains driven by actual job state. Mobile workspace navigation enters when opened. No artificial job progress, added dependencies, media-composition changes or constant ambient motion is introduced. Reduced-motion preferences disable CSS animations and transitions.

Verification is recorded in the newest [VERIFICATION.md](../VERIFICATION.md) entry. The new header/theme captures were inspected at [desktop](screenshots/motion-theme-2026-11-12/light-desktop.png) and [phone](screenshots/motion-theme-2026-11-12/light-mobile.png) sizes. The original restructure evidence below remains tied to its implementation checkpoint.

## Preservation and reuse audit

The initial tree contained 14 modified route/community files and an untracked `tests/browser/rehearsal.spec.ts`. These remain in place and are excluded from the redesign commit. A private patch was retained outside Git at `/tmp/airl-before-unified-ui.patch`; the immediate source rollback anchor is `checkpoint/pre-unified-ui-2026-11-12` at `aeb8492`. This patch is a local preservation aid, not a full runtime backup. The private-data procedure in [PRESERVATION_CHECKPOINT.md](PRESERVATION_CHECKPOINT.md) still applies before any future migration.

Read the project conventions, handoff, architecture, verification, product vision, UI pivot, MVP and redesign roadmap before editing. Inspected public/protected route wrappers, permission snapshots, shared layouts, tokens, account/provider controls, universe views, voting, production status and the player. Relevant installed Next.js 16.4.6 guides were read before implementation.

Reused `pageAccess` / `AccessProvider`, server page guards, owner/admin API checks, the universe catalog/detail APIs, anonymous voting/session hooks, SSE refresh, four-stage job status, protected production/review components, the shadcn-style Button, existing local licensed font, approved Barangay illustration, and the existing Remotion player. No replacement scaffold or dependency installation was introduced.

## Design and navigation

AIRL uses a near-black editorial foundation, warm-white text, restrained cool violet, generous spacing, bold display typography and quiet borders. The existing Barangay illustration is presented with restrained saturation. Custom-world covers remain explicitly abstract treatments. There are no fabricated engagement metrics or generated-art claims.

The homepage is rebuilt around the exact product headline and supporting statement. Its two main actions are **Explore Universes** and **Join Live**. The official universe is the single featured world. A compact three-step section explains discovery, participation and playback. Launch Journey remains available; authorized creation is a secondary entry.

| Public destination | Route and behavior |
| --- | --- |
| Home | AIRL wordmark → `/`; `/platform` retains its alias and selected-universe query behavior |
| Explore | `/universes`, actual catalog with search, genre filters and truthful loading/empty/error states |
| Live | `/live`, public room directory; a selected universe links directly to `/live/[id]` |
| Sign in / Profile | `/account`, existing accounts and private interests |
| Dashboard | Permission-aware link to existing Studio; absent for guests/viewers |
| Universe sections | Overview → Episodes → Characters → Live, with current-section indication |
| Presenter and theme | Journey/Explore mode switch and persisted theme choice in the footer; explicit Launch Journey on home |

The Dashboard wraps existing protected routes in one responsive shell, with an account-role indicator, breadcrumb and shared navigation. Its overview prioritizes actual managed universes and then existing creation tools. Sidebar sections are adapted to actual permissions: Overview, My universes, Create a universe, contextual World settings / Characters / Episodes & live, AI settings, Account, and admin Account permissions. Contextual links preserve the selected universe. No unsupported metrics, editing features or new backend capabilities are presented.

## Tokens and theme

All product tokens live in `src/app/globals.css`. Primary dark values are background `#101012`, panel `#18181c`, warm text `#f3f0ea`, secondary text `#aaa8b2`, accent `#c1b1f5`, accent ink `#20172f`, and subtle borders `#ffffff21`. Light uses warm background `#f4f2ed`, near-white panels, dark text `#25222b` and violet `#64439d`. Spacing uses 8/16/24/32/48/64 px steps; cards use 8 px radii and controls 5 px.

Schibsted Grotesk is served locally under the retained font license. New visitors start dark; saved Light, Dark and System preferences still apply and persist. System follows the OS after explicit selection. Semantic aliases keep compatible modules on the same palette. Removed 371 obsolete CSS selectors after checking application source references. Authored illustration/composition colors are retained. Journey keeps its own scoped Manila palette, full-screen layout and font.

## Redesigned screens and retained feature locations

| Screen / feature | Current location and preserved behavior |
| --- | --- |
| Landing and `/platform` | New hero, required copy, Explore/Live actions, featured official world, short explanation |
| Explore | Visual world cards, actual identity/premise, one clear entry, owner-only management |
| Live directory | Same actual public catalog with explicit room entry; no claim every round is open |
| Universe overview | Cover/premise/lore, section navigation, ordered episodes, cast and canonical history |
| Episode library | Existing ordered published episodes and Live selection retained |
| Episode details | Larger portrait playback stage, stored script summary where available, source vote, cast, adjacent episode navigation and next-round action |
| Characters and profiles | Scoped profiles, relationships, appearance references, approved memories and story helper |
| Live audience | Large native-radio choices, clear selection, vote confirmation, real totals and real round status |
| Public production | Existing status response drives four named stages; human wording, real failures, no invented progress/events or private artifacts |
| Dashboard overview | Existing owned universes, scratch/pitch creation, restore actions and admin grants |
| Dashboard world management | Existing settings, visibility/archive, complete character editor, relationships, QR room access and production controls |
| Dashboard production | `/studio/[roomId]`, real job history/events, model/consent selection, last valid preview, canon corrections, review, publish/reject/retry |
| Dashboard AI settings | `/studio/ai`, all existing advanced provider/inference tools |
| Account | Existing sign-in/up/out and private interest settings, restyled shared forms |
| Story questions | Public questions use the existing local provider default; advanced provider selection remains in Dashboard draft questions and Journey |
| Compatible module pages | Existing CinemAI, PersonaAI, watch, universe and discovery URLs retain entry points and shared theme |
| Journey | Independent Manila presentation preserved, including sheets, chapters, actual events and stored fallback |

Public episode scene notes are disclosed below the player rather than crowding it. Playback, seeking, captions, transcript, fixture labeling and episode switching reuse their original implementations. Public story questions retain source scope and citations without provider menus. Advanced creator provider operation and consent remain protected. All API authorization remains independent of navigation visibility.

## Changed files

Application presentation: `src/app/globals.css`, `src/app/layout.tsx`, `src/app/platform/page.tsx`, `src/app/live/page.tsx`, `src/components/nav.tsx`, `src/components/layout/public-shell.tsx`, new `src/components/layout/dashboard-shell.tsx`, `src/components/platform/access.tsx`, `src/components/platform/worlds.tsx`, `src/components/platform/world-view.tsx`, `src/components/platform/story-helper.tsx`, `src/components/theme-switcher.tsx`, `src/features/production/production-timeline.tsx`.

Browser coverage: updated `tests/browser/access.spec.ts`, `tests/browser/platform.spec.ts` and `tests/browser/experience.spec.ts`, new `tests/browser/unified.spec.ts`. Existing rehearsal/metadata work is preserved but not included in this commit. Documentation: this report, `README.md`, `HANDOFF.md`, `ARCHITECTURE_PLAN.md`, `docs/UI_UX_PIVOT.md`, `docs/REDESIGN_ROADMAP.md`, and `VERIFICATION.md`. Screenshots are under `docs/screenshots/unified-airl-2026-11-12/`.

## Verification and screenshots

- PASS — strict `npm run typecheck` and production `npm run build`, including after final polish.
- PASS — all 38 unit/regression tests in 3.303 seconds. Transport/executor doubles do not establish live paid-provider operation.
- PASS — full production-build browser acceptance: **16 cases in 2.4 minutes**, with explicit `/tmp/airl-unified-acceptance-20261112-1.sqlite` and `AIRL_ALLOW_LIVE_REQUESTS=false`. This includes the two pre-existing uncommitted rehearsal cases. Guest/viewer/creator/admin navigation and direct API/page checks, private universes, real voting from independent audiences, actual four-stage Ollama production, early preview, review/publication, canon propagation, source citations, stored fallback, captions, playback, episode selection and repeated seek/replay passed.
- Real community Ollama production took 33.3 seconds, with maximum sampled audience API latency 7 ms. Journey used actual job `a8f3ac5f-30e4-4272-a782-fd324714178b`, retained its early preview and returned a real cited scene answer. Timing is observed, not an SLA.
- After screenshot review, removed redundant world-management tabs, made the desktop sidebar sticky, and explicitly opened scene notes for source deep links. A fresh build and **five focused cases in 13.9 seconds** passed on `/tmp/airl-unified-focused-20261112.sqlite`, including a new source-note regression. The final compact mobile menu then passed a fresh build/typecheck and **two focused cases in 11.4 seconds** on `/tmp/airl-unified-menu-20261112.sqlite`. These targeted runs reuse unchanged build outputs through `/tmp/airl-unified-final.config.ts`, which overrides only the server launch to omit a redundant rebuild. No repeat inference was needed for final navigation polish.
- PASS — 320 × 740, 390 × 844, 1440 × 900 and 1920 × 1080 layouts for public content, episode viewing and protected Dashboard routes. No horizontal overflow observed. Mobile workspace Menu expands/collapses by pointer and Enter, reflects `aria-expanded`, and retains focus. Native vote radios, visible focus, reduced-motion behavior and Journey sheet focus containment/Escape/restoration remain covered.
- PASS — dark default, explicit System following a light OS, persisted Light/Dark preferences, and light/dark visual inspection. Computed primary-action contrast is **8.88:1 dark** and **7.42:1 light**. This is focused evidence, not a full WCAG audit.
- PASS — separate `npm run start` smoke on loopback port 3110 using the isolated acceptance database. Public/legacy routes and QR return 200; unknown/private universes/rooms and guest Studio return 404. Browser cases separately validate authorized Studio and private/API permissions. The native visible-browser host was unavailable; automated Chrome and human screenshot inspection were used, not a claimed manual/device browser run.
- PASS — all **576** fingerprinted protected source/runtime files match their initial hashes, with no added runtime files. No changes to server, API, AI provider, schema/domain/fixture, Remotion implementation, dependencies or Journey layout source. Pre-existing metadata/community edits remain intact. Original checkpoints/main remain pinned. Owned preview/test processes are stopped; the unrelated port-3000 service was untouched.

Thirteen actual Chrome screenshots were inspected. All use disposable acceptance data; test account/world names are fixture records, not live user content. The live production capture is actual Ollama execution from the complete run. Demo review/playback is accurately labeled. Other captures were refreshed after the relevant final layout changes.

| Capture | Screenshot |
| --- | --- |
| Landing desktop | [01](screenshots/unified-airl-2026-11-12/01-landing-desktop.png) |
| Landing phone | [02](screenshots/unified-airl-2026-11-12/02-landing-mobile.png) |
| Explore | [03](screenshots/unified-airl-2026-11-12/03-explore.png) |
| Universe | [04](screenshots/unified-airl-2026-11-12/04-universe.png) |
| Live vote | [05](screenshots/unified-airl-2026-11-12/05-live-vote.png) |
| Actual local Ollama production | [06](screenshots/unified-airl-2026-11-12/06-production-local-ollama.png) |
| Deterministic Demo review | [07](screenshots/unified-airl-2026-11-12/07-production-demo-review.png) |
| Published Demo episode playback | [08](screenshots/unified-airl-2026-11-12/08-episode-playback.png) |
| Dashboard overview | [09](screenshots/unified-airl-2026-11-12/09-dashboard-overview.png) |
| Dashboard world management | [10](screenshots/unified-airl-2026-11-12/10-dashboard-world-management.png) |
| 1920-pixel projector layout | [11](screenshots/unified-airl-2026-11-12/11-projector.png) |
| Light theme | [12](screenshots/unified-airl-2026-11-12/12-landing-light.png) |
| Compact mobile Dashboard | [13](screenshots/unified-airl-2026-11-12/13-dashboard-mobile.png) |

[VERIFICATION.md](../VERIFICATION.md) retains exact evidence and historical checkpoints.

## Limitations

Physical-device and venue/projector-hardware checks, screen-reader usability and first-time human comprehension/timing remain unverified for this build. The native visible-browser preview host is unavailable; browser automation and screenshot inspection provide the local visual checks. Hosted OpenAI/BYOK paid inference was not invoked. No deployment, remote push, migration, infrastructure change or live-database operation is part of this sprint. Existing media remains silent animated compositions; custom imagery/voice/MP4 export are not added. SQLite and Mac-local inference retain their existing runtime requirements.

## Rollback

Keep current databases/media/private configuration in place. After preserving any later edits, use `git revert <redesign-commit>` for the isolated redesign commit. Do not reset the working tree or restore an older database. For comparison, create a separate worktree at `checkpoint/pre-unified-ui-2026-11-12` and use fresh explicit temporary storage with paid requests disabled. The earlier source/documentation checkpoints remain unchanged. Uncommitted rehearsal work is independent and must be retained separately during any rollback.
