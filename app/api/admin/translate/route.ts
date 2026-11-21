/* Admin — translate a piece of page text (a whole text section, or a blog post) from one language into others.
 * Uses OpenAI (OPENAI_API_KEY, the same key as the chat bot). The answer must keep exactly the same shape (keys, list lengths),
 * otherwise it is refused, so a translation can never break the page. Nothing is saved here: the admin reviews, then saves. */
import { NextResponse } from "next/server";
import OpenAI from "openai";
import { isAdmin, sameOrigin } from "@/lib/content/auth";
import { i18n } from "@/lib/i18n/config";

export const dynamic = "force-dynamic";
export const maxDuration = 60;
const NAMES: Record<string, string> = { vi: "Vietnamese", en: "English", ko: "Korean", zh: "Simplified Chinese", ja: "Japanese", de: "German", fr: "French" };
const LANGS = i18n.locales as readonly string[];

/** true when b has exactly a's structure (same keys, same list lengths, strings where a has strings) */
function sameShape(a: unknown, b: unknown): boolean {
  if (typeof a === "string") return typeof b === "string";
  if (Array.isArray(a)) return Array.isArray(b) && a.length === b.length && a.every((x, i) => sameShape(x, b[i]));
  if (a && typeof a === "object") {
    if (!b || typeof b !== "object" || Array.isArray(b)) return false;
    const ka = Object.keys(a), kb = Object.keys(b as object);
    return ka.length === kb.length && ka.every((k) => sameShape((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]));
  }
  return a === b;
}

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ configured: !!process.env.OPENAI_API_KEY });
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Không được phép" }, { status: 403 });
  if (!isAdmin()) return NextResponse.json({ error: "Phiên đăng nhập đã hết, đăng nhập lại nhé." }, { status: 401 });
  const key = process.env.OPENAI_API_KEY;
  if (!key) return NextResponse.json({ error: "Chưa bật dịch tự động: thêm OPENAI_API_KEY trên Vercel (Settings → Environment Variables) rồi deploy lại." }, { status: 503 });

  const b = await req.json().catch(() => ({}));
  const from = String(b.from ?? ""), to = String(b.to ?? "");
  if (!LANGS.includes(from) || !LANGS.includes(to) || from === to) return NextResponse.json({ error: "Ngôn ngữ không hợp lệ" }, { status: 400 });
  const value = b.value;
  const text = JSON.stringify(value ?? null);
  if (value == null || text.length > 60_000) return NextResponse.json({ error: "Nội dung trống hoặc quá dài để dịch một lần" }, { status: 400 });
  const kind = b.kind === "markdown" ? "markdown" : "ui";

  const system = [
    `You translate website content of a software developer's portfolio from ${NAMES[from]} to ${NAMES[to]}.`,
    "Input and output are JSON. Return a JSON object {\"result\": <translated value>} where <translated value> has EXACTLY the same structure as the input: same keys (never translate keys), same array lengths, same order.",
    "Translate only the human-readable string values. Keep unchanged: technology and product names (React, Next.js, Node.js, MongoDB…), company names, people's names, URLs, emails, numbers, dates written as ranges, placeholders like {count} or {name}, emoji.",
    kind === "markdown" ? "String values may be Markdown: keep all Markdown syntax, code blocks and inline code exactly as they are, translate only the prose." : "Keep it natural, concise and professional, like a native speaker writing a portfolio. Keep the same tone and roughly the same length.",
  ].join("\n");

  try {
    const ai = new OpenAI({ apiKey: key });
    const r = await ai.chat.completions.create({
      model: process.env.OPENAI_TRANSLATE_MODEL || "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [{ role: "system", content: system }, { role: "user", content: text }],
    });
    const out = JSON.parse(r.choices[0]?.message?.content ?? "{}").result;
    if (!sameShape(value, out)) return NextResponse.json({ error: "Bản dịch bị lệch cấu trúc, thử lại nhé." }, { status: 502 });
    return NextResponse.json({ ok: true, result: out });
  } catch (err) {
    console.error("translate", err);
    const status = (err as { status?: number })?.status;
    return NextResponse.json({ error: status === 401 ? "OPENAI_API_KEY không đúng." : status === 429 ? "OpenAI đang giới hạn hoặc hết hạn mức, thử lại sau." : "Không dịch được, thử lại nhé." }, { status: 502 });
  }
}
