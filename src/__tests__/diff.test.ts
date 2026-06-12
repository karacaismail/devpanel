import { describe, expect, it } from "vitest";
import { diffSchemas, migrationSteps } from "../lib/diff";

const before = [
  { name: "title", type: "string", required: true },
  { name: "phone", type: "phone", required: true, pii: true },
  { name: "legacy_code", type: "string" },
];
const after = [
  { name: "title", type: "string", required: true },
  { name: "phone", type: "phone", required: false, pii: true },
  { name: "loyalty_tier", type: "string" },
];

describe("SchemaDiff → migration önizleme (P8/d02)", () => {
  it("ekle/sil/değiş doğru tespit edilir", () => {
    const d = diffSchemas(before, after);
    expect(d.added.map((f) => f.name)).toEqual(["loyalty_tier"]);
    expect(d.removed.map((f) => f.name)).toEqual(["legacy_code"]);
    expect(d.changed.map((c) => c.name)).toEqual(["phone"]);
  });

  it("migration sırası: önce ekle, sonra değiştir; silme en sonda ve korumalı", () => {
    const steps = migrationSteps(diffSchemas(before, after));
    expect(steps[0]).toMatch(/ADD COLUMN.*loyalty_tier/i);
    expect(steps.at(-1)).toMatch(/legacy_code/);
    expect(steps.at(-1)).toMatch(/-- GUARD/);
  });
});
