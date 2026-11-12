import { cache } from 'react';
import type { PageAccess } from '@/lib/access';
import { LiveStore, LiveError } from '@/server/live/store';
import { notFound } from "next/navigation";
import { sessionToken } from "@/server/live/http";
import { PlatformStore } from "./store";
export async function readableUniverse(id: string) {
  const store = new PlatformStore();
  try {
    return store.getWorld(id, store.account(await sessionToken()));
  } catch {
    notFound();
  } finally {
    store.close();
  }
}
export async function readableStoryItem(
  id: string,
  item: string,
  kind: "character" | "episode",
) {
  const store = new PlatformStore();
  try {
    const actor = store.account(await sessionToken());
    store.getWorld(id, actor);
    const found =
      kind === "character"
        ? store.characters(id, actor).find((character) => character.id === item)
        : store
            .episodes(id, actor)
            .find((episode) => episode.episode_id === item);
    if (!found) notFound();
    return found;
  } finally {
    store.close();
  }
}

// React cache shares this request's server-validated permissions with layout/page guards.
export const pageAccess = cache(async (): Promise<PageAccess> => {
  const store = new PlatformStore();
  let live: LiveStore | undefined;
  try {
    const token = await sessionToken();
    const account = store.account(token);
    const canCreate = !!account && account.role !== 'viewer';
    const managedWorldIds = canCreate ? store.list(account, true).map(world => world.id) : [];
    let legacyOperator = false;
    if (token && !managedWorldIds.includes('barangay-2099')) {
      live = new LiveStore(store.path);
      try { live.creator(token); legacyOperator = true; } catch (error) {
        if (!(error instanceof LiveError)) throw error;
      }
    }
    return { account: account ? { id: account.id, role: account.role } : null, canCreate, managedWorldIds, legacyOperator };
  } finally { live?.dispose(); store.close(); }
});
export async function requireStudioPage(universeId?: string, allowOperator = false) {
  const access = await pageAccess();
  const allowed = universeId
    ? access.managedWorldIds.includes(universeId) || (allowOperator && universeId === 'barangay-2099' && access.legacyOperator)
    : access.canCreate;
  if (!allowed) notFound();
  return access;
}
