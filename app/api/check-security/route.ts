import { NextResponse } from "next/server";

// ─────────────────────────────────────────────────────────────
//  POST /api/check-security
//  Ported from Check-SEO---Security-Link-Web (Express backend)
//  into a native Next.js route (no separate server needed).
// ─────────────────────────────────────────────────────────────

const FETCH_TIMEOUT_MS = 10_000;
const BROWSER_HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
};

interface SecurityIssue {
  code: string;
  solution: string;
}

interface SecurityCheck {
  header: string;
  code: string;
  solution: string;
  deduction: number;
}

const SECURITY_CHECKS: SecurityCheck[] = [
  {
    header: "content-security-policy",
    code: "missing_csp",
    solution: "app.use(helmet.contentSecurityPolicy());",
    deduction: 20,
  },
  {
    header: "x-frame-options",
    code: "missing_frame_options",
    solution: "app.use(helmet.frameguard({ action: 'deny' }));",
    deduction: 15,
  },
  {
    header: "x-xss-protection",
    code: "missing_xss_protection",
    solution: "app.use(helmet.xssFilter());",
    deduction: 15,
  },
  {
    header: "strict-transport-security",
    code: "missing_hsts",
    solution: "app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true, preload: true }));",
    deduction: 10,
  },
  {
    header: "referrer-policy",
    code: "missing_referrer_policy",
    solution: "app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));",
    deduction: 10,
  },
  {
    header: "permissions-policy",
    code: "missing_permissions_policy",
    solution: "app.use(helmet.permittedCrossDomainPolicies({ permittedPolicies: 'none' }));",
    deduction: 10,
  },
  {
    header: "cross-origin-resource-policy",
    code: "missing_corp",
    solution: "app.use(helmet.crossOriginResourcePolicy({ policy: 'same-origin' }));",
    deduction: 10,
  },
  {
    header: "cross-origin-opener-policy",
    code: "missing_coop",
    solution: "app.use(helmet.crossOriginOpenerPolicy({ policy: 'same-origin' }));",
    deduction: 10,
  },
  {
    header: "cross-origin-embedder-policy",
    code: "missing_coep",
    solution: "app.use(helmet.crossOriginEmbedderPolicy({ policy: 'require-corp' }));",
    deduction: 10,
  },
  {
    header: "x-content-type-options",
    code: "missing_nosniff",
    solution: "app.use(helmet.noSniff());",
    deduction: 10,
  },
  {
    header: "cache-control",
    code: "missing_cache_control",
    solution:
      'app.use((req, res, next) => {\n  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");\n  next();\n});',
    deduction: 10,
  },
  {
    header: "access-control-allow-origin",
    code: "missing_cors",
    solution:
      'app.use(cors({\n  origin: "https://yourdomain.com",\n  methods: ["GET", "POST"],\n  allowedHeaders: ["Content-Type"]\n}));',
    deduction: 10,
  },
  {
    header: "server",
    code: "server_info_exposed",
    solution: 'app.use((req, res, next) => {\n  res.removeHeader("Server");\n  next();\n});',
    deduction: 5,
  },
  {
    header: "set-cookie",
    code: "missing_cookie_flags",
    solution:
      'app.use((req, res, next) => {\n  res.cookie("sessionId", "yourSessionId", {\n    secure: true,\n    httpOnly: true,\n    sameSite: "Strict"\n  });\n  next();\n});',
    deduction: 10,
  },
];

function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
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

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, { signal: controller.signal, redirect: "follow", headers: BROWSER_HEADERS });
    const headers = response.headers;

    let securityScore = 100;
    const issues: SecurityIssue[] = [];

    for (const { header, code, solution, deduction } of SECURITY_CHECKS) {
      if (!headers.get(header)) {
        issues.push({ code, solution });
        securityScore -= deduction;
      }
    }

    return NextResponse.json({ url, securityScore: Math.max(0, securityScore), issues });
  } catch {
    return NextResponse.json({ error: "fetch_failed" }, { status: 500 });
  } finally {
    clearTimeout(timer);
  }
}
