import { ImageResponse } from "next/og";
import { getPost } from "@/lib/blog";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Inter has no CJK glyphs, so translated titles need a matching Noto Sans.
const FONT_BY_LANG: Record<string, string> = { ja: "Noto Sans JP", ko: "Noto Sans KR", zh: "Noto Sans SC" };

// next/og's default font loader builds a file:// URL that breaks on Windows
// dev servers, so we fetch a real font ourselves. Requesting with an old
// Chrome UA makes Google Fonts return .ttf instead of .woff2, which satori
// (the renderer behind ImageResponse) can embed directly.
async function loadTitleFont(text: string, family: string): Promise<ArrayBuffer | null> {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@700&text=${encodeURIComponent(text)}`, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.90 Safari/537.36" },
      })
    ).text();
    const match = css.match(/src: url\(([^)]+)\) format\('(?:opentype|truetype)'\)/);
    if (!match) return null;
    const fontRes = await fetch(match[1]);
    return fontRes.ok ? await fontRes.arrayBuffer() : null;
  } catch {
    return null;
  }
}

export default async function OgImage({ params }: { params: { slug: string; lang: string } }) {
  const post = await getPost(params.slug, params.lang);
  const title: string = post?.frontmatter.title || "Untitled";
  const family = FONT_BY_LANG[post?.lang ?? ""] ?? "Inter";
  const fontData = await loadTitleFont(title + "NGUYENBUIYMG· Blog0123456789", family);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: "#07070d",
          backgroundImage:
            "radial-gradient(circle at 15% 15%, rgba(99,102,241,0.35), transparent 45%), radial-gradient(circle at 85% 85%, rgba(34,211,238,0.3), transparent 45%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              backgroundImage: "linear-gradient(135deg, #6366f1, #8b5cf6, #22d3ee)",
            }}
          />
          <span style={{ color: "#9a9ab0", fontSize: 24, letterSpacing: 1 }}>
            NGUYEN BUI NHUT Y · Blog
          </span>
        </div>

        <div
          style={{
            color: "#eaeaf2",
            fontSize: title.length > 60 ? 48 : 64,
            fontWeight: 700,
            lineHeight: 1.15,
            display: "flex",
          }}
        >
          {title}
        </div>

        <div
          style={{
            height: 6,
            width: 180,
            borderRadius: 999,
            backgroundImage: "linear-gradient(90deg, #6366f1, #8b5cf6, #22d3ee)",
          }}
        />
      </div>
    ),
    {
      ...size,
      fonts: fontData ? [{ name: family, data: fontData, style: "normal", weight: 700 }] : undefined,
    }
  );
}
