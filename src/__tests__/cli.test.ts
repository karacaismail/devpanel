import { describe, expect, it } from "vitest";
import { buildScaffoldPreview, toCli, toMcp } from "../lib/cli";
import { getLevel, parseCommand } from "../lib/granularity";

describe("CLI/MCP eşdeğerliği (AI-first ilke #1)", () => {
  const action = {
    tool: "sdk.scaffold",
    args: { name: "crm", level: "kaya", "test-first": true },
  };

  it("aksiyon → sdk komutu", () => {
    expect(toCli(action)).toBe("sdk scaffold --name crm --level kaya --test-first");
  });

  it("aksiyon → MCP çağrısı (geçerli JSON)", () => {
    const parsed = JSON.parse(toMcp(action));
    expect(parsed.tool).toBe("sdk.scaffold");
    expect(parsed.arguments.name).toBe("crm");
  });
});

describe("scaffold önizlemesi (test-önce sözleşmesi)", () => {
  it("test dosyası HER ZAMAN ilk sırada", () => {
    const p = buildScaffoldPreview(parseCommand("crm kaya yap")!, getLevel("dag"));
    expect(p.ok).toBe(true);
    expect(p.files.length).toBeGreaterThanOrEqual(2);
    expect(p.files[0].kind).toBe("test");
    expect(p.files[0].path).toMatch(/\.test\.ts$/);
  });

  it("komşuluk ihlali → önizleme yok, ihlal mesajı var", () => {
    const p = buildScaffoldPreview(parseCommand("fiyat alan yap")!, getLevel("dag"));
    expect(p.ok).toBe(false);
    expect(p.files).toHaveLength(0);
    expect(p.violation).toMatch(/Seviye atlanamaz/);
  });
});
