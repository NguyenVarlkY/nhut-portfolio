/* One small file store for everything the admin keeps: content, history, inbox, blog posts, media, visit stats.
 *  - production: the project's private Vercel Blob store (BLOB_READ_WRITE_TOKEN, or BLOB_STORE_ID + the deployment's OIDC identity)
 *  - local development without a store: the git-ignored .data/ folder
 * Paths are always built by our own code from fixed prefixes plus checked names, never taken raw from a request. */
import { promises as fs } from "node:fs";
import path from "node:path";

export type StorageKind = "blob" | "local" | "none";
export function storageKind(): StorageKind {
  if (process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID) return "blob";
  return process.env.NODE_ENV === "production" ? "none" : "local";
}

const LOCAL_ROOT = path.join(process.cwd(), ".data");
const SAFE = /^[a-z0-9][a-z0-9/_.-]{0,200}$/i;
function localPath(p: string) {
  if (!SAFE.test(p) || p.includes("..")) throw new Error("bad path");
  return path.join(LOCAL_ROOT, ...p.split("/"));
}
export class NoStorage extends Error { constructor() { super("Chưa có kho lưu: tạo Vercel Blob cho dự án rồi deploy lại.") } }

export interface StoredFile { path: string; size: number; uploadedAt: number }

export async function readBytes(p: string): Promise<{ body: Buffer; contentType: string; uploadedAt: number } | null> {
  const kind = storageKind();
  try {
    if (kind === "blob") {
      const { get } = await import("@vercel/blob");
      const res = await get(p, { access: "private", useCache: false });
      if (!res || res.statusCode !== 200) return null;
      return { body: Buffer.from(await new Response(res.stream).arrayBuffer()), contentType: res.blob.contentType, uploadedAt: +new Date(res.blob.uploadedAt) };
    }
    if (kind === "local") {
      const file = localPath(p);
      const [body, st] = await Promise.all([fs.readFile(file), fs.stat(file)]);
      return { body, contentType: typeFromName(p), uploadedAt: st.mtimeMs };
    }
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code !== "ENOENT" && !/not.?found/i.test(String((err as Error)?.message))) console.error("storage read", p, err);
  }
  return null;
}

export async function readJson<T>(p: string): Promise<T | null> {
  const r = await readBytes(p);
  if (!r) return null;
  try { return JSON.parse(r.body.toString("utf8")) as T } catch { return null }
}

export async function writeBytes(p: string, body: Buffer | string, contentType: string, cacheSeconds = 60) {
  const kind = storageKind();
  if (kind === "blob") {
    const { put } = await import("@vercel/blob");
    await put(p, body, { access: "private", contentType, addRandomSuffix: false, allowOverwrite: true, cacheControlMaxAge: cacheSeconds });
  } else if (kind === "local") {
    const file = localPath(p);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, body);
  } else throw new NoStorage();
}
export const writeJson = (p: string, v: unknown) => writeBytes(p, JSON.stringify(v), "application/json");

export async function remove(paths: string[]) {
  if (!paths.length) return;
  const kind = storageKind();
  if (kind === "blob") {
    const { del } = await import("@vercel/blob");
    for (let i = 0; i < paths.length; i += 100) await del(paths.slice(i, i + 100));
  } else if (kind === "local") {
    await Promise.all(paths.map((p) => fs.rm(localPath(p), { force: true })));
  } else throw new NoStorage();
}

/** Every file under a prefix (e.g. "inbox/"), newest first. */
export async function listFiles(prefix: string, max = 2000): Promise<StoredFile[]> {
  const kind = storageKind();
  const out: StoredFile[] = [];
  if (kind === "blob") {
    const { list } = await import("@vercel/blob");
    let cursor: string | undefined;
    do {
      const r = await list({ prefix, cursor, limit: 1000 });
      r.blobs.forEach((b) => out.push({ path: b.pathname, size: b.size, uploadedAt: +new Date(b.uploadedAt) }));
      cursor = r.hasMore ? r.cursor : undefined;
    } while (cursor && out.length < max);
  } else if (kind === "local") {
    const walk = async (dir: string, rel: string) => {
      let entries: import("node:fs").Dirent[] = [];
      try { entries = await fs.readdir(dir, { withFileTypes: true }) } catch { return }
      for (const e of entries) {
        const r = rel ? `${rel}/${e.name}` : e.name;
        if (e.isDirectory()) await walk(path.join(dir, e.name), r);
        else if (r.startsWith(prefix)) { const st = await fs.stat(path.join(dir, e.name)); out.push({ path: r, size: st.size, uploadedAt: st.mtimeMs }) }
      }
    };
    const top = prefix.split("/")[0];
    await walk(path.join(LOCAL_ROOT, top), top);
  }
  return out.sort((a, b) => b.uploadedAt - a.uploadedAt).slice(0, max);
}

export function typeFromName(p: string) {
  const ext = p.split(".").pop()?.toLowerCase();
  return ({ json: "application/json", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", gif: "image/gif", avif: "image/avif", pdf: "application/pdf" } as Record<string, string>)[ext ?? ""] ?? "application/octet-stream";
}

/** Run jobs a few at a time (keeps the store and the function within limits). */
export async function pool<T, R>(items: T[], n: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => { while (i < items.length) { const k = i++; out[k] = await fn(items[k]) } }));
  return out;
}
