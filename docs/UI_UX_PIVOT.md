# Minimalist hackathon UI strategy

Status is proposed design, pending review after the preservation checkpoint. This sprint changes documentation only. The existing Manila Journey at application commit `1a7baf3` remains the current implementation. Its supplied visual-reference styling and earlier verification remain part of the preserved baseline.

## Design direction

Make AIRL's entertainment value clear before exposing its technical settings. Use strong typography, intentional spacing, cinematic composition, restrained motion and progressive disclosure. Every visible element should explain a world, guide an action or show truthful state. Lightweight CSS motion and reusable media assets should work on the M2 Pro with 16 GB RAM and ordinary audience phones.

The proposed public landing contains AIRL identity, the tagline, a short explanation, a compelling existing visual, Explore Universes as the main action, a permission-aware Create a Universe action, the featured official world and account access. Keep Launch Journey visibly available for presenters while giving public discovery first priority. Explore currently has Launch Journey as its main action. Changing that hierarchy is part of the future design review.

## Information architecture for the next implementation

These labels are design targets mapped to existing routes. No new route or authorization policy is introduced by this plan.

| Surface | Proposed visible navigation/actions | Reuse |
| --- | --- | --- |
| Public landing | Home, Explore, Live, Sign In/Profile | `/`, `/universes`, `/live`, `/account` |
| Public universe | Overview, Characters, Episodes, Join live room | `/universes/[id]` and its current module routes |
| Member profile | Profile and private interests, available story interactions | `/account`, existing story helpers |
| Creator workspace | My Universes, Create Universe, Creator Studio | `/studio`, existing blank-draft/pitch flows |
| Selected owned universe | Settings, Characters, Episodes, production/review | `/studio/worlds/[id]`, scoped Studio/episode routes |
| Advanced creator tools | AI Settings and detailed events | Existing `/studio/ai`, provider picker and event panels |
| Admin workspace | Creator permissions, official canon and protected operations | Existing admin surfaces and APIs |
| Presenter mode | Direct Journey entry, chapters and Exit to Explore | `/journey` and existing shared URL context |

CinemAI and PersonaAI remain reachable through contextual universe navigation and existing deep links. Existing discovery and future-module pages may be visually de-emphasized on the landing, with route compatibility retained. This is a presentation decision requiring design review, with implementation scheduled only after approval.

## Journeys

A visitor opens the landing, explores Barangay 2099, understands its premise/cast, then watches an episode or joins its audience room. Phone voting keeps a clear join action, readable choices, vote confirmation and published playback. Current anonymous session voting continues as the baseline. A member-only voting rule would be a separate identity-policy change.

A creator signs in, reaches owned universes, creates a private draft from scratch or pitches, edits settings/cast and starts a production through the existing scoped room. Advanced provider/model configuration is disclosed when needed. Private drafts, approval, corrections and public visibility remain explicit. Official canon stays admin-only.

A presenter opens Journey with universe/round/episode context, introduces the world, displays the QR and recorded decision, shows actual agents, reviews and premieres, then asks a scene-linked story question. The current chapter rail, sheets, saved fallback and manual navigation are reusable. Keep a single focal point and one main action per chapter, with failures and live-job state available.

## Progressive disclosure and preservation

| Visually simplify | Functional requirement to preserve |
| --- | --- |
| Provider forms on public pages | Guarded Studio settings, consent and model selection |
| Dense event/JSON panels | Real event history, validated artifacts and recoverable errors |
| Repeated module cards and concept badges | Working module routes and selected-universe links |
| Administrative controls | Server role/ownership checks, grants and canon review |
| Long cast/transcript sections on the main stage | Accessible sheets and source-linked detail pages |
| Excessive decorative motion | Actual handoff updates and reduced-motion alternatives |

## Accessibility and device acceptance

Maintain keyboard access, visible focus, semantic labels, sufficient contrast and usable touch targets. Sheet focus must stay inside, Escape must close it, and focus must return to the trigger. Chapter shortcuts must leave inputs and playback controls usable. Honor reduced motion and keep status understandable without animation or color alone.

Review at 390 × 844 and 1440 × 900, then on the physical iPhone and venue projector. Require no horizontal overflow, reachable playback/caption/seek controls and clear mode distinction. Check loading, closed rounds, no saved episode, failed jobs, retry limits, review and stale/reconnecting states. Refresh and view switches must reuse persisted records. Existing browser results cover the preserved build. The proposed redesign requires its own acceptance run.

The first incremental implementation and rollback boundaries are defined in [REDESIGN_ROADMAP.md](REDESIGN_ROADMAP.md). The current operational demonstration stays in [PRESENTER_RUNBOOK.md](../PRESENTER_RUNBOOK.md).
