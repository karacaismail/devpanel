import { describe, expect, it } from "vitest";
import {
  LISTING_FLOW,
  canTransition,
  missingCompensations,
  pinnedVersion,
} from "../lib/workflow";

describe("Workflow sözleşmesi (P3 — layer1-workflow)", () => {
  it("yalnız tanımlı geçişler çizilebilir/yürütülebilir", () => {
    expect(canTransition(LISTING_FLOW, "draft", "review")).toBe(true);
    expect(canTransition(LISTING_FLOW, "draft", "sold")).toBe(false);
    expect(canTransition(LISTING_FLOW, "yok", "review")).toBe(false);
  });

  it("telafi (compensation) zorunlu — eksikler raporlanır", () => {
    const missing = missingCompensations(LISTING_FLOW);
    expect(missing.length).toBeGreaterThan(0);
    expect(missing[0]).toMatchObject({ from: "active", to: "sold" });
  });

  it("tenant pinleme: pin varsa pin, yoksa güncel sürüm", () => {
    expect(pinnedVersion(LISTING_FLOW, "acme")).toBe(2);
    expect(pinnedVersion(LISTING_FLOW, "globex")).toBe(LISTING_FLOW.version);
  });
});
