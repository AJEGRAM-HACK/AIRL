# AIRL hackathon presenter runbook

Use the Mac with Node 24, Ollama serving `qwen3:4b-instruct`, the existing SQLite database and the configured ngrok account. Keep power connected, the lid open and internet available. The launcher includes the recovery worker and idle-sleep prevention.

1. Stop the running demo before rebuilding. From the repository, run the following commands.

   ```sh
   export PATH=/tmp/node-v24.22.2-darwin-arm64/bin:$PATH
   export AIRL_LIVE_DB_PATH="$PWD/.data/airl-live.sqlite"
   npm run build
   npm run demo:tunnel
   ```

2. Open the printed presenter URL at `/journey?universe=barangay-2099`. Sign in at `/account` as the existing admin on the same origin, then open Journey. The everyday `/` entry uses Explore and has a prominent Launch Journey action. For a custom world, its creator owner or an admin can present. Open Presentation settings in Journey for its universe selector and next-round action. The selector lists accessible worlds with configured rooms. Existing jobs resume from their stored state. The introduction opens first unless the shared URL names a chapter. Use the slim chapter rail, Next/Previous chapter controls, or Left/Right and Page Up/Page Down to navigate. On the main stage, scroll at the content edge or swipe left/up for the next chapter and right/down for the previous chapter. Long content scrolls normally first; horizontal swipes can switch directly. One gesture advances one chapter, with a strong 3D transition and a reduced-motion fallback. Sheets, form fields and playback controls keep their own scrolling/gestures. Data updates keep the presenter on the selected chapter.
3. Introduce the premise and open Meet the cast. Close the sheet to return to the same chapter. Open the voting stage and display the QR. Its destination is `/live/[universe]`, where audience phones join, vote and watch. Visitors may need to tap ngrok's Visit Site notice once. The public HTTPS endpoint uses a trusted certificate. Check that voting is open. If the current round is closed, an authorized presenter can start the next round explicitly in Presentation settings.
4. Join the room in the presenter session if prompted. Wait for votes, then choose Close voting & produce. Journey uses local Ollama with `qwen3:4b-instruct`. Follow the recorded winning direction into production. The active agent and handoffs come from recorded events. Validated dialogue and preview tabs reveal one artifact at a time, retaining the last valid preview and its version during revisions. Drafts remain restricted to authorized users.
5. Choose Review before the premiere when the job reaches review to open the authorized review sheet. Read the proposed canon changes and Critic feedback. Correct canon JSON if needed, then Approve & publish. Official Barangay 2099 publication requires an admin. Close the review sheet, then choose Premiere the live episode. Play the approved episode, use the player’s fullscreen control on the projector, seek backward, replay, toggle captions and open the Episode transcript sheet. Escape or Close sheet restores the same chapter and keyboard focus. Share the Audience watch link.
6. Choose Ask about this episode. The helper defaults to this episode's spoiler scope and suggests a featured-character question. Ask what that character said, then open its scene citation. This action performs a separate local inference.

If generation runs long, choose Play a saved episode in the persistent footer. To pick another approved item, open Choose saved episode, select it and choose Use this episode. It is labeled Pre-generated rehearsal episode. Playback reads the stored manifest and makes no inference request. The live production status stays visible. Return to live production opens the pending job, and Open the completed live episode appears after publication. Replaying a saved episode leaves the stored vote, job and review state intact. A world needs at least one approved episode for this action.

Exit to Explore returns to the regular root entry. Launch Journey and the mode links carry universe, round, episode and chapter context. Direct Live, CinemAI, PersonaAI, Studio and legacy URLs remain available. Refreshing restores the selected Journey step and saved episode from its URL while jobs continue in SQLite. Rejected or failed jobs retain their recorded state. An authorized retry uses the existing bounded retry controls.

If the app stops, restart the launcher with the same database. Queued work is recovered by the worker. Interrupted running work becomes claimable after its 150-second lease expires. Failed jobs need an authorized retry and retain the three-attempt bound. Keep the last approved saved episode ready while waiting. Rebuilding replaces `.next`, so pause the presentation first.

The user's November 12 paid-demo instruction authorizes Hosted OpenAI on the trusted local server. Port 3110 uses the curated one-universe/one-published-episode snapshot, a privately configured key and GPT-6.1 Terra. A consented API rehearsal completed four stages and one memory correction with Critic approval; its new draft remains private. In Journey, open Presentation settings, confirm Hosted OpenAI/model and authorize the intended operation before closing voting. Consent resets after each close attempt. Existing Studio selection/review/publication controls remain available. Keep the existing approved saved episode ready. The public `demo:tunnel` launcher still forces hosted calls off, so this local paid setup is not a verified paid public-tunnel launch. Do not run a paid-disabled recovery worker against hosted queued jobs. BYOK stays request-only and cannot run background episodes. [Private setup, observed failures/costs and limits](docs/DEMO_OPENAI_SETUP.md).

The user confirmed saved playback, seeking, replay and captions at `05e1542`. For the Manila layout, the user confirmed that Explore and Journey are clearly different on the iPhone and Exit works. Fresh physical sheet/playback checks are deferred. Browser emulation verified these interactions on the current layout.

Use an already approved Ollama episode or an approved offline Demo episode as the presentation fallback. Demo content remains labeled in its production metadata. Before the event, rehearse the venue network and physical iPhone, check ngrok allowance, and repeat the complete sequence with two independent audience sessions. Run automated browser checks separately from the presentation because they rebuild production output. Set AIRL_LIVE_DB_PATH explicitly to a fresh temporary path, following the README verification command. The harness otherwise inherits the live database when that variable is set. Backup and recovery preparation is documented in [PRESERVATION_CHECKPOINT.md](docs/PRESERVATION_CHECKPOINT.md).


## Local-network HTTPS fallback

Use the Mac and phones on the same trusted Wi-Fi. The dedicated launcher binds only to a private IPv4 address assigned to the Mac, validates the Host header and terminates TLS in the application process. Ollama remains on `127.0.0.1:11434`. Room QR images are generated locally with `qrcode` and contain only the public audience URL.

```sh
# Use Node 24. The temporary development runtime may require this PATH.
export PATH=/tmp/node-v24.22.2-darwin-arm64/bin:$PATH
export AIRL_DEMO_HOST="$(ipconfig getifaddr en0)"
export AIRL_LIVE_DB_PATH="$PWD/.data/airl-live.sqlite"
npm run demo:setup
npm run build
npm run demo:lan
```

If Wi-Fi uses another interface, select its assigned private IPv4 address. Setup creates an ignored local CA and a 30-day server certificate under `.data/demo-tls/`. Rerun setup after the IP changes or the server certificate expires. Preserve the CA for phones already enrolled. Private keys stay on the Mac with restricted permissions. Transfer only `root.crt` to the iPhone through AirDrop or USB, install the profile in Settings, then enable AIRL Local Demo CA under Settings → General → About → Certificate Trust Settings. Remove the demo CA profile after the event. [Apple certificate trust instructions](https://support.apple.com/en-ph/102390)

Open the printed `https://<LAN-IP>:3443/studio/barangay-2099` address on the Mac. Its room-joining panel displays a QR code and clickable audience URL. Scan it using the iPhone camera after trusting the CA. At the top of the audience room, Vote on next chapter jumps directly to joining and choices; Watch episodes returns to playback. The normal loopback Studio instead explains how to get a phone-accessible QR. Port 3443 is configurable using `AIRL_DEMO_PORT`. If access fails, check the IP, Wi-Fi client isolation, certificate trust and macOS incoming-connection prompt. Keep router port forwarding disabled.

Sign in as an admin on the HTTPS origin to publish official canon. Bootstrap the signed-up account locally using `npm run account:admin -- your-email@example.com` with the same database. Legacy operator codes provide official-room round controls and draft inspection. Publication requires the admin account. Select Ollama and `qwen3:4b-instruct`, collect phone votes, close voting, inspect actual stage events, then approve and play the episode on the phone. Test captions, scene seeking and locking/unlocking Safari. Operator sessions belong to the chosen HTTPS origin; a localhost login does not transfer.

For crash recovery, restart `npm run demo:lan` with the same database and start `npm run production:worker` in another terminal with that database. A killed running job becomes claimable after its 150-second lease expires. The worker polls every two seconds. Recovery can repeat inference, reuses completed drafts when available and preserves publication idempotency. Failed jobs require operator retry and retain the three-attempt limit. Keep the worker running during the presentation.

For acceptance, use README's explicit temporary-database browser command separately from the presentation. It rebuilds `.next` and uses port 3100. The database path must be explicitly isolated. Run `node_modules/.bin/tsx --test tests/*.test.ts` for all unit regressions, including the LAN bind restrictions. Browser emulation and local certificate checks supplement the physical-phone rehearsal.


The build explicitly targets Safari 16 after the physical iPhone exposed an unsupported class static block in the default Next client bundle. When changing browser targets, use a clean generated build because the existing cache retained older output during verification. Physical iPhone joining and voting now pass. A real winning taho vote completed all four Ollama stages and publication in 28.3 seconds. On the public ngrok origin, the user confirmed voting, initial playback and caption toggling. A blank frame after rewind was reproduced and fixed by preserving visible episode content at scene boundaries. A second fix makes silent playback independent of audio-context resumption. The user confirmed repeated rewind/replay on the physical iPhone through the public URL. See VERIFICATION.md for exact evidence and limits.
