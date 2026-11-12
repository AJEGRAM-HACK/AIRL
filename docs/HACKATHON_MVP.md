# Minimum credible hackathon demonstration

The current application baseline is `1a7baf3`, preserved with its documentation at branch `checkpoint/pre-hackathon-ui-pivot-2026-11-12`. This document defines the next presentation target. Actual recorded outcomes and remaining device/provider gaps live in [VERIFICATION.md](../VERIFICATION.md).

The demonstration must show a creator-owned universe, persistent characters, a real community decision, actual four-stage production, human review and playable creative output. Use Barangay 2099 and its existing cast for a predictable presentation. Keep world creation and advanced configuration available in Studio for questions after the main demonstration.

## Approximately three-minute presentation

| Time | Presenter action | Evidence and judging criteria |
| --- | --- | --- |
| 0–25 s | Explain AIRL, open the featured universe and show its cast | UI/UX, Creative Content, creator/universe concept |
| 25–65 s | Display the audience QR, collect independent phone votes and close the round | Community, recorded counts and winner |
| 65–110 s | Show the actual Director → Screenwriter → Visual Producer → Critic state, then a validated excerpt/preview when ready | Agent Use, original content reflecting the winner |
| 110–155 s | Review and approve the live result if ready, or play an approved saved episode labeled Pre-generated rehearsal episode | UI/UX and Creative Content, explicit publication/fallback provenance |
| 155–180 s | Show a canonical character memory or an episode-scoped cited answer and its source scene | Continuity and persistent-character evidence |

This is a presentation schedule. Production, network, review and question latency vary, so three minutes is not an execution SLA. A saved episode can carry the reveal while the live job stays visibly queued/running/review. State which path is being shown. Never present a saved episode as the result of a just-cast vote or label deterministic Demo as live inference.

## Audience, creator and AI paths

Audience phones open the QR's existing `/live/[id]` route, join their opaque session, select a direction, receive Vote recorded and watch a published episode. Voting remains server-validated and one vote per session/round. Recreating a cookie identity remains a known limitation.

The presenter signs in with the necessary role, selects the intended universe/round, joins if prompted, closes the vote, inspects the private draft and proposed canon, and explicitly approves publication. Official publication requires an admin. Creator owners manage custom universes. Private worlds require authorized access and are unsuitable for unrestricted audience joining until deliberately published.

Live generation uses loopback Ollama `qwen3:4b-instruct`. Persisted jobs and real events drive the UI. The screenplay produces a validated manifest and browser preview before Critic completion. Approved publication atomically commits episodes and canon. Questions use bounded source retrieval and valid citation IDs. Longer-term story quality still needs human review.

## Reliability and fallback

Use an approved episode from the same universe as the saved fallback. Playback uses stored data and zero inference. An approved offline Demo episode is suitable for rehearsal with its execution mode visible. Hosted OpenAI preparation remains gated by server credentials and explicit paid-run approval. Background BYOK is unsupported. The public launcher disables paid hosted requests.

Keep the Mac powered, lid open, internet available and the recovery worker running. Use the existing ngrok HTTPS web tunnel for up to 35 audience members, with Ollama staying on loopback. Check current account allowance and venue connectivity. The earlier 35-session run was synthetic. A physical-iPhone mode/Exit check passed on the Manila layout, while its fresh sheet/playback check is deferred. Earlier phone playback remains separately verified.

Acceptance for a future UI change requires the preserved typecheck/unit/build/browser coverage, two independent audience sessions, role and private-draft checks, idempotent publication, repeat playback/seek/captions, source-scene navigation, mode/refresh persistence and a saved fallback while live work continues. Rehearse process recovery on isolated storage. Verify at projector size and on the physical device. Operational commands stay in [PRESENTER_RUNBOOK.md](../PRESENTER_RUNBOOK.md).

## Boundaries of this demonstration

The proposed first design sprint excludes infrastructure migration, a new authentication system, schema replacement, paid inference without approval, MP4 export, generated voices/artwork, team collaboration, universe forks, broad moderation and additional future modules. These remain later decisions. Preserve the working functionality and direct routes while simplifying the visible experience.
