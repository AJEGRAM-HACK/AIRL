# Universe, identity and character model

This document maps the actual implemented contracts to proposed extensions. Runtime truth lives in [domain.ts](../src/lib/domain.ts), [platform migration](../src/server/platform/migration.ts), [platform store](../src/server/platform/store.ts) and [production schemas](../src/server/production/schemas.ts). Schema additions here are planning only.

## Identity and ownership

| Product term | Current representation | Current permissions |
| --- | --- | --- |
| Visitor | No account, optionally an opaque audience session | Public discovery/playback and anonymous room voting |
| Member | An account with stored role `viewer` | Profile/interests and signed-in story questions, plus audience capabilities |
| Creator | Stored role `creator`, granted by an admin | Create private worlds and manage owned custom universes |
| Admin | Stored role `admin`, initial bootstrap from trusted CLI | Grant viewer/creator access and manage official/all universes |
| Legacy operator | Narrow existing live-session authorization | Official round controls and draft inspection, with account checks still required for publication |

Member is a proposed product label for the existing viewer role. The enum currently remains viewer/creator/admin. Registration grants viewer access. Local salted scrypt password hashes and opaque session tokens are already implemented. Cookies are HttpOnly and SameSite Strict, with Secure on HTTPS. The server resolves identity and expiry, verifies ownership/visibility and checks same-origin mutations. Page/UI permission snapshots support presentation, while APIs independently authorize actions.

`PlatformStore.getWorld` permits writes only for admins or the creator owner of a custom world. Archived worlds must be restored before editing. Inaccessible/private or unknown public-page identifiers return 404. Official canon requires an admin. Unpublished scripts, previews, review and draft-source retrieval require the existing management or narrowly defined legacy read permissions.

Email verification/reset, hosted identity, team membership and stronger public identity/rate-limit policy remain future work. Requiring accounts for voting would change the current verified anonymous-session behavior and needs separate approval. Broader public-service hardening is outside the first UI sprint.

## Current universe representation

| Concern | Current field/storage | Gap or proposed extension |
| --- | --- | --- |
| Identity/owner | UUID or preserved official ID, `title`, `owner_id`, `official` | Dedicated display description if premise becomes insufficient |
| Visibility/lifecycle | private/public, recoverable archival | Teams and richer publication policy deferred |
| Narrative | `WorldSettings` setting, era, genre, tone, premise, storyline, languages, rules | Versioned lore and longer continuity evaluation |
| Cast | `universe_characters` keyed by universe and slug, JSON validated by `WorldCharacter` | First-class profile revisions |
| Relationships | Composite universe/from/to references | Richer relationship arcs after schema approval |
| Canon/history | Ordered `universe_episodes`, `canon_events`, approved memory/relationships | Branching/forks and revision metadata deferred |
| Community | One configured scoped room per universe, rounds/options/votes | Additional experience types deferred |
| Visual identity | Character color/symbol, scoped image BLOBs and reference asset IDs | Universe art direction, expressions and rendering custom artwork |
| Creative AI | Provider/model selected and frozen per job | Durable per-universe preferences are planned |

Settings limits already enforced include setting 600 characters, era/genre/tone 160, premise 1500, storyline 3000, up to eight languages and twenty rules of 500 characters each. A new world title is trimmed and limited to 120 characters. Creation may include up to twelve initial characters and two to six first-vote options. Additional UI constraints must follow the actual schemas.

## Current character contract

| Field group | Implemented validation/default |
| --- | --- |
| Identity | Slug `id` up to 80 characters, name required up to 100, role up to 200 |
| Voice/personality | Up to twelve personality strings of 200 characters, voice up to 300, speakingStyle up to 500 |
| Narrative | Backstory up to 2000, up to twelve motivations of 300, twenty rules of 300, memory strings up to 1000 |
| Visual references | Appearance up to 600, up to twelve UUID asset IDs, validated hex color default `#a78bfa`, symbol default `person` from bot/glasses/coffee/person |
| Defaults | Optional text and arrays default empty, with explicit visual defaults |

The runtime memory array has no explicit maximum item count in `WorldCharacter`. Inference context is separately bounded. Do not describe an unimplemented count cap as an existing constraint.

Only the owner/admin can edit scoped characters. Referenced asset IDs must belong to the same universe. The image API checks PNG/JPEG/WebP signatures and a 2,000,000-byte limit. Image storage/linking is implemented. Upload UI and custom artwork rendering remain follow-on work. Existing history/snapshots constrain destructive cast changes. Editing an existing profile preserves its approved memories. New-character memories are seeded as canon events, while later approved production memory changes flow through publication.

Current personality, voice, speaking style, motivations, rules and approved memories feed frozen production context and provider prompts. Numeric personality sliders are a proposed extension requiring an actual prompt/output contract and evaluation.

## Proposed character extensions

| Group | Proposed fields and initial validation design |
| --- | --- |
| Identity | Aliases up to eight strings of 80 characters, description up to 1000 |
| Personality | Humor, logic, confidence, empathy, curiosity, chaos, sarcasm, courage and creativity as finite numbers from 0 to 1, default 0.5 |
| Communication | Primary language up to 40 characters, up to forty vocabulary strings of 40 and eight catchphrases of 120, existing voice/style/rules retained |
| Narrative | Goals/fears/conflicts as up to eight strings of 300 per field, arc up to 1000, up to twenty world-knowledge strings of 500 |
| Visuals | Up to twelve scoped artwork UUIDs, up to twelve approved expression/animation registry IDs, costume up to 600 and art style up to 300 |
| Revision | Proposed schemaVersion 1, absent legacy version interpreted as 0; positive profileVersion starting at 1; promptPolicyVersion string up to 80, initially character-v1; approved source-event references |

These fields and suggested defaults are unimplemented. Before adoption, define exact list/text limits in an approved Zod schema, include every trait in the shared live-provider prompt contract, freeze the effective versions on jobs and test differences in actual outputs. A midpoint default supplies compatibility for missing numeric fields without claiming it was inferred from legacy personality text. Keep original strings and approved memories intact. Do not add decorative controls without corresponding inference behavior.

## Continuity and job reproducibility

Closing a round freezes its winner, world/cast/history, provider/model and explicit story order. Validated outlines and preview versions precede Critic completion. The public manifest remains protected until publication. Canon corrections, published episode and approved memories/relationships commit transactionally and idempotently. Retries preserve selection and compatible validated stages. Model outputs remain nondeterministic despite stored inputs. Explicit prompt/profile version fields are a proposed reproducibility improvement.

Story retrieval filters visibility, universe, episode boundary and optional character before inference. Citations must name supplied source IDs. This enforces source references, with semantic grounding still requiring human evaluation. Secrets remain outside records and job payloads. Existing provider security and route contracts are authoritative in [ARCHITECTURE_PLAN.md](../ARCHITECTURE_PLAN.md).

## Preservation and later migration

The legacy-to-universe migration already exists and was previously applied to the normal database after backup/copy verification. It preserves Barangay 2099, the original cast/IDs, episodes, artifacts, production history and approved canon. The current schema has platform migration versions through 3. This sprint does not execute that utility or change the database.

For a future character/schema extension, capture a fresh backup, rehearse additive changes on a separate copy, add explicit versioned defaults, retain old JSON/IDs and validate scoped foreign keys, original records, assets, source-round links and ordered canon. Map Captain Bot, Tita Nena and Kuya Taho from their current stored profiles, retaining their exact history and descriptive traits. Preserve legacy provider IDs through the existing alias. Verify old and new records through real entry points before approving an apply step.

A later hosted migration should preserve UUIDs and transactional constraints while adding tested Auth/RLS and durable workers. It requires separate infrastructure approval. Backup and isolated restoration procedures live in [PRESERVATION_CHECKPOINT.md](PRESERVATION_CHECKPOINT.md).
