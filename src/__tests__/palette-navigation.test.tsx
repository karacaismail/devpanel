import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CommandPalette } from "../components/CommandPalette";
import { useUiStore } from "../lib/store";

describe("CommandPalette — ekran navigasyonu", () => {
  it("ekran adı yazınca 'Git →' sonucu çıkar ve tıklayınca geçer", async () => {
    const user = userEvent.setup();
    useUiStore.setState({ screen: "overview" });
    render(<CommandPalette open onOpenChange={() => {}} />);

    const input = screen.getByRole("combobox", { name: /komut/i });
    await user.type(input, "workflow");

    const hit = await screen.findByRole("button", { name: /Git → Workflow Designer/ });
    await user.click(hit);
    expect(useUiStore.getState().screen).toBe("workflow");
  });

  it("scaffold komutu yazılınca navigasyon değil önizleme öncelikli", async () => {
    const user = userEvent.setup();
    render(<CommandPalette open onOpenChange={() => {}} />);
    await user.type(screen.getByRole("combobox", { name: /komut/i }), "crm kaya yap");
    expect(await screen.findAllByTestId("scaffold-file")).not.toHaveLength(0);
    expect(screen.queryByRole("button", { name: /Git →/ })).toBeNull();
  });
});
