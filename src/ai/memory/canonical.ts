import { DatabaseSync } from 'node:sqlite';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { characters } from '@/features/persona/characters';
import { CharacterSchema } from '@/lib/domain';
// All providers and character pages read approved canon through this boundary.
// It never initializes databases or imports draft artifacts.
export function canonicalCharacters(path = resolve(process.env.AIRL_LIVE_DB_PATH || '.data/airl-live.sqlite')) {
  if (!existsSync(path)) return characters;
  const db = new DatabaseSync(path,{readOnly:true,timeout:5000});
  try {
    if (!db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='characters'").get()) return characters;
    return characters.map(seed => {
      const row = db.prepare('SELECT profile FROM characters WHERE id=?').get(seed.id);
      return row ? CharacterSchema.parse({...seed,...JSON.parse(String(row.profile))}) : seed;
    });
  } finally { db.close(); }
}
