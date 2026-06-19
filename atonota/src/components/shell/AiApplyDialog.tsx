import { useState, useEffect } from "react";
import { Sparkles, X, ShieldAlert, GitPullRequestArrow, Terminal } from "lucide-react";
import { useAiStore } from "@/store/ai-store";
import { LiquidGlass } from "@/liquid-glass";
import { cn } from "@/lib/utils";

const CONFIRM_WORD = "UYGULA";

/**
 * AI apply diyaloğu — "öneri → diff → onay → audit" zincirinin onay kapısı.
 * Global; store.pending dolunca açılır. Diff'i gösterir; yıkıcı önerilerde
 * isim-yazarak onay (ConfirmDanger deseni) ister. Onay → confirmApply → audit toast.
 */
export function AiApplyDialog() {
  const pending = useAiStore((s) => s.pending);
  const confirmApply = useAiStore((s) => s.confirmApply);
  const cancelApply = useAiStore((s) => s.cancelApply);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    setTyped("");
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") cancelApply(false); };
    if (pending) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pending, cancelApply]);

  if (!pending) return null;
  const { result, destructive, query } = pending;
  const blocked = destructive && typed.trim() !== CONFIRM_WORD;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => cancelApply(false)} />
      <LiquidGlass
        config={{ depth: 26, radius: 18, blur: 4, edge: 0.6, specular: 0.5 }}
        className="relative z-10 flex max-h-[80vh] w-[min(40rem,calc(100vw-2rem))] flex-col !rounded-2xl shadow-2xl shadow-black/60"
      >
        <div className="flex items-center gap-2.5 border-b border-border/60 px-4 py-3">
          <span className={cn("flex h-7 w-7 items-center justify-center rounded-full", destructive ? "bg-rose-500/20 text-rose-400" : "bg-primary/20 text-primary")}>
            {destructive ? <ShieldAlert className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">{result.title}</p>
            <p className="truncate text-[10px] text-muted">öneri kaynağı: "{query}"</p>
          </div>
          <button type="button" aria-label="kapat" onClick={() => cancelApply(false)} className="shrink-0 rounded-lg p-1.5 text-muted hover:bg-elevated hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-primary">
            <GitPullRequestArrow className="h-3.5 w-3.5" /> Diff önizleme
          </p>
          <pre className="overflow-auto rounded-xl border border-primary/20 bg-elevated/70 p-3 font-mono text-[11px] leading-relaxed text-foreground/90">{result.body}</pre>

          {result.apply && (
            <div className="flex items-center gap-2 rounded-lg border border-border bg-elevated/40 px-3 py-2 text-[11px] text-muted">
              <Terminal className="h-3.5 w-3.5 shrink-0 text-foreground/70" />
              <code className="truncate text-foreground/80">{result.apply}</code>
              <span className="ml-auto shrink-0 rounded bg-primary/15 px-1.5 py-0.5 text-[9px] text-primary">CLI eşdeğeri</span>
            </div>
          )}

          <p className="flex items-start gap-1.5 text-[11px] text-muted">
            <span className="mt-px">•</span>{result.note}
          </p>

          {destructive && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-3">
              <p className="flex items-center gap-1.5 text-[11px] font-medium text-rose-400">
                <ShieldAlert className="h-3.5 w-3.5" /> Geri-alınamaz aksiyon — onaylamak için <kbd className="rounded bg-rose-500/15 px-1.5 py-0.5 font-mono text-rose-300">{CONFIRM_WORD}</kbd> yaz
              </p>
              <input
                autoFocus
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                placeholder={CONFIRM_WORD}
                className="mt-2 w-full rounded-lg border border-rose-500/30 bg-elevated px-3 py-1.5 text-sm text-foreground placeholder:text-muted/60 focus:border-rose-500/60 focus:outline-none"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 border-t border-border/60 px-4 py-3">
          <button type="button" onClick={() => cancelApply(true)} className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:border-border/80 hover:text-foreground">
            Reddet
          </button>
          <span className="ml-auto text-[10px] text-muted">Esc · iptal</span>
          <button
            type="button"
            disabled={blocked}
            onClick={confirmApply}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors",
              blocked ? "cursor-not-allowed bg-elevated text-muted" : destructive ? "bg-rose-500 text-white hover:bg-rose-400" : "bg-primary text-primary-fg hover:bg-primary/90",
            )}
          >
            <GitPullRequestArrow className="h-3.5 w-3.5" /> Uygula (diff)
          </button>
        </div>
      </LiquidGlass>
    </div>
  );
}
