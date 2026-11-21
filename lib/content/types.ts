/* Editable portfolio content.
 * - `data`: facts that are the same in every language (name, links, skills, dates, project links…) — defaults in lib/data.ts
 * - `i18n[lang][section]`: the words shown on the page per language — defaults in lib/i18n/<lang>.json
 * Only what the owner changed is stored (whole sections), everything else falls back to the code defaults. */
import * as base from "../data";
import type { Lang } from "../i18n/LanguageContext";

export type BaseData = {
  profile: typeof base.profile;
  roleRotator: string[];
  skills: base.SkillGroup[];
  experience: base.Job[];
  projects: base.Project[];
  certifications: typeof base.certifications;
  languages: typeof base.languages;
  education: typeof base.education;
  seo: typeof base.seo;
};
export type DataKey = keyof BaseData;

export const DEFAULT_DATA: BaseData = {
  profile: base.profile,
  roleRotator: base.roleRotator,
  skills: base.skills,
  experience: base.experience,
  projects: base.projects,
  certifications: base.certifications,
  languages: base.languages,
  education: base.education,
  seo: base.seo,
};
export const DATA_KEYS = Object.keys(DEFAULT_DATA) as DataKey[];

/** Text sections of the dictionaries the owner may edit (UI chrome like menus and tools stays in code). */
export const TEXT_SECTIONS = ["hero", "about", "stats", "services", "experienceData", "projectsData", "credentialsData", "faq", "contact", "footer", "seo"] as const;
export type TextSection = (typeof TEXT_SECTIONS)[number];

export type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };
export interface Overrides {
  data?: Partial<BaseData>;
  i18n?: Partial<Record<Lang, Partial<Record<TextSection, JsonValue>>>>;
  updatedAt?: number;
}

export function mergeData(o?: Overrides): BaseData {
  return { ...DEFAULT_DATA, ...(o?.data ?? {}) } as BaseData;
}
