import { DatabaseSync } from "node:sqlite";
import { characters } from "@/features/persona/characters";
export const OFFICIAL = "barangay-2099";
export function migratePlatform(db: DatabaseSync) {
  if (
    db
      .prepare(
        "SELECT name FROM sqlite_master WHERE name='platform_migrations'",
      )
      .get() &&
    db.prepare("SELECT version FROM platform_migrations WHERE version=3").get()
  )
    return;
  db.exec("BEGIN IMMEDIATE");
  try {
    db.exec(`
      CREATE TABLE IF NOT EXISTS platform_migrations(version INTEGER PRIMARY KEY);
      CREATE TABLE IF NOT EXISTS accounts(id TEXT PRIMARY KEY,email TEXT NOT NULL UNIQUE,name TEXT NOT NULL,password_hash TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN ('viewer','creator','admin')),interests TEXT NOT NULL DEFAULT '{}',onboarded INTEGER NOT NULL DEFAULT 0,created INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS room_operator_codes(code_hash TEXT PRIMARY KEY,room_id TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS account_sessions(token_hash TEXT PRIMARY KEY,account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE);
      CREATE TABLE IF NOT EXISTS universes(id TEXT PRIMARY KEY,title TEXT NOT NULL,owner_id TEXT REFERENCES accounts(id),official INTEGER NOT NULL DEFAULT 0,visibility TEXT NOT NULL DEFAULT 'private',archived INTEGER NOT NULL DEFAULT 0,settings TEXT NOT NULL,next_order INTEGER NOT NULL DEFAULT 1);
      CREATE TABLE IF NOT EXISTS universe_rooms(room_id TEXT PRIMARY KEY,universe_id TEXT NOT NULL UNIQUE REFERENCES universes(id));
      CREATE TABLE IF NOT EXISTS universe_characters(universe_id TEXT NOT NULL REFERENCES universes(id),slug TEXT NOT NULL,profile TEXT NOT NULL,PRIMARY KEY(universe_id,slug));
      CREATE TABLE IF NOT EXISTS universe_relationships(universe_id TEXT NOT NULL,from_slug TEXT NOT NULL,to_slug TEXT NOT NULL,description TEXT NOT NULL,PRIMARY KEY(universe_id,from_slug,to_slug),FOREIGN KEY(universe_id,from_slug) REFERENCES universe_characters(universe_id,slug),FOREIGN KEY(universe_id,to_slug) REFERENCES universe_characters(universe_id,slug));
      CREATE TABLE IF NOT EXISTS universe_episodes(episode_id TEXT PRIMARY KEY,universe_id TEXT NOT NULL REFERENCES universes(id),story_order INTEGER NOT NULL,round_id TEXT,published_at TEXT NOT NULL,UNIQUE(universe_id,story_order));
      CREATE TABLE IF NOT EXISTS canon_events(id TEXT PRIMARY KEY,universe_id TEXT NOT NULL,character_id TEXT NOT NULL,episode_id TEXT,scene_id TEXT,story_order INTEGER NOT NULL,content TEXT NOT NULL,kind TEXT NOT NULL,FOREIGN KEY(universe_id,character_id) REFERENCES universe_characters(universe_id,slug));
      CREATE TABLE IF NOT EXISTS production_outlines(run_id TEXT PRIMARY KEY,script TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS production_previews(run_id TEXT NOT NULL,version INTEGER NOT NULL,script TEXT NOT NULL,manifest TEXT NOT NULL,PRIMARY KEY(run_id,version));
      CREATE TABLE IF NOT EXISTS job_failures(job_id TEXT PRIMARY KEY,code TEXT NOT NULL,created TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS job_runs(job_id TEXT NOT NULL,run_id TEXT NOT NULL UNIQUE,created INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS universe_assets(id TEXT PRIMARY KEY,universe_id TEXT NOT NULL REFERENCES universes(id),name TEXT NOT NULL,mime TEXT NOT NULL,content BLOB NOT NULL);
    `);
    if (
      !db
        .prepare("SELECT version FROM platform_migrations WHERE version=1")
        .get()
    ) {
      const settings = {
        setting: "A futuristic Filipino barangay",
        era: "2099",
        genre: "Community science-fiction comedy",
        tone: "Warm, funny Taglish",
        premise:
          "A robot captain optimizes barangay life while the community challenges his logic.",
        storyline: "The audience shapes the next barangay decision.",
        rules: ["Preserve established character voices and approved canon."],
      };
      db.prepare(
        "INSERT OR IGNORE INTO universes(id,title,official,visibility,settings) VALUES(?,?,1,?,?)",
      ).run(OFFICIAL, "Barangay 2099", "public", JSON.stringify(settings));
      db.prepare("INSERT OR IGNORE INTO universe_rooms VALUES(?,?)").run(
        OFFICIAL,
        OFFICIAL,
      );
      const legacy = !!db
        .prepare("SELECT name FROM sqlite_master WHERE name='characters'")
        .get();
      for (const seed of characters) {
        const stored = legacy
          ? db.prepare("SELECT profile FROM characters WHERE id=?").get(seed.id)
          : undefined;
        const profile = stored ? JSON.parse(String(stored.profile)) : seed;
        const normalized = {
          ...profile,
          color: /^#[0-9a-fA-F]{6}$/.test(profile.color)
            ? profile.color
            : (
                {
                  violet: "#c7aafa",
                  pink: "#f3b3de",
                  mint: "#8be2d2",
                } as Record<string, string>
              )[profile.color] || "#a78bfa",
          appearance: profile.avatar || "",
          motivations: [profile.motivation],
          speakingStyle: profile.voice,
          rules: profile.dialogueConstraints || [],
          assets: [],
          symbol:
            seed.id === "captain-bot"
              ? "bot"
              : seed.id === "tita-nena"
                ? "glasses"
                : "coffee",
        };
        db.prepare(
          "INSERT OR IGNORE INTO universe_characters VALUES(?,?,?)",
        ).run(OFFICIAL, seed.id, JSON.stringify(normalized));
      }
      for (const seed of characters) {
        const row = db
          .prepare(
            "SELECT profile FROM universe_characters WHERE universe_id=? AND slug=?",
          )
          .get(OFFICIAL, seed.id)!;
        for (const description of JSON.parse(String(row.profile))
          .relationships || []) {
          const target = characters.find((item) =>
            description.startsWith(item.name + ":"),
          );
          if (target)
            db.prepare(
              "INSERT OR IGNORE INTO universe_relationships VALUES(?,?,?,?)",
            ).run(OFFICIAL, seed.id, target.id, description);
        }
      }
      db.prepare("INSERT INTO platform_migrations VALUES(1)").run();
    }
    for (const [table, column, definition] of [
      ["productions", "universe_id", "TEXT NOT NULL DEFAULT 'barangay-2099'"],
      ["room_jobs", "snapshot", "TEXT"],
      ["room_jobs", "story_order", "INTEGER"],
    ]) {
      if (
        db
          .prepare(
            "SELECT name FROM sqlite_master WHERE type='table' AND name=?",
          )
          .get(table) &&
        !db
          .prepare(`PRAGMA table_info(${table})`)
          .all()
          .some((row) => row.name === column)
      )
        db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    }
    if (
      db.prepare("SELECT name FROM sqlite_master WHERE name='episodes'").get()
    ) {
      const rows = db
        .prepare(
          "SELECT run_id,artifact,created_at FROM episodes ORDER BY created_at,rowid",
        )
        .all();
      let order = Number(
        db
          .prepare(
            "SELECT COALESCE(MAX(story_order),0) n FROM universe_episodes WHERE universe_id=?",
          )
          .get(OFFICIAL)!.n,
      );
      for (const row of rows) {
        if (
          db
            .prepare(
              "SELECT episode_id FROM universe_episodes WHERE episode_id=?",
            )
            .get(String(row.run_id))
        )
          continue;
        const universe = db
          .prepare("SELECT universe_id FROM productions WHERE id=?")
          .get(String(row.run_id));
        if (universe && universe.universe_id !== OFFICIAL) continue;
        db.prepare("INSERT INTO universe_episodes VALUES(?,?,?,?,?)").run(
          String(row.run_id),
          OFFICIAL,
          ++order,
          null,
          String(row.created_at),
        );
        const artifact = JSON.parse(String(row.artifact));
        for (const [index, update] of (
          artifact.script?.memoryUpdates || []
        ).entries()) {
          if (
            !db
              .prepare(
                "SELECT slug FROM universe_characters WHERE universe_id=? AND slug=?",
              )
              .get(OFFICIAL, update.characterId)
          )
            continue;
          db.prepare(
            "INSERT OR IGNORE INTO canon_events VALUES(?,?,?,?,?,?,?,?)",
          ).run(
            `${row.run_id}:${index}`,
            OFFICIAL,
            update.characterId,
            String(row.run_id),
            artifact.manifest?.scenes?.find(
              (scene: { id: string; dialogue: { characterId: string }[] }) =>
                scene.dialogue.some(
                  (line) => line.characterId === update.characterId,
                ),
            )?.id || null,
            order,
            update.memory,
            "memory",
          );
        }
      }
      db.prepare(
        "UPDATE universes SET next_order=MAX(next_order,?) WHERE id=?",
      ).run(order + 1, OFFICIAL);
    }
    for (const row of db
      .prepare(
        "SELECT slug,profile FROM universe_characters WHERE universe_id=?",
      )
      .all(OFFICIAL)) {
      for (const [index, memory] of (
        JSON.parse(String(row.profile)).memories || []
      ).entries()) {
        if (
          !db
            .prepare(
              "SELECT id FROM canon_events WHERE universe_id=? AND character_id=? AND content=?",
            )
            .get(OFFICIAL, String(row.slug), memory)
        )
          db.prepare(
            "INSERT OR IGNORE INTO canon_events VALUES(?,?,?,?,?,?,?,?)",
          ).run(
            `seed:${row.slug}:${index}`,
            OFFICIAL,
            String(row.slug),
            null,
            null,
            0,
            memory,
            "memory",
          );
      }
    }
    if (
      db
        .prepare("SELECT name FROM sqlite_master WHERE name='productions'")
        .get() &&
      db.prepare("SELECT name FROM sqlite_master WHERE name='room_jobs'").get()
    ) {
      db.prepare("INSERT OR IGNORE INTO platform_migrations VALUES(2)").run();
      db.prepare("INSERT OR IGNORE INTO platform_migrations VALUES(3)").run();
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
export function worldSnapshot(db: DatabaseSync, roomId: string) {
  const row = db
    .prepare(
      "SELECT u.* FROM universes u JOIN universe_rooms r ON r.universe_id=u.id WHERE r.room_id=?",
    )
    .get(roomId);
  if (!row) throw new Error("Universe room not found");
  const cast = db
    .prepare(
      "SELECT profile FROM universe_characters WHERE universe_id=? ORDER BY slug",
    )
    .all(String(row.id))
    .map((item) => JSON.parse(String(item.profile)));
  const history = !db
    .prepare("SELECT name FROM sqlite_master WHERE name='episodes'")
    .get()
    ? []
    : db
        .prepare(
          "SELECT e.artifact FROM universe_episodes u JOIN episodes e ON e.run_id=u.episode_id WHERE u.universe_id=? ORDER BY u.story_order DESC LIMIT 5",
        )
        .all(String(row.id))
        .reverse()
        .map((item) => JSON.parse(String(item.artifact)));
  return {
    universeId: String(row.id),
    world: {
      id: String(row.id),
      title: String(row.title),
      ...JSON.parse(String(row.settings)),
    },
    characters: cast,
    approvedHistory: history,
    storyOrder: Number(row.next_order),
    seededHistory: [],
  };
}
