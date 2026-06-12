import type { NavDef, PageDef, Rule } from "./types";

/**
 * İçerik yükleyici — tüm JSON content/ altından eager import edilir.
 * Vite, JSON dosyaları değişince HMR ile bu modülü yeniden değerlendirir;
 * böylece "JSON değişince dinamik render" otomatik olur.
 */
const pageModules = import.meta.glob<{ default: PageDef }>("../../content/pages/*.json", { eager: true });

export const PAGES: Record<string, PageDef> = Object.fromEntries(
  Object.values(pageModules).map((m) => [m.default.id, m.default]),
);

export const PAGE_LIST: PageDef[] = Object.values(PAGES).sort((a, b) => a.title.localeCompare(b.title, "tr"));

import navJson from "../../content/nav.json";
import rulesJson from "../../content/rules.json";

export const NAV: NavDef = navJson as NavDef;
export const RULES: Rule[] = (rulesJson as { rules: Rule[] }).rules;

export function getPage(id: string): PageDef | undefined {
  return PAGES[id];
}
