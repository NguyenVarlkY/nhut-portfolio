import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

// ─────────────────────────────────────────────────────────────
//  GET  /api/game-requirements?q=<search term>
//    -> list of { name, url } matches from Steam store search
//  POST /api/game-requirements  { url: "<steam store app url>" }
//    -> { name, minimum: string[], recommended: string[] }
//
//  Rewritten from the scraping idea in ScTSG-Info-CPU (axios + cheerio
//  against the Steam store) as a clean, timeboxed Next.js route.
// ─────────────────────────────────────────────────────────────

const FETCH_TIMEOUT_MS = 10_000;
const MAX_RESULTS = 8;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36";

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function isSteamAppUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return (u.hostname === "store.steampowered.com") && u.pathname.startsWith("/app/");
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ error: "missing_query" }, { status: 400 });

  try {
    const searchUrl = `https://store.steampowered.com/search/?term=${encodeURIComponent(q)}`;
    const response = await fetchWithTimeout(searchUrl, { headers: { "User-Agent": USER_AGENT } });
    const html = await response.text();
    const $ = cheerio.load(html);

    const results = $(".search_result_row")
      .slice(0, MAX_RESULTS)
      .map((_, el) => ({
        name: $(el).find(".title").text().trim(),
        url: $(el).attr("href") ?? "",
      }))
      .get()
      .filter((r) => r.name && r.url);

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: { url?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const url = body.url ?? "";
  if (!url || !isSteamAppUrl(url)) {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }

  try {
    const response = await fetchWithTimeout(url, {
      headers: {
        "User-Agent": USER_AGENT,
        // Bypass the Steam age-verification gate so sysreq content renders.
        Cookie: "birthtime=568022401; lastagecheckage=1-0-2000; wants_mature_content=1",
      },
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    const name = $('meta[property="og:title"]').attr("content")?.trim() || $(".apphub_AppName").first().text().trim();

    // Prefer the Windows tab; fall back to whichever sysreq block exists first.
    const winTab = $('.game_area_sys_req[data-os="win"]');
    const tab = winTab.length ? winTab : $(".game_area_sys_req").first();

    const extractList = (selector: string): string[] =>
      tab
        .find(selector)
        .find("li")
        .map((_, li) => $(li).text().trim().replace(/\s+/g, " "))
        .get()
        .filter(Boolean);

    const minimum = extractList(".game_area_sys_req_leftCol");
    const recommended = extractList(".game_area_sys_req_rightCol");

    if (!minimum.length && !recommended.length) {
      return NextResponse.json({ error: "no_requirements_found" }, { status: 404 });
    }

    return NextResponse.json({ name, minimum, recommended });
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  }
}
