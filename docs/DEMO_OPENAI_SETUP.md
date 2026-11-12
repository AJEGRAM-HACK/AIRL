# Curated demonstration and OpenAI setup

Prepared November 12, 2026 from application checkpoint `d78b053`. This follow-up is authorized by the user's request to show one universe/episode and prepare OpenAI credentials. Original working-tree edits remain separate.

## Presentation data

The earlier port-3110 preview used `/tmp/airl-unified-acceptance-20261112-1.sqlite`, a disposable browser-acceptance database containing test accounts, extra worlds and multiple published episodes. That database is retained. No universe or episode was deleted from either source database.

The new ignored `.data/demo-presentation-20261112.sqlite` is a coherent SQLite backup-API snapshot of `.data/airl-live.sqlite`, opened read-only at the source. Integrity and foreign-key checks passed. It retains the existing account, cast, relationships, votes, jobs, assets and approved canon, with exactly one public universe and one published episode:

- **Barangay 2099** (`barangay-2099`).
- **Taho as Currency: The Great Taho Revolution** (`7cfe613f-75ee-4605-ba4f-db5365a3cc75`), the previously approved local Ollama episode. It is not an OpenAI-generated episode.

Port 3110 now uses the curated database explicitly. The original database and unrelated port-3000 service remain untouched. The copy has restricted file permissions. It is a local presentation snapshot, not a replacement for the encrypted private-backup procedure in [PRESERVATION_CHECKPOINT.md](PRESERVATION_CHECKPOINT.md). Subsequent writes on the demo copy are independent of the original.

The Live episode gallery waits for its library response and lists published episodes when available. Seeded reference samples remain the labeled fallback for Barangay only when no published episodes exist. A stale reference selection resolves to a valid published episode after a refresh. Other universes, creation, ownership and publication features remain available through their existing authorization.

## Private credential entry

The user entered the key privately into ignored root `.env.local`, with mode `0600`. Model metadata access returned HTTP 200 for `gpt-6.1-terra`, configured as both `OPENAI_MODEL` and the sole `OPENAI_ALLOWED_MODELS` entry. The user subsequently authorized the private paid preview and paid demo generation. The trusted loopback port-3110 server now has `AIRL_ALLOW_LIVE_REQUESTS=true`. Never paste the secret into chat, source code, a terminal command, logs or a `NEXT_PUBLIC_` variable.

1. In the [OpenAI API dashboard](https://platform.openai.com/api-keys), select the intended project and create a project API key. Supply billing/credits privately in your own account if the dashboard requires them; this task does not purchase credits.
2. Open `.env.local` locally, paste the secret after `OPENAI_API_KEY=`, and save. The file was opened in TextEdit for this handoff. API keys belong in server environment configuration, per [OpenAI's authentication guidance](https://developers.openai.com/api/reference/overview).
3. When replacing a key, verify credential presence without printing its value, then check model access with the model metadata endpoint before inference. Restart the owned server to load a changed credential.
4. In Journey, sign in with the existing admin account and open **Presentation settings**. Configured Hosted OpenAI is selected automatically for managers; authorize the intended paid operation before closing voting. Consent clears after every close attempt and whenever the model or current round changes. The existing Studio provider selector also supports Hosted OpenAI. The AI-settings **Test connection with inference** button incurs inference; it is not a metadata-only credential test. Review output before publication. Publishing another episode will increase the visible episode count.

The model is a recommendation for this writing workload: [GPT-6.1 Terra](https://developers.openai.com/api/docs/models/gpt-6.1-terra) is documented as fast and efficient for natural writing and supports structured outputs. Standard short-context list rates checked on November 12 are $1/million input tokens and $5/million output tokens; the private config uses these for estimates only, not a billing cap. The existing server limits remain 110 seconds per operation, with the configured output cap raised to the supported 4,000 tokens. APIs, schemas, authentication, provider selection, SDK adapters and dependencies are unchanged. Shared stage guidance now explicitly matches the actual player: three six-second scenes, one short line each, registered cast pictograms and existing backgrounds. The Critic still rejects ungrounded memories and continuity errors.

Journey now passes the selected provider/model/consent through the existing close endpoint. Its default remains local Ollama when hosted configuration is unavailable. Legacy operators retain their previous local controls; paid generation requires an authorized manager account. BYOK is not offered for background jobs. Saved playback performs no inference. The public `demo:tunnel` launcher still intentionally forces hosted requests off; this change enables the trusted local presentation server, not public tunnel hosting. Do not mix a paid-disabled recovery worker with hosted queued jobs. Standalone CLI `AI_PROVIDER` remains Ollama; there is no automatic fallback between providers.

## Observed paid preview

The separate ignored `.data/openai-private-preview-20261112.sqlite` retains the actual API outputs and failed attempts. Run `10b93678-44c7-4a36-9632-15722ff5caae` generated **Kantahang Sapilitan**, completing all four stages and one Critic-requested memory correction. The final Critic approved it; it remains a private draft. The real run took 95.219 seconds with calls paced 15 seconds apart, reporting 10,693 input and 2,534 output tokens, estimated $0.023363. Pacing was part of this operator rehearsal, not a new retry policy in the app.

Earlier run `c29fba55-ec0f-4946-9187-bdd38bcba020` completed the four initial stages, then encountered HTTP 429 when starting its requested revision. Its reported tokens estimate $0.014311. Resume `3c8963c6-81c5-4e0e-b42b-8314b324fa6c` stopped at Visual Producer validation, estimating $0.012778. These exposed unsupported-extra/prop requests and motivated the shared guidance correction. Combined reported-token estimate: $0.050452, excluding any unreported usage and differing billing treatment. [OpenAI's error guidance](https://developers.openai.com/api/docs/guides/error-codes) distinguishes rate limits from credit/spend/quota failures; the stored sanitized 429 does not establish its precise cause.

Restricted private review exports are `.data/openai-demo-preview.md` and `.data/openai-demo-preview.json`. The run used the curated universe's real approved history/cast through the existing provider registry and workflow, with publication deferred. It was an operator API rehearsal, not a live audience vote or browser enqueue test. No episode, canon, account or job was added to the actual presentation database, and the new draft is not listed in its Studio. Its one public episode remains the approved Ollama fallback.

## Local restart and rollback

Use the existing Node 24 installation and successful production build:

```sh
export PATH=/tmp/node-v24.22.2-darwin-arm64/bin:$PATH
AIRL_LIVE_DB_PATH="$PWD/.data/demo-presentation-20261112.sqlite" AIRL_ALLOW_LIVE_REQUESTS=true npm run start -- --port 3110
```

Do not start another listener when 3110 is already running. Stop only the owned preview before a rebuild. To return to the prior test-data preview, restart it with the previous explicit `/tmp/airl-unified-acceptance-20261112-1.sqlite` path. Preserve any newer demo writes rather than replacing a database. Source rollback anchor: `checkpoint/pre-demo-cleanup-2026-11-12` at `d78b053`. Preserve `.env.local` privately; do not commit it or the database.

The owned recovery worker is also running with the same explicit curated database path and paid gate. Its restart command is the same environment prefix followed by `npm run production:worker`. No jobs were queued/running at startup. Stop this owned worker as well as the web preview before rebuilding or switching its database.

Checks and remaining limits are recorded in [VERIFICATION.md](../VERIFICATION.md).
