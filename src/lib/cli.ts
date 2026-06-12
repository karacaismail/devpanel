import type { PanelAction, ScaffoldPreview } from "./types";
import { checkNeighborhood, getLevel, type ParsedCommand } from "./granularity";
import type { GranularityLevel } from "./types";

/** Panel aksiyonu → `sdk …` komutu (AI-first ilke #1: her aksiyonun CLI eşdeğeri). */
export function toCli(action: PanelAction): string {
  const cmd = action.tool.replace(/^sdk\./, "").split(".").join(" ");
  const flags = Object.entries(action.args)
    .map(([k, v]) =>
      typeof v === "boolean" ? (v ? `--${k}` : "") : `--${k} ${String(v)}`,
    )
    .filter(Boolean)
    .join(" ");
  return `sdk ${cmd}${flags ? " " + flags : ""}`;
}

/** Panel aksiyonu → MCP tool çağrısı (JSON). */
export function toMcp(action: PanelAction): string {
  return JSON.stringify({ tool: action.tool, arguments: action.args }, null, 2);
}

function testFileFor(name: string, level: GranularityLevel): string {
  return `tests/${name}.contract.test.ts`;
}

function defFileFor(name: string, level: GranularityLevel): string {
  switch (level.id) {
    case "dag":
      return `apps/${name}/app.yaml`;
    case "kaya":
      return `domains/${name}/domain.yaml`;
    case "buyuk-tas":
      return `archetypes/${name}.yaml`;
    case "orta-tas":
      return `surfaces/${name}.surface.yaml`;
    case "kucuk-tas":
      return `fragments/${name}.fragment.yaml`;
    case "cakil":
      return `archetypes/_fields/${name}.field.yaml`;
  }
}

/**
 * Scaffold ÖNİZLEMESİ (P0: yazma yok). Sıra sözleşmesi (be-sdk):
 * test dosyası HER ZAMAN ilk eleman.
 */
export function buildScaffoldPreview(
  cmd: ParsedCommand,
  context: GranularityLevel = getLevel("dag"),
): ScaffoldPreview {
  const check = checkNeighborhood(context, cmd.level);
  if (!check.ok) {
    return { ok: false, violation: check.message, files: [] };
  }
  const action: PanelAction = {
    tool: "sdk.scaffold",
    args: { name: cmd.name, level: cmd.level.id, "test-first": true },
  };
  return {
    ok: true,
    name: cmd.name,
    level: cmd.level,
    action,
    files: [
      {
        path: testFileFor(cmd.name, cmd.level),
        kind: "test",
        content: [
          `import { describe, it, expect } from "vitest";`,
          ``,
          `// KIRMIZI başlar — tanım bu testi yeşile çevirene kadar iş bitmedi.`,
          `describe("${cmd.name} (${cmd.level.ad}) sözleşmesi", () => {`,
          `  it("tanım şemaya uyar", () => { expect.fail("henüz tanım yok"); });`,
          `  it("komşu tenant okuyamaz", () => { expect.fail("RLS testi bekliyor"); });`,
          `});`,
        ].join("\n"),
      },
      {
        path: defFileFor(cmd.name, cmd.level),
        kind: "definition",
        content: [
          `# ${cmd.name} — ${cmd.level.ad} (${cmd.level.metafor} · ${cmd.level.sp})`,
          `name: ${cmd.name}`,
          `level: ${cmd.level.id}`,
          `flags:`,
          `  pii: false      # zorunlu seçim — kaydetmeden önce işaretle`,
          `  bitemporal: false`,
          `  retention: null`,
          `  audit: true`,
        ].join("\n"),
      },
    ],
  };
}
