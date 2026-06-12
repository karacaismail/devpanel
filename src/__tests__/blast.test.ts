import { describe, expect, it } from "vitest";
import { blastRadius } from "../lib/blast";
import type { CapabilityScope } from "../lib/blast";

const read: CapabilityScope = {
  id: "party.read",
  label: "Party okuma",
  writes: false,
  tables: ["ten_party"],
};
const writeWide: CapabilityScope[] = [
  { id: "party.write", label: "", writes: true, tables: ["ten_party"] },
  { id: "listing.write", label: "", writes: true, tables: ["ten_listing"] },
  { id: "ledger.write", label: "", writes: true, tables: ["ten_ledger"] },
];

describe("Blast-radius önizleme (P12/d11)", () => {
  it("salt-okuma → dar, ek onay yok", () => {
    const r = blastRadius([read]);
    expect(r.level).toBe("dar");
    expect(r.needsApproval).toBe(false);
  });

  it("çok tablolu yazma → geniş, ek onay zorunlu", () => {
    const r = blastRadius(writeWide);
    expect(r.level).toBe("geniş");
    expect(r.needsApproval).toBe(true);
    expect(r.tables).toHaveLength(3);
  });
});
