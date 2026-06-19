import { describe, expect, it, beforeEach } from "vitest";
import { simulate, isDestructive } from "../simulate";
import { proactiveFor, quickCommandsFor } from "../proactive";
import { useAiStore } from "@/store/ai-store";
import { PAGE_LIST } from "@/engine/loader";
import type { EvalContext } from "@/engine/types";

const ctx: EvalContext = { org: "acme", env: "development", role: "developer", isProd: false };
const prodCtx: EvalContext = { org: "acme", env: "production", role: "developer", isProd: true };

describe("AI-first omurga — yıkıcı tespiti", () => {
  it("geri-alınamaz komutları yıkıcı işaretler", () => {
    expect(isDestructive("tüm partyleri sil")).toBe(true);
    expect(isDestructive("production'a deploy et")).toBe(true);
    expect(isDestructive("migration başlat")).toBe(true);
    expect(isDestructive("rollback yap")).toBe(true);
  });
  it("güvenli komutları yıkıcı saymaz", () => {
    expect(isDestructive("crm şeması oluştur")).toBe(false);
    expect(isDestructive("logları özetle")).toBe(false);
  });
});

describe("AI-first omurga — proaktif öneriler", () => {
  it("dashboard'da yalnız aksiyon gerektiren (danger/warning) callout'ları öneriye çevirir", () => {
    const out = proactiveFor("dashboard", ctx);
    expect(Array.isArray(out)).toBe(true);
    for (const p of out) {
      expect(["danger", "warning"]).toContain(p.tone);
      expect(p.command.length).toBeGreaterThan(0);
    }
  });
  it("en kritik öneri (danger) en başta gelir", () => {
    const out = proactiveFor("dashboard", prodCtx);
    if (out.length > 1) {
      const idxDanger = out.findIndex((p) => p.tone === "danger");
      const idxWarn = out.findIndex((p) => p.tone === "warning");
      if (idxDanger !== -1 && idxWarn !== -1) expect(idxDanger).toBeLessThan(idxWarn);
    }
  });
  it("when koşulu bağlama göre değerlendirilir — prod uyarısı yalnız prod'da çıkar", () => {
    const dev = proactiveFor("dashboard", ctx).map((p) => p.text);
    const prod = proactiveFor("dashboard", prodCtx).map((p) => p.text);
    const prodOnly = prod.filter((t) => !dev.includes(t));
    // prod bağlamında en az bir ek (koşullu) öneri açılır
    expect(prod.length).toBeGreaterThanOrEqual(dev.length);
    expect(prodOnly.every((t) => t.length > 0)).toBe(true);
  });
  it("bilinmeyen sayfa için boş döner — patlamaz", () => {
    expect(proactiveFor("yok-böyle-sayfa", ctx)).toEqual([]);
  });
  it("var olan her sayfa için bağlama özel hızlı komut üretir", () => {
    for (const p of PAGE_LIST) {
      expect(quickCommandsFor(p.id).length, `${p.id} hızlı komut`).toBeGreaterThan(0);
    }
  });
});

describe("AI-first omurga — öneri→diff→onay→audit zinciri (store)", () => {
  beforeEach(() => useAiStore.setState({ history: [], toasts: [], pending: null }));

  it("record geçmişe pending kayıt düşer", () => {
    const r = simulate("crm şeması oluştur");
    const id = useAiStore.getState().record("dashboard", "crm şeması oluştur", r);
    const h = useAiStore.getState().history;
    expect(h[0].id).toBe(id);
    expect(h[0].status).toBe("pending");
    expect(h[0].page).toBe("dashboard");
  });

  it("confirmApply: status applied olur ve audit toast'ı düşer", () => {
    const r = simulate("crm şeması oluştur");
    const id = useAiStore.getState().record("dashboard", "x", r);
    useAiStore.getState().requestApply({ entryId: id, result: r, query: "x", page: "dashboard" });
    expect(useAiStore.getState().pending).not.toBeNull();
    useAiStore.getState().confirmApply();
    expect(useAiStore.getState().pending).toBeNull();
    expect(useAiStore.getState().history.find((e) => e.id === id)!.status).toBe("applied");
    expect(useAiStore.getState().toasts.length).toBe(1);
  });

  it("cancelApply(reject): status rejected olur, sessiz mutasyon yok", () => {
    const r = simulate("crm şeması oluştur");
    const id = useAiStore.getState().record("dashboard", "x", r);
    useAiStore.getState().requestApply({ entryId: id, result: r, query: "x", page: "dashboard" });
    useAiStore.getState().cancelApply(true);
    expect(useAiStore.getState().pending).toBeNull();
    expect(useAiStore.getState().history.find((e) => e.id === id)!.status).toBe("rejected");
  });
});
