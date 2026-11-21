import { NextResponse } from "next/server";
import { sanitizeInput, validateEmail } from "@/lib/sanitize";
import { Resend } from "resend";
import { saveMessage } from "@/lib/content/inbox";
import { storageKind } from "@/lib/content/storage";

// ─────────────────────────────────────────────────────────────
//  POST /api/contact
//  - Server-side validate + sanitize (chống SQLi / XSS / profanity)
//  - Gửi email thật qua Resend SDK
//  - Nếu chưa cấu hình RESEND_API_KEY → trả 501 (client sẽ fallback mailto:)
// ─────────────────────────────────────────────────────────────

// Lazy-init Resend: KHÔNG throw ở top-level khi thiếu RESEND_API_KEY
let resendClient: Resend | null = null;
function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  if (!resendClient) resendClient = new Resend(apiKey);
  return resendClient;
}

// Rate limit đơn giản trong bộ nhớ (per IP, 5 requests / 10 phút)
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const hitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    hitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

function getClientIp(request: Request): string {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  // 1) Rate limit
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 },
    );
  }

  // 2) Parse body
  let body: { name?: string; email?: string; message?: string; website?: string; lang?: string; page?: string; startedAt?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // bots fill the hidden "website" field, or submit faster than a person can type: pretend it worked, keep nothing
  if (body.website || (typeof body.startedAt === "number" && Date.now() - body.startedAt < 2500)) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const name = body.name ?? "";
  const email = body.email ?? "";
  const message = body.message ?? "";

  // 3) Validate + sanitize (server-side, luôn bật — KHÔNG tin client)
  const emailCheck = validateEmail(email);
  if (!emailCheck.valid) {
    return NextResponse.json({ error: emailCheck.error }, { status: 400 });
  }

  const nameResult = sanitizeInput(name, {
    maxLength: 100,
    checkSql: true,
    checkXss: true,
    checkProfanity: true,
    trim: true,
  });
  const msgResult = sanitizeInput(message, {
    maxLength: 5000,
    checkSql: true,
    checkXss: true,
    checkProfanity: true,
    trim: true,
  });

  if (!nameResult.clean) {
    return NextResponse.json(
      { error: `Name: ${nameResult.errors.join(", ")}` },
      { status: 400 },
    );
  }
  if (!msgResult.clean) {
    return NextResponse.json(
      { error: `Message: ${msgResult.errors.join(", ")}` },
      { status: 400 },
    );
  }

  const cleanName = nameResult.sanitized;
  const cleanMessage = msgResult.sanitized;

  // 4) Lưu vào hộp thư (/admin → Hộp thư)
  const lang = typeof body.lang === "string" && /^[a-z]{2}$/.test(body.lang) ? body.lang : "";
  const page = typeof body.page === "string" ? body.page.slice(0, 200) : "";
  const country = (request.headers.get("x-vercel-ip-country") ?? "").slice(0, 2);
  const resend = getResend();
  const toEmail = process.env.CONTACT_TO_EMAIL ?? "y2002bt@gmail.com";
  let stored = false;
  if (storageKind() !== "none") {
    try {
      await saveMessage({ name: cleanName, email, message: cleanMessage, lang, country, page, emailed: !!resend });
      stored = true;
    } catch (err) {
      console.error("inbox save", err);
    }
  }

  if (!resend) {
    if (stored) return NextResponse.json({ ok: true, stored }, { status: 200 });
    // Không lưu được và chưa cấu hình email → báo client fallback về mailto:
    return NextResponse.json(
      { error: "NOT_CONFIGURED", message: "Email service not configured yet" },
      { status: 501 },
    );
  }

  // 5) Gửi email qua Resend SDK
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL ?? "Portfolio <onboarding@resend.dev>",
      to: [toEmail],
      replyTo: email,
      subject: `[Portfolio] Message from ${cleanName}`,
      text: `${cleanMessage}\n\n— ${cleanName} (${email})`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;">
          <h2 style="margin:0 0 16px;">📬 New portfolio message</h2>
          <p><strong>Name:</strong> ${escapeHtml(cleanName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space:pre-wrap;background:#f9fafb;padding:16px;border-radius:8px;">${escapeHtml(cleanMessage)}</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
          <p style="color:#6b7280;font-size:12px;">Sent from the portfolio contact form. Every message is also kept in /admin → Hộp thư.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      if (stored) return NextResponse.json({ ok: true, stored }, { status: 200 });
      return NextResponse.json(
        { error: "Failed to send email. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, id: data?.id, stored }, { status: 200 });
  } catch (err) {
    console.error("Resend network error:", err);
    if (stored) return NextResponse.json({ ok: true, stored }, { status: 200 });
    return NextResponse.json(
      { error: "Email service unreachable. Please try again." },
      { status: 500 },
    );
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&" + "amp;")
    .replace(/</g, "&" + "lt;")
    .replace(/>/g, "&" + "gt;")
    .replace(/"/g, "&" + "quot;")
    .replace(/'/g, "&" + "#039;");
}
