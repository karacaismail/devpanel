import { describe, expect, it } from "vitest";
import { SCREEN_REGISTRY, screenFromHash, searchScreens } from "../lib/navigation";

describe("ekran navigasyonu (deep-link + arama)", () => {
  it("kayıt defteri tüm ekranları içerir ve grup taşır", () => {
    expect(SCREEN_REGISTRY.length).toBeGreaterThanOrEqual(15);
    const at = SCREEN_REGISTRY.find((s) => s.id === "archetype");
    expect(at?.group).toBe("Tanım");
  });

  it("arama: etiket ve anahtar kelimede, Türkçe-normalize eşleşir", () => {
    expect(searchScreens("arche").map((s) => s.id)).toContain("archetype");
    expect(searchScreens("şema").map((s) => s.id)).toContain("migration");
    expect(searchScreens("LOG").map((s) => s.id)).toContain("observability");
    expect(searchScreens("xyzqw")).toHaveLength(0);
  });

  it("hash → ekran: geçerliyse id, değilse null", () => {
    expect(screenFromHash("#migration")).toBe("migration");
    expect(screenFromHash("migration")).toBe("migration");
    expect(screenFromHash("#yok-boyle-ekran")).toBeNull();
    expect(screenFromHash("")).toBeNull();
  });
});
