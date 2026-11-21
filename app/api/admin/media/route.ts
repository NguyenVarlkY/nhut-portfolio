/* Admin media library — GET: list · POST: upload one file (multipart "file") · DELETE ?path=: remove. */
import { NextResponse } from "next/server";
import { isAdmin, sameOrigin } from "@/lib/content/auth";
import { listFiles, remove, writeBytes, NoStorage } from "@/lib/content/storage";
import { MAX_UPLOAD, MEDIA_PREFIX, isMediaPath, mediaPath, publicUrl, sniff } from "@/lib/content/media";

export const dynamic = "force-dynamic";
const deny = () => NextResponse.json({ error: "Phiên đăng nhập đã hết, đăng nhập lại nhé." }, { status: 401 });

export async function GET() {
  if (!isAdmin()) return deny();
  const files = (await listFiles(MEDIA_PREFIX, 1000)).filter((f) => isMediaPath(f.path));
  return NextResponse.json({ files: files.map((f) => ({ ...f, url: publicUrl(f.path), kind: f.path.endsWith(".pdf") ? "pdf" : "image" })) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Không được phép" }, { status: 403 });
  if (!isAdmin()) return deny();
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof Blob)) return NextResponse.json({ error: "Chưa chọn file" }, { status: 400 });
    if (file.size > MAX_UPLOAD) return NextResponse.json({ error: "File lớn quá (tối đa 4 MB). Ảnh sẽ được tự thu nhỏ — với PDF hãy nén bớt." }, { status: 413 });
    const buf = Buffer.from(await file.arrayBuffer());
    const kind = sniff(buf);
    if (!kind) return NextResponse.json({ error: "Chỉ nhận ảnh PNG, JPG, WebP, GIF, AVIF hoặc file PDF." }, { status: 415 });
    const name = typeof (file as File).name === "string" ? (file as File).name : "file";
    const path = mediaPath(name, kind.ext);
    await writeBytes(path, buf, kind.type, 31536000);
    return NextResponse.json({ ok: true, path, url: publicUrl(path), size: buf.length, kind: kind.ext === "pdf" ? "pdf" : "image" });
  } catch (err) {
    if (err instanceof NoStorage) return NextResponse.json({ error: err.message }, { status: 400 });
    console.error("upload", err);
    return NextResponse.json({ error: "Không tải lên được, thử lại nhé." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Không được phép" }, { status: 403 });
  if (!isAdmin()) return deny();
  const p = new URL(req.url).searchParams.get("path") ?? "";
  if (!isMediaPath(p)) return NextResponse.json({ error: "File không hợp lệ" }, { status: 400 });
  await remove([p]);
  return NextResponse.json({ ok: true });
}
