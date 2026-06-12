// Saf Node içerik doğrulayıcı (vite/rollup gerektirmez) — content.test.ts ile aynı sözleşme.
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const REG = new Set(["prose", "metrics", "cards", "table", "badges", "code", "callout", "steps", "keyvalue", "progress", "kanban"]);
const dir = join(ROOT, "content", "pages");
const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
const pages = {};
const errs = [];

for (const f of files) {
  let p;
  try { p = JSON.parse(readFileSync(join(dir, f), "utf8")); }
  catch { errs.push(`${f}: geçersiz JSON`); continue; }
  if (!p.id) errs.push(`${f}: id yok`);
  if (!p.title) errs.push(`${f}: title yok`);
  if (!Array.isArray(p.sections)) errs.push(`${f}: sections dizi değil`);
  else for (const s of p.sections) if (!REG.has(s.type)) errs.push(`${f}: bilinmeyen tip "${s.type}"`);
  if (p.id) pages[p.id] = p;
}

const nav = JSON.parse(readFileSync(join(ROOT, "content", "nav.json"), "utf8"));
let navItems = 0;
for (const g of nav.groups) for (const it of g.items) { navItems++; if (!pages[it.page]) errs.push(`nav eksik sayfa: ${it.page}`); }

const rules = JSON.parse(readFileSync(join(ROOT, "content", "rules.json"), "utf8"));
if (!rules.rules.some((r) => r.then === "lock:destructive")) errs.push("prod kilidi kuralı yok");

console.log(`benzersiz sayfa: ${Object.keys(pages).length} · nav grup: ${nav.groups.length} · nav öğe: ${navItems} · kural: ${rules.rules.length}`);
console.log(errs.length ? "HATALAR:\n" + errs.join("\n") : "✓ içerik sözleşmesi temiz — tüm section tipleri registry'de, tüm nav sayfaları mevcut, prod kilidi var");
process.exit(errs.length ? 1 : 0);
