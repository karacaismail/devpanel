import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { Warning } from "@phosphor-icons/react";

/**
 * §5 — tüm yıkıcı işlemler İSİM-YAZARAK onaylanır.
 * İsim birebir eşleşmeden onay butonu açılmaz.
 */
export function ConfirmDanger({
  open,
  onOpenChange,
  name,
  title,
  description,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  title: string;
  description?: string;
  onConfirm: () => void;
}) {
  const [typed, setTyped] = useState("");
  const ok = typed === name;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        if (!o) setTyped("");
        onOpenChange(o);
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-1/2 w-[min(26rem,calc(100vw-1.5rem))] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-danger/40 bg-panel p-4 shadow-2xl"
        >
          <Dialog.Title className="flex items-center gap-2 text-ink">
            <Warning size={18} className="text-danger" /> {title}
          </Dialog.Title>
          <p className="mt-2 text-sm text-mute">
            {description ?? "Bu işlem geri alınamaz."} Devam etmek için{" "}
            <code className="font-mono text-danger">{name}</code> yaz.
          </p>
          <input
            aria-label="Onay için adını yaz"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={name}
            className="mt-3 w-full rounded border border-line bg-elev px-2 py-1.5 font-mono text-sm text-ink placeholder:text-mute/50"
          />
          <div className="mt-4 flex justify-end gap-2">
            <Dialog.Close className="rounded border border-line px-3 py-1.5 text-sm text-mute hover:text-ink">
              Vazgeç
            </Dialog.Close>
            <button
              type="button"
              disabled={!ok}
              onClick={() => {
                onConfirm();
                setTyped("");
                onOpenChange(false);
              }}
              className="rounded bg-danger px-3 py-1.5 text-sm text-bg disabled:cursor-not-allowed disabled:opacity-40"
            >
              Onayla
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
