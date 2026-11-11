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
      const scoped=!!db.prepare("SELECT name FROM sqlite_master WHERE name='universe_characters'").get();
      const row = scoped?db.prepare('SELECT profile FROM universe_characters WHERE universe_id=? AND slug=?').get('barangay-2099',seed.id):db.prepare('SELECT profile FROM characters WHERE id=?').get(seed.id);
      if(!row)return seed;const profile=JSON.parse(String(row.profile));return CharacterSchema.parse({...seed,...profile,motivation:profile.motivations?.join(' · ')||profile.motivation||seed.motivation,dialogueConstraints:profile.rules||profile.dialogueConstraints||seed.dialogueConstraints});
    });
  } finally { db.close(); }
}
