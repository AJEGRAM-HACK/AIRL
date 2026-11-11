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
        ? store.characters(id, actor).some((character) => character.id === item)
        : store
            .episodes(id, actor)
            .some((episode) => episode.episode_id === item);
    if (!found) notFound();
  } finally {
    store.close();
  }
}
