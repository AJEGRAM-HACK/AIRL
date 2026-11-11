import { loadEnvConfig } from '@next/env';
import { LiveStore } from '../src/server/live/store';
loadEnvConfig(process.cwd());
const store = new LiveStore();
try {
  console.log('Enter this one-time code in the room studio within ten minutes. Keep it private.');
  console.log(store.issueOperatorCode());
} finally { store.dispose(); }
