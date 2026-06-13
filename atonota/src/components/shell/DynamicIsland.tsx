import { useState, useRef, useEffect, type CSSProperties } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search, X, Sparkles, ChevronRight } from "lucide-react";
import { NAV, PAGES } from "@/engine/loader";
import { Icon } from "@/engine/registry";
import { simulate, SUGGESTIONS } from "@/ai/simulate";
import { LiquidGlass } from "@/liquid-glass";
import { cn } from "@/lib/utils";

interface Leaf { label: string; page: string; icon?: string }
const ALL: Leaf[] = NAV.groups.flatMap((g) => g.items);
const toPath = (page: string) => (page === "dashboard" ? "/" : `/${page}`);

/**
 * iOS-tarzı Dynamic Island — TEK bileşen morf. Tıklayınca ayrı modal AÇILMAZ;
 * aynı cam yüzey büyür: önce yatayda genişler (width), sonra yavaşça aşağı açılır
 * (max-height, gecikmeli). İçerik (pill ↔ panel) çapraz solunur. Easy-ease UX.
 */
export function DynamicIsland() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [q, setQ] = useState("");
  const [aiResult, setAiResult] = useState<ReturnType<typeof simulate> | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = ALL.find((i) => toPath(i.page) === pathname) ?? ALL[0];

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) { setExpanded(false); setAiResult(null); }
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setExpanded(true); setTimeout(() => inputRef.current?.focus(), 120); }
      if (e.key === "Escape") { setExpanded(false); setAiResult(null); }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onClick); document.removeEventListener("keydown", onKey); };
  }, []);

  const isAi = q.trim().length > 0 && !ALL.some((i) => i.label.toLocaleLowerCase("tr").includes(q.toLocaleLowerCase()));
  const navHits = q ? ALL.filter((i) => i.label.toLocaleLowerCase("tr").includes(q.toLocaleLowerCase())) : ALL;
  const runAi = () => { if (q.trim()) setAiResult(simulate(q)); };
  const go = (page: string) => { navigate(toPath(page)); setExpanded(false); setQ(""); setAiResult(null); };

  const open = () => { setExpanded(true); setTimeout(() => inputRef.current?.focus(), 160); };

  // İki fazlı geçiş: AÇILIRKEN önce width (delay 0), sonra max-height (delay .3s).
  // KAPANIRKEN tersi: önce max-height (delay 0), sonra width (delay .22s).
  const morph: CSSProperties = {
    transitionProperty: "width, max-height, border-radius",
    transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
    transitionDuration: expanded ? "0.42s, 0.5s, 0.42s" : "0.42s, 0.34s, 0.42s",
    transitionDelay: expanded ? "0s, 0.3s, 0s" : "0.22s, 0s, 0s",
  };

  return (
    <>
      {/* scrim: tetikleyicilerin (z-40) üstünde, panelin (z-[60]) altında; blur YOK */}
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/65 transition-opacity duration-300",
          expanded ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => { setExpanded(false); setAiResult(null); }}
      />

      {/* TEK container — konum sabit (sıçrama yok); yalnız width/max-height büyür */}
      <div className="fixed left-3 top-3 z-[60] sm:left-1/2 sm:top-4 sm:-translate-x-1/2" ref={ref}>
        <LiquidGlass
          config={{ depth: 30, radius: expanded ? 18 : 999, blur: expanded ? 3 : 1, edge: 0.7, specular: 0.6, tint: "rgba(255,255,255,0.05)" }}
          style={morph}
          className={cn(
            "relative overflow-hidden shadow-2xl shadow-black/60",
            expanded
              ? "max-h-[82vh] w-[calc(100vw-1.5rem)] !rounded-2xl sm:w-[720px]"
              : "max-h-[3.25rem] w-[4.5rem] !rounded-full sm:w-[15rem]",
          )}
        >
          {/* ── KAPALI KATMAN (pill) — genişleyince solar ── */}
          <button
            type="button"
            onClick={open}
            aria-hidden={expanded}
            tabIndex={expanded ? -1 : 0}
            className={cn(
              "absolute inset-0 flex items-center gap-2 px-2.5 transition-opacity duration-200 sm:px-3.5",
              expanded ? "pointer-events-none opacity-0" : "opacity-100 delay-150",
            )}
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-fg">A</span>
            <Icon name={current.icon} className="hidden h-3.5 w-3.5 shrink-0 text-primary sm:inline" />
            <span className="hidden flex-1 truncate text-left text-xs font-medium text-foreground/80 sm:inline">{current.label}</span>
            <span className="flex shrink-0 items-center gap-1 rounded bg-primary/15 px-1.5 py-0.5 text-[9px] text-primary"><Sparkles className="h-2.5 w-2.5" /><span className="hidden sm:inline">AI</span></span>
            <kbd className="hidden shrink-0 text-[9px] sm:inline-flex">⌘K</kbd>
          </button>

          {/* ── AÇIK KATMAN (panel) — max-height açılınca beliren içerik ── */}
          <div
            className={cn(
              "flex max-h-[82vh] flex-col overflow-y-auto transition-opacity duration-200",
              expanded ? "opacity-100 delay-[340ms]" : "pointer-events-none opacity-0",
            )}
          >
            {/* AI-first komut çubuğu */}
            <div className="flex items-center gap-2 border-b border-border/50 px-4 py-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-fg">A</span>
              <Sparkles className="h-4 w-4 shrink-0 text-primary" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => { setQ(e.target.value); setAiResult(null); }}
                onKeyDown={(e) => e.key === "Enter" && isAi && runAi()}
                placeholder="AI'a sor ya da sayfa ara…  (örn. 'crm şeması oluştur')"
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted focus:outline-none"
              />
              {isAi && <button type="button" onClick={runAi} className="flex shrink-0 items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-xs text-primary-fg"><Sparkles className="h-3 w-3" /> Üret</button>}
              <button type="button" aria-label="kapat" onClick={() => { setExpanded(false); setAiResult(null); }} className="shrink-0 rounded-lg p-1.5 text-muted hover:bg-elevated hover:text-foreground"><X className="h-3.5 w-3.5" /></button>
            </div>

            {/* AI sonucu */}
            {aiResult && (
              <div className="border-b border-border/50 p-3">
                <p className="mb-1.5 flex items-center gap-1.5 px-1 text-[10px] font-medium uppercase tracking-wider text-primary"><Sparkles className="h-3 w-3" /> AI önerisi · {aiResult.title}</p>
                <pre className="overflow-auto rounded-lg border border-primary/20 bg-elevated p-3 font-mono text-[11px] leading-relaxed text-foreground/90">{aiResult.body}</pre>
                <div className="mt-2 flex items-center gap-2">
                  {aiResult.apply && <span className="rounded-md bg-primary px-2.5 py-1 text-[11px] text-primary-fg">Uygula (diff)</span>}
                  <span className="rounded-md border border-border px-2.5 py-1 text-[11px] text-muted">Reddet</span>
                  <span className="ml-auto text-[10px] text-muted">{aiResult.note}</span>
                </div>
              </div>
            )}

            {/* öneri çipleri */}
            {!aiResult && !q && (
              <div className="border-b border-border/50 p-3">
                <p className="mb-2 px-1 text-[10px] font-medium uppercase tracking-wider text-muted">AI önerileri</p>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} type="button" onClick={() => { setQ(s); setAiResult(simulate(s)); }} className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted hover:border-primary/50 hover:text-foreground">{s}</button>
                  ))}
                </div>
              </div>
            )}

            {/* navigasyon ızgarası */}
            {!aiResult && (
              <div className="p-3">
                <p className="mb-2 flex items-center gap-1.5 px-1 text-[10px] font-medium uppercase tracking-wider text-muted"><Search className="h-3 w-3" /> Navigasyon ({navHits.length})</p>
                <div className="grid grid-cols-3 gap-1 sm:grid-cols-4 md:grid-cols-6">
                  {navHits.slice(0, 36).map((it) => {
                    const active = toPath(it.page) === pathname;
                    return (
                      <button key={it.page} type="button" onClick={() => go(it.page)} className={cn("flex flex-col items-center gap-1.5 rounded-xl p-3 transition-all", active ? "bg-elevated ring-1 ring-border" : "hover:bg-elevated/60")}>
                        <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", active ? "bg-primary/20" : "bg-elevated/80")}><Icon name={it.icon} className="h-4 w-4 text-primary" /></span>
                        <span className={cn("text-center text-[10px] font-medium leading-tight", active ? "text-foreground" : "text-muted")}>{PAGES[it.page]?.title?.replace("{{org}} · ", "") ?? it.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 border-t border-border/50 px-4 py-1.5 text-[10px] text-muted">
              <span><kbd>esc</kbd> kapat</span><span><kbd>⌘K</kbd> aç</span>
              <span className="ml-auto flex items-center gap-1"><Sparkles className="h-2.5 w-2.5 text-primary" /> AI-first komut adası <ChevronRight className="h-2.5 w-2.5" /> Enter ile üret</span>
            </div>
          </div>
        </LiquidGlass>
      </div>
    </>
  );
}
