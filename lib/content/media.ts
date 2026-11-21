/* Uploaded pictures and files (avatar, project screenshots, CV, blog images, share image).
 * Stored privately under media/ and served by /api/media/<path> with a long cache (names are random, so they never change). */
import { randomBytes } from "node:crypto";

export const MEDIA_PREFIX = "media/";
export const MAX_UPLOAD = 4 * 1024 * 1024; // Vercel functions accept ~4.5 MB bodies

/** What the bytes really are (the browser's claim is not trusted). SVG is refused: it can carry scripts. */
export function sniff(b: Buffer): { ext: string; type: string } | null {
  if (b.length < 12) return null;
  if (b[0] === 0x89 && b.toString("ascii", 1, 4) === "PNG") return { ext: "png", type: "image/png" };
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return { ext: "jpg", type: "image/jpeg" };
  if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") return { ext: "webp", type: "image/webp" };
  if (b.toString("ascii", 0, 4) === "GIF8") return { ext: "gif", type: "image/gif" };
  if (b.toString("ascii", 4, 12) === "ftypavif") return { ext: "avif", type: "image/avif" };
  if (b.toString("ascii", 0, 5) === "%PDF-") return { ext: "pdf", type: "application/pdf" };
  return null;
}

export function mediaPath(originalName: string, ext: string) {
  const d = new Date();
  const base = originalName.replace(/\.[^.]*$/, "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "file";
  return `${MEDIA_PREFIX}${d.getUTCFullYear()}${String(d.getUTCMonth() + 1).padStart(2, "0")}/${randomBytes(6).toString("hex")}-${base}.${ext}`;
}

export const isMediaPath = (p: string) => /^media\/\d{6}\/[a-f0-9]{12}-[a-z0-9-]{1,40}\.(png|jpg|webp|gif|avif|pdf)$/.test(p);
export const publicUrl = (p: string) => `/api/${p}`;
