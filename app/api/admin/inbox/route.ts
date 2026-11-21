/* Admin inbox — GET: all messages · PATCH {ids, read?, starred?}: mark · DELETE {ids}: remove. */
import { NextResponse } from "next/server";
import { isAdmin, sameOrigin } from "@/lib/content/auth";
import { deleteMessages, isMessageId, listMessages, updateMessage } from "@/lib/content/inbox";
import { storageKind } from "@/lib/content/storage";

export const dynamic = "force-dynamic";
const deny = () => NextResponse.json({ error: "Phiên đăng nhập đã hết, đăng nhập lại nhé." }, { status: 401 });
const ids = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string" && isMessageId(x)).slice(0, 200) : []);

export async function GET() {
  if (!isAdmin()) return deny();
  const messages = storageKind() === "none" ? [] : await listMessages();
  return NextResponse.json({ messages, emailConfigured: !!process.env.RESEND_API_KEY }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Không được phép" }, { status: 403 });
  if (!isAdmin()) return deny();
  const b = await req.json().catch(() => ({}));
  const list = ids(b.ids);
  const patch = { read: typeof b.read === "boolean" ? b.read : undefined, starred: typeof b.starred === "boolean" ? b.starred : undefined };
  const out = [];
  for (const id of list) out.push(await updateMessage(id, patch));
  return NextResponse.json({ ok: true, messages: out.filter(Boolean) });
}

export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Không được phép" }, { status: 403 });
  if (!isAdmin()) return deny();
  const b = await req.json().catch(() => ({}));
  await deleteMessages(ids(b.ids));
  return NextResponse.json({ ok: true });
}
