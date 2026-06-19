import { useState } from "react";
import { Sparkles, Play, GitPullRequestArrow, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { simulate, isDestructive, SUGGESTIONS } from "@/ai/simulate";
import { useAiStore } from "@/store/ai-store";
import { cn } from "@/lib/utils";
import type { Section } from "../types";

/**
 * `aisim` section tipi — sayfaya gömülü çalışan AI simülatörü.
 * JSON yalnız başlık/açıklama/örnekleri verir; mantık deterministik motordan.
 */
export function AiSim({ section }: { section: Section }) {
  const examples = (section.examples as string[]) ?? SUGGESTIONS;
  const [q, setQ] = useState(examples[0] ?? "");
  const [res, setRes] = useState<ReturnType<typeof simulate> | null>(null);
  const record = useAiStore((s) => s.record);
  const requestApply = useAiStore((s) => s.requestApply);

  const run = (text: string) => {
    const r = simulate(text);
    setRes(r);
    record("aisim", text, r);
  };
  const apply = () => {
    if (!res) return;
    const entryId = record("aisim", q, res);
    requestApply({ entryId, result: res, query: q, page: "aisim", destructive: isDestructive(q) });
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4 text-primary" /> {String(section.title ?? "AI Simülasyonu")}</CardTitle>
        {section.description ? <CardDescription>{String(section.description)}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {examples.map((ex) => (
            <button key={ex} type="button" onClick={() => { setQ(ex); run(ex); }} className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted hover:border-primary/50 hover:text-foreground">{ex}</button>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && run(q)} placeholder="Doğal dil komut…" className="flex-1 rounded-lg border border-border bg-elevated px-3 py-1.5 text-sm text-foreground placeholder:text-muted focus:outline-none" />
          <button type="button" onClick={() => run(q)} className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-fg"><Play className="h-3.5 w-3.5" /> Üret</button>
        </div>
        {res && (
          <div>
            <p className="mb-1 text-[11px] uppercase tracking-wider text-primary">{res.title}</p>
            <pre className="overflow-auto rounded-lg border border-primary/20 bg-elevated p-3 font-mono text-[11px] leading-relaxed text-foreground/90">{res.body}</pre>
            <div className="mt-2 flex items-center gap-2">
              {res.apply && (
                <button type="button" onClick={apply} className={cn("flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium text-primary-fg transition-colors", isDestructive(q) ? "bg-rose-500 hover:bg-rose-400" : "bg-primary hover:bg-primary/90")}>
                  <GitPullRequestArrow className="h-3 w-3" /> Uygula (diff)
                  {isDestructive(q) && <ShieldAlert className="h-3 w-3 text-rose-100" />}
                </button>
              )}
              <button type="button" onClick={() => setRes(null)} className="rounded-md border border-border px-2.5 py-1 text-[11px] text-muted hover:text-foreground">Reddet</button>
              <span className="ml-auto text-[10px] text-muted">{res.note}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
