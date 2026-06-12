import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ArchetypeStudio } from "../screens/ArchetypeStudio";
import { SurfaceBuilder } from "../screens/SurfaceBuilder";
import { ARCHETYPES, SURFACES } from "../data/archetypes";

describe("ArcheType Studio (P1) sözleşmesi", () => {
  it("listeler; kernel-paylaşımlı ArcheType rozet taşır", () => {
    render(<ArchetypeStudio archetypes={ARCHETYPES} />);
    expect(screen.getAllByText("Party").length).toBeGreaterThan(0);
    expect(screen.getAllByText("kernel").length).toBeGreaterThan(0);
  });

  it("bayraklar görünür ve 'doğurdukları' sekmesi türetilenleri gösterir", async () => {
    const user = userEvent.setup();
    render(<ArchetypeStudio archetypes={ARCHETYPES} />);
    expect(screen.getAllByText(/pii/i).length).toBeGreaterThan(0);
    await user.click(screen.getByRole("tab", { name: /doğurdukları/i }));
    expect(await screen.findByText(/ten_party/)).toBeInTheDocument();
  });

  it("ekranın CLI/MCP eşdeğeri görünür (kabul kriteri)", () => {
    render(<ArchetypeStudio archetypes={ARCHETYPES} />);
    expect(screen.getByText(/sdk archetype read --id party/)).toBeInTheDocument();
  });
});

describe("Surface Builder (P2) sözleşmesi", () => {
  it("headless anahtarı: açılınca surface:none boş-durum kartı", async () => {
    const user = userEvent.setup();
    render(<SurfaceBuilder surfaces={SURFACES} />);
    const emptyState = /surface:\s*none — bu projeksiyon UI üretmez/i;
    expect(screen.queryByText(emptyState)).toBeNull();
    await user.click(screen.getByRole("switch", { name: /headless/i }));
    expect(await screen.findByText(emptyState)).toBeInTheDocument();
  });

  it("edition_overrides görünür", () => {
    render(<SurfaceBuilder surfaces={SURFACES} />);
    expect(screen.getAllByText(/edition/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/lite/).length).toBeGreaterThan(0);
  });

  it("ekranın CLI/MCP eşdeğeri görünür (kabul kriteri)", () => {
    render(<SurfaceBuilder surfaces={SURFACES} />);
    expect(screen.getByText(/sdk surface read/)).toBeInTheDocument();
  });
});
