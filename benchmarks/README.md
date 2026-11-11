# Local inference benchmark

Run `npm run benchmark:local` from the repository using Node 24, installed dependencies and loopback Ollama serving `qwen3:4b-instruct`. The script sets isolated SQLite storage, disables paid requests, loads fixed inputs from `local-inputs.json` and saves complete results under ignored `.data/benchmarks/<timestamp>/`. The tracked JSON captures the latest successful run. It contains synthetic benchmark data and generated artifacts.

The tracked fixed-input result belongs to application checkpoint `2f37d3602ba2d619f38b8fb2ab07fd04739be5c3`. The latest application checkpoint is `7989ccde15933ab6765cd28ceebaa85cd489d535`, which adds tunnel/replay/role-interface changes. This documentation refresh preserves the recorded benchmark artifact and timings. Current acceptance and public-load results are recorded separately in [VERIFICATION.md](../VERIFICATION.md), with a development summary in [CHANGELOG.md](../CHANGELOG.md).

## Verified run on November 12, 2026

Model was `qwen3:4b-instruct`, temperature 0, context 8192, request deadline 110000 ms and maximum output 2400 tokens. Episode stage caps are 650 Director, 1400 Screenwriter, 800 Visual Producer and 600 Critic. Inference runs sequentially on the M2 Pro / 16 GB Mac. Timing includes local persistence and review/publication operations for episode tasks. System/application load and model residency affect comparisons.

| Task | Elapsed | Result |
| --- | --- | --- |
| Official-universe episode | 38.569 s | Three scenes, Critic approved, attempt one, playable preview observed during Critic |
| Three universe pitches | 14.370 s | Three validated editable pitches with setting/conflict/cast/first vote |
| Private-universe episode | 27.498 s | Three scenes, Critic approved, attempt one, playable preview observed during Critic |
| Episode/character-scoped story answer | 4.195 s | Answer cites Tita Nena's scene and approved memory from the requested episode |

The two episode tasks recorded zero failed stage events and one production attempt each. Pitches and answers recorded zero schema-validation retries. Publication was replayed for both episodes, preserving one episode per run. Unauthenticated access to the private world was rejected. Script, manifest, stage events, token usage for pitches/answers and citation details are in the JSON.

## Observed output quality

The official story follows the taho-currency winner and gives each original character one short line. Tita Nena's discount remark supports the answer's characterization of her response as skeptical/witty. The source citation opens that scene at its timestamp. Dialogue in this sample is English despite the official world's Taglish tone, so language/style fidelity needs broader evaluation.

The pitches follow the orbital-observatory mystery preference with missing-map and trust motifs. Each has one starter character and three audience choices. The private episode uses its supplied original cast and neutral visual backgrounds. Its three short lines produce a compact scene sequence. These checks establish structural validity and a usable local generation path. Creative depth, factual citation support across more questions, continuity over longer histories and topic-avoidance reliability need larger human-reviewed evaluations.

## Failures and comparison history

An initial run with the expanded full pitch schema completed its official episode in 50.919 seconds, then timed out during pitch generation at the 110-second bound. That failure remains under `.data/benchmarks/1794424807134/failed-results.json`. The pitch model contract was reduced to bounded fields and expanded into the full typed world draft server-side.

The next full pass recorded 44.004 / 17.283 / 37.430 / 3.703 seconds for official episode, pitches, private episode and answer. A later compact-context pass recorded 42.771 / 14.471 / 25.371 / 4.504 seconds. The final tracked pass uses the shared live adapter contracts and the fixed inputs above. These are repeated development measurements, with environment load varying between runs. They do not establish a statistically controlled model comparison.

OpenAI and BYOK inference remain unverified. No paid request was made. To compare another local model, change the benchmark fixture in a reviewed change, retain the original input/settings artifact and record its exact installed model ID, results, failures and elapsed times alongside this baseline.
