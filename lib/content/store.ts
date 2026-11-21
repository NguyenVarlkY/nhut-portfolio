/* Where the owner's edits live.
 *  - production: one private file in Vercel Blob (portfolio/content.json), needs BLOB_READ_WRITE_TOKEN
 *  - local development without a token: .data/content.json in the project folder (git-ignored)
 * Pages read it through Next's data cache (tag "portfolio-content"); saving clears that tag so the site updates in seconds. */
import { unstable_cache, revalidateTag } from "next/cache";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Overrides } from "./types";

export const CONTENT_TAG = "portfolio-content";
const BLOB_PATH = "portfolio/content.json";
const LOCAL_FILE = path.join(process.cwd(), ".data", "content.json");

export type StorageKind = "blob" | "local" | "none";
export function storageKind(): StorageKind {
  if (process.env.BLOB_READ_WRITE_TOKEN) return "blob";
  return process.env.NODE_ENV === "production" ? "none" : "local";
}

export async function readOverrides(): Promise<Overrides> {
  const kind = storageKind();
  try {
    if (kind === "blob") {
      const { get } = await import("@vercel/blob");
      const res = await get(BLOB_PATH, { access: "private", useCache: false });
      if (!res || res.statusCode !== 200) return {};
      return JSON.parse(await new Response(res.stream).text()) as Overrides;
    }
    if (kind === "local") return JSON.parse(await fs.readFile(LOCAL_FILE, "utf8")) as Overrides;
  } catch (err) {
    if ((err as NodeJS.ErrnoException)?.code !== "ENOENT") console.error("readOverrides", err);
  }
  return {};
}

export async function writeOverrides(o: Overrides) {
  const kind = storageKind();
  const body = JSON.stringify(o);
  if (kind === "blob") {
    const { put } = await import("@vercel/blob");
    await put(BLOB_PATH, body, { access: "private", contentType: "application/json", addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: 60 });
  } else if (kind === "local") {
    await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
    await fs.writeFile(LOCAL_FILE, body, "utf8");
  } else {
    throw new Error("Chưa có kho lưu: tạo Vercel Blob cho dự án rồi deploy lại.");
  }
  revalidateTag(CONTENT_TAG);
}

/** Cached read for pages (one storage read per change, not per visitor). Falls back to the code defaults on any error. */
export const getOverrides = unstable_cache(async () => readOverrides(), ["portfolio-content-v1"], { tags: [CONTENT_TAG], revalidate: 3600 });
