# Minimalist hackathon UI strategy

Status: the user authorized the first frontend implementation phase on November 12, 2026, from preservation checkpoint `81e975e`. The expanded brief authorizes the design system, landing/navigation, discovery/universe detail, voting, production timeline, episode reveal and existing creator Studio. See [the implemented screen report](HACKATHON_UI_REPORT.md). Backend APIs, schemas, identity policy, providers and infrastructure remain preserved. Manila Journey remains the presenter layout. New identity policies, character parameter fields and persistence/model extensions remain future phases.

## Full restructure implementation

The subsequent complete frontend brief is implemented on `ui/unified-airl`. Public navigation is now Explore / Live / Sign in or Profile, plus permission-aware Dashboard access; the AIRL wordmark returns home. Landing, discovery, universe/story content, audience participation and the existing creator tools share one near-black/warm-white/cool-violet system. `/studio` remains the protected workspace URL with a shared sidebar, compact mobile Menu and contextual universe tools. Journey retains its separately scoped Manila presentation. [UNIFIED_FRONTEND_REPORT.md](UNIFIED_FRONTEND_REPORT.md) records actual screens, feature locations, tokens and acceptance. Earlier phase notes below remain the historical rationale.

## Design direction

Make AIRL's entertainment value clear before exposing its technical settings. Use strong typography, intentional spacing, cinematic composition, restrained motion and progressive disclosure. The implemented public experience uses subtle violet accents and shared spacing/control tokens in globals.css; Journey retains its stone/olive presentation palette. Every visible element should explain a world, guide an action or show truthful state. Lightweight CSS motion and reusable media assets should work on the M2 Pro with 16 GB RAM and ordinary audience phones.

The proposed public landing contains AIRL identity, the tagline, a short explanation, a compelling existing visual, Explore Universes as the main action, a permission-aware Create a Universe action, the featured official world and account access. Keep Launch Journey visibly available for presenters while giving public discovery first priority. The first increment makes Explore Universes primary and retains the context-preserving Journey entry. Discovery adds visual cards, local search/genre filters and explicit loading, empty and error states over the existing API.

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

CinemAI and PersonaAI remain reachable through contextual universe navigation and existing deep links. Existing discovery and future-module pages may be visually de-emphasized on the landing, with route compatibility retained. The authorized first increment de-emphasizes those module names in the header while retaining contextual links and All experiences in the footer.

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

Review at 390 × 844 and 1440 × 900, then on the physical iPhone and venue projector. Require no horizontal overflow, reachable playback/caption/seek controls and clear mode distinction. Check loading, closed rounds, no saved episode, failed jobs, retry limits, review and stale/reconnecting states. Refresh and view switches must reuse persisted records. The expanded frontend has its own acceptance and screenshot record in HACKATHON_UI_REPORT.md. Historical physical-device results remain tied to the preserved build; fresh physical/venue checks are still required.

The first incremental implementation and rollback boundaries are defined in [REDESIGN_ROADMAP.md](REDESIGN_ROADMAP.md). The current operational demonstration stays in [PRESENTER_RUNBOOK.md](../PRESENTER_RUNBOOK.md).
