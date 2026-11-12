# Shared blue theme and spatial Journey

November 12, 2026. This frontend increment starts at `f1c371f4d0714426de02f03ffb1a55c33e47d1ba`. The user's latest instruction explicitly supersedes the independent Manila palette, authorizing a unified blue theme and a 3D experience. Journey's full-screen flow, manual chapters, context links, sheets, production and playback are preserved. The immediate rollback anchor is `checkpoint/pre-blue-spatial-2026-11-12`; original preservation branches/tags and main remain unchanged.

## Appearance and interaction

Explore, Dashboard and Journey now use the same semantic tokens, locally served typography and saved Light/Dark/System preference. Journey exposes the shared theme selector in its header. Sheets, forms, navigation, voting states and production controls inherit the same palette instead of forcing stone/olive colors.

Dark: navy background `#07111f`, blue-black panels `#0d1d31`, cool-white text `#edf5ff`, secondary text `#a5b8d0`, sky-blue accent `#86c5ff`. Light: pale-blue background `#edf5ff`, near-white panels `#f9fcff`, navy text `#122c4a`, secondary text `#4b6480`, blue accent `#165ea8`. Status errors retain their meaningful error color. All new colors/materials live in globals.css. Existing authored episode content and Remotion composition are preserved.

The new `SpatialWorld` component builds a designed architectural illustration from CSS 3D geometry: extruded buildings with separate roof/front/side faces, a gridded platform, orbit planes and a shaded planet. It replaces the official universe's public cover treatment and appears in Journey's introduction. It is decorative illustration, not a generated scene or a claim about stored assets. Custom-world discovery covers remain abstract; Journey's generic spatial treatment carries the selected world's actual title.

Mouse movement changes the scene's viewing angle through requestAnimationFrame-bounded CSS variables. Pointer exit restores the camera. Touch uses a stable camera. Reduced-motion preferences disable pointer response, animations and transitions while preserving a static dimensional view. The scene has a textual image alternative and does not intercept keyboard navigation or require a permission. No continuous rotation, gyroscope, camera, paid artwork/model operation, WebGL dependency or new rendering infrastructure was added.

Journey retains five presenter-controlled chapters. The world stage pairs the actual premise/cast entry with the shared 3D illustration. Voting options use shallow perspective surfaces with real recorded totals; the QR remains flat. Agent panels gain depth tied to the recorded active stage, and the validated artifact sits in a shared surface. The premiere gains a dimensional frame while the actual player and its controls stay flat. Chapter entrances use short perspective transitions. Keyboard shortcuts, focus-safe sheets, transcript, saved fallback and live-job visibility reuse their existing implementations.

## Preservation and changes

Application files: `src/app/globals.css`, `src/app/journey/journey.css`, `src/components/journey-demo.tsx`, `src/components/universe-art.tsx`, new `src/components/spatial-world.tsx`. Tests: updated `tests/browser/journey.spec.ts` to assert shared theme behavior instead of the superseded Manila color; new `tests/browser/spatial-theme.spec.ts`. Project conventions and current documentation now reflect the explicit new theme authorization.

No API, schema, provider, orchestration, auth policy, vote transaction, review transition, stored canon, fixture data, package/dependency or video-composition source changes. Original 14 modified files and untracked rehearsal test remain in place and outside the UI commit. Only the explicitly authorized Journey CSS changes among the earlier protected fingerprints; the remaining protected source/runtime fingerprints are checked before completion.

## Verification

- PASS — strict typecheck and production build; all 38 unit/regression tests in 3.293 seconds. Transport/executor doubles retain their existing limitations.
- PASS — all 18 production-build Chrome cases in 2.7 minutes, with explicit `/tmp/airl-blue-browser-20261112.sqlite` and `AIRL_ALLOW_LIVE_REQUESTS=false`. The temporary config reuses the successfully built, unchanged application and overrides only the start command/cwd to omit another build. Two cases belong to preserved uncommitted rehearsal work and remain outside this UI commit.
- PASS — the new spatial regression verifies actual preserve-3d geometry, mouse response, camera reset and disabled response under reduced motion. Explore/Journey share computed background/accent and saved theme in both modes. World/vote/production/premiere were checked in dark/light at 320 × 740, 390 × 844, 1440 × 900 and 1920 × 1080. Theme controls and chapter arrows remain reachable; no horizontal overflow observed. Cast-sheet color, Escape/restored focus and theme persistence across mode switches/reload passed.
- PASS — existing guest/viewer/creator/admin permissions, unknown/private rooms, real audience voting, actual local Ollama production, private previews, review/publication/canon, saved fallback, real source citations, playback/captions/episode switching/repeated seek/replay and sheet keyboard behavior. Community Ollama production took 31.5 seconds; maximum sampled audience API latency was 12 ms. Journey job `504c2e0e-4bf2-410b-afe9-caa60fbd7368` retained its early preview and cited scene-003 at 12 seconds. These are observations, not generation-time guarantees.
- PASS — actual dark/light screenshot inspection and computed primary-action contrast: 8.82:1 dark, 6.56:1 light. This is focused evidence, not a full accessibility audit.
- PASS — separate loopback `npm run start` smoke: Home, Explore, Live and Journey return 200; unknown/private rooms and guest Studio return 404. The preview remains running on port 3110 against its earlier isolated acceptance database, with paid requests disabled.
- PASS — all 575 protected source/runtime fingerprints outside the explicitly authorized Journey CSS match the earlier baseline, with no added runtime files. The original 14-file patch is preserved exactly, and the untracked rehearsal file remains excluded. Original source/documentation references and main remain pinned. No backend/dependency/data migration, paid call, deployment or remote push.

Nine actual browser screenshots were inspected and retained. They use disposable acceptance fixtures; production/premiere images show a stored, correctly labeled deterministic Demo episode, while the complete suite separately exercises actual Ollama.

| Surface | Capture |
| --- | --- |
| Explore dark | [01](screenshots/blue-spatial-2026-11-12/01-explore-dark.png) |
| Explore light | [02](screenshots/blue-spatial-2026-11-12/02-explore-light.png) |
| Journey dark | [03](screenshots/blue-spatial-2026-11-12/03-journey-dark.png) |
| Journey light | [04](screenshots/blue-spatial-2026-11-12/04-journey-light.png) |
| Phone dark | [05](screenshots/blue-spatial-2026-11-12/05-journey-mobile-dark.png) |
| Phone light | [06](screenshots/blue-spatial-2026-11-12/06-journey-mobile-light.png) |
| Voting stage | [07](screenshots/blue-spatial-2026-11-12/07-journey-vote.png) |
| Recorded Demo production | [08](screenshots/blue-spatial-2026-11-12/08-journey-production.png) |
| Approved Demo premiere | [09](screenshots/blue-spatial-2026-11-12/09-journey-premiere.png) |

## Limits and rollback

CSS perspective provides a browser 3D presentation, not a game engine, VR experience or generated 3D model pipeline. Physical-device/Safari, venue projector and screen-reader checks remain open. The visible browser host is unavailable; automated Chrome and screenshot inspection supply local visual evidence. Hosted paid providers and live data were not used.

Revert the isolated blue/spatial UI commit after preserving later edits. Keep databases/media/private configuration in place. Use `checkpoint/pre-blue-spatial-2026-11-12` in a separate worktree for comparison, with explicit temporary storage and paid requests disabled. Do not reset shared history or restore an older database over later stories. The existing local preview remains on port 3110 using its earlier disposable acceptance database.
