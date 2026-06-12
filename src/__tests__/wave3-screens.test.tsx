import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Releases } from "../screens/Releases";
import { EventCatalog } from "../screens/EventCatalog";
import { LearnPath } from "../screens/LearnPath";

describe("Sürümler (sus-versioning) sözleşmesi", () => {
  it("şema sürümleri ve changelog listelenir; güncel işaretli", () => {
    render(<Releases />);
    expect(screen.getAllByText(/2026-06/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/güncel/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/changelog/i).length).toBeGreaterThan(0);
  });

  it("tenant pinleri görünür ve değiştirilebilir", async () => {
    const user = userEvent.setup();
    render(<Releases />);
    const pin = screen.getByLabelText(/acme pin/i);
    await user.selectOptions(pin, "2026-06");
    expect((pin as HTMLSelectElement).value).toBe("2026-06");
  });

  it("CLI/MCP eşdeğeri görünür", () => {
    render(<Releases />);
    expect(screen.getByText(/sdk release list/)).toBeInTheDocument();
  });
});

describe("Event Kataloğu sözleşmesi", () => {
  it("event'ler payload şeması ve abonelerle listelenir", () => {
    render(<EventCatalog />);
    expect(screen.getAllByText(/order\.completed/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/billing/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/payload/i).length).toBeGreaterThan(0);
  });

  it("CLI/MCP eşdeğeri görünür", () => {
    render(<EventCatalog />);
    expect(screen.getByText(/sdk event list/)).toBeInTheDocument();
  });
});

describe("Eğitim Yolu sözleşmesi (jr-öncesi vibecoder personası)", () => {
  it("adımlar listelenir; tamamlama ilerlemeyi günceller", async () => {
    const user = userEvent.setup();
    render(<LearnPath />);
    const before = screen.getByText(/%\d+/).textContent;
    const firstUndone = screen.getAllByRole("checkbox", { checked: false })[0];
    await user.click(firstUndone);
    expect(screen.getByText(/%\d+/).textContent).not.toBe(before);
  });

  it("her adımın ilgili ekrana bağlantısı var", () => {
    render(<LearnPath />);
    expect(screen.getAllByRole("button", { name: /ekranı aç/i }).length).toBeGreaterThanOrEqual(4);
  });

  it("CLI/MCP eşdeğeri görünür", () => {
    render(<LearnPath />);
    expect(screen.getByText(/sdk learn status/)).toBeInTheDocument();
  });
});
