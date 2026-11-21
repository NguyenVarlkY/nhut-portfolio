/* The owner's edits: portfolio/content.json in the store (see storage.ts), plus a copy of every saved version
 * in portfolio/history/ so a bad save can be undone. Pages read it through Next's data cache (tag "portfolio-content");
 * saving clears that tag so the site updates in seconds. */
import { unstable_cache, revalidateTag } from "next/cache";
import type { Overrides } from "./types";
import { listFiles, readJson, remove, storageKind, writeJson } from "./storage";

export { storageKind } from "./storage";
export type { StorageKind } from "./storage";
export const CONTENT_TAG = "portfolio-content";
const CONTENT = "portfolio/content.json";
const HISTORY = "portfolio/history/";
const KEEP_VERSIONS = 60;

export async function readOverrides(): Promise<Overrides> {
  if (storageKind() === "none") return {};
  return (await readJson<Overrides>(CONTENT)) ?? {};
}

export interface VersionInfo { id: string; savedAt: number; size: number }

/** Save, keep a copy in the history, and drop the oldest copies past KEEP_VERSIONS. */
export async function writeOverrides(o: Overrides, note = "") {
  await writeJson(CONTENT, o);
  revalidateTag(CONTENT_TAG);
  try {
    const at = o.updatedAt ?? Date.now();
    await writeJson(`${HISTORY}${at}.json`, { ...o, note: note.slice(0, 120) });
    const all = await listVersions();
    if (all.length > KEEP_VERSIONS) await remove(all.slice(KEEP_VERSIONS).map((v) => `${HISTORY}${v.id}.json`));
  } catch (err) { console.error("history", err) } // history is a bonus; the save itself already succeeded
}

export async function listVersions(): Promise<VersionInfo[]> {
  const files = await listFiles(HISTORY, 500);
  return files
    .map((f) => ({ id: f.path.slice(HISTORY.length).replace(/\.json$/, ""), savedAt: 0, size: f.size }))
    .filter((v) => /^\d{10,14}$/.test(v.id))
    .map((v) => ({ ...v, savedAt: Number(v.id) }))
    .sort((a, b) => b.savedAt - a.savedAt);
}

export async function readVersion(id: string): Promise<(Overrides & { note?: string }) | null> {
  if (!/^\d{10,14}$/.test(id)) return null;
  return readJson(`${HISTORY}${id}.json`);
}

/** Cached read for pages (one storage read per change, not per visitor). Falls back to the code defaults on any error. */
export const getOverrides = unstable_cache(async () => readOverrides(), ["portfolio-content-v1"], { tags: [CONTENT_TAG], revalidate: 3600 });
