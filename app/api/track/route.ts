/* Public: one visit report from the tracker (components/ui/Tracker.tsx). No cookies, no IP stored.
 * Bots, the signed-in owner and floods are ignored. Always answers 204 so it never shows errors to visitors. */
import { isAdmin } from "@/lib/content/auth";
import { cleanReport, saveReport } from "@/lib/content/analytics";
import { storageKind } from "@/lib/content/storage";

export const dynamic = "force-dynamic";
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|zalo|whatsapp|telegram|curl|wget|python|node-fetch|axios/i;
const hits = new Map<string, { n: number; until: number }>();
const done = () => new Response(null, { status: 204 });

export async function POST(req: Request) {
  try {
    if (storageKind() === "none") return done();
    const ua = req.headers.get("user-agent") ?? "";
    if (!ua || BOT.test(ua) || isAdmin()) return done();
    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "local";
    const now = Date.now();
    const h = hits.get(ip);
    if (!h || h.until < now) hits.set(ip, { n: 1, until: now + 10 * 60e3 });
    else if (++h.n > 40) return done();
    if (hits.size > 5000) hits.forEach((v, k) => { if (v.until < now) hits.delete(k) });
    const text = await req.text();
    if (text.length > 8000) return done();
    const r = cleanReport(JSON.parse(text), req.headers.get("x-vercel-ip-country") ?? "");
    if (r) await saveReport(r);
  } catch {
    /* never bother the visitor */
  }
  return done();
}
