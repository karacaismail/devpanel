import { describe, expect, it } from "vitest";
import { filterMarkup, displacementDataUri } from "../displacement";
import { setConfig, getConfig, subscribe } from "../core";
import { DEFAULTS } from "../types";

describe("liquid-glass displacement", () => {
  it("filtre feImage + feDisplacementMap içerir; scale derinliği yansıtır", () => {
    const m = filterMarkup("t1", { ...DEFAULTS, depth: 50, chroma: 2 });
    expect(m).toContain("feImage");
    expect(m).toContain("feDisplacementMap");
    expect(m).toContain('scale="50"'); // yeşil kanal = depth
    expect(m).toContain('scale="52"'); // kırmızı = depth + chroma (kromatik aberasyon)
    expect(m).toContain('scale="48"'); // mavi = depth - chroma
    expect(m).toContain("feGaussianBlur");
  });
  it("displacement haritası radius'a göre değişir (edge-lens)", () => {
    const a = displacementDataUri({ ...DEFAULTS, radius: 8 });
    const b = displacementDataUri({ ...DEFAULTS, radius: 40 });
    expect(a).not.toBe(b);
    expect(a.startsWith("data:image/svg+xml")).toBe(true);
  });
  it("edge şiddeti gradyan kontrastını değiştirir", () => {
    const lo = filterMarkup("e1", { ...DEFAULTS, edge: 0.1 });
    const hi = filterMarkup("e2", { ...DEFAULTS, edge: 0.9 });
    expect(lo).not.toBe(hi);
  });
});

describe("liquid-glass reaktif config (JS değişince UI güncellenir)", () => {
  it("setConfig dinleyicileri tetikler ve config'i günceller", () => {
    let seen = 0;
    const unsub = subscribe(() => (seen += 1));
    setConfig({ depth: 77 });
    expect(getConfig().depth).toBe(77);
    expect(seen).toBe(1);
    setConfig({ blur: 5 });
    expect(getConfig().blur).toBe(5);
    expect(seen).toBe(2);
    unsub();
    setConfig({ depth: 10 });
    expect(seen).toBe(2); // abonelik kalktı
  });
});
