// ─────────────────────────────────────────────────────────────
//  Input sanitization utility
//  - SQL injection pattern detection
//  - HTML / XSS stripping
//  - Profanity filter (multi-language: EN, VI, KO, ZH, JA)
//  - Length & character limits
// ─────────────────────────────────────────────────────────────

// ─── Profanity word lists ────────────────────────────────────
const PROFANITY_EN = [
  "fuck", "shit", "ass", "bitch", "damn", "bastard", "crap", "dick",
  "piss", "slut", "whore", "cock", "cunt", "douche", "motherfucker",
  "asshole", "dumbass", "jackass", "prick", "twat", "wanker",
];

const PROFANITY_VI = [
  "đụ", "địt", "lồn", "cặc", "buồi", "mẹ mày", "bố mày",
  "chó chết", "đĩ", "điếm", "cút", "mát", "ngu", "ngu si",
  "hãm", "hãm l", "đần", "thằng điên", "con điên",
  "vãi lồn", "vãi cặc", "đéo", "éo", "chịch",
];

const PROFANITY_KO = [
  "씨발", "시발", "병신", "존나", "좆", "느금", "미친",
  "새끼", "년", "놈", "지랄", "엿", "꺼져",
];

const PROFANITY_ZH = [
  "操你妈", "傻逼", "草泥马", "你妈", "狗屎", "混蛋",
  "滚", "贱人", "他妈的", "卧槽",
];

const PROFANITY_JA = [
  "ちくしょう", "くそ", "ばか", "あほ", "死ね",
  "うざい", "きもい", "ふざけるな", "変態",
];

// Merge all (use array instead of Set for ES5/ES2015 compatibility)
const PROFANITY_LIST = [
  ...PROFANITY_EN,
  ...PROFANITY_VI,
  ...PROFANITY_KO,
  ...PROFANITY_ZH,
  ...PROFANITY_JA,
];

// ─── SQL injection patterns ─────────────────────────────────
const SQL_PATTERNS = [
  /(\bSELECT\b.*\bFROM\b)/i,
  /(\bINSERT\s+INTO\b)/i,
  /(\bUPDATE\b.*\bSET\b)/i,
  /(\bDELETE\b.*\bFROM\b)/i,
  /(\bDROP\s+TABLE\b)/i,
  /(\bALTER\s+TABLE\b)/i,
  /(\bCREATE\s+TABLE\b)/i,
  /(\bTRUNCATE\b)/i,
  /(\bEXEC\b)/i,
  /(\bEXECUTE\b)/i,
  /(\bUNION\b.*\bSELECT\b)/i,
  /(\bOR\b\s+\d+\s*=\s*\d+\b)/i,
  /(\bAND\b\s+\d+\s*=\s*\d+\b)/i,
  /--/,
  /(\bWAITFOR\s+DELAY\b)/i,
  /(\bSLEEP\s*\()/i,
  /(\bBENCHMARK\s*\()/i,
  /(')\s*(OR|AND|UNION|SELECT|INSERT|UPDATE|DELETE|DROP|--)/i,
  /(\bINFORMATION_SCHEMA\b)/i,
  /(\bPG_SLEEP\b)/i,
];

// ─── HTML / XSS patterns ────────────────────────────────────
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
  /<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi,
  /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
  /on\w+\s*=\s*['"][^'"]*['"]/gi,
  /on\w+\s*=\s*[^\s>]+/gi,
  /javascript\s*:/gi,
  /expression\s*\(/gi,
  /vbscript\s*:/gi,
  /<[^>]*>/g, // strip any HTML tag
];

// ─── Email validation ───────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Public API ─────────────────────────────────────────────

export interface SanitizeResult {
  clean: boolean;
  sanitized: string;
  errors: string[];
  warnings: string[];
}

export interface SanitizeOptions {
  /** Max length (default 2000) */
  maxLength?: number;
  /** Allow basic HTML? (default false — strip all) */
  allowHtml?: boolean;
  /** Check SQL injection? (default true) */
  checkSql?: boolean;
  /** Check profanity? (default true) */
  checkProfanity?: boolean;
  /** Check XSS? (default true) */
  checkXss?: boolean;
  /** Trim whitespace? (default true) */
  trim?: boolean;
}

const DEFAULT_OPTIONS: SanitizeOptions = {
  maxLength: 2000,
  allowHtml: false,
  checkSql: true,
  checkProfanity: true,
  checkXss: true,
  trim: true,
};

/**
 * Sanitize a single string input.
 * Returns cleaned text + error/warning lists.
 */
export function sanitizeInput(
  input: string,
  options?: SanitizeOptions,
): SanitizeResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let text = input ?? "";
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Trim
  if (opts.trim) text = text.trim();

  // 2. Empty check
  if (!text) {
    return { clean: false, sanitized: "", errors: ["Input is empty"], warnings: [] };
  }

  // 3. Length check
  if (text.length > (opts.maxLength ?? 2000)) {
    errors.push(`Input exceeds maximum length of ${opts.maxLength} characters`);
    text = text.slice(0, opts.maxLength ?? 2000);
  }

  // 4. SQL injection check
  if (opts.checkSql) {
    for (const pattern of SQL_PATTERNS) {
      if (pattern.test(text)) {
        errors.push("Input contains suspicious SQL patterns");
        // Neutralize: strip the dangerous parts
        text = text.replace(pattern, "[REDACTED]");
        break;
      }
    }
  }

  // 5. XSS / HTML check
  if (opts.checkXss) {
    let hadXss = false;
    for (const pattern of XSS_PATTERNS) {
      if (pattern.test(text)) {
        hadXss = true;
        text = text.replace(pattern, "");
      }
    }
    if (hadXss) {
      warnings.push("HTML / script tags were removed from input");
    }
    // Strip remaining HTML tags if not allowed
    if (!opts.allowHtml) {
      const stripped = text.replace(/<[^>]*>/g, "");
      if (stripped !== text) {
        warnings.push("HTML tags were stripped from input");
        text = stripped;
      }
    }
  }

  // 6. Profanity check
  if (opts.checkProfanity) {
    const lower = text.toLowerCase();
    let hadProfanity = false;
for (const word of PROFANITY_LIST) {
      const idx = lower.indexOf(word.toLowerCase());
      if (idx !== -1) {
        hadProfanity = true;
        // Replace with asterisks
        const replacement = "*".repeat(word.length);
        const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
        text = text.replace(regex, replacement);
      }
    }
    if (hadProfanity) {
      warnings.push("Inappropriate language was filtered from input");
    }
  }

  // 7. Normalize whitespace (collapse multiple spaces)
  text = text.replace(/\s+/g, " ");

  return {
    clean: errors.length === 0,
    sanitized: text,
    errors,
    warnings,
  };
}

/**
 * Validate an email address.
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  const trimmed = (email ?? "").trim();
  if (!trimmed) return { valid: false, error: "Email is required" };
  if (!EMAIL_RE.test(trimmed)) return { valid: false, error: "Invalid email format" };
  if (trimmed.length > 254) return { valid: false, error: "Email is too long" };
  return { valid: true };
}

/**
 * Sanitize multiple fields at once (e.g. form submit).
 */
export function sanitizeForm<T extends Record<string, string>>(
  fields: T,
  fieldOptions?: Partial<Record<keyof T, SanitizeOptions>>,
): {
  clean: boolean;
  sanitized: Partial<T>;
  errors: Partial<Record<keyof T, string[]>>;
  warnings: Partial<Record<keyof T, string[]>>;
} {
  const sanitized: any = {};
  const errors: any = {};
  const warnings: any = {};
  let allClean = true;

  for (const [key, value] of Object.entries(fields)) {
    const opts = fieldOptions?.[key as keyof T];
    const result = sanitizeInput(value as string, opts);
    sanitized[key as keyof T] = result.sanitized;
    if (result.errors.length > 0) {
      errors[key as keyof T] = result.errors;
      allClean = false;
    }
    if (result.warnings.length > 0) {
      warnings[key as keyof T] = result.warnings;
    }
  }

  return { clean: allClean, sanitized, errors, warnings };
}
