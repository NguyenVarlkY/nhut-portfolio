/* Admin sign-in: one password (env ADMIN_PASSWORD, set by the owner on Vercel), a signed http-only cookie for 7 days.
 * Wrong passwords are slowed down per network (in memory per server instance) and every attempt takes the same time. */
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const COOKIE = "ny_admin";
const DAYS = 7;
const secret = () => process.env.ADMIN_SECRET || (process.env.ADMIN_PASSWORD ? `pw:${process.env.ADMIN_PASSWORD}` : "");
const sign = (s: string) => createHmac("sha256", secret()).update(s).digest("base64url");
const same = (a: string, b: string) => { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y) };

export const adminConfigured = () => !!process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 8;

export function checkPassword(given: string) {
  const want = process.env.ADMIN_PASSWORD ?? "";
  // compare hashes so the time does not depend on how many characters match
  return adminConfigured() && same(sign(`pw.${given}`), sign(`pw.${want}`));
}

export function makeSession() {
  const exp = Date.now() + DAYS * 86400e3;
  return { value: `${exp}.${sign(`admin.${exp}`)}`, maxAge: DAYS * 86400 };
}

export function isAdmin(): boolean {
  if (!adminConfigured()) return false;
  const v = cookies().get(COOKIE)?.value ?? "";
  const [exp, sig] = v.split(".");
  if (!exp || !sig || Number(exp) < Date.now()) return false;
  return same(sig, sign(`admin.${exp}`));
}

const tries = new Map<string, { n: number; until: number }>();
/** false when this network made too many wrong attempts (10 per 15 minutes). */
export function allowAttempt(ip: string) {
  const now = Date.now();
  const t = tries.get(ip);
  if (!t || t.until < now) return true;
  return t.n < 10;
}
export function recordFailure(ip: string) {
  const now = Date.now();
  const t = tries.get(ip);
  if (!t || t.until < now) tries.set(ip, { n: 1, until: now + 15 * 60e3 });
  else t.n++;
  if (tries.size > 2000) tries.forEach((v, k) => { if (v.until < now) tries.delete(k) });
}

/** Requests that change data must come from this site (the cookie is SameSite=Strict too). */
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === new URL(req.url).host || new URL(origin).host === req.headers.get("host") } catch { return false }
}
