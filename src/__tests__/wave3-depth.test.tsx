import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ArchetypeStudio } from "../screens/ArchetypeStudio";
import { DataBrowser } from "../screens/DataBrowser";
import { ApiExplorer } from "../screens/ApiExplorer";
import { AiConsole } from "../screens/AiConsole";
import { ThemeEditor } from "../screens/ThemeEditor";
import { ARCHETYPES } from "../data/archetypes";
import { generateRows } from "../data/rows";

describe("ArcheType Studio — YAML düzenleme (tanım kazanır)", () => {
  it("düzenle → diff → uygula akışı; name: olmadan reddedilir", async () => {
    const user = userEvent.setup();
    render(<ArchetypeStudio archetypes={ARCHETYPES} />);
    await user.click(screen.getByRole("button", { name: /düzenle/i }));

    const editor = screen.getByLabelText(/yaml editörü/i);
    fireEvent.change(editor, { target: { value: "scope: kernel" } });
    await user.click(screen.getByRole("button", { name: /doğrula ve uygula/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/name:/);

    fireEvent.change(editor, {
      target: { value: "name: party\nscope: kernel\n# tenant notu: acme onayladı" },
    });
    await user.click(screen.getByRole("button", { name: /doğrula ve uygula/i }));
    expect(screen.getByText(/tenant notu: acme onayladı/)).toBeInTheDocument();
  });
});

describe("Data Browser — durum filtre çipleri", () => {
  it("blocked çipi yalnız blocked kayıtları bırakır", async () => {
    const user = userEvent.setup();
    const expected = generateRows(1000).filter((r) => r.status === "blocked").length;
    render(<DataBrowser />);
    await user.click(screen.getByRole("button", { name: /^blocked/i }));
    expect(screen.getByText(`${expected} kayıt`)).toBeInTheDocument();
  });
});

describe("API Explorer — sorgu geçmişi ve curl", () => {
  it("çalıştırınca geçmişe düşer; curl kopyalama butonu var", async () => {
    const user = userEvent.setup();
    render(<ApiExplorer />);
    expect(screen.queryByText(/geçmiş boş/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /çalıştır/i }));
    expect(screen.queryByText(/geçmiş boş/i)).toBeNull();
    expect(screen.getByRole("button", { name: /curl/i })).toBeInTheDocument();
  });
});

describe("AI Konsolu — dry-run playground", () => {
  it("tool dry-run çağrısı maskeli mock yanıt döner", async () => {
    const user = userEvent.setup();
    render(<AiConsole />);
    await user.click(screen.getByRole("button", { name: /dry-run/i }));
    expect(await screen.findByText(/"dryRun": true/)).toBeInTheDocument();
    expect(screen.getByText(/"piiMasked": true/)).toBeInTheDocument();
  });
});

describe("Tema — preset paletler ve export", () => {
  it("preset uygulanınca tokenlar değişir ve AA korunur", async () => {
    const user = userEvent.setup();
    render(<ThemeEditor />);
    const accentBefore = (screen.getByLabelText("token-accent") as HTMLInputElement).value;
    await user.click(screen.getByRole("button", { name: /okyanus/i }));
    const accentAfter = (screen.getByLabelText("token-accent") as HTMLInputElement).value;
    expect(accentAfter).not.toBe(accentBefore);
    expect(screen.getByRole("button", { name: /kaydet/i })).toBeEnabled(); // preset AA geçer
  });

  it("JSON export butonu var", () => {
    render(<ThemeEditor />);
    expect(screen.getByRole("button", { name: /json export/i })).toBeInTheDocument();
  });
});
