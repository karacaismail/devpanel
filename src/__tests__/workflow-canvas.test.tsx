/**
 * Workflow Designer (canvas) kontrat testleri.
 * Figma-sınıfı tuval: düğümler, kenar seçimi, tıkla-bağla, telafi düzeltme, zoom.
 */
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WorkflowDesigner } from "../screens/WorkflowDesigner";
import { LISTING_FLOW } from "../lib/workflow";

describe("WorkflowDesigner — canvas sözleşmesi", () => {
  it("tüm durumlar düğüm olarak çizilir", () => {
    render(<WorkflowDesigner />);
    for (const s of LISTING_FLOW.states) {
      expect(screen.getByRole("button", { name: `durum: ${s}` })).toBeInTheDocument();
    }
  });

  it("kenara tıklayınca inspector geçiş detayını gösterir", async () => {
    const user = userEvent.setup();
    render(<WorkflowDesigner />);
    await user.click(screen.getByRole("button", { name: "geçiş: draft → review" }));
    const inspector = screen.getByRole("complementary");
    expect(inspector).toHaveTextContent("draft → review");
    expect(inspector).toHaveTextContent(/author/);
  });

  it("eksik telafi inspector'dan düzeltilince kırmızı uyarı kalkar", async () => {
    const user = userEvent.setup();
    render(<WorkflowDesigner />);
    expect(screen.getByText(/Telafi \(compensation\) zorunlu/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "geçiş: active → sold" }));
    await user.type(screen.getByLabelText(/telafi düzenle/i), "satışı iptal et (sold → active)");
    await user.click(screen.getByRole("button", { name: /uygula/i }));

    expect(screen.queryByText(/Telafi \(compensation\) zorunlu/)).toBeNull();
  });

  it("tıkla-bağla: porttan başlat → hedef düğüm → telafili geçiş eklenir", async () => {
    const user = userEvent.setup();
    render(<WorkflowDesigner />);
    await user.click(screen.getByRole("button", { name: "bağlantı başlat: review" }));
    await user.click(screen.getByRole("button", { name: "durum: archived" }));

    const inspector = screen.getByRole("complementary");
    expect(inspector).toHaveTextContent("review → archived");
    await user.type(screen.getByLabelText(/yeni rol/i), "moderator");
    await user.type(screen.getByLabelText(/yeni telafi/i), "arşivden çıkar");
    await user.click(screen.getByRole("button", { name: /geçişi ekle/i }));

    expect(screen.getByRole("button", { name: "geçiş: review → archived" })).toBeInTheDocument();
  });

  it("duplicate bağlantı denemesi reddedilir", async () => {
    const user = userEvent.setup();
    render(<WorkflowDesigner />);
    await user.click(screen.getByRole("button", { name: "bağlantı başlat: draft" }));
    await user.click(screen.getByRole("button", { name: "durum: review" }));
    await user.click(screen.getByRole("button", { name: /geçişi ekle/i }));
    expect(screen.getByText(/zaten tanımlı/)).toBeInTheDocument();
  });

  it("zoom kontrolleri ve yüzde göstergesi var", () => {
    render(<WorkflowDesigner />);
    expect(screen.getByRole("button", { name: /yakınlaştır/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /uzaklaştır/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sığdır/i })).toBeInTheDocument();
    expect(screen.getByText(/100%/)).toBeInTheDocument();
  });

  it("kenar silme isim-yazarak onay ister (ConfirmDanger)", async () => {
    const user = userEvent.setup();
    render(<WorkflowDesigner />);
    await user.click(screen.getByRole("button", { name: "geçiş: draft → review" }));
    await user.click(screen.getByRole("button", { name: /geçişi sil/i }));
    expect(await screen.findByLabelText(/adını yaz/i)).toBeInTheDocument();
  });
});
