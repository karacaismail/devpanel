import { describe, expect, it } from "vitest";
import { contrastRatio, hexToRgb, meetsAA } from "../lib/contrast";

describe("AA kontrast bekçisi (P13)", () => {
  it("hex çözümleme", () => {
    expect(hexToRgb("#ffffff")).toEqual([255, 255, 255]);
    expect(hexToRgb("0b0e14")).toEqual([11, 14, 20]);
    expect(hexToRgb("kırmızı")).toBeNull();
  });

  it("siyah/beyaz oranı 21:1", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 0);
  });

  it("varsayılan tema AA geçer", () => {
    expect(meetsAA("#e7eaf2", "#0b0e14")).toBe(true); // ink/bg
    expect(meetsAA("#7fb1ff", "#0b0e14")).toBe(true); // accent/bg
  });

  it("düşük kontrast AA'dan kalır", () => {
    expect(meetsAA("#15181f", "#0b0e14")).toBe(false);
  });
});
