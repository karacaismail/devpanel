import { describe, expect, it } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { FloatingOrb } from "../FloatingOrb";
import { Toaster } from "../Toaster";
import { AiApplyDialog } from "../AiApplyDialog";
import { Dock } from "../Dock";

/**
 * Smoke testi — AI omurga bileşenleri SONSUZ render döngüsüne girmeden mount olmalı.
 * (zustand'a inline obje/dizi selector verince React "Maximum update depth" fırlatır;
 * bu test o regresyonu kalıcı yakalar — beyaz ekran bir daha geçmesin.)
 */
describe("AI omurga — render smoke", () => {
  it("FloatingOrb sonsuz döngü olmadan render olur", () => {
    expect(() => render(<MemoryRouter><FloatingOrb /></MemoryRouter>)).not.toThrow();
    cleanup();
  });
  it("Toaster ve AiApplyDialog mount olur (pending yokken null döner)", () => {
    expect(() => render(<><Toaster /><AiApplyDialog /></>)).not.toThrow();
    cleanup();
  });
  it("Dock render olur ve 6 kısayol taşır", () => {
    const { getByLabelText } = render(<MemoryRouter><Dock /></MemoryRouter>);
    for (const label of ["Genel Bakış", "Şema", "AI İçgörüler", "Modüller", "Tema", "Aktivite"]) {
      expect(getByLabelText(label)).toBeInTheDocument();
    }
    cleanup();
  });
});
