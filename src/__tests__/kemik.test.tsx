/**
 * KEMİK TESTİ — uygulama iskeletinin regresyon sözleşmesi.
 *
 * Bu dosya, panelin "bozulmaması gereken" davranışlarını kilitler:
 *   1. Kayıt defterindeki TÜM ekranlar çöküşsüz render olur.
 *   2. Overview hariç her ekran CLI/MCP eşdeğeri (EquivalencePanel) taşır
 *      (devpanel.md kabul kriteri — AI-first ilke #1).
 *   3. Kabuk: breadcrumb'lı TopBar + tıklanabilir durum çubuğu her zaman var.
 *
 * KURAL: Yeni özellik bu testi KIRMADAN eklenir. Bu dosyadaki beklentiler
 * ancak ürün kararı değişirse ve bilinçli olarak güncellenir.
 */
import { describe, expect, it } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "../App";
import { SCREEN_REGISTRY } from "../lib/navigation";
import { useUiStore } from "../lib/store";

function renderApp() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <App />
    </QueryClientProvider>,
  );
}

describe("KEMİK — iskelet regresyon sözleşmesi", () => {
  // Bilinçli güncellemeler: +3 (Tenants, Ayarlar, Fragments), +3 (Releases,
  // Events, Eğitim Yolu), +5 (Ahmet birleştirmesi: ERD, Scheduler, Webhooks,
  // E-posta Şablonları, Health).
  // +5 (Ahmet 2. parti: Media, Reports, Terminal, Roles, Code Editor).
  it("kayıt defteri 31 ekranı kilitler", () => {
    expect(SCREEN_REGISTRY).toHaveLength(31);
  });

  it("tüm ekranlar render olur; Overview hariç hepsi agent eşdeğeri taşır", async () => {
    renderApp();

    for (const meta of SCREEN_REGISTRY) {
      act(() => useUiStore.getState().setScreen(meta.id));

      if (meta.id === "overview") {
        expect(await screen.findByText(/marketplace · acme/)).toBeInTheDocument();
      } else {
        const panels = await screen.findAllByText(/Bu ekranın agent eşdeğeri/);
        expect(panels.length, `${meta.id} ekranında EquivalencePanel yok`).toBeGreaterThan(0);
      }
    }
  });

  it("kabuk: breadcrumb, ⌘K arama, bildirim, durum çubuğu her zaman var", async () => {
    renderApp();
    act(() => useUiStore.getState().setScreen("overview"));

    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /bildirimler/i })).toBeInTheDocument();
    expect(screen.getByText(/Ara \/ Komut/)).toBeInTheDocument();
    // durum çubuğu (footer): conformance + migration + DLQ kısayolları
    const statusbar = within(screen.getByRole("contentinfo"));
    expect(statusbar.getByRole("button", { name: /conformance/i })).toBeInTheDocument();
    expect(statusbar.getByRole("button", { name: /migration kuyruğu/i })).toBeInTheDocument();
    expect(statusbar.getByRole("button", { name: /DLQ/ })).toBeInTheDocument();
  });

  it("deep-link: ekran değişimi hash'e yazılır", async () => {
    renderApp();
    act(() => useUiStore.getState().setScreen("migration"));
    expect(window.location.hash).toBe("#migration");
  });
});
