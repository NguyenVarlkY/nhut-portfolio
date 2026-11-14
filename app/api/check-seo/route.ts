import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

// ─────────────────────────────────────────────────────────────
//  POST /api/check-seo
//  Ported from Check-SEO---Security-Link-Web (Express backend)
//  into a native Next.js route (no separate server needed).
// ─────────────────────────────────────────────────────────────

const FETCH_TIMEOUT_MS = 10_000;
const MAX_LINKS_TO_CHECK = 25;
const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
};

interface SeoIssue {
  code: string;
  count?: number;
}

function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal, redirect: "follow", headers: BROWSER_HEADERS });
  } finally {
    clearTimeout(timer);
  }
}

export async function POST(request: Request) {
  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const url = body.url ?? "";
  if (!url || !isValidHttpUrl(url)) {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }

  try {
    const response = await fetchWithTimeout(url, FETCH_TIMEOUT_MS);
    const html = await response.text();
    const $ = cheerio.load(html);

    let seoScore = 100;
    const seoIssues: SeoIssue[] = [];
    const deduct = (code: string, points: number, count?: number) => {
      seoIssues.push(count === undefined ? { code } : { code, count });
      seoScore -= points;
    };

    if (!$("title").text()) deduct("missing_title", 20);

    const description = $('meta[name="description"]').attr("content");
    if (!description) {
      deduct("missing_description", 20);
    } else if (description.length > 155) {
      deduct("description_too_long", 5);
    }

    if (!$('meta[name="keywords"]').attr("content")) deduct("missing_keywords", 20);
    if (!$("h1").text()) deduct("missing_h1", 20);
    if (!$('meta[name="robots"]').attr("content")) deduct("missing_robots", 20);

    const imagesWithoutAlt = $("img").filter((_, img) => !$(img).attr("alt"));
    if (imagesWithoutAlt.length) deduct("images_without_alt", 10, imagesWithoutAlt.length);

    // Broken link check — capped and run concurrently with a timeout per link.
    const externalHrefs = $("a")
      .map((_, a) => $(a).attr("href"))
      .get()
      .filter((href): href is string => !!href && href.startsWith("http"))
      .slice(0, MAX_LINKS_TO_CHECK);

    const brokenLinks = (
      await Promise.all(
        externalHrefs.map(async (href) => {
          try {
            const linkResponse = await fetchWithTimeout(href, 5_000);
            return linkResponse.ok ? null : href;
          } catch {
            return href;
          }
        })
      )
    ).filter((href): href is string => href !== null);

    if (brokenLinks.length) deduct("broken_links", 10, brokenLinks.length);

    if (!$('link[rel="canonical"]').attr("href")) deduct("missing_canonical", 10);
    if (!$('meta[property="og:title"]').attr("content")) deduct("missing_og_title", 10);
    if (!$('meta[name="viewport"]').attr("content")) deduct("missing_viewport", 10);
    if (!$('link[rel="alternate"][hreflang]').length) deduct("missing_hreflang", 10);
    if (!url.startsWith("https://")) deduct("not_https", 10);
    if (!$('script[type="application/ld+json"]').length) deduct("missing_schema", 10);

    const wordCount = $("body").text().trim().split(/\s+/).filter(Boolean).length;
    if (wordCount < 300) deduct("content_too_short", 10);

    const iframesWithoutTitle = $("iframe").filter((_, iframe) => !$(iframe).attr("title"));
    if (iframesWithoutTitle.length) deduct("iframes_without_title", 5, iframesWithoutTitle.length);

    const internalLinks = $("a").filter((_, a) => ($(a).attr("href") ?? "").startsWith(url));
    if (internalLinks.length < 3) deduct("insufficient_internal_links", 5);

    // Heuristic: very thin body text + an SPA root div often means the real
    // content is client-rendered (or the page is a login/consent wall), so a
    // static fetch can't see what a logged-in browser actually renders.
    const hasSpaRoot = $("#root, #app, #__next, #__nuxt").length > 0;
    const possiblyIncomplete = wordCount < 50 && (hasSpaRoot || response.status >= 300);

    return NextResponse.json({ url, seoScore: Math.max(0, seoScore), seoIssues, possiblyIncomplete });
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }
}
