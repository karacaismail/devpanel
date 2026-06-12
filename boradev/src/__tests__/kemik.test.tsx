/**
 * KEMİK — MetaPanel regresyon sözleşmesi (CLAUDE.md kuralı: gevşetilmez).
 * Kapsam: bağlam store'u, kabuk bileşenleri, temsilci sayfalar, yeni Y-sayfaları.
 */
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useContextStore, branchFor, destructiveLocked } from "@/stores/context-store";
import { GlobalContextBar } from "@/components/layout/global-context-bar";
import { Sidebar } from "@/components/layout/sidebar";
import GovernancePage from "@/app/governance/page";
import AiPlatformPage from "@/app/ai-platform/page";
import PlatformPage from "@/app/platform/page";
import InfrastructurePage from "@/app/infrastructure/page";
import DatabasesPage from "@/app/databases/page";
import NetworkPage from "@/app/network/page";
import TracesPage from "@/app/traces/page";
import AlertsPage from "@/app/alerts/page";
import VectorsPage from "@/app/vectors/page";
import IdentityPage from "@/app/identity/page";
import SecretsPage from "@/app/secrets/page";
import MarketplacePage from "@/app/marketplace/page";
import PublisherPage from "@/app/publisher/page";
import BillingPage from "@/app/billing/page";

describe("K1 — bağlam store'u", () => {
  it("env değişimi store'a yazılır; prod yıkıcı eylemleri kilitler", () => {
    useContextStore.setState({ env: "development" });
    expect(destructiveLocked(useContextStore.getState().env)).toBe(false);
    useContextStore.getState().setEnv("production");
    expect(useContextStore.getState().env).toBe("production");
    expect(destructiveLocked("production")).toBe(true);
    expect(branchFor("production")).toMatch(/main/);
    useContextStore.setState({ env: "development" });
  });

  it("ContextBar prod seçiminde onay ister; onayla store güncellenir", async () => {
    const user = userEvent.setup();
    useContextStore.setState({ env: "development" });
    render(<GlobalContextBar />);
    await user.click(screen.getByRole("button", { name: "prod" }));
    expect(screen.getByRole("dialog", { name: /prod onayı/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /prod'a geç/i }));
    expect(useContextStore.getState().env).toBe("production");
    useContextStore.setState({ env: "development" });
  });
});

describe("Kabuk — sidebar", () => {
  it("görev-tabanlı gruplar var; akordeon tek-açık çalışır", async () => {
    const user = userEvent.setup();
    render(<Sidebar />);
    for (const g of ["Tasarla", "Yürüt", "Kontrol Et", "AI", "Platform"]) {
      expect(screen.getByRole("button", { name: new RegExp(g) })).toBeInTheDocument();
    }
    await user.click(screen.getByRole("button", { name: /Tasarla/ }));
    expect(screen.getByRole("button", { name: /Tasarla/ })).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getByRole("button", { name: /Yürüt/ }));
    expect(screen.getByRole("button", { name: /Tasarla/ })).toHaveAttribute("aria-expanded", "false");
  });
});

const PAGES: Array<[string, () => React.ReactNode, RegExp]> = [
  ["governance", GovernancePage, /Yönetişim/],
  ["ai-platform", AiPlatformPage, /AI Katmanı/],
  ["platform", PlatformPage, /Engines/],
  ["infrastructure", InfrastructurePage, /Sunucu Filosu/],
  ["databases", DatabasesPage, /Veritabanları/],
  ["network", NetworkPage, /CDN/],
  ["traces", TracesPage, /Trace/],
  ["alerts", AlertsPage, /Uyarılar/],
  ["vectors", VectorsPage, /Vektör/],
  ["identity", IdentityPage, /Kimlik/],
  ["secrets", SecretsPage, /Sırlar/],
  ["marketplace", MarketplacePage, /Pazar Yeri/],
  ["publisher", PublisherPage, /Yayıncı/],
  ["billing", BillingPage, /Faturalama/],
];

describe("Sayfalar — çöküşsüz render + CLI/MCP eşdeğeri", () => {
  for (const [name, Page, title] of PAGES) {
    it(`${name} render olur ve agent eşdeğeri taşır`, () => {
      const { unmount } = render(<Page />);
      expect(screen.getAllByText(title).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/agent eşdeğeri/i).length).toBeGreaterThan(0);
      unmount();
    });
  }
});
