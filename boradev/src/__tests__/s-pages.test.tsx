/**
 * S-yaması sözleşmesi — Atonota raporu S1–S17 + Q4 sonrası:
 * derinleştirilen sayfalar çöküşsüz render olur ve agent eşdeğeri taşır.
 * (Tam liste yerelde/CI'da koşar; monaco gibi ağır bağımlılıklar dahil.)
 */
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Schema from "@/app/schema/page";
import Erd from "@/app/erd/page";
import Forms from "@/app/forms/page";
import Workflows from "@/app/workflows/page";
import Permissions from "@/app/permissions/page";
import Logs from "@/app/logs/page";
import Health from "@/app/health/page";
import Settings from "@/app/settings/page";
import Docs from "@/app/docs/page";
import Modules from "@/app/modules/page";
import Reports from "@/app/reports/page";
import Tenants from "@/app/tenants/page";
import Deployments from "@/app/deployments/page";
import Governance from "@/app/governance/page";
import AiPlatform from "@/app/ai-platform/page";
import AgentRuns from "@/app/agent-runs/page";
import Migration from "@/app/migration/page";
import Dependencies from "@/app/dependencies/page";

const PAGES: Array<[string, () => React.ReactNode]> = [
  ["schema", Schema], ["erd", Erd], ["forms", Forms], ["workflows", Workflows],
  ["permissions", Permissions], ["logs", Logs], ["health", Health],
  ["settings", Settings], ["docs", Docs], ["modules", Modules], ["reports", Reports],
  ["tenants", Tenants], ["deployments", Deployments], ["governance", Governance],
  ["ai-platform", AiPlatform], ["agent-runs", AgentRuns], ["migration", Migration],
  ["dependencies", Dependencies],
];

describe("S-yamalı sayfalar — render + CLI/MCP eşdeğeri", () => {
  for (const [name, Page] of PAGES) {
    it(`${name}`, () => {
      const { unmount } = render(<Page />);
      expect(screen.getAllByText(/agent eşdeğeri/i).length).toBeGreaterThan(0);
      unmount();
    });
  }
});

describe("S1 — tenant yaşam döngüsü", () => {
  it("provizyon sihirbazı ve detay sekmeleri sözleşmesi", () => {
    render(<Tenants />);
    expect(screen.getByRole("button", { name: /yeni tenant/i })).toBeInTheDocument();
    expect(screen.getAllByText(/MAU/).length).toBeGreaterThan(0); // filo metrikleri
  });
});
