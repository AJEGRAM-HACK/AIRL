import { DatabaseSync } from "node:sqlite";
import {
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
  createHash,
} from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  Account,
  AccountRole,
  Interests,
  World,
  WorldCharacter,
  WorldDraft,
  WorldSettings,
  RelationshipChange,
} from "@/lib/domain";
import { LiveStore, LiveError } from "@/server/live/store";
import { ProductionStore } from "@/server/production/store";
import { migratePlatform, OFFICIAL } from "./migration";
export const databasePath = () =>
  resolve(process.env.AIRL_LIVE_DB_PATH || ".data/airl-live.sqlite");
const tokenHash = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const encodePassword = (
  password: string,
  salt = randomBytes(16).toString("hex"),
) =>
  `${salt}:${scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 }).toString("hex")}`;
export class PlatformStore {
  readonly db: DatabaseSync;
  constructor(readonly path = databasePath()) {
    mkdirSync(dirname(path), { recursive: true });
    const live = new LiveStore(path);
    live.dispose();
    const production = new ProductionStore(path);
    production.close();
    this.db = new DatabaseSync(path, { timeout: 5000 });
    migratePlatform(this.db);
  }
  transaction<T>(action: () => T): T {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const result = action();
      this.db.exec("COMMIT");
      return result;
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }
  account(token?: string): Account | null {
    if (!token) return null;
    const row = this.db
      .prepare(
        "SELECT a.* FROM accounts a JOIN account_sessions s ON s.account_id=a.id JOIN live_sessions l ON l.token_hash=s.token_hash WHERE s.token_hash=? AND l.expires>?",
      )
      .get(tokenHash(token), Date.now());
    return row
      ? {
          id: String(row.id),
          email: String(row.email),
          name: String(row.name),
          role: row.role as AccountRole,
          interests: Interests.parse(JSON.parse(String(row.interests))),
          onboarded: !!row.onboarded,
        }
      : null;
  }
  requireAccount(token?: string, creator = false) {
    const account = this.account(token);
    if (!account) throw new LiveError(401, "Sign in to continue.");
    if (creator && account.role === "viewer")
      throw new LiveError(403, "Creator access must be granted by an admin.");
    return account;
  }
  private issueSession(accountId: string) {
    const token = randomBytes(32).toString("base64url");
    this.db
      .prepare(
        "INSERT INTO live_sessions(token_hash,role,expires) VALUES(?,?,?)",
      )
      .run(tokenHash(token), "participant", Date.now() + 7 * 86400_000);
    this.db
      .prepare("INSERT INTO account_sessions VALUES(?,?)")
      .run(tokenHash(token), accountId);
    return token;
  }
  signup(email: string, name: string, password: string) {
    const id = randomUUID();
    const hash = encodePassword(password);
    return this.transaction(() => {
      if (
        this.db
          .prepare("SELECT id FROM accounts WHERE email=?")
          .get(email.toLowerCase())
      )
        throw new LiveError(409, "This email is already registered.");
      this.db
        .prepare(
          "INSERT INTO accounts(id,email,name,password_hash,role,created) VALUES(?,?,?,?,?,?)",
        )
        .run(id, email.toLowerCase(), name, hash, "viewer", Date.now());
      return this.issueSession(id);
    });
  }
  signin(email: string, password: string) {
    const row = this.db
      .prepare("SELECT id,password_hash FROM accounts WHERE email=?")
      .get(email.toLowerCase());
    const stored = String(
      row?.password_hash || `${"0".repeat(32)}:${"0".repeat(128)}`,
    );
    const [salt, expected] = stored.split(":");
    const actual = Buffer.from(
      encodePassword(password, salt).split(":")[1],
      "hex",
    );
    if (!timingSafeEqual(actual, Buffer.from(expected, "hex")) || !row)
      throw new LiveError(401, "Email or password is incorrect.");
    return this.transaction(() => this.issueSession(String(row.id)));
  }
  signout(token?: string) {
    if (token)
      this.transaction(() => {
        this.db
          .prepare("DELETE FROM account_sessions WHERE token_hash=?")
          .run(tokenHash(token));
        this.db
          .prepare("DELETE FROM live_sessions WHERE token_hash=?")
          .run(tokenHash(token));
      });
  }
  interests(actor: Account, value: unknown) {
    const data = Interests.parse(value);
    this.db
      .prepare("UPDATE accounts SET interests=?,onboarded=1 WHERE id=?")
      .run(JSON.stringify(data), actor.id);
    return data;
  }
  grant(actor: Account, id: string, role: "viewer" | "creator") {
    if (actor.role !== "admin")
      throw new LiveError(403, "Admin access is required.");
    if (
      !this.db
        .prepare("UPDATE accounts SET role=? WHERE id=? AND role!='admin'")
        .run(role, id).changes
    )
      throw new LiveError(404, "Account not found or protected.");
  }
  bootstrapAdmin(email: string) {
    if (
      !this.db
        .prepare("UPDATE accounts SET role='admin' WHERE email=?")
        .run(email.toLowerCase()).changes
    )
      throw new Error("Sign up with this email first.");
  }
  accounts(actor: Account) {
    if (actor.role !== "admin")
      throw new LiveError(403, "Admin access is required.");
    return this.db
      .prepare("SELECT id,email,name,role FROM accounts ORDER BY created")
      .all();
  }
  private world(row: Record<string, unknown>): World {
    return {
      id: String(row.id),
      title: String(row.title),
      ownerId: row.owner_id ? String(row.owner_id) : null,
      official: !!row.official,
      visibility: row.visibility as World["visibility"],
      archived: !!row.archived,
      settings: WorldSettings.parse(JSON.parse(String(row.settings))),
      nextOrder: Number(row.next_order),
    };
  }
  getWorld(id: string, actor: Account | null = null, write = false): World {
    const row = this.db.prepare("SELECT * FROM universes WHERE id=?").get(id);
    if (!row) throw new LiveError(404, "Universe not found.");
    const world = this.world(row);
    const manages =
      !!actor &&
      (actor.role === "admin" ||
        (!world.official &&
          actor.role === "creator" &&
          world.ownerId === actor.id));
    if (write && !manages)
      throw new LiveError(403, "You cannot manage this universe.");
    if (!write && !manages && (world.visibility !== "public" || world.archived))
      throw new LiveError(404, "Universe not found.");
    if (write && world.archived)
      throw new LiveError(409, "Restore this universe before editing.");
    return world;
  }
  canManage(world: World, actor: Account | null) {
    return (
      !!actor &&
      (actor.role === "admin" ||
        (!world.official &&
          actor.role === "creator" &&
          world.ownerId === actor.id))
    );
  }
  list(actor: Account | null, owned = false) {
    const rows = this.db
      .prepare("SELECT * FROM universes ORDER BY official DESC,title")
      .all();
    const interests = (actor?.interests.genres || []).map((value) =>
      value.toLowerCase(),
    );
    return rows
      .map((row) => this.world(row))
      .filter((world) =>
        owned
          ? this.canManage(world, actor)
          : world.visibility === "public" && !world.archived,
      )
      .sort(
        (a, b) =>
          Number(interests.includes(b.settings.genre.toLowerCase())) -
            Number(interests.includes(a.settings.genre.toLowerCase())) ||
          Number(b.official) - Number(a.official),
      );
  }
  create(actor: Account, value: unknown) {
    if (actor.role === "viewer")
      throw new LiveError(403, "Creator access must be granted by an admin.");
    const draft = WorldDraft.parse(value),
      id = randomUUID();
    if (draft.characters.some((character) => character.assets.length))
      throw new LiveError(
        400,
        "Add appearance assets after creating their universe.",
      );
    if (
      new Set(draft.characters.map((c) => c.id)).size !==
      draft.characters.length
    )
      throw new LiveError(
        400,
        "Character slugs must be unique within the universe.",
      );
    return this.transaction(() => {
      this.db
        .prepare(
          "INSERT INTO universes(id,title,owner_id,settings) VALUES(?,?,?,?)",
        )
        .run(id, draft.title, actor.id, JSON.stringify(draft.settings));
      this.db.prepare("INSERT INTO universe_rooms VALUES(?,?)").run(id, id);
      for (const character of draft.characters)
        this.saveCharacterRow(id, character);
      if (draft.firstVote) {
        const round = randomUUID();
        this.db
          .prepare("INSERT INTO live_rounds VALUES(?,?,?,NULL,?)")
          .run(round, id, "open", Date.now());
        draft.firstVote.forEach((title, index) =>
          this.db
            .prepare("INSERT INTO live_options VALUES(?,?,?,?,?)")
            .run(round, `option-${index + 1}`, title, "", index),
        );
      }
      return this.getWorld(id, actor);
    });
  }
  update(
    actor: Account,
    id: string,
    value: {
      title?: string;
      settings?: unknown;
      visibility?: "private" | "public";
      restore?: boolean;
    },
  ) {
    if (value.restore) {
      const row = this.db.prepare("SELECT * FROM universes WHERE id=?").get(id);
      if (!row || !this.canManage(this.world(row), actor))
        throw new LiveError(403, "Universe access denied.");
      this.db.prepare("UPDATE universes SET archived=0 WHERE id=?").run(id);
    }
    const world = this.getWorld(id, actor, true);
    const settings =
      value.settings === undefined
        ? world.settings
        : WorldSettings.parse(value.settings);
    this.db
      .prepare(
        "UPDATE universes SET title=?,settings=?,visibility=? WHERE id=?",
      )
      .run(
        value.title || world.title,
        JSON.stringify(settings),
        value.visibility || world.visibility,
        id,
      );
    return this.getWorld(id, actor);
  }
  remove(actor: Account, id: string) {
    const world = this.getWorld(id, actor, true);
    if (world.official)
      throw new LiveError(409, "The official universe cannot be removed.");
    // Archival is recoverable and preserves every historical reference.
    this.db
      .prepare("UPDATE universes SET archived=1,visibility=? WHERE id=?")
      .run("private", id);
  }
  characters(id: string, actor: Account | null) {
    this.getWorld(id, actor);
    return this.db
      .prepare(
        "SELECT profile FROM universe_characters WHERE universe_id=? ORDER BY slug",
      )
      .all(id)
      .map((row) => WorldCharacter.parse(JSON.parse(String(row.profile))));
  }
  private saveCharacterRow(id: string, value: unknown) {
    const data = WorldCharacter.parse(value);
    this.db
      .prepare(
        "INSERT INTO universe_characters VALUES(?,?,?) ON CONFLICT(universe_id,slug) DO UPDATE SET profile=excluded.profile",
      )
      .run(id, data.id, JSON.stringify(data));
    return data;
  }
  saveCharacter(actor: Account, id: string, value: unknown) {
    this.getWorld(id, actor, true);
    const data = WorldCharacter.parse(value);
    for (const asset of data.assets)
      if (
        !this.db
          .prepare(
            "SELECT id FROM universe_assets WHERE id=? AND universe_id=?",
          )
          .get(asset, id)
      )
        throw new LiveError(
          400,
          "Asset belongs to another universe or is unavailable.",
        );
    return this.transaction(() => {
      const existing = this.db
        .prepare(
          "SELECT profile FROM universe_characters WHERE universe_id=? AND slug=?",
        )
        .get(id, data.id);
      if (existing)
        data.memories = JSON.parse(String(existing.profile)).memories || [];
      const saved = this.saveCharacterRow(id, data);
      if (!existing)
        for (const [index, memory] of data.memories.entries())
          this.db
            .prepare("INSERT INTO canon_events VALUES(?,?,?,?,?,?,?,?)")
            .run(
              `seed:${id}:${data.id}:${index}`,
              id,
              data.id,
              null,
              null,
              0,
              memory,
              "memory",
            );
      return saved;
    });
  }
  deleteCharacter(actor: Account, id: string, slug: string) {
    this.getWorld(id, actor, true);
    const snapshots = this.db
      .prepare(
        "SELECT snapshot FROM room_jobs WHERE room_id=? AND snapshot IS NOT NULL",
      )
      .all(id);
    if (
      snapshots.some((row) =>
        JSON.parse(String(row.snapshot)).characters?.some(
          (character: { id: string }) => character.id === slug,
        ),
      )
    )
      throw new LiveError(
        409,
        "Characters referenced by production snapshots must be retained.",
      );
    if (
      this.db
        .prepare(
          "SELECT id FROM canon_events WHERE universe_id=? AND character_id=? AND episode_id IS NOT NULL",
        )
        .get(id, slug)
    )
      throw new LiveError(
        409,
        "Characters with story history must be retained.",
      );
    this.transaction(() => {
      this.db
        .prepare(
          "DELETE FROM universe_relationships WHERE universe_id=? AND (from_slug=? OR to_slug=?)",
        )
        .run(id, slug, slug);
      this.db
        .prepare(
          "DELETE FROM canon_events WHERE universe_id=? AND character_id=?",
        )
        .run(id, slug);
      this.db
        .prepare(
          "DELETE FROM universe_characters WHERE universe_id=? AND slug=?",
        )
        .run(id, slug);
    });
  }
  relationships(id: string, actor: Account | null) {
    this.getWorld(id, actor);
    return this.db
      .prepare(
        'SELECT from_slug AS "from",to_slug AS "to",description FROM universe_relationships WHERE universe_id=?',
      )
      .all(id);
  }
  relationship(actor: Account, id: string, value: unknown) {
    this.getWorld(id, actor, true);
    const data = RelationshipChange.parse(value);
    for (const slug of [data.from, data.to])
      if (
        !this.db
          .prepare(
            "SELECT slug FROM universe_characters WHERE universe_id=? AND slug=?",
          )
          .get(id, slug)
      )
        throw new LiveError(
          400,
          "Both characters must belong to this universe.",
        );
    this.db
      .prepare(
        "INSERT INTO universe_relationships VALUES(?,?,?,?) ON CONFLICT(universe_id,from_slug,to_slug) DO UPDATE SET description=excluded.description",
      )
      .run(id, data.from, data.to, data.description);
  }
  episodes(id: string, actor: Account | null) {
    this.getWorld(id, actor);
    return this.db
      .prepare(
        "SELECT u.episode_id,u.universe_id,u.story_order,COALESCE(u.round_id,j.round_id) AS round_id,u.published_at,e.artifact,j.choice,j.id AS job_id FROM universe_episodes u JOIN episodes e ON e.run_id=u.episode_id LEFT JOIN room_jobs j ON j.run_id=e.run_id AND j.room_id=u.universe_id WHERE u.universe_id=? ORDER BY u.story_order",
      )
      .all(id)
      .map((row) => ({
        episode_id: String(row.episode_id),
        universe_id: id,
        story_order: Number(row.story_order),
        round_id: row.round_id ? String(row.round_id) : null,
        published_at: String(row.published_at),
        choice: row.choice ? String(row.choice) : null,
        job_id: row.job_id ? String(row.job_id) : null,
        artifact: JSON.parse(String(row.artifact)),
      }));
  }
  timeline(id: string, actor: Account | null) {
    this.getWorld(id, actor);
    return this.db
      .prepare(
        "SELECT * FROM canon_events WHERE universe_id=? ORDER BY story_order,rowid",
      )
      .all(id);
  }
  addAsset(
    actor: Account,
    id: string,
    name: string,
    mime: string,
    content: Buffer,
  ) {
    this.getWorld(id, actor, true);
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(mime) ||
      content.length > 2_000_000
    )
      throw new LiveError(400, "Use a PNG, JPEG or WebP image under 2 MB.");
    const valid =
      mime === "image/png"
        ? content
            .subarray(0, 8)
            .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
        : mime === "image/jpeg"
          ? content[0] === 255 && content[1] === 216
          : content.toString("ascii", 0, 4) === "RIFF" &&
            content.toString("ascii", 8, 12) === "WEBP";
    if (!valid)
      throw new LiveError(400, "Image content does not match its format.");
    const asset = randomUUID();
    this.db
      .prepare("INSERT INTO universe_assets VALUES(?,?,?,?,?)")
      .run(asset, id, name.slice(0, 100), mime, content);
    return asset;
  }
  asset(assetId: string, actor: Account | null) {
    const row = this.db
      .prepare("SELECT * FROM universe_assets WHERE id=?")
      .get(assetId);
    if (!row) throw new LiveError(404, "Asset not found.");
    this.getWorld(String(row.universe_id), actor);
    return row;
  }
  close() {
    this.db.close();
  }
}
