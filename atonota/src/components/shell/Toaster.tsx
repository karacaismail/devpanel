import { CheckCircle2, Info, AlertTriangle, ShieldAlert, X } from "lucide-react";
import { useAiStore, type ToastKind } from "@/store/ai-store";
import { cn } from "@/lib/utils";

/** Audit toast'ları — logAction/confirmApply buradan kullanıcıya görünür olur. */
const TONE: Record<ToastKind, { icon: typeof Info; cls: string }> = {
  ok: { icon: CheckCircle2, cls: "text-emerald-400 border-emerald-500/30" },
  info: { icon: Info, cls: "text-sky-400 border-sky-500/30" },
  warn: { icon: AlertTriangle, cls: "text-amber-400 border-amber-500/30" },
  danger: { icon: ShieldAlert, cls: "text-rose-400 border-rose-500/30" },
};

export function Toaster() {
  const toasts = useAiStore((s) => s.toasts);
  const dismiss = useAiStore((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 z-[80] flex w-[min(26rem,calc(100vw-2rem))] -translate-x-1/2 flex-col gap-2">
      {toasts.map((t) => {
        const { icon: I, cls } = TONE[t.kind];
        return (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-2.5 rounded-xl border bg-panel/95 px-3.5 py-2.5 text-xs shadow-2xl shadow-black/50 backdrop-blur",
              cls,
            )}
            style={{ animation: "toast-in 0.28s cubic-bezier(0.22,1,0.36,1)" }}
          >
            <I className="mt-0.5 h-4 w-4 shrink-0" />
            <span className="flex-1 text-foreground/90">{t.text}</span>
            <button type="button" aria-label="kapat" onClick={() => dismiss(t.id)} className="shrink-0 text-muted hover:text-foreground">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
