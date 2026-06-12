import { beforeEach, describe, expect, it } from "vitest";
import { logAction, useAuditStore } from "../lib/audit";

describe("Audit kaydı (layer1-audit) sözleşmesi", () => {
  beforeEach(() => useAuditStore.setState({ entries: [] }));

  it("her panel aksiyonu CLI eşdeğeriyle audit'e düşer", () => {
    logAction({ tool: "module.disable", args: { id: "review-badges" } }, "Modül devre dışı");
    const e = useAuditStore.getState().entries[0];
    expect(e.summary).toBe("Modül devre dışı");
    expect(e.cli).toBe("sdk module disable --id review-badges");
    expect(e.actor).toBeTruthy();
    expect(e.ts).toBeTruthy();
  });

  it("en yeni kayıt başta; tampon 200 ile sınırlı", () => {
    for (let i = 0; i < 205; i++) {
      logAction({ tool: "x.y", args: { i } }, `aksiyon ${i}`);
    }
    const entries = useAuditStore.getState().entries;
    expect(entries).toHaveLength(200);
    expect(entries[0].summary).toBe("aksiyon 204");
  });
});
