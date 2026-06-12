import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDanger } from "../components/ConfirmDanger";

describe("ConfirmDanger sözleşmesi (§5 — yıkıcı işlemler isim-yazarak)", () => {
  it("isim birebir yazılmadan onay butonu kilitli", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(
      <ConfirmDanger
        open
        onOpenChange={() => {}}
        name="loyalty-points"
        title="Modülü kaldır"
        onConfirm={onConfirm}
      />,
    );
    const btn = screen.getByRole("button", { name: /onayla/i });
    expect(btn).toBeDisabled();

    const input = screen.getByLabelText(/adını yaz/i);
    await user.type(input, "loyalty");
    expect(btn).toBeDisabled();

    await user.type(input, "-points");
    expect(btn).toBeEnabled();
    await user.click(btn);
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
