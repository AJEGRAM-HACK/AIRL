# Deploy the AIRL hackathon viewer demo

The hosted demo serves the existing Explore, Journey, Live and episode pages. The checkout includes the 18.5 MB **Taho Tender** video and poster. On first boot, the launcher imports the published episode and the recorded showcase round, then opens a separate round with zero votes. The live tally comes from viewer votes saved in SQLite. The recorded 7/3/2 tally belongs to the earlier showcase round.

Only the hosted launcher enables viewer mode. It accepts anonymous room joins and votes, serves the public showcase and tally, and disables account, Studio, operator, and AI API access. Voting is limited to one vote per room session per round. A new browser session can obtain a separate vote, so use the tally as audience participation feedback.

## Hosting

Use one Oracle Cloud Always Free Ampere A1 VM with a persistent boot or block volume, subject to capacity and eligibility in the account's home region. One CPU and 6 GB RAM fit within the current A1 allowance for an otherwise unused tenancy. Thirty full plays of the bundled film are about 555 MB of transfer. Check the Always Free label and account usage before provisioning. Oracle can reclaim idle instances, so check availability before sharing the URL and keep a database backup. [Oracle Always Free resources](https://docs.oracle.com/en-us/iaas/Content/FreeTier/freetier_topic-Always_Free_Resources.htm)

AIRL is a Next.js App Router server on Node.js 24. It uses native `node:sqlite`, a writable SQLite database, cookie sessions and server-sent events. Static Cloudflare Pages cannot run these server routes. Render Free discards the writable filesystem on restarts. Supabase would require porting SQLite stores and transactions to Postgres. The VM runs the existing application and serves the existing media over the same HTTPS origin. [Cloudflare Pages Next.js guide](https://developers.cloudflare.com/pages/framework-guides/nextjs/deploy-a-static-nextjs-site/) · [Render free services](https://render.com/docs/free)

## Install and start

1. Provision a Linux VM in the home region within Always Free limits. Point a hostname you control to its public IP. Allow inbound TCP 80 and 443 in OCI and the host firewall, and restrict SSH to your admin network. The AIRL process listens on loopback port 3000.
2. Install Node.js 24 LTS and npm on the system PATH, plus Git and Caddy 2.10 or newer. Create an unprivileged service account and group named `airl-viewer`. Use your authenticated GitHub access to clone only the deployment branch. Do the install and build as an unprivileged deploy user with write access to the checkout. The service account needs read and traversal access.

   ```sh
   sudo install -d -m 0755 -o "$(id -un)" -g "$(id -gn)" /opt/airl-viewer
   git clone --single-branch --branch deploy/hackathon-viewer-demo https://github.com/AJEGRAM-HACK/AIRL.git /opt/airl-viewer
   cd /opt/airl-viewer
   npm ci --include=dev
   npm run build
   ```

3. Install and start the bundled systemd service. The state directory is created automatically with restricted permissions. Keep it on persistent storage across updates.

   ```sh
   sudo install -m 0644 deploy/viewer/airl-viewer.service /etc/systemd/system/airl-viewer.service
   sudo systemctl daemon-reload
   sudo systemctl enable --now airl-viewer
   sudo systemctl status airl-viewer
   ```

4. Replace `viewer.example.com` in [the Caddyfile](../deploy/viewer/Caddyfile) with the real hostname. Add the site block to the server's Caddy configuration, validate it with `caddy validate --config /etc/caddy/Caddyfile`, then start or reload Caddy. It obtains and renews the public certificate. [Caddy HTTPS setup](https://caddyserver.com/docs/automatic-https)
5. From a phone on cellular data, open `https://YOUR_HOST/journey?universe=barangay-2099` and play, seek, and replay the film. At `https://YOUR_HOST/live/barangay-2099`, join from two independent browser sessions, vote, and check that the tally updates. Restart the service with `sudo systemctl restart airl-viewer` and check that both votes and the film are still there. Check the room QR opens the HTTPS URL. Confirm that `/studio`, `/account`, and the AI, operator, and production-write endpoints return 404.

The hosted launcher sets `AIRL_VIEWER_DEMO=true` and `AIRL_ALLOW_LIVE_REQUESTS=false` for the server. The only required deployment setting is the absolute, persistent `AIRL_LIVE_DB_PATH` supplied by the service. Use a fresh path and keep the same path across restarts and releases. Avoid copying any local `.env`, SQLite database or private media to the VM. No API keys, Ollama, production worker, or GPU are needed. Back up using SQLite's online `.backup` command, and store the backup privately outside the VM.

## Face-to-face presentation

Use the [presenter runbook](../PRESENTER_RUNBOOK.md) for the local LAN rehearsal, operator, Studio, production, and phone flow. `npm run demo` still opens the existing isolated saved showcase with the original closed round. Keep its settings and presentation database separate from the public service. For a local hosted-mode preview after `npm run build`, use `AIRL_LIVE_DB_PATH="$PWD/.data/viewer.sqlite" npm run demo:viewer`.
