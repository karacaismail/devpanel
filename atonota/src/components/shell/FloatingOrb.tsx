import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Sparkles, Send, X, Minimize2, Copy } from "lucide-react";
import { simulate } from "@/ai/simulate";
import { LiquidGlass } from "@/liquid-glass";
import { useContextStore } from "@/store/context-store";
import { cn } from "@/lib/utils";

interface Msg { id: number; role: "user" | "ai"; text: string; note?: string }

const HINTS: Record<string, string> = {
  "/schema": "Model oluşturabilir, alan önerebilir, migration üretebilirim.",
  "/theme": "AA-uyumlu renk paleti oluşturabilirim.",
  "/data": "Doğal dilden GraphQL sorgusu yazabilirim.",
  "/logs": "Logları özetleyip anomali çıkarabilirim.",
  "/test-runner": "Kontrat testi iskeleti üretebilirim.",
};

let seq = 0;

/** AI-first omurga: her sayfada erişilebilir, bağlama duyarlı, proaktif AI asistanı. */
export function FloatingOrb() {
  const { pathname } = useLocation();
  const org = useContextStore((s) => s.org);
  const [open, setOpen] = useState(false);
  const [pulse, setPulse] = useState(false);
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => { if (!open) { setPulse(true); setTimeout(() => setPulse(false), 2500); } }, 30000);
    return () => clearInterval(t);
  }, [open]);
  useEffect(() => { chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight }); }, [msgs]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const r = simulate(text);
    setMsgs((m) => [...m, { id: ++seq, role: "user", text }, { id: ++seq, role: "ai", text: `${r.title}\n\n${r.body}`.replaceAll("{{org}}", org), note: r.note }]);
    setInput("");
  };

  return (
    <>
      {open && (
        <LiquidGlass config={{ depth: 24, radius: 16, blur: 3, edge: 0.6, specular: 0.5 }} className="fixed bottom-20 right-4 z-[60] flex h-[28rem] w-[min(24rem,calc(100vw-2rem))] flex-col !rounded-2xl shadow-2xl shadow-black/60">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-fg"><Sparkles className="h-3.5 w-3.5" /></span>
            <div className="flex-1"><p className="text-sm font-semibold text-foreground">AI Asistan</p><p className="text-[10px] text-muted">bağlam: {pathname}</p></div>
            <button type="button" aria-label="küçült" onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-muted hover:bg-elevated"><Minimize2 className="h-3.5 w-3.5" /></button>
          </div>
          <div ref={chatRef} className="flex-1 space-y-2 overflow-y-auto p-3">
            {msgs.length === 0 && (
              <div className="rounded-lg border border-border bg-elevated/50 p-3 text-xs text-muted">
                {HINTS[pathname] ?? "Doğal dille sor: şema, modül, sorgu, palet, log özeti, test üretebilirim."}
                <p className="mt-2 text-[10px] text-primary">AI önerir, sen onaylarsın — sessiz mutasyon yok.</p>
              </div>
            )}
            {msgs.map((m) => (
              <div key={m.id} className={cn("rounded-lg p-2.5 text-xs", m.role === "user" ? "ml-6 bg-primary/15 text-foreground" : "mr-2 border border-border bg-elevated/50")}>
                <pre className="whitespace-pre-wrap break-words font-sans text-foreground/90">{m.text}</pre>
                {m.note && <p className="mt-1.5 flex items-center gap-1 border-t border-border/50 pt-1.5 text-[10px] text-muted"><span>{m.note}</span></p>}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 border-t border-border p-2.5">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(input)} placeholder="AI'a sor…" className="flex-1 rounded-lg border border-border bg-elevated px-3 py-1.5 text-xs text-foreground placeholder:text-muted focus:outline-none" />
            <button type="button" aria-label="gönder" onClick={() => send(input)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-fg"><Send className="h-3.5 w-3.5" /></button>
          </div>
        </LiquidGlass>
      )}
      <button
        type="button"
        aria-label="AI asistan"
        onClick={() => setOpen((o) => !o)}
        className={cn("fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-fg shadow-2xl shadow-primary/30 transition-transform hover:scale-105", pulse && "animate-pulse ring-4 ring-primary/30")}
      >
        {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
      </button>
    </>
  );
}
