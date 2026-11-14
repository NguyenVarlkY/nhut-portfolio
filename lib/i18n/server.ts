import en from "./en.json";
import vi from "./vi.json";
import ko from "./ko.json";
import zh from "./zh.json";
import ja from "./ja.json";
import de from "./de.json";
import fr from "./fr.json";
import type { Lang } from "./LanguageContext";

const DICTS: Record<Lang, Record<string, any>> = { en, vi, ko, zh, ja, de, fr };

/** Server-side translation lookup (no React context) — for Server Components. */
export function st(lang: Lang, path: string): string {
  const keys = path.split(".");

  let result: any = DICTS[lang];
  for (const k of keys) {
    if (result == null) break;
    result = result[k];
  }
  if (typeof result === "string") return result;

  let fallback: any = en;
  for (const k of keys) {
    if (fallback == null) return path;
    fallback = fallback[k];
  }
  return typeof fallback === "string" ? fallback : path;
}
