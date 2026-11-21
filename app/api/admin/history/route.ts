/* Admin — saved versions of the content. GET: list · GET ?id=<savedAt>: that version's content (to compare or restore). */
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/content/auth";
import { listVersions, readVersion } from "@/lib/content/store";
import { storageKind } from "@/lib/content/storage";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Phiên đăng nhập đã hết, đăng nhập lại nhé." }, { status: 401 });
  if (storageKind() === "none") return NextResponse.json({ versions: [] });
  const id = new URL(req.url).searchParams.get("id");
  if (id) {
    const v = await readVersion(id);
    return v ? NextResponse.json({ version: v }, { headers: { "Cache-Control": "no-store" } }) : NextResponse.json({ error: "Không tìm thấy bản này" }, { status: 404 });
  }
  return NextResponse.json({ versions: await listVersions() }, { headers: { "Cache-Control": "no-store" } });
}
