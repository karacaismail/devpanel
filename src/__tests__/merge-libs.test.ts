/** Ahmet birleştirmesi — taşınan saf lib'lerin kontrat testleri. */
import { describe, expect, it } from "vitest";
import { describeCron, nextRuns, parseCron } from "../lib/cron";
import { extractVariables, renderTemplate } from "../lib/template";
import { buildErd } from "../lib/erd";
import { ARCHETYPES } from "../data/archetypes";
import type { ArcheTypeDef } from "../lib/types";

describe("cron (Scheduler çekirdeği)", () => {
  it("5 alanlı ifadeyi çözer: *, liste, aralık, adım", () => {
    const p = parseCron("*/15 9-11 1,15 * 1-5");
    expect(p.minute.values).toEqual([0, 15, 30, 45]);
    expect(p.hour.values).toEqual([9, 10, 11]);
    expect(p.dayOfMonth.values).toEqual([1, 15]);
    expect(p.month.wildcard).toBe(true);
    expect(p.dayOfWeek.values).toEqual([1, 2, 3, 4, 5]);
  });

  it("geçersiz ifade fırlatır", () => {
    expect(() => parseCron("* * *")).toThrow();
    expect(() => parseCron("99 * * * *")).toThrow();
  });

  it("Türkçe açıklama üretir", () => {
    expect(describeCron("*/5 * * * *")).toMatch(/5 dakikada bir/);
    expect(describeCron("0 3 * * *")).toMatch(/her gün 03:00/i);
    expect(describeCron("0 9 * * 1")).toMatch(/Pazartesi/);
  });

  it("sonraki çalışmaları hesaplar", () => {
    const from = new Date("2026-06-12T10:20:00");
    const runs = nextRuns("0 6 * * *", from, 2);
    expect(runs[0].getHours()).toBe(6);
    expect(runs[0].getDate()).toBe(13);
    expect(runs[1].getDate()).toBe(14);
  });
});

describe("template ({{değişken}} motoru — EmailTemplates çekirdeği)", () => {
  it("değişkenleri ilk-görülme sırasıyla, tekilleştirip çıkarır", () => {
    expect(extractVariables("Merhaba {{ad}}, {{ app }} seni bekliyor. {{ad}}!")).toEqual(["ad", "app"]);
    expect(extractVariables("{{user.email}}")).toEqual(["user.email"]);
  });

  it("doldurur; eksik değişken {{aynen}} kalır", () => {
    const out = renderTemplate("Sayın {{ad}}, borç: {{tutar}}", { ad: "İsmail" });
    expect(out).toBe("Sayın İsmail, borç: {{tutar}}");
  });
});

describe("ERD türetme (şema ilişki haritası)", () => {
  it("ref alanlarından kenar üretir: listing.seller → party", () => {
    const erd = buildErd(ARCHETYPES);
    expect(erd.nodes.map((n) => n.id)).toEqual(expect.arrayContaining(["party", "listing"]));
    const edge = erd.edges.find((e) => e.field === "seller");
    expect(edge).toMatchObject({ from: "listing", to: "party", broken: false });
  });

  it("hedefi olmayan ref kırık ilişki olarak işaretlenir", () => {
    const broken: ArcheTypeDef = {
      ...ARCHETYPES[1],
      id: "invoice",
      name: "Invoice",
      fields: [{ name: "customer", type: "ref(ghost)", required: true }],
    };
    const erd = buildErd([...ARCHETYPES, broken]);
    const e = erd.edges.find((x) => x.from === "invoice");
    expect(e?.broken).toBe(true);
    expect(erd.nodes.find((n) => n.id === "invoice")?.hasBrokenRelation).toBe(true);
  });
});
