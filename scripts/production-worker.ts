import { loadEnvConfig } from '@next/env';
import { runRoomJob } from '../src/server/production/room-jobs';
loadEnvConfig(process.cwd());
let stopped = false;
process.on('SIGINT', () => { stopped = true; });
process.on('SIGTERM', () => { stopped = true; });
async function main() {
  do {
    const worked = await runRoomJob();
    if (!process.argv.includes('--watch')) break;
    if (!worked) await new Promise(resolve => setTimeout(resolve,2000));
  } while (!stopped);
}
main().catch(() => { console.error('Production worker failed. Inspect local job state before retrying.'); process.exitCode=1; });
