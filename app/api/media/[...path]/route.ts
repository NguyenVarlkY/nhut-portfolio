/* Public: serves an uploaded picture/file. Only paths in the media/ naming scheme; cached for a year (names never change). */
import { isMediaPath } from "@/lib/content/media";
import { readBytes } from "@/lib/content/storage";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { path: string[] } }) {
  const p = ["media", ...params.path].join("/");
  if (!isMediaPath(p)) return new Response("Not found", { status: 404 });
  const f = await readBytes(p);
  if (!f) return new Response("Not found", { status: 404, headers: { "Cache-Control": "public, max-age=60" } });
  const pdf = p.endsWith(".pdf");
  return new Response(new Uint8Array(f.body), {
    headers: {
      "Content-Type": f.contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      // pictures can never run anything; Chrome refuses to show PDFs under a sandbox, so PDFs only get the name header
      ...(pdf ? { "Content-Disposition": `inline; filename="${p.split("/").pop()}"` } : { "Content-Security-Policy": "default-src 'none'; img-src 'self'; style-src 'unsafe-inline'; sandbox" }),
    },
  });
}
