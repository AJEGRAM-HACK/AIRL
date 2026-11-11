# CinemAI

**Stories made by AI. Directed by everyone.**

Milestone 1 foundation for a community-directed cinematic storytelling platform. This is a local interactive prototype; all episode, participant, voting and character data is seeded. There is no backend, AI execution, real vote submission, or production job.

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

The OpenAI Agents SDK, Trigger.dev, Remotion and their credentials are intentionally deferred until their approved milestones. No model accessibility or live-service tests have been performed. Deployment and pushing are not authorized.

## Verification

See [VERIFICATION.md](VERIFICATION.md) for results and limitations. Production build, strict TypeScript and HTTP checks passed. Browser visual and interaction QA remains unverified because the computer-use browser host was unavailable. Scripts use Next.js Webpack mode because Turbopack encountered an environment port-binding failure.
