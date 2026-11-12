# Redesign roadmap

Phase 0 is complete at documentation checkpoint `81e975e`. The user authorized Phase 1 on November 12, 2026, including universe discovery and responsive refinement. Later implementation phases remain proposals awaiting separate review. The existing code already implements substantial parts of phases 2–6. Each phase starts by checking its actual remaining gaps. Reuse boundaries are defined by [ARCHITECTURE_PLAN.md](../ARCHITECTURE_PLAN.md), model extensions by [UNIVERSE_MODEL.md](UNIVERSE_MODEL.md), and UI goals by [UI_UX_PIVOT.md](UI_UX_PIVOT.md).

## Phase 0 — Preservation and documentation

Record the clean `main` baseline at `fc48254`, retain application acceptance at `1a7baf3`, create the checkpoint branch, inventory ignored data, audit conflicting claims and prepare this plan. Validate source/data/dependency preservation and document the backup procedure. Commit intended documentation separately. Stop for user review after reporting the result.

## Phase 1 — Design foundation, authorized frontend sprint

**Objective.** Refine the everyday landing and public navigation to communicate creator-made universes and community-shaped entertainment immediately. Keep the verified Journey as a working presenter route.

**Reusable code.** `src/app/page.tsx`, `src/app/platform/page.tsx`, `src/components/nav.tsx`, `src/components/world-art.tsx`, `src/components/platform/access.tsx`, the existing button/theme system and public universe routes. Journey's current layout and provider orchestration remain existing capabilities.

**Expected changes.** Establish a reviewed desktop/mobile information hierarchy. Make Explore Universes the primary public action and Create a Universe permission-aware, routing through existing Studio creation. Retain a visible Launch Journey entry and account access. Simplify top-level public labels while preserving contextual CinemAI/PersonaAI links, selected-universe context and legacy URLs. Adjust spacing/type/responsive styles within the existing design system. Do not implement later character/schema proposals as part of this visual phase.

**Dependencies.** The user authorized this frontend phase after reviewing the preservation checkpoint; the existing frontend and design direction were summarized before implementation. Source checkpoint and ignored-data backup procedure are available. An existing admin/creator account and approved saved episode support later acceptance.

**Security and database implications.** Keep the server permission snapshot and independent API checks. Hide unauthorized creator actions and retain server denials. No schema or authentication-policy change is proposed for this phase. Fixture and provider labels remain accurate.

**Acceptance criteria.** The landing contains identity, tagline, short product explanation, one primary Explore action, permission-aware creation, featured official world and profile access. Guest/viewer/creator/admin variants agree with server permissions. Root remains Explore. Journey, direct module/legacy URLs and universe/round/episode context remain usable. At 390 × 844 and 1440 × 900, there is no overflow and the main actions have visible keyboard focus and readable contrast. Reduced motion works. With an explicit fresh temporary browser database path, existing typecheck, 38-unit baseline and nine-browser baseline pass, together with new discovery/responsive regressions, including real local Ollama and two audiences, private previews, canon approval, saved fallback and replay. Repeat a physical-iPhone check and record it separately.

**Risks.** Hidden capability through oversimplified navigation, stale cached permissions, broken context links and public CSS leaking into Journey. Review each role and both modes before acceptance. Request extra tests only for a specific regression beyond existing coverage.

**Rollback.** Keep the future UI change in its own commit. Revert that UI commit after checking later dependent edits. Use the source checkpoint in a separate worktree to compare behavior. Keep the active database in place, since this phase has no data migration. Do not reset shared history or restore an older database over live canon.

## Phase 2 — Profiles and authorization refinement

**Objective and reuse.** Improve profile/sign-in guidance and creator-eligibility visibility using existing accounts, viewer/creator/admin roles, `/account`, `/api/admin`, page guards and ownership checks.

**Expected changes and dependencies.** Address reviewed UX gaps first. Email verification/reset or hosted identity requires a separately approved design and security contract. Member is a proposed label for the current viewer role. Anonymous voting continues until an explicit participation-policy decision.

**Security/database implications.** Authorization remains server-owned. Label-only changes need no schema migration. Any identity migration needs scoped sessions, role preservation and isolated migration tests.

**Acceptance, risks and rollback.** Retain fresh sign-in/sign-out, grant boundaries, direct URL/API denials and private-world isolation. Evaluate account lockout and recovery before deploying identity changes. Roll back UI independently. Future identity/data changes require version-compatible migrations and a verified copy restore plan.

## Phase 3 — Universe architecture refinement

**Objective and reuse.** Improve owned-world discovery/settings using existing universe tables, private/public/archive/restore behavior, scoped rooms, cast and ordered canon. The legacy migration has already been implemented and applied historically.

**Expected changes and dependencies.** Validate gaps in description/lore/visual identity and persistent AI preferences before adding fields. Preserve original official IDs and approved history. Require approval before any new schema or hosted migration.

**Security/database implications.** Keep owner/admin writes, official-admin canon and pre-inference source scoping. Use additive versioned fields and rehearsal copies for future migrations.

**Acceptance, risks and rollback.** Verify old records, scoped assets/relationships, source-round links, archival restore and no cross-universe memory. Prevent accidental public disclosure or destructive history edits. Roll back UI alone when possible. For data changes, retain compatible readers and validate backup restoration into a separate database before cutover.

## Phase 4 — Character builder refinement

**Objective and reuse.** Make the existing typed character editor easier to use, preserving voice, personality strings, rules, appearance references and approved memories.

**Expected changes and dependencies.** Group existing fields first. Numeric traits, aliases, richer narrative fields, revisions and artwork rendering remain optional approved extensions described in UNIVERSE_MODEL. Numeric controls require corresponding shared-provider prompt behavior and evaluated output differences.

**Security/database implications.** Enforce owned-universe asset references and admin-only official edits. Version any new profile contract while retaining old strings and history.

**Acceptance, risks and rollback.** Verify defaults/limits, legacy compatibility, active-job snapshots and both live adapters' context contracts. Review semantic character consistency and avoid decorative sliders. Revert UI grouping separately. Restore a future schema only through tested compatibility/backup procedures, preserving historical snapshots.

## Phase 5 — Creator Studio simplification

**Objective and reuse.** Streamline owned worlds, episode management, review and provider selection using the existing Studio, ProviderPicker, RoomProduction, jobs/events and transactional publication.

**Expected changes and dependencies.** Use progressive disclosure for technical forms, raw JSON and event detail. Preserve explicit generation/review/publication choices, bounded retries and visibility controls. Resolve earlier phase usability findings before changing workflow surfaces.

**Security/database implications.** Keep provider/consent/credential boundaries and job snapshots. Presentation changes should use existing tables and API contracts. Any proposed contract change needs separate review.

**Acceptance, risks and rollback.** Retain real status, last valid preview, corrected canon, rejection/publication race safety, exact provider selection and idempotency. Prevent hidden paid consent or unauthenticated drafts. Revert the isolated UI commit while retaining durable jobs and canon.

## Phase 6 — Hackathon presentation and reliability

**Objective and reuse.** Rehearse the approximately three-minute story using existing Journey chapters, QR voting, real agent handoffs, sheets, saved playback and cited questions.

**Expected changes and dependencies.** Fix issues found in projector/phone/venue and repeated-run rehearsal. Keep generation provenance clear, a same-universe saved fallback ready and advanced setup outside the judge flow. Hosted validation requires credentials and explicit paid-run approval.

**Security/database implications.** Keep ngrok limited to the web app and Ollama loopback-only. Use isolated rehearsal storage for load/crash tests. Any actual public vote/round manipulation requires the intended presenter action and should preserve prior records.

**Acceptance, risks and rollback.** Verify current physical-device interactions, restart/lease recovery, repeat generation, response latency, memory pressure and tunnel allowance. Distinguish synthetic audience load from real devices and presentation timing from generation guarantees. Network/model latency and cold starts remain risks. Revert scoped UI fixes when needed, retain the existing saved episode and restart the launcher against the same database. Always-on hosting, durable cloud scheduling and media export require a later approved milestone.
