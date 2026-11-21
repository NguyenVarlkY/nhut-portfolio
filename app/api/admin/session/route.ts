/* POST: sign in with the admin password · DELETE: sign out · GET: am I signed in? */
import { NextResponse } from "next/server";
import { COOKIE, adminConfigured, allowAttempt, checkPassword, isAdmin, makeSession, recordFailure, sameOrigin } from "@/lib/content/auth";
import { storageKind } from "@/lib/content/store";

export const dynamic = "force-dynamic";
const ipOf = (req: Request) => (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "local";
const noStore = { "Cache-Control": "no-store" };

export async function GET() {
  return NextResponse.json({ signedIn: isAdmin(), configured: adminConfigured(), storage: storageKind() }, { headers: noStore });
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Không được phép" }, { status: 403 });
  if (!adminConfigured()) return NextResponse.json({ error: "Chưa đặt mật khẩu quản lý (ADMIN_PASSWORD, ít nhất 8 ký tự) trên Vercel." }, { status: 503 });
  const ip = ipOf(req);
  if (!allowAttempt(ip)) return NextResponse.json({ error: "Sai quá nhiều lần. Thử lại sau 15 phút." }, { status: 429 });
  const body = await req.json().catch(() => ({}));
  const password = typeof body.password === "string" ? body.password.slice(0, 200) : "";
  await new Promise((r) => setTimeout(r, 300)); // same pace for right and wrong answers
  if (!checkPassword(password)) {
    recordFailure(ip);
    return NextResponse.json({ error: "Sai mật khẩu." }, { status: 401 });
  }
  const s = makeSession();
  const res = NextResponse.json({ ok: true }, { headers: noStore });
  res.cookies.set(COOKIE, s.value, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: s.maxAge });
  return res;
}

export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Không được phép" }, { status: 403 });
  const res = NextResponse.json({ ok: true }, { headers: noStore });
  res.cookies.set(COOKIE, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
  return res;
}
