import { useEffect } from "react";
import { CheckCircle, Warning, X } from "@phosphor-icons/react";
import { useToastStore } from "../lib/audit";

/** Aksiyon geri bildirimi — 4 sn sonra kendiliğinden düşer. */
export function Toasts() {
  const { toasts, dismiss } = useToastStore();

  useEffect(() => {
    if (toasts.length === 0) return;
    const id = setTimeout(() => dismiss(toasts[0].id), 4000);
    return () => clearTimeout(id);
  }, [toasts, dismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-10 right-4 z-50 flex w-72 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`flex items-start gap-2 rounded-md border bg-panel p-3 text-sm shadow-xl ${
            t.tone === "ok" ? "border-ok/40" : "border-danger/40"
          }`}
        >
          {t.tone === "ok" ? (
            <CheckCircle size={16} className="mt-0.5 shrink-0 text-ok" />
          ) : (
            <Warning size={16} className="mt-0.5 shrink-0 text-danger" />
          )}
          <span className="text-ink">{t.message}</span>
          <button
            type="button"
            onClick={() => dismiss(t.id)}
            aria-label="kapat"
            className="ml-auto text-mute hover:text-ink"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
