import { describe, expect, it } from "vitest";
import {
  LEVELS,
  checkNeighborhood,
  formatBadge,
  getLevel,
  parseCommand,
} from "../lib/granularity";

describe("granülerlik cetveli (ADR-0008 Rev.2)", () => {
  it("seviyeler büyükten küçüğe sıralı ve rank ardışıktır", () => {
    expect(LEVELS.map((l) => l.rank)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(LEVELS[0].metafor).toBe("Dağ");
  });

  it("rozet biçimi: yeni ad önde, metafor parantezde", () => {
    expect(formatBadge(getLevel("buyuk-tas"))).toBe("ArcheType (Büyük Taş · 13)");
  });
});

describe("doğal dil komutu", () => {
  it('"crm dağ yap" → name=crm, level=dag', () => {
    const p = parseCommand("crm dağ yap");
    expect(p).not.toBeNull();
    expect(p!.name).toBe("crm");
    expect(p!.level.id).toBe("dag");
  });

  it('"listing orta taş yap" → name=listing, level=orta-tas', () => {
    const p = parseCommand("listing orta taş yap");
    expect(p!.name).toBe("listing");
    expect(p!.level.id).toBe("orta-tas");
  });

  it("seviye ya da ad yoksa null", () => {
    expect(parseCommand("yap")).toBeNull();
    expect(parseCommand("dağ yap")).toBeNull();
    expect(parseCommand("crm hede yap")).toBeNull();
  });
});

describe("komşuluk kuralı", () => {
  it("bir alt seviye eklenebilir", () => {
    expect(checkNeighborhood(getLevel("dag"), getLevel("kaya")).ok).toBe(true);
  });

  it("seviye atlanamaz", () => {
    const r = checkNeighborhood(getLevel("dag"), getLevel("cakil"));
    expect(r.ok).toBe(false);
    expect(r.message).toMatch(/Seviye atlanamaz/);
  });

  it("aynı ya da daha büyük seviye eklenemez", () => {
    expect(checkNeighborhood(getLevel("kaya"), getLevel("kaya")).ok).toBe(false);
    expect(checkNeighborhood(getLevel("kaya"), getLevel("dag")).ok).toBe(false);
  });
});
