import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { Sparkles, Send, X, Minimize2, History, MessageSquare, GitPullRequestArrow, AlertTriangle, ShieldAlert, CircleDot, CheckCircle2, XCircle, Clock } from "lucide-react";
import { simulate, isDestructive, type SimResult } from "@/ai/simulate";
import { proactiveFor, quickCommandsFor, type Proactive } from "@/ai/proactive";
import { LiquidGlass } from "@/liquid-glass";
import { useContextStore, toEvalContext } from "@/store/context-store";
import { useAiStore } from "@/store/ai-store";
import { PAGES } from "@/engine/loader";
import { cn } from "@/lib/utils";

interface Msg { id: number; role: "user" | "ai"; text: string; note?: string; result?: SimResult; query?: string }

let seq = 0;
const pageIdFromPath = (p: string) => (p === "/" ? "dashboard" : p.replace(/^\//, ""));

/** AI-first omurga: her sayfada erişilebilir, BAĞLAMA DUYARLI, PROAKTİF AI asistanı. */
export function FloatingOrb() {
  const { pathname } = useLocation();
  const org = useContextStore((s) => s.org);
  const env = useContextStore((s) => s.env);
  const role = useContextStore((s) => s.role);
  const record = useAiStore((s) => s.record);
  const requestApply = useAiStore((s) => s.requestApply);
  const history = useAiStore((s) => s.history);

  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"chat" | "history">("chat");
  const [pulse, setPulse] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);

  const pageId = pageIdFromPath(pathname);
  const page = PAGES[pageId];
  const evalCtx = useMemo(() => toEvalContext({ org, env, role }), [org, env, role]);
  const proactive = useMemo(() => proactiveFor(pageId, evalCtx), [pageId, evalCtx]);
  const quick = useMemo(() => quickCommandsFor(pageId), [pageId]);
  const alertCount = proactive.filter((p) => p.tone === "danger").length;

  // Yeni sayfaya geçince sohbeti temizle — bağlam değişti, öneriler tazelensin.
  useEffect(() => { setMsgs([]); setTab("chat"); }, [pageId]);
  useEffect(() => {
    const t = setInterval(() => { if (!open) { setPulse(true); setTimeout(() => setPulse(false), 2500); } }, 30000);
    return () => clearInterval(t);
  }, [open]);
  useEffect(() => { chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight }); }, [msgs]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const r = simulate(text);
    record(pageId, text, r);
    setMsgs((m) => [
      ...m,
      { id: ++seq, role: "user", text },
      { id: ++seq, role: "ai", text: `${r.title}\n\n${r.body}`.replaceAll("{{org}}", org), note: r.note, result: r, query: text },
    ]);
    setInput("");
    setTab("chat");
  };

  const apply = (m: Msg) => {
    if (!m.result || !m.query) return;
    const entryId = record(pageId, m.query, m.result);
    requestApply({ entryId, result: m.result, query: m.query, page: pageId, destructive: isDestructive(m.query) });
  };

  return (
    <>
      {open && (
        <LiquidGlass config={{ depth: 24, radius: 16, blur: 3, edge: 0.6, specular: 0.5 }} className="fixed bottom-20 right-4 z-[60] flex h-[30rem] w-[min(25rem,calc(100vw-2rem))] flex-col !rounded-2xl shadow-2xl shadow-black/60">
          {/* başlık + sekmeler */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-fg"><Sparkles className="h-3.5 w-3.5" /></span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">AI Asistan</p>
              <p className="text-[10px] text-muted">bağlam: {page?.title?.replace("{{org}} · ", "") ?? pageId} · {env}</p>
            </div>
            <div className="flex items-center gap-0.5 rounded-lg bg-elevated/60 p-0.5">
              <button type="button" onClick={() => setTab("chat")} className={cn("flex items-center gap-1 rounded-md px-2 py-1 text-[10px]", tab === "chat" ? "bg-primary/20 text-primary" : "text-muted hover:text-foreground")}><MessageSquare className="h-3 w-3" /> Sohbet</button>
              <button type="button" onClick={() => setTab("history")} className={cn("flex items-center gap-1 rounded-md px-2 py-1 text-[10px]", tab === "history" ? "bg-primary/20 text-primary" : "text-muted hover:text-foreground")}><History className="h-3 w-3" /> Geçmiş {history.length > 0 && <span className="rounded bg-primary/20 px-1 text-[9px] text-primary">{history.length}</span>}</button>
            </div>
            <button type="button" aria-label="küçült" onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-muted hover:bg-elevated"><Minimize2 className="h-3.5 w-3.5" /></button>
          </div>

          {tab === "chat" ? (
            <>
              <div ref={chatRef} className="flex-1 space-y-2 overflow-y-auto p-3">
                {msgs.length === 0 && (
                  <div className="space-y-2.5">
                    {/* PROAKTİF: AI sayfayı okudu, fark ettiklerini sunar */}
                    {proactive.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="flex items-center gap-1.5 px-0.5 text-[10px] font-medium uppercase tracking-wider text-primary"><Sparkles className="h-3 w-3" /> AI bu sayfada şunları fark etti</p>
                        {proactive.map((p, i) => <ProactiveCard key={i} p={p} onAsk={() => send(p.command)} />)}
                      </div>
                    )}
                    {/* bağlama özel hızlı komutlar */}
                    <div>
                      <p className="mb-1.5 px-0.5 text-[10px] font-medium uppercase tracking-wider text-muted">Bu sayfada deneyebilirsin</p>
                      <div className="flex flex-wrap gap-1.5">
                        {quick.map((q) => (
                          <button key={q} type="button" onClick={() => send(q)} className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted transition-colors hover:border-primary/50 hover:text-foreground">{q}</button>
                        ))}
                      </div>
                    </div>
                    <p className="px-0.5 text-[10px] text-primary">AI önerir, sen onaylarsın — sessiz mutasyon yok.</p>
                  </div>
                )}
                {msgs.map((m) => (
                  <div key={m.id} className={cn("rounded-lg p-2.5 text-xs", m.role === "user" ? "ml-6 bg-primary/15 text-foreground" : "mr-2 border border-border bg-elevated/50")}>
                    <pre className="whitespace-pre-wrap break-words font-sans text-foreground/90">{m.text}</pre>
                    {m.note && <p className="mt-1.5 border-t border-border/50 pt-1.5 text-[10px] text-muted">{m.note}</p>}
                    {m.role === "ai" && m.result?.apply && (
                      <button type="button" onClick={() => apply(m)} className="mt-2 flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-fg transition-colors hover:bg-primary/90">
                        <GitPullRequestArrow className="h-3 w-3" /> Uygula (diff)
                        {m.query && isDestructive(m.query) && <ShieldAlert className="h-3 w-3 text-rose-200" />}
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 border-t border-border p-2.5">
                <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(input)} placeholder={`AI'a sor — bağlam: ${pageId}…`} className="flex-1 rounded-lg border border-border bg-elevated px-3 py-1.5 text-xs text-foreground placeholder:text-muted focus:outline-none" />
                <button type="button" aria-label="gönder" onClick={() => send(input)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-fg"><Send className="h-3.5 w-3.5" /></button>
              </div>
            </>
          ) : (
            <HistoryPanel />
          )}
        </LiquidGlass>
      )}

      <button
        type="button"
        aria-label="AI asistan"
        onClick={() => setOpen((o) => !o)}
        className={cn("fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-fg shadow-2xl shadow-primary/30 transition-transform hover:scale-105", pulse && !open && "animate-pulse ring-4 ring-primary/30")}
      >
        {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
        {!open && alertCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-background">{alertCount}</span>
        )}
      </button>
    </>
  );
}

function ProactiveCard({ p, onAsk }: { p: Proactive; onAsk: () => void }) {
  const tone = p.tone === "danger"
    ? { I: ShieldAlert, cls: "border-rose-500/30 bg-rose-500/5", ic: "text-rose-400" }
    : p.tone === "warning"
      ? { I: AlertTriangle, cls: "border-amber-500/30 bg-amber-500/5", ic: "text-amber-400" }
      : { I: CircleDot, cls: "border-sky-500/30 bg-sky-500/5", ic: "text-sky-400" };
  const { I } = tone;
  return (
    <button type="button" onClick={onAsk} className={cn("flex w-full items-start gap-2 rounded-lg border p-2.5 text-left transition-colors hover:brightness-125", tone.cls)}>
      <I className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", tone.ic)} />
      <span className="flex-1">
        <span className="block text-[11px] leading-snug text-foreground/90">{p.text}</span>
        <span className={cn("mt-1 inline-flex items-center gap-1 text-[10px]", tone.ic)}><Sparkles className="h-2.5 w-2.5" /> AI'a çözdür →</span>
      </span>
    </button>
  );
}

const STATUS = {
  pending: { I: Clock, cls: "text-amber-400" },
  applied: { I: CheckCircle2, cls: "text-emerald-400" },
  rejected: { I: XCircle, cls: "text-rose-400" },
} as const;

/** AI komut geçmişi — tüm öneriler, durumları (pending/applied/rejected) ile denetlenebilir. */
function HistoryPanel() {
  const history = useAiStore((s) => s.history);
  if (history.length === 0) {
    return <div className="flex flex-1 items-center justify-center p-6 text-center text-xs text-muted">Henüz AI komutu yok.<br />Sohbetten bir öneri üret — burada audit'lenir.</div>;
  }
  return (
    <div className="flex-1 space-y-1.5 overflow-y-auto p-3">
      {history.map((e) => {
        const { I, cls } = STATUS[e.status];
        return (
          <div key={e.id} className="rounded-lg border border-border bg-elevated/40 p-2.5">
            <div className="flex items-center gap-1.5">
              <I className={cn("h-3.5 w-3.5 shrink-0", cls)} />
              <span className="flex-1 truncate text-[11px] font-medium text-foreground/90">{e.title}</span>
              <span className="shrink-0 font-mono text-[9px] text-muted">{e.ts}</span>
            </div>
            <p className="mt-1 truncate pl-5 text-[10px] text-muted">"{e.query}"</p>
            <div className="mt-1 flex items-center gap-1.5 pl-5">
              <span className="rounded bg-elevated px-1.5 py-0.5 text-[9px] text-muted">{e.intent}</span>
              <span className="rounded bg-elevated px-1.5 py-0.5 text-[9px] text-muted">{e.page}</span>
              <span className={cn("ml-auto text-[9px]", cls)}>{e.status}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
