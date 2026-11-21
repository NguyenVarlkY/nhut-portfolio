/* Server-side check of what the admin page sends before it is stored and shown to every visitor.
 * Shapes must match the defaults (no unknown keys, no wrong types), text is length-limited and control characters removed,
 * and every link must be http(s) or mailto — a "javascript:" link would run code in visitors' browsers. */
import { i18n } from "../i18n/config";
import type { Lang } from "../i18n/LanguageContext";
const LANGS = i18n.locales as readonly string[];
import { DATA_KEYS, DEFAULT_DATA, TEXT_SECTIONS, type JsonValue, type Overrides } from "./types";

export class InvalidContent extends Error {}
const MAX_TOTAL = 900_000;
const CTRL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const OPTIONAL = new Set(["demoUrl", "githubUrl", "outcome", "image", "gallery", "avatar", "cvUrl"]);
const empty = (m: unknown): JsonValue => (typeof m === "string" ? "" : typeof m === "number" ? 0 : typeof m === "boolean" ? false : Array.isArray(m) ? [] : {});
const LINK_KEY = /(url|github|linkedin|facebook|href|link)$/i;
/** pictures/files: a full https link, or a file uploaded to this site (/api/media/…, /assets/…) */
const MEDIA_KEY = /^(avatar|image|gallery|ogImage|cvUrl)$/;

function cleanString(v: string, path: string, key: string): string {
  const s = v.replace(CTRL, "").slice(0, 8000);
  const t = s.trim();
  if (!t) return s;
  if (MEDIA_KEY.test(key)) {
    if (!/^https:\/\//i.test(t) && !/^\/(api\/media|assets)\/[\w./-]+$/.test(t) || t.includes("..")) throw new InvalidContent(`Ảnh/file không hợp lệ ở ${path}: tải lên trong trang quản lý hoặc dùng link https://`);
    return t;
  }
  if (key === "siteUrl") {
    if (!/^https:\/\/[a-z0-9.-]+(:\d+)?\/?$/i.test(t)) throw new InvalidContent(`Địa chỉ trang không hợp lệ: dạng https://ten-mien.com`);
    return t.replace(/\/$/, "");
  }
  if (LINK_KEY.test(key) && !/^(https?:\/\/|mailto:)/i.test(t)) throw new InvalidContent(`Link không hợp lệ ở ${path}: phải bắt đầu bằng https://`);
  return s;
}

/** Same shape as `model` (arrays may have any length; items follow the first default item). */
function clean(v: unknown, model: unknown, path: string, key = ""): JsonValue {
  if (typeof model === "string") { if (typeof v !== "string") throw new InvalidContent(`${path} phải là chữ`); return cleanString(v, path, key) }
  if (typeof model === "number") { const n = Number(v); if (!Number.isFinite(n)) throw new InvalidContent(`${path} phải là số`); return n }
  if (typeof model === "boolean") return !!v;
  if (Array.isArray(model)) {
    if (!Array.isArray(v)) throw new InvalidContent(`${path} phải là danh sách`);
    if (v.length > 200) throw new InvalidContent(`${path} quá dài`);
    const itemModel = model[0] ?? "";
    return v.map((x, i) => clean(x, itemModel, `${path}[${i}]`, key));
  }
  if (model && typeof model === "object") {
    if (!v || typeof v !== "object" || Array.isArray(v)) throw new InvalidContent(`${path} sai dạng`);
    const out: Record<string, JsonValue> = {};
    const m = model as Record<string, unknown>;
    for (const [k, x] of Object.entries(v as Record<string, unknown>)) {
      const km = k in m ? m[k] : OPTIONAL.has(k) ? "" : undefined;
      if (km === undefined) throw new InvalidContent(`${path}.${k} không được phép`);
      if (x === undefined || x === null || (x === "" && OPTIONAL.has(k))) continue; // empty optional link = no link
      out[k] = clean(x, km, `${path}.${k}`, k);
    }
    // a missing required field gets an empty value of the right type (the page never meets "undefined")
    for (const [k, km] of Object.entries(m)) if (!(k in out) && !OPTIONAL.has(k)) out[k] = empty(km);
    return out;
  }
  return null;
}

/** Text sections: free structure, but only strings / arrays / objects of strings (they come from the dictionaries). */
function cleanText(v: unknown, path: string, depth = 0): JsonValue {
  if (depth > 6) throw new InvalidContent(`${path} lồng quá sâu`);
  if (typeof v === "string") return cleanString(v, path, "");
  if (Array.isArray(v)) { if (v.length > 200) throw new InvalidContent(`${path} quá dài`); return v.map((x, i) => cleanText(x, `${path}[${i}]`, depth + 1)) }
  if (v && typeof v === "object") {
    const out: Record<string, JsonValue> = {};
    for (const [k, x] of Object.entries(v)) { if (!/^[\w-]{1,60}$/.test(k)) throw new InvalidContent(`Tên trường không hợp lệ: ${k}`); out[k] = cleanText(x, `${path}.${k}`, depth + 1) }
    return out;
  }
  throw new InvalidContent(`${path} sai dạng`);
}

export function validateOverrides(input: unknown): Overrides {
  if (!input || typeof input !== "object") throw new InvalidContent("Dữ liệu trống");
  if (JSON.stringify(input).length > MAX_TOTAL) throw new InvalidContent("Dữ liệu quá lớn");
  const src = input as Overrides;
  const out: Overrides = { updatedAt: Date.now() };
  if (src.data) {
    out.data = {};
    for (const [k, v] of Object.entries(src.data)) {
      if (!DATA_KEYS.includes(k as never)) throw new InvalidContent(`Mục ${k} không được phép`);
      (out.data as Record<string, JsonValue>)[k] = clean(v, DEFAULT_DATA[k as keyof typeof DEFAULT_DATA], k);
    }
  }
  if (src.i18n) {
    out.i18n = {};
    for (const [lang, sections] of Object.entries(src.i18n)) {
      if (!LANGS.includes(lang)) throw new InvalidContent(`Ngôn ngữ ${lang} không hỗ trợ`);
      const s: Record<string, JsonValue> = {};
      for (const [sec, v] of Object.entries(sections ?? {})) {
        if (!(TEXT_SECTIONS as readonly string[]).includes(sec)) throw new InvalidContent(`Mục chữ ${sec} không được phép`);
        s[sec] = cleanText(v, `${lang}.${sec}`);
      }
      (out.i18n as Record<string, unknown>)[lang] = s;
    }
  }
  return out;
}
