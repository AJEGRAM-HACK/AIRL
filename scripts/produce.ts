import { loadEnvConfig } from '@next/env';
import { resolve } from 'node:path';
import { ProductionStore } from '../src/server/production/store';
import { produce } from '../src/server/production/workflow';
import { configuredProvider } from '../src/ai/providers/config';
loadEnvConfig(process.cwd());
const args = process.argv.slice(2);
const dbPath = resolve(process.env.CINEMAI_DB_PATH || (process.env.AI_PROVIDER === 'openai' ? '.data/cinemai.sqlite' : '.data/airl-demo.sqlite'));
async function main() {
  if (args[0] === 'inspect' && args[1]) {
    const store = new ProductionStore(dbPath);
    try { console.log(JSON.stringify(store.inspect(args[1]), null, 2)); } finally { store.close(); }
    return;
  }
  const provider = await configuredProvider();
  console.log(provider.mode === 'demo' ? 'Demo-generated content · Simulated agent workflow' : 'Live OpenAI execution requested');
  const winningChoice = args.join(' ').trim();
  if (!winningChoice) throw new Error('Usage: npm run production -- "Winning story choice"');
  const store = new ProductionStore(dbPath);
  try {
    const result = await produce(store, provider.executor, { roomId: 'barangay-2099', winningChoice }, provider.model, id => console.log(`Production run: ${id}`));
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== 'complete') process.exitCode = 2;
  } finally { store.close(); }
}
main().catch(error => { console.error(error instanceof Error ? error.message : 'Production failed'); process.exitCode = 1; });
