/* Visit statistics without cookies or IP addresses.
 * Each page view sends one small report when the visitor leaves (stats/raw/<day>/…). When the owner opens the stats page,
 * raw reports are folded into one summary per day (stats/day/<day>.json) and removed, so reading stays cheap. */
import { randomBytes } from "node:crypto";
import { listFiles, pool, readJson, remove, writeJson } from "./storage";

export interface Report {
  first: boolean; // first report of this visit (tab session)
  fresh: boolean; // first visit ever from this browser
  lang: string;
  pages: Record<string, number>;
  sections: string[];
  projects: string[];
  clicks: Record<string, number>;
  ref: string;
  device: "mobile" | "tablet" | "desktop";
  seconds: number;
  country: string;
  hour: number; // 0–23, Vietnam time
}

export interface DayStats {
  day: string;
  sessions: number;
  visitors: number; // new browsers
  views: number;
  seconds: number;
  reports: number;
  pages: Record<string, number>;
  sections: Record<string, number>;
  projects: Record<string, number>;
  clicks: Record<string, number>;
  countries: Record<string, number>;
  refs: Record<string, number>;
  devices: Record<string, number>;
  langs: Record<string, number>;
  hours: number[];
}

const RAW = "stats/raw/";
const DAY = "stats/day/";
const KEY = /^[\w./#:@-]{1,80}$/;
const vnDay = (t = Date.now()) => new Date(t + 7 * 3600e3).toISOString().slice(0, 10);
const vnHour = (t = Date.now()) => new Date(t + 7 * 3600e3).getUTCHours();

function counts(v: unknown, maxKeys = 30): Record<string, number> {
  const out: Record<string, number> = {};
  if (!v || typeof v !== "object") return out;
  for (const [k, n] of Object.entries(v as Record<string, unknown>).slice(0, maxKeys)) {
    const x = Math.floor(Number(n));
    if (KEY.test(k) && x > 0) out[k] = Math.min(x, 50);
  }
  return out;
}
const words = (v: unknown, max = 30) => (Array.isArray(v) ? Array.from(new Set(v.filter((x): x is string => typeof x === "string" && KEY.test(x)))).slice(0, max) : []);

/** Checked copy of what a browser sent. */
export function cleanReport(v: unknown, country: string): Report | null {
  if (!v || typeof v !== "object") return null;
  const r = v as Record<string, unknown>;
  const pages = counts(r.pages, 20);
  const sections = words(r.sections, 20);
  const projects = words(r.projects, 20);
  const clicks = counts(r.clicks, 20);
  if (!Object.keys(pages).length && !sections.length && !projects.length && !Object.keys(clicks).length) return null;
  const ref = typeof r.ref === "string" && /^[a-z0-9.-]{1,80}$/i.test(r.ref) ? r.ref.toLowerCase().replace(/^www\./, "") : "";
  return {
    first: !!r.first,
    fresh: !!r.fresh,
    lang: typeof r.lang === "string" && /^[a-z]{2}$/.test(r.lang) ? r.lang : "",
    pages, sections, projects, clicks, ref,
    device: r.device === "mobile" || r.device === "tablet" ? r.device : "desktop",
    seconds: Math.max(0, Math.min(3600, Math.floor(Number(r.seconds) || 0))),
    country: /^[A-Z]{2}$/.test(country) ? country : "",
    hour: vnHour(),
  };
}

export async function saveReport(r: Report) {
  await writeJson(`${RAW}${vnDay()}/${Date.now()}-${randomBytes(3).toString("hex")}.json`, r);
}

const emptyDay = (day: string): DayStats => ({ day, sessions: 0, visitors: 0, views: 0, seconds: 0, reports: 0, pages: {}, sections: {}, projects: {}, clicks: {}, countries: {}, refs: {}, devices: {}, langs: {}, hours: Array(24).fill(0) });
const add = (into: Record<string, number>, from: Record<string, number>) => { for (const [k, n] of Object.entries(from)) into[k] = (into[k] ?? 0) + n };
const bump = (into: Record<string, number>, k: string) => { if (k) into[k] = (into[k] ?? 0) + 1 };

function fold(d: DayStats, r: Report) {
  d.reports++;
  const views = Object.values(r.pages).reduce((a, b) => a + b, 0);
  d.views += views;
  d.seconds += r.seconds;
  add(d.pages, r.pages);
  add(d.clicks, r.clicks);
  r.sections.forEach((s) => bump(d.sections, s));
  r.projects.forEach((p) => bump(d.projects, p));
  if (r.first) {
    d.sessions++;
    if (r.fresh) d.visitors++;
    bump(d.countries, r.country || "??");
    bump(d.refs, r.ref || "(trực tiếp)");
    bump(d.devices, r.device);
    bump(d.langs, r.lang || "??");
    d.hours[r.hour] = (d.hours[r.hour] ?? 0) + 1;
  }
}

let compacting: Promise<void> | null = null;
/** Fold waiting raw reports into the day summaries (one run at a time). */
export function compact(): Promise<void> {
  compacting ??= (async () => {
    try {
      const raw = (await listFiles(RAW, 3000)).filter((f) => f.path.endsWith(".json"));
      const byDay = new Map<string, string[]>();
      for (const f of raw) {
        const day = f.path.slice(RAW.length, RAW.length + 10);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) continue;
        byDay.set(day, [...(byDay.get(day) ?? []), f.path]);
      }
      for (const [day, paths] of Array.from(byDay.entries())) {
        const reports = await pool(paths, 10, (p) => readJson<Report>(p));
        const d = (await readJson<DayStats>(`${DAY}${day}.json`)) ?? emptyDay(day);
        reports.forEach((r) => { if (r) fold(d, r) });
        await writeJson(`${DAY}${day}.json`, d);
        await remove(paths);
      }
    } finally {
      compacting = null;
    }
  })();
  return compacting;
}

export async function readDays(days: number): Promise<DayStats[]> {
  const want: string[] = [];
  for (let i = days - 1; i >= 0; i--) want.push(vnDay(Date.now() - i * 86400e3));
  const have = new Set((await listFiles(DAY, 1000)).map((f) => f.path.slice(DAY.length, DAY.length + 10)));
  return pool(want, 10, async (day) => (have.has(day) ? (await readJson<DayStats>(`${DAY}${day}.json`)) ?? emptyDay(day) : emptyDay(day)));
}
