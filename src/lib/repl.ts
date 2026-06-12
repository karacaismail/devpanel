/**
 * Terminal/REPL çekirdeği — Ahmet'in repl.ts kavramı. `sdk` CLI köprüsünün
 * panel-içi simülasyonu: panel ne yapıyorsa CLI de yapar (AI-first ilke #1).
 * Bilinmeyen komut hata + öneri döner — demo asla kırılmaz.
 */
import { ARCHETYPES, SURFACES } from "../data/archetypes";
import { JOBS } from "../data/integrations";
import { MCP_TOOLS, SDK_CHECK_OUTPUT } from "../data/ops";
import { LEVELS, formatBadge } from "./granularity";

export interface ReplResult {
  out: string;
  tone: "ok" | "err";
}

const HELP = `kullanılabilir komutlar:
  help                    bu liste
  sdk archetype list      ArcheType tanımları
  sdk surface list        Surface projeksiyonları
  sdk job list            zamanlanmış işler
  sdk mcp list            MCP tool kataloğu
  sdk levels              granülerlik cetveli
  sdk check               sözleşme conformance
  clear                   ekranı temizle`;

export function execute(cmd: string): ReplResult {
  const c = cmd.trim().replace(/\s+/g, " ");
  switch (c) {
    case "help":
      return { out: HELP, tone: "ok" };
    case "sdk archetype list":
      return {
        out: ARCHETYPES.map(
          (a) => `${a.id.padEnd(12)} scope=${a.scope.padEnd(6)} pii=${a.flags.pii} alan=${a.fields.length}`,
        ).join("\n"),
        tone: "ok",
      };
    case "sdk surface list":
      return {
        out: SURFACES.map((s) => `${s.id.padEnd(16)} projeksiyon=${s.archetype} headless=${s.headless}`).join("\n"),
        tone: "ok",
      };
    case "sdk job list":
      return {
        out: JOBS.map((j) => `${j.id.padEnd(18)} ${j.cron.padEnd(14)} ${j.enabled ? "aktif" : "duraklatıldı"}`).join("\n"),
        tone: "ok",
      };
    case "sdk mcp list":
      return { out: MCP_TOOLS.map((t) => `${t.name.padEnd(24)} ${t.ops}`).join("\n"), tone: "ok" };
    case "sdk levels":
      return { out: LEVELS.map((l) => formatBadge(l)).join("\n"), tone: "ok" };
    case "sdk check":
      return { out: SDK_CHECK_OUTPUT, tone: "ok" };
    default:
      return {
        out: `bilinmeyen komut: "${c}" — \`help\` ile katalogu gör.`,
        tone: "err",
      };
  }
}
