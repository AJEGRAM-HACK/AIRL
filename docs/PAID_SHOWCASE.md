# Paid presentation episode

Updated November 12, 2026 after the user's instruction to replace the demo results with an appealing paid generation.

## Current presentation

**Taho Tender** is the sole published episode in the sole public universe, Barangay 2099. It is a 42-second captioned, silent animated composition with 12 Taglish dialogue lines, generated blue character artwork and camera motion. The story turns taho into official currency and ends with Captain Bot becoming the central bank.

The user-authorized Hosted OpenAI run used GPT-6.1 Terra and passed Director, Screenwriter, Visual Producer and Critic. A persisted administrator's authority was checked for the trusted local operator preparation and publication. The round contains one controlled presenter vote. Publication used the existing transaction and approved-canon checks.

- Episode/run ID `efbdba79-9564-4de1-8ca0-984c26d284f5`.
- Room job `a74e1393-1260-4a13-a8a7-ffa3c13335bd`.
- Round `af38c22f-c2f8-4aba-a1e2-42583781ae1a`.
- Active ignored database `.data/demo-paid-showcase-20261112.sqlite`.
- [Public premiere](https://pope-java-fable.ngrok-free.dev/journey?universe=barangay-2099&round=af38c22f-c2f8-4aba-a1e2-42583781ae1a&episode=efbdba79-9564-4de1-8ca0-984c26d284f5&step=premiere).
- [Audience watch and voting room](https://pope-java-fable.ngrok-free.dev/live/barangay-2099).

This is a fresh presentation timeline with the standard official world and cast. The existing account and opaque sessions were copied under a consistent source read transaction. The original live database, prior presentation database and earlier private preview database remain available for recovery. The active database has one account, one universe and one published episode. Integrity checks return `ok` and foreign-key checks return zero violations.

## Rendering and generation

Paid story requests now produce three scenes with three or four short lines each. The OpenAI visual output uses exact 14-second durations and script-derived speaker IDs. The workflow attaches authoritative cast profiles. Requiring the relationship array and excluding the unused optional cast field gives the SDK a concrete structured-output contract. Existing persisted manifests remain readable.

Optional server configuration sets `OPENAI_MIN_CALL_INTERVAL_MS=15000` and `OPENAI_REASONING_EFFORT=low` for this presentation. Pacing respects cancellation. Reasoning effort is sent only when configured. The existing 110-second workflow and 4,000-token output bounds apply. The final successful attempt took 50.05 seconds. Two earlier attempts retained private failure evidence. Combined reported usage estimates $0.044072, excluding unreported usage or differences in actual billing.

The retry audit also found that input property ordering could defeat snapshot reuse. `resumable` now applies the existing input contract before comparison. A regression verifies that reordered equivalent inputs reuse validated stages and a changed story direction prevents reuse.

The cinematic renderer uses a project-owned generated PNG for the three named official characters. Other cast compositions use the existing renderer. Caption placement clears playback controls at 320, 390 and 1440 pixels. Phone premiere sizing is larger, with normal stage scrolling. Reduced motion keeps the camera fixed. [Artwork, saved path and exact generation prompt](assets/paid-showcase-art.md).

## Launch

The owned loopback preview runs on 3110. The owned ngrok launcher runs the HTTPS upstream on 3456, a recovery worker and idle-sleep prevention. Both select the active database. The launcher passes an explicit `AIRL_ALLOW_LIVE_REQUESTS=true` through to its server and worker. Its default remains false. Admin/owner checks and per-operation paid consent apply through the existing APIs.

```sh
export PATH=/tmp/node-v24.22.2-darwin-arm64/bin:$PATH
AIRL_LIVE_DB_PATH="$PWD/.data/demo-paid-showcase-20261112.sqlite" AIRL_ALLOW_LIVE_REQUESTS=true npm run demo:tunnel
```

Stop the owned launcher and loopback preview before rebuilding. Keep the Mac powered and awake while presenting. Ngrok prints the public URL when it starts. The key remains in restricted ignored server configuration.

Verification, screenshots, failed attempts and current limits are recorded in [VERIFICATION.md](../VERIFICATION.md). Source rollback anchor `checkpoint/pre-paid-showcase-2026-11-12` retains `1113a01`. Switching back to an earlier presentation database is a separate operator action that should account for subsequent activity.
