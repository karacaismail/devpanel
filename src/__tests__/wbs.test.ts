import { describe, expect, it } from "vitest";
import { totalSp, validatePlan } from "../lib/wbs";
import type { WbsNode } from "../lib/wbs";

const good: WbsNode = {
  id: "1",
  name: "marketplace",
  level: "dag",
  children: [
    {
      id: "2",
      name: "sales",
      level: "kaya",
      children: [{ id: "3", name: "listing", level: "buyuk-tas" }],
    },
  ],
};

const skipping: WbsNode = {
  id: "1",
  name: "marketplace",
  level: "dag",
  children: [{ id: "x", name: "fiyat", level: "cakil" }],
};

describe("WBS plan doğrulama (P10 — komşuluk kuralı ağaçta)", () => {
  it("komşu seviyeli ağaç geçerli", () => {
    expect(validatePlan(good)).toHaveLength(0);
  });

  it("seviye atlayan plan kaydedilemez", () => {
    const v = validatePlan(skipping);
    expect(v).toHaveLength(1);
    expect(v[0].nodeId).toBe("x");
    expect(v[0].message).toMatch(/Seviye atlanamaz/);
  });

  it("SP toplamı alt ağaçtan toplanır", () => {
    expect(totalSp(good)).toBe(34 + 21 + 13);
  });
});
