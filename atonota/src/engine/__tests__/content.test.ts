import { describe, expect, it } from "vitest";
import { PAGES, PAGE_LIST, NAV, RULES, getPage } from "../loader";
import { REGISTRY } from "../registry";

describe("içerik bütünlüğü — JSON kontrolü", () => {
  it("sayfalar yüklendi ve dashboard var", () => {
    expect(PAGE_LIST.length).toBeGreaterThanOrEqual(8);
    expect(getPage("dashboard")).toBeDefined();
  });

  it("her sayfanın id/title/sections'ı var ve her section tipi registry'de tanımlı", () => {
    for (const p of PAGE_LIST) {
      expect(p.id, `${p.id} id`).toBeTruthy();
      expect(p.title, `${p.id} title`).toBeTruthy();
      expect(Array.isArray(p.sections), `${p.id} sections dizi`).toBe(true);
      for (const s of p.sections) {
        expect(REGISTRY[s.type], `bilinmeyen section tipi: ${s.type} (${p.id})`).toBeDefined();
      }
    }
  });

  it("nav'daki her sayfa referansı gerçek bir JSON sayfasına işaret eder", () => {
    for (const g of NAV.groups) {
      for (const it of g.items) {
        expect(PAGES[it.page], `nav → eksik sayfa: ${it.page}`).toBeDefined();
      }
    }
  });

  it("kurallar yüklendi ve prod kilidi mevcut", () => {
    expect(RULES.length).toBeGreaterThan(0);
    expect(RULES.some((r) => r.then === "lock:destructive")).toBe(true);
  });
});
