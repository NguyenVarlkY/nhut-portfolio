/* GET: defaults (code) + current edits, for the admin page · PUT: save edits (validated) and refresh the site. Admin only. */
import { NextResponse } from "next/server";
import { isAdmin, sameOrigin } from "@/lib/content/auth";
import { readOverrides, storageKind, writeOverrides } from "@/lib/content/store";
import { DEFAULT_DATA, TEXT_SECTIONS } from "@/lib/content/types";
import { InvalidContent, validateOverrides } from "@/lib/content/validate";
import { i18n } from "@/lib/i18n/config";
import { seoDefaults } from "@/lib/seo";
const LANGS = i18n.locales;
import en from "@/lib/i18n/en.json";
import vi from "@/lib/i18n/vi.json";
import ko from "@/lib/i18n/ko.json";
import zh from "@/lib/i18n/zh.json";
import ja from "@/lib/i18n/ja.json";
import de from "@/lib/i18n/de.json";
import fr from "@/lib/i18n/fr.json";

export const dynamic = "force-dynamic";
const DICTS: Record<string, Record<string, unknown>> = { en, vi, ko, zh, ja, de, fr };
const noStore = { "Cache-Control": "no-store" };
const deny = () => NextResponse.json({ error: "Phiên đăng nhập đã hết, đăng nhập lại nhé." }, { status: 401 });

export async function GET() {
  if (!isAdmin()) return deny();
  const texts = Object.fromEntries(LANGS.map((l) => [l, Object.fromEntries(TEXT_SECTIONS.map((s) => [s, s === "seo" ? seoDefaults(l) : DICTS[l][s] ?? null]))]));
  return NextResponse.json({ defaults: { data: DEFAULT_DATA, i18n: texts }, overrides: await readOverrides(), storage: storageKind() }, { headers: noStore });
}

export async function PUT(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Không được phép" }, { status: 403 });
  if (!isAdmin()) return deny();
  try {
    const body = await req.json();
    const clean = validateOverrides(body);
    await writeOverrides(clean, typeof body?.note === "string" ? body.note : "");
    return NextResponse.json({ ok: true, updatedAt: clean.updatedAt }, { headers: noStore });
  } catch (err) {
    if (err instanceof InvalidContent || (err instanceof Error && /kho lưu/.test(err.message))) return NextResponse.json({ error: err.message }, { status: 400 });
    if (err instanceof SyntaxError) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
    console.error("admin content save", err);
    return NextResponse.json({ error: "Không lưu được, thử lại nhé." }, { status: 500 });
  }
}
