# CinemAI

**Stories made by AI. Directed by everyone.**

CinemAI combines a Milestone 1 interactive UI with a local four-agent production CLI. The web UI remains a fixture prototype; live API execution is only attempted through the CLI and requires separately configured credentials. No successful live agent run has been verified yet.

## Run locally

Install Node.js 24 LTS and npm, then:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. No environment values are required for Milestone 1.

Production verification:

```sh
npm run typecheck
npm run build
npm run start
```

If using the temporary Node runtime downloaded during implementation in this session:

```sh
export PATH=/tmp/node-v24.22.2-darwin-arm64/bin:$PATH
npm run dev
```

That runtime is temporary; install Node 24 normally for future sessions.

## Routes

| Route | Experience |
| --- | --- |
| `/` | CinemAI landing page and original CSS world illustration |
| `/watch/barangay-2099` | Captioned 15-second storyboard playback, seeking, episode history and local choice preview |
| `/studio/barangay-2099` | Seeded dashboard, disconnected agent workflow, script, character memory and episode preview |
| `/universe/barangay-2099` | Fictional world and three detailed character profiles |

Dynamic route parameters are validated; unsupported rooms and universes return 404.

## Prototype behavior

- The storyboard player cycles through three seeded captions. It is a browser illustration, not generated video, Remotion or an MP4. There is no audio.
- Voting is an explicitly local preview. A choice increments a seeded result only in component memory, locks selection until refresh, and is never sent to a server.
- Studio statistics are examples. Agents show “Not connected”; no production execution is implied. Operator actions are disabled.
- Characters include motivations, voice, relationships and initial memories, validated with Zod. They are source fixtures, not persistent database records.
- Original visual artwork is CSS; character pictograms use ISC-licensed Lucide icons. No external images or fonts are required.
- Keyboard focus, semantic radio inputs, caption controls, a skip link, responsive layouts and reduced-motion support are included.

## Structure

- `src/app`: route wrappers, metadata, styles, 404 page.
- `src/components`: responsive views and client interactions.
- `src/components/ui/button.tsx`: shadcn/ui-style accessible Button primitive using Radix Slot and CVA.
- `src/lib/domain.ts`: shared Zod schemas, production status types and future integration interfaces.
- `src/lib/fixtures.ts`: validated story, character, episode and voting fixtures.
- `.env.example`: empty placeholders for later service integrations. No credentials are needed now.

## Milestone 2 recommendation — requires approval

1. Add Supabase migrations for universes, rooms, episodes, character profiles, voting rounds, options and votes. Seed this fictional world.
2. Enable Supabase anonymous authentication. Derive participant identity from the verified server session; enforce a unique `(round_id, participant_id)` constraint.
3. Create transactional vote submission and round closure, validating room membership, option membership and round status server-side.
4. Apply RLS: public safe reads, participants limited to their own vote, and operator-only round management through server-verified roles. Keep the service-role key server-only.
5. Subscribe to safe aggregated result updates via Supabase Realtime; re-fetch authoritative totals after reconnect. Avoid exposing individual participant votes.
6. Add protected operator API routes and test two independent sessions, duplicate submissions, closed rounds, invalid options, unauthorized closure, races and reconnects.

The OpenAI Agents SDK is now installed for the authorized local production slice. Trigger.dev, Supabase and Remotion remain unconnected. No model accessibility or live-service success has been verified. Deployment and pushing are not authorized.

## Verification

See [VERIFICATION.md](VERIFICATION.md) for results and limitations. Production build, strict TypeScript and HTTP checks passed. Browser visual and interaction QA remains unverified because the computer-use browser host was unavailable. Scripts use Next.js Webpack mode because Turbopack encountered an environment port-binding failure.


## Local four-agent production slice

This implementation follows the [official OpenAI agent definition guidance](https://developers.openai.com/api/docs/guides/agents/define-agents) using separate typed agent runs orchestrated in code. All four agents share one OpenAI client and API key. No other AI provider or infrastructure service is introduced.

1. Create an ignored `.env.local` with `OPENAI_API_KEY` and `OPENAI_MODEL` set to a model available to your API project. Never paste secrets into chat or commit them. No default model is assumed.
2. Run:

```sh
npm run production -- "Launch a mandatory karaoke night"
```

3. The CLI prints the run ID. Inspect persisted events and outputs with:

```sh
npm run production -- inspect RUN_ID
```

The CLI checks model access, then executes Story Director → Screenwriter → Visual Producer → Creative Critic using the Agents SDK and Zod output schemas. The three-scene manifest is checked against script dialogue and an approved visual vocabulary. Those asset IDs are plans, not rendered media. All responses have explicit request timeouts, one SDK turn per agent and a 4,000-token output budget. Raw SDK errors are not printed or stored; safe error classifications are persisted. SDK tracing is disabled; local SQLite events are the audit source.

Schema failures have at most two attempts. A critic rejection allows one script/manifest revision and another critique. A second rejection ends in `review`, without publishing or modifying character memories. Accepted episodes and their memory updates commit in one transaction. A later run loads persistent profiles and the last five approved episodes plus labeled original story history. This bounded history is a starting continuity policy, not long-term retrieval.

Data lives in ignored `.data/cinemai.sqlite` (override with `CINEMAI_DB_PATH`). It survives CLI restarts and records stage starts, successes, outputs and failures. One running production per room prevents concurrent continuity updates. An interrupted process may leave a `running` row: inspect the database and confirm the process has stopped before an operator manually resolves that row. Automatic crash recovery and resumable durable jobs are not implemented.

SQLite uses Node 24's built-in `node:sqlite`; it is a local development persistence adapter, **not suitable for Vercel's ephemeral filesystem**. Migrate to Supabase before hosted execution. The CLI is local operator access and exposes no unauthenticated generation HTTP endpoint. The existing studio and audience pages do not read this database and continue to label all displayed data as fixtures.

```sh
npm run test:production
npm run typecheck
npm run build
```

Tests use explicit executor doubles to verify orchestration, persistence, revision limits and failure handling. They are not successful OpenAI requests. A credentialed live CLI run must complete all four stages before this slice can be called operational. Current blocker: neither the API key nor the model is configured.
