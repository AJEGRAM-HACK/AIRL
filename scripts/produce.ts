import { loadEnvConfig } from '@next/env';
import { resolve } from 'node:path';
import { ProductionStore } from '../src/server/production/store';
import { produce } from '../src/server/production/workflow';
import { createOpenAIExecutor } from '../src/server/production/openai';
loadEnvConfig(process.cwd());
const args = process.argv.slice(2);
const dbPath = resolve(process.env.CINEMAI_DB_PATH || '.data/cinemai.sqlite');
async function main() {
  if (args[0] === 'inspect' && args[1]) {
    const store = new ProductionStore(dbPath);
    try { console.log(JSON.stringify(store.inspect(args[1]), null, 2)); } finally { store.close(); }
    return;
  }
  if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL) throw new Error('Configure OPENAI_API_KEY and OPENAI_MODEL in .env.local. No API request was made.');
  const winningChoice = args.join(' ').trim();
  if (!winningChoice) throw new Error('Usage: npm run production -- "Winning story choice"');
  const store = new ProductionStore(dbPath);
  try {
    const result = await produce(store, createOpenAIExecutor(process.env.OPENAI_API_KEY, process.env.OPENAI_MODEL), { roomId: 'barangay-2099', winningChoice }, process.env.OPENAI_MODEL, id => console.log(`Production run: ${id}`));
    console.log(JSON.stringify(result, null, 2));
    if (result.status !== 'complete') process.exitCode = 2;
  } finally { store.close(); }
}
main().catch(error => { console.error(error instanceof Error ? error.message : 'Production failed'); process.exitCode = 1; });
