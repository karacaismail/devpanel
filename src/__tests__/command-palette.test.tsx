import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommandPalette } from "../components/CommandPalette";

function renderOpen() {
  return render(<CommandPalette open onOpenChange={() => {}} />);
}

describe("CommandPalette (⌘K) sözleşmesi", () => {
  it("doğal dil → scaffold ÖNİZLEME (yazma yok) + CLI eşdeğeri", async () => {
    const user = userEvent.setup();
    renderOpen();
    const input = screen.getByRole("combobox", { name: /komut/i });
    await user.type(input, "crm kaya yap");

    // önizleme: test dosyası ilk sırada
    const files = await screen.findAllByTestId("scaffold-file");
    expect(files[0]).toHaveTextContent("tests/crm.contract.test.ts");

    // CLI eşdeğeri görünür
    expect(screen.getByText(/sdk scaffold --name crm/)).toBeInTheDocument();
    // yazma yok uyarısı
    expect(screen.getByText(/diske yazılmaz/i)).toBeInTheDocument();
  });

  it("komşuluk ihlali UI'da engellenir", async () => {
    const user = userEvent.setup();
    renderOpen();
    const input = screen.getByRole("combobox", { name: /komut/i });
    await user.type(input, "fiyat alan yap");

    expect(await screen.findByText(/Seviye atlanamaz/)).toBeInTheDocument();
    expect(screen.queryAllByTestId("scaffold-file")).toHaveLength(0);
  });
});
