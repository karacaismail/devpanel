import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ThemeEditor } from "../screens/ThemeEditor";

describe("Tema/Token Editörü sözleşmesi (P13)", () => {
  it("varsayılan tokenlar AA geçer, kaydet aktiftir", () => {
    render(<ThemeEditor />);
    expect(screen.getByRole("button", { name: /kaydet/i })).toBeEnabled();
  });

  it("AA altı kontrast → kaydet kilitlenir + uyarı", () => {
    render(<ThemeEditor />);
    const ink = screen.getByLabelText("token-ink");
    fireEvent.change(ink, { target: { value: "#15181f" } });
    expect(screen.getByRole("button", { name: /kaydet/i })).toBeDisabled();
    expect(screen.getAllByText(/AA/).length).toBeGreaterThan(0);
  });

  it("ekranın CLI/MCP eşdeğeri görünür", () => {
    render(<ThemeEditor />);
    expect(screen.getByText(/sdk theme apply/)).toBeInTheDocument();
  });
});
