import { backup, DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import assert from "node:assert/strict";
import { PlatformStore, databasePath } from "../src/server/platform/store";
async function main() {
  const source = databasePath();
  mkdirSync(".data", { recursive: true });
  const copy = resolve(`.data/universe-migration-${Date.now()}.sqlite`);
  const original = new DatabaseSync(source, { readOnly: true, timeout: 5000 });
  const tables = [
    "characters",
    "episodes",
    "productions",
    "room_jobs",
    "live_rounds",
    "live_votes",
  ];
  const baseline = tables.map((table) => {
    const columns = original
      .prepare(`PRAGMA table_info(${table})`)
      .all()
      .map((row) => String(row.name));
    return {
      table,
      columns,
      rows: original
        .prepare(`SELECT ${columns.join(",")} FROM ${table} ORDER BY rowid`)
        .all(),
    };
  });
  await backup(original, copy);
  original.close();
  function verify(path: string) {
    const platform = new PlatformStore(path);
    try {
      for (const item of baseline)
        assert.deepEqual(
          platform.db
            .prepare(
              `SELECT ${item.columns.join(",")} FROM ${item.table} ORDER BY rowid`,
            )
            .all(),
          item.rows,
          `${item.table} continuity`,
        );
      assert.equal(
        platform.episodes("barangay-2099", null).length,
        baseline.find((item) => item.table === "episodes")!.rows.length,
      );
      for (const job of baseline.find((item) => item.table === "room_jobs")!.rows) {
        if (job.status !== "published" || !job.run_id) continue;
        const episode = platform.episodes("barangay-2099", null).find(item => item.episode_id === job.run_id);
        assert.equal(episode?.round_id, job.round_id, "Original source-round link");
      }
      for (const old of baseline.find((item) => item.table === "characters")!
        .rows) {
        const profile = JSON.parse(String(old.profile));
        const current = platform
          .characters("barangay-2099", null)
          .find((character) => character.id === profile.id)!;
        assert.ok(current);
        for (const memory of profile.memories)
          assert.ok(current.memories.includes(memory));
      }
      assert.deepEqual(
        platform.db.prepare("PRAGMA foreign_key_check").all(),
        [],
      );
      assert.equal(
        platform.db.prepare("PRAGMA integrity_check").get()!.integrity_check,
        "ok",
      );
    } finally {
      platform.close();
    }
  }
  verify(copy);
  console.log(
    JSON.stringify(
      {
        migration: "copy verified",
        backup: copy,
        preservedTables: baseline.map((item) => ({
          table: item.table,
          rows: item.rows.length,
        })),
      },
      null,
      2,
    ),
  );
  if (process.argv.includes("--apply")) {
    verify(source);
    console.log(
      "Live additive migration verified. Existing IDs, artifacts, votes and canon preserved.",
    );
  }
}
main().catch(() => {
  console.error(
    "Migration verification failed. The live database was not intentionally migrated unless --apply had already begun. Inspect the preserved copy.",
  );
  process.exitCode = 1;
});
