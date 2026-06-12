import type { GranularityLevel, LevelId } from "./types";

/** ADR-0008 Rev.2 — seviye cetveli. */
export const LEVELS: GranularityLevel[] = [
  { id: "dag", ad: "App", metafor: "Dağ", sp: 34, rank: 0 },
  { id: "kaya", ad: "Domain", metafor: "Kaya", sp: 21, rank: 1 },
  { id: "buyuk-tas", ad: "ArcheType", metafor: "Büyük Taş", sp: 13, rank: 2 },
  { id: "orta-tas", ad: "Surface/Workflow", metafor: "Orta Taş", sp: 8, rank: 3 },
  { id: "kucuk-tas", ad: "Fragment", metafor: "Küçük Taş", sp: 5, rank: 4 },
  // Alan/Attribute adı açık karar (ADR-0010 Rev.1) — UI "Alan" der.
  { id: "cakil", ad: "Alan", metafor: "Çakıl", sp: 3, rank: 5 },
];

export function getLevel(id: LevelId): GranularityLevel {
  const l = LEVELS.find((x) => x.id === id);
  if (!l) throw new Error(`Bilinmeyen seviye: ${id}`);
  return l;
}

/** Rozet biçimi: `ArcheType (Büyük Taş · 13)` — yeni ad önde, metafor parantezde. */
export function formatBadge(level: GranularityLevel): string {
  return `${level.ad} (${level.metafor} · ${level.sp})`;
}

function normalize(s: string): string {
  return s
    .toLocaleLowerCase("tr")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ı", "i")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .trim();
}

const LEVEL_WORDS: Array<{ words: string; id: LevelId }> = [
  { words: "buyuk tas", id: "buyuk-tas" },
  { words: "orta tas", id: "orta-tas" },
  { words: "kucuk tas", id: "kucuk-tas" },
  { words: "dag", id: "dag" },
  { words: "kaya", id: "kaya" },
  { words: "cakil", id: "cakil" },
  { words: "app", id: "dag" },
  { words: "domain", id: "kaya" },
  { words: "archetype", id: "buyuk-tas" },
  { words: "surface", id: "orta-tas" },
  { words: "workflow", id: "orta-tas" },
  { words: "fragment", id: "kucuk-tas" },
  { words: "alan", id: "cakil" },
];

const VERBS = ["yap", "olustur", "kur", "scaffold", "ekle"];

export interface ParsedCommand {
  name: string;
  level: GranularityLevel;
  verb: string;
}

/**
 * Doğal dil komutu: `"crm dağ yap"`, `"listing orta taş yap"`.
 * Biçim: <ad> <seviye> <fiil>
 */
export function parseCommand(input: string): ParsedCommand | null {
  const n = normalize(input);
  const verb = VERBS.find((v) => n.endsWith(` ${v}`) || n === v);
  if (!verb) return null;
  const rest = n.slice(0, n.length - verb.length).trim();
  const hit = LEVEL_WORDS.find(
    (lw) => rest === lw.words || rest.endsWith(` ${lw.words}`),
  );
  if (!hit) return null;
  const name = rest.slice(0, rest.length - hit.words.length).trim();
  if (!name) return null;
  return { name, level: getLevel(hit.id), verb };
}

export interface NeighborhoodResult {
  ok: boolean;
  message?: string;
}

/**
 * Komşuluk kuralı (ADR-0008): bir bağlamın altına yalnızca BİR ALT seviye
 * eklenebilir; seviye atlayan plan kaydedilemez.
 */
export function checkNeighborhood(
  context: GranularityLevel,
  target: GranularityLevel,
): NeighborhoodResult {
  if (target.rank === context.rank + 1) return { ok: true };
  if (target.rank <= context.rank) {
    return {
      ok: false,
      message: `${formatBadge(target)} — ${formatBadge(context)} bağlamının altına aynı ya da daha büyük seviye eklenemez.`,
    };
  }
  const skipped = LEVELS.filter(
    (l) => l.rank > context.rank && l.rank < target.rank,
  )
    .map((l) => l.ad)
    .join(" → ");
  return {
    ok: false,
    message: `Seviye atlanamaz: ${formatBadge(context)} altına doğrudan ${formatBadge(target)} eklenemez. Aradaki seviyeler: ${skipped}.`,
  };
}
