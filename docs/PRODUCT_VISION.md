# AIRL product vision

Status recorded November 12, 2026. This defines the product direction for a later redesign. Existing implementation and verification are recorded in [the architecture plan](../ARCHITECTURE_PLAN.md) and [verification record](../VERIFICATION.md).

AIRL means **Artificial In Real Life**. Its tagline is **The real world is the prompt.** AIRL is a creator-driven, community-powered AI entertainment platform. People create fictional universes and characters, communities shape story decisions, and AI agents transform those decisions into original episodes with persistent continuity.

## Audiences and product containers

| Audience | Value | Current entry |
| --- | --- | --- |
| Visitors and audiences | Discover a world, vote, watch the result | `/universes`, `/live/[id]`, published episodes |
| Signed-in members | Maintain a profile, interests and access to story questions | `/account`, episode/character helpers |
| Authorized creators | Build and manage owned worlds, characters and episodes | `/studio`, `/studio/worlds/[id]` |
| Admins | Grant creator access and protect official canon | Existing admin controls and server checks |
| Presenters and judges | Follow one community decision through production and premiere | `/journey` |

A universe is the main creative container. It joins its premise, setting, storyline, genre, tone, rules, cast, relationships, approved memories, episodes and community room. Richer visual identity and durable universe-level AI preferences are future extensions. Barangay 2099 and Captain Bot, Tita Nena and Kuya Taho remain the official world and cast. Detailed current/proposed fields and permissions live in [UNIVERSE_MODEL.md](UNIVERSE_MODEL.md).

AIRL Live owns participation. CinemAI owns structured episode creation and playback. PersonaAI owns scoped character profiles and continuity. AIRL Studio owns creator operations, provider selection and human review. Future QuestAI, RemixAI, WorldForge and Memories experiences stay secondary in the proposed hackathon navigation. Existing URLs and functionality remain accessible through appropriate surfaces.

## Judging criteria and decisions

| Criterion | Product evidence to present | Consequence for design |
| --- | --- | --- |
| UI/UX | A clear universe entry and a complete phone/presenter journey | Strong hierarchy, legible controls, progressive disclosure |
| Community | Independent audience votes determine a recorded winner | Make joining, choices and results immediate |
| Agent Use | Director, Screenwriter, Visual Producer and Critic produce validated outputs | Show actual events, private previews and explicit approval |
| Creative Content | Original scenes reflect the winner and established characters | Preserve character voices, canon and a playable reveal |

Success for the next design review means a visitor can explain the product after reading the opening screen, find Explore and account access, and enter an official world without configuration. A creator can reach owned content without seeing unauthorized worlds. Judges can follow the decision-to-episode chain in approximately three minutes using live progress or a labeled saved episode. These are proposed acceptance goals. The evidence already collected for the existing build remains separately attributed to its tested commits.

## Current capabilities and product gaps

Profiles, creator grants, owned universes, custom cast, scoped memory, voting, real Ollama production, review, publication and Remotion preview already exist. A later redesign should improve their discoverability and presentation. Numeric personality controls, first-class character revisions, richer artwork/audio, universe forks, teams and always-on hosting remain future scope. Hosted OpenAI and HTTPS BYOK have adapters and guarded pathways, with live paid validation still pending.

The active task is preservation and planning. The proposed interface strategy is in [UI_UX_PIVOT.md](UI_UX_PIVOT.md), the credible demonstration is in [HACKATHON_MVP.md](HACKATHON_MVP.md), and approval gates are in [REDESIGN_ROADMAP.md](REDESIGN_ROADMAP.md).
