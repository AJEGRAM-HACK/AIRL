# AIRL — Artificial In Real Life

> **The real world is the prompt.**

AIRL is a creator-driven, community-powered entertainment platform. Creators build fictional worlds and persistent characters; audiences shape stories through participation; and AI-assisted production turns community choices into episodes.

AIRL is the platform. **AIRL Live** powers community participation, **CinemAI** creates episodic stories, and **PersonaAI** provides shared character definitions and continuity.

## Features

**First production** is the shared **Taho Tender** demo video across Explore, Live, the episode library/detail, Journey and published Studio previews. Open `/universes/barangay-2099/episodes/efbdba79-9564-4de1-8ca0-984c26d284f5`, or choose **Play first production** in Journey. The four-shot export is approximately 32 seconds. The original is retained in `.data/flow-demo/DEMO B2099.mp4`. The H.264/AAC playback copy and poster live in the same ignored folder, exposed through the ignored `public/demo-media` media links. Shared metadata maps this external Flow/Veo export to the existing demo episode/job IDs. The film page and Journey summary use the four-shot synopsis.

- **Universe discovery and creation** — browse public worlds or create and manage universes with scoped characters, relationships, and story canon.
- **Community participation** — join live story rounds, vote on what happens next, and follow updates as results come in.
- **Episodic production** — turn a winning choice into a structured story through Director, Screenwriter, Visual Producer, and Critic stages.
- **Creator review and publishing** — review generated drafts and proposed canon changes before publishing an episode.
- **Interactive playback** — watch episodes with seeking, captions, transcripts, replay, and dialogue audio.
- **Character continuity** — use shared character profiles, approved memories, relationships, and source-grounded story questions.
- **Explore and Journey experiences** — discover stories through the public interface or present them in a guided, chapter-based experience.
- **Multiple AI providers** — use deterministic Demo generation, local Ollama, hosted OpenAI, or authenticated request-scoped creator keys.

## Dependencies and technologies

### Runtime

- **Node.js 24 LTS** and **npm**
- **Next.js 16** with the App Router
- **React 19** and **TypeScript**
- **SQLite** for local application persistence

### Core libraries

- **AI:** OpenAI SDK, OpenAI Agents SDK, and Zod for validated data contracts
- **Media:** Remotion and the Remotion Player
- **UI:** Tailwind CSS 4, Radix UI Slot, Class Variance Authority, clsx, tailwind-merge, and Lucide
- **Utilities:** QRCode

### Optional integrations and development tools

- **Ollama** for local model inference; no hosted API key is required for local inference.
- **OpenAI API credentials** for hosted model requests.
- **Playwright** for browser testing and **tsx** for TypeScript scripts and tests.

Package versions are pinned in [`package-lock.json`](package-lock.json). See [`package.json`](package.json) for the complete dependency and script list.
