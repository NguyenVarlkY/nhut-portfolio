/* Admin — visit statistics for the last N days (7–180). Folds waiting raw reports first. */
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/content/auth";
import { compact, readDays } from "@/lib/content/analytics";
import { storageKind } from "@/lib/content/storage";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "Phiên đăng nhập đã hết, đăng nhập lại nhé." }, { status: 401 });
  if (storageKind() === "none") return NextResponse.json({ days: [] });
  const n = Math.min(180, Math.max(7, Number(new URL(req.url).searchParams.get("days")) || 30));
  await compact().catch((err) => console.error("stats compact", err));
  return NextResponse.json({ days: await readDays(n) }, { headers: { "Cache-Control": "no-store" } });
}
