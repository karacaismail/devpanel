import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ArchetypeStudio } from "../screens/ArchetypeStudio";
import { SurfaceBuilder } from "../screens/SurfaceBuilder";
import { EntityTable } from "../components/EntityTable";
import { ARCHETYPES, SURFACES } from "../data/archetypes";
import { generateRows } from "../data/rows";
import { LISTING_FLOW, validateNewTransition } from "../lib/workflow";
import { toCsv } from "../lib/csv";

describe("ArcheType Studio — Custom Field ekleme (§4-b)", () => {
  it("pii bayrağı seçilmeden eklenemez; eklenince tenant-custom rozeti taşır", async () => {
    const user = userEvent.setup();
    render(<ArchetypeStudio archetypes={ARCHETYPES} />);
    await user.click(screen.getByRole("tab", { name: /alanlar/i }));

    const addBtn = screen.getByRole("button", { name: /alan ekle/i });
    await user.type(screen.getByLabelText(/alan adı/i), "segment");
    expect(addBtn).toBeDisabled(); // pii kararı zorunlu seçim

    await user.click(screen.getByRole("radio", { name: /pii değil/i }));
    expect(addBtn).toBeEnabled();
    await user.click(addBtn);

    expect(screen.getByText("segment")).toBeInTheDocument();
    expect(screen.getAllByText(/tenant-custom \(E8\)/).length).toBeGreaterThanOrEqual(2);
  });
});

describe("Surface Builder — canlı etkileşim (§4-c)", () => {
  it("görünürlük değişimi önizlemeye ve YAML patch'e yansır", async () => {
    const user = userEvent.setup();
    render(<SurfaceBuilder surfaces={SURFACES} />);
    const preview = screen.getByRole("region", { name: /canlı önizleme/i });
    expect(within(preview).queryByText("Telefon")).toBeNull();

    await user.click(screen.getByRole("button", { name: /görünürlük: phone/i }));
    expect(within(preview).getByText("Telefon")).toBeInTheDocument();
    expect(screen.getByText(/phone.visible/)).toBeInTheDocument(); // patch diff
  });

  it("edition önizlemesi: lite, hidden alanları gizler", async () => {
    const user = userEvent.setup();
    render(<SurfaceBuilder surfaces={SURFACES} />);
    const preview = screen.getByRole("region", { name: /canlı önizleme/i });
    expect(within(preview).getByText("Şehir")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/edition önizlemesi/i), "lite");
    expect(within(preview).queryByText("Şehir")).toBeNull();
  });
});

describe("EntityTable — kolon menüsü ve satır detayı", () => {
  const rows = generateRows(10);

  it("kolon gizlenebilir", async () => {
    const user = userEvent.setup();
    render(<EntityTable rows={rows} />);
    expect(screen.getByRole("columnheader", { name: /şehir/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /kolonlar/i }));
    await user.click(screen.getByRole("checkbox", { name: /şehir/i }));
    expect(screen.queryByRole("columnheader", { name: /şehir/i })).toBeNull();
  });

  it("satıra tıklayınca detay paneli açılır; PII maskeli + audit geçmişi", async () => {
    const user = userEvent.setup();
    render(<EntityTable rows={rows} />);
    await user.click(screen.getByText(rows[0].display_name));
    const drawer = await screen.findByRole("dialog");
    expect(within(drawer).getAllByText(/\*\*\*/).length).toBeGreaterThan(0);
    expect(within(drawer).getByText(/audit geçmişi/i)).toBeInTheDocument();
  });
});

describe("CSV export — PII maskesi zorunlu", () => {
  it("çıktıda ham e-posta/telefon bulunmaz", () => {
    const rows = generateRows(5);
    const csv = toCsv(rows, ["display_name", "email", "phone", "city"]);
    expect(csv).not.toContain(rows[0].email);
    expect(csv).toContain("***@***");
    expect(csv.split("\n")).toHaveLength(6); // başlık + 5 satır
  });
});

describe("Workflow — yeni geçiş validasyonu", () => {
  it("telafi boş, duplicate, self-loop ve tanımsız durum reddedilir", () => {
    expect(validateNewTransition(LISTING_FLOW, { from: "draft", to: "review", role: "x", compensation: "y" }).ok).toBe(false); // duplicate
    expect(validateNewTransition(LISTING_FLOW, { from: "draft", to: "draft", role: "x", compensation: "y" }).ok).toBe(false); // self-loop
    expect(validateNewTransition(LISTING_FLOW, { from: "draft", to: "archived", role: "x", compensation: " " }).ok).toBe(false); // telafi zorunlu
    expect(validateNewTransition(LISTING_FLOW, { from: "draft", to: "yok", role: "x", compensation: "y" }).ok).toBe(false); // tanımsız durum
    expect(validateNewTransition(LISTING_FLOW, { from: "draft", to: "archived", role: "author", compensation: "geri al" }).ok).toBe(true);
  });
});
