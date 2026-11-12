# Hackathon UI/UX Optimization report

November 12, 2026. Branch `ui/hackathon-experience`, starting from clean `a19d82f`. Preservation source/documentation references remain pinned to `fc48254` and `81e975e`. UI checkpoint: `da763cfa502cc1570397133439ec1bb271151e7a`.

## Actual screens redesigned

The landing now uses a restrained violet accent, local expressive typography and one supporting statement. Explore remains primary; creation follows existing permissions. Discovery identifies Official canon and Creator universe records, keeping search/genre filters and routes. Universe detail leads with its real lore, reusable world art, scoped cast, ordered episodes and approved history. Character details retain all existing fields and source links.

The live audience experience prioritizes the story question, large native radio choices, a clear join/submit path, recorded confirmation and real counts. A four-stage timeline uses the existing production response. Public viewers see the latest reported stage; private events stay private. Studio can use recorded stage events. No estimated percentage, fabricated event history, AI reasoning or simulated live inference is displayed.

Episode detail places the existing Remotion player on a dedicated stage beside the winning choice, source decision, cast links and next-chapter action. The live gallery retains seeded-reference labels and published-episode selection, adds the winning choice/cast and offers a direct return to the newest published episode when browsing older entries.

Creator Studio separates private creation, owned universes and advanced AI settings. Pitch generation is an explicit disclosure. World management has settings/characters/production anchors. Production settings and raw event/script detail stay accessible through disclosure; paid consent, private review and publication are unchanged. Custom Studio rooms link to their own cast rather than displaying official-world fixture cards.

## Reused components and contracts

The shadcn-style Button (Radix Slot/CVA), Nav, ThemeSwitcher, mode switch, UniverseArt/WorldArt, server-derived access snapshot, CanCreate/CanManage, UniverseLinks, ProviderPicker, RoomJoin, CommunityPanel, RoomProduction, EpisodeGallery, StoryHelper and EpisodePreview are retained. The new ProductionTimeline composes the existing stage names and API fields. Authentication, ownership, anonymous sessions, voting endpoints/SSE, provider selection, four-stage orchestration, human review, transactional publication, approved memory and Remotion rendering are reused without backend changes.

## Files changed

Application and browser files for this increment:

- [src/app/globals.css](../src/app/globals.css)
- [src/app/platform/page.tsx](../src/app/platform/page.tsx)
- [src/components/audience.tsx](../src/components/audience.tsx)
- [src/components/layout/public-shell.tsx](../src/components/layout/public-shell.tsx)
- [src/components/platform/world-view.tsx](../src/components/platform/world-view.tsx)
- [src/components/platform/worlds.tsx](../src/components/platform/worlds.tsx)
- [src/components/studio.tsx](../src/components/studio.tsx)
- [src/features/live/community-panel.tsx](../src/features/live/community-panel.tsx)
- [src/features/production/episode-gallery.tsx](../src/features/production/episode-gallery.tsx)
- [src/features/production/room-production.tsx](../src/features/production/room-production.tsx)
- [tests/browser/community.spec.ts](../tests/browser/community.spec.ts)
- [tests/browser/platform.spec.ts](../tests/browser/platform.spec.ts)
- [src/features/production/production-timeline.tsx](../src/features/production/production-timeline.tsx)
- [tests/browser/experience.spec.ts](../tests/browser/experience.spec.ts)

The accompanying documentation updates AGENTS, HANDOFF, README, architecture/current-scope notes, UI strategy, roadmap, changelog and verification. Ten original PNG browser captures are preserved in `docs/screenshots/hackathon-ui-2026-11-12/`. No generated build, dependency, environment or database file belongs to the commit.

## Browser screenshot evidence

These are real production-build Chrome captures on disposable databases, not mockups. The Demo review/episode captures are deliberately labeled as deterministic output. The additional live capture comes from actual loopback Ollama execution. Fixture/test-created worlds remain visibly identified by their real stored titles and visibility. Screenshots were inspected individually. Captures after viewport changes wait for a fresh render/font/layout frame to avoid stale compositor tiles.

| Screen | Browser evidence |
| --- | --- |
| Desktop landing | [01-landing-desktop.png](screenshots/hackathon-ui-2026-11-12/01-landing-desktop.png) |
| Mobile landing | [02-landing-mobile.png](screenshots/hackathon-ui-2026-11-12/02-landing-mobile.png) |
| Universe discovery | [03-discovery.png](screenshots/hackathon-ui-2026-11-12/03-discovery.png) |
| Universe detail | [04-universe.png](screenshots/hackathon-ui-2026-11-12/04-universe.png) |
| Mobile voting and recorded confirmation | [05-voting-mobile.png](screenshots/hackathon-ui-2026-11-12/05-voting-mobile.png) |
| Production ready for review — deterministic Demo | [06-production-review.png](screenshots/hackathon-ui-2026-11-12/06-production-review.png) |
| Published episode playback — deterministic Demo | [07-episode.png](screenshots/hackathon-ui-2026-11-12/07-episode.png) |
| Creator Studio | [08-studio.png](screenshots/hackathon-ui-2026-11-12/08-studio.png) |
| Actual Ollama production in progress | [production-live.png](screenshots/hackathon-ui-2026-11-12/production-live.png) |
| 1920 × 1080 projector viewport | [projector.png](screenshots/hackathon-ui-2026-11-12/projector.png) |

## Accessibility and interaction verification

Native radios, labels and keyboard controls remain intact. The public experience has visible violet focus outlines for links, buttons, form controls and disclosure summaries. Choices and primary actions provide large touch areas. Recorded-vote confirmation and production/error updates have semantic status/alert regions. States use text/icons alongside color. The skip link is fully clipped until focused, avoiding stray offscreen content during scrolling/capture while retaining keyboard access. Reduced motion disables the recorded-stage spinner and existing cinematic animation.

The existing account, creator/admin ownership, independent API/page authorization, two-audience voting, saved episode selection, actual playback, repeated seeking/replay, captions, source scenes, story citations, review and publication cases pass. The new screen case exercises 320 × 740, 390 × 844, 1440 × 900 and 1920 × 1080 layouts with no unintended horizontal scrolling. It exercises creation disclosure, advanced-route access, actual Demo vote/review/publication/playback and theme persistence. Computed primary-button contrast is 8.66:1 in dark mode and 7.46:1 in light mode. The automated join/select/submit path completed below the 15-second test ceiling; this is not a first-time human usability measurement.

The public timeline regression deliberately intercepts supplied running/failed/review responses to verify the UI contract and reduced-motion styling. It is separate from the actual Ollama screenshot and live workflow evidence.

## Tests and preservation

- `npm run typecheck` passed on the final source.
- `npm test` passed all 38 unit/regression tests in 3.359 seconds, including production/sprint coverage. Transport/executor doubles remain identified; they do not establish paid-provider operation.
- The complete production-browser suite passed all 13 cases in 2.0 minutes on explicit disposable `/tmp/airl-experience-final-1794462830-64155.sqlite`, with `AIRL_ALLOW_LIVE_REQUESTS=false`. The normal harness ran the production build and `npm run start` first.
- The final change clarified failure copy to say “Recorded audience votes are preserved,” which avoids claiming that a guest visitor has voted. A fresh production build and targeted public-timeline regression passed afterward on separate `/tmp/airl-experience-copy-1794462976-65169.sqlite`; no extra inference was needed for that text change.
- The real community Ollama run completed production in 23.5 seconds; maximum sampled audience API latency was 11 ms. Journey's real job `69548b22-b4fb-4a60-9181-d18779f65f15` retained its early preview, persisted context, human publication, saved fallback and cited scene answer.
- An earlier full run had 12 passes and one new screenshot-test failure from an ambiguous provider selector (production settings versus the story helper). Scoping that selector corrected the test. A targeted nine-second screen run then passed. Visual review found the cramped canon textarea, stale post-resize screenshot tiles and an offscreen skip-link artifact; the field, focus clipping and capture settling were corrected before the final complete pass. No failing/partial run is counted as a successful full suite.

No source changes were made to server modules, API routes, provider adapters, schemas/domain/fixtures, Journey implementation, video rendering, package manifests or lockfile. The existing public launcher remains stopped. Sixty existing runtime files outside the retained old build were privately fingerprinted; final inventory/content verification matched with no additions/removals. No live data migration, dependency installation, paid API call, deployment or remote push occurred.

## Remaining issues and recommended next frontend sprint

Physical iPhone, venue network and actual projector hardware were not rechecked. Screen-reader usability and the five-second comprehension / fifteen-second first-time voting / three-minute judging flow still need people using the product. The under-15-second automated interaction check is not a human study. Native playback/QR behavior was checked with the existing browser tests; no new public phone-session or tunnel rehearsal is claimed. Existing hosted/BYOK live-operation limits remain; no paid validation was attempted.

The recommended next frontend sprint is a timed judge-and-audience rehearsal: observe new users finding a universe and voting, test the exact projector/phone setup, audit keyboard and screen-reader journeys, and refine wording/spacing from those observations. Continue using existing data/contracts; richer character parameters, authentication replacement and infrastructure work remain outside this sprint.
