import type { ReactNode } from "react";
import * as Icons from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AiSim } from "./sections/AiSim";
import type { Section } from "./types";

/**
 * Section registry: JSON `type` → React bileşeni. Yeni içerik bloğu eklemek,
 * yeni bir kayıt eklemekten ibarettir; JSON o tipi kullanır, kod değişmez.
 * Tüm bileşenler shadcn/ui (Card/Badge) üzerine kuruludur — Bora estetiği.
 */

type Variant = "default" | "secondary" | "outline" | "success" | "warning" | "destructive";

function Icon({ name, className }: { name?: string; className?: string }) {
  if (!name) return null;
  const C = (Icons as Record<string, unknown>)[name] as React.ComponentType<{ className?: string }> | undefined;
  return C ? <C className={className} /> : null;
}

/* ---- bölüm bileşenleri ---- */

function Prose({ section }: { section: Section }) {
  return <p className="text-sm leading-relaxed text-muted">{String(section.text ?? "")}</p>;
}

function MetricCards({ section }: { section: Section }) {
  const items = (section.items ?? []) as Array<{ label: string; value: string; sub?: string; tone?: Variant }>;
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {items.map((m, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted">{m.label}</p>
            <p className="mt-1 text-xl">{m.value}</p>
            {m.sub && <p className="text-xs text-muted">{m.sub}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CardGrid({ section }: { section: Section }) {
  const items = (section.items ?? []) as Array<{ title: string; body?: string; badge?: string; badgeTone?: Variant; icon?: string }>;
  const cols = (section.cols as number) ?? 3;
  return (
    <div className={`grid gap-3 sm:grid-cols-2 lg:grid-cols-${cols}`}>
      {items.map((c, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Icon name={c.icon} className="h-4 w-4 text-primary" />
              {c.title}
              {c.badge && <Badge variant={c.badgeTone ?? "outline"} className="ml-auto">{c.badge}</Badge>}
            </CardTitle>
          </CardHeader>
          {c.body && <CardContent className="pt-0 text-xs text-muted">{c.body}</CardContent>}
        </Card>
      ))}
    </div>
  );
}

function Table({ section }: { section: Section }) {
  const cols = (section.columns ?? []) as string[];
  const rows = (section.rows ?? []) as string[][];
  return (
    <Card>
      {section.title ? (
        <CardHeader className="pb-2"><CardTitle className="text-sm">{String(section.title)}</CardTitle></CardHeader>
      ) : null}
      <CardContent className={section.title ? "pt-0" : "p-5"}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted">
              {cols.map((c) => <th key={c} className="pb-2 font-medium">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-border/60">
                {r.map((cell, j) => <td key={j} className="py-2 text-foreground/90">{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

function BadgeList({ section }: { section: Section }) {
  const items = (section.items ?? []) as Array<{ label: string; tone?: Variant }>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((b, i) => <Badge key={i} variant={b.tone ?? "outline"}>{b.label}</Badge>)}
    </div>
  );
}

function CodeBlock({ section }: { section: Section }) {
  return (
    <pre className="overflow-auto rounded-lg border border-border bg-elevated p-4 font-mono text-xs leading-relaxed text-muted">
      {String(section.code ?? "")}
    </pre>
  );
}

function Callout({ section }: { section: Section }) {
  const tone = (section.tone as "warning" | "danger" | "ok") ?? "warning";
  const cls = tone === "danger" ? "border-danger/40 bg-danger/10 text-danger" : tone === "ok" ? "border-ok/40 bg-ok/10 text-ok" : "border-warn/40 bg-warn/10 text-warn";
  return (
    <div className={`flex items-start gap-2 rounded-lg border p-3 text-sm ${cls}`}>
      <Icon name={section.icon as string} className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{String(section.text ?? "")}</p>
    </div>
  );
}

function Steps({ section }: { section: Section }) {
  const items = (section.items ?? []) as Array<{ label: string; note?: string; done?: boolean }>;
  return (
    <Card>
      {section.title ? <CardHeader className="pb-2"><CardTitle className="text-sm">{String(section.title)}</CardTitle></CardHeader> : null}
      <CardContent className={section.title ? "space-y-1.5 pt-0" : "space-y-1.5 p-5"}>
        {items.map((s, i) => (
          <div key={i} className="flex items-start gap-2.5 rounded-lg border border-border px-3 py-2 text-sm">
            <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] ${s.done ? "bg-ok/20 text-ok" : "bg-elevated text-muted"}`}>{s.done ? "✓" : i + 1}</span>
            <div className="min-w-0">
              <p className={s.done ? "text-muted line-through" : "text-foreground"}>{s.label}</p>
              {s.note && <p className="text-xs text-muted">{s.note}</p>}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function KeyValue({ section }: { section: Section }) {
  const items = (section.items ?? []) as Array<{ k: string; v: string; tone?: Variant }>;
  return (
    <Card>
      {section.title ? <CardHeader className="pb-2"><CardTitle className="text-sm">{String(section.title)}</CardTitle></CardHeader> : null}
      <CardContent className={section.title ? "pt-0" : "p-5"}>
        <dl className="grid grid-cols-1 gap-x-6 gap-y-1.5 text-sm sm:grid-cols-2">
          {items.map((it, i) => (
            <div key={i} className="flex items-center justify-between gap-3 border-b border-border/50 py-1">
              <dt className="text-muted">{it.k}</dt>
              <dd className="font-mono text-xs text-foreground/90">{it.v}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

function Progress({ section }: { section: Section }) {
  const items = (section.items ?? []) as Array<{ label: string; value: number; sub?: string; tone?: "ok" | "warn" | "danger" }>;
  const color = (t?: string) => (t === "danger" ? "bg-danger" : t === "warn" ? "bg-warn" : t === "ok" ? "bg-ok" : "bg-primary");
  return (
    <Card>
      {section.title ? <CardHeader className="pb-2"><CardTitle className="text-sm">{String(section.title)}</CardTitle></CardHeader> : null}
      <CardContent className={section.title ? "space-y-2.5 pt-0" : "space-y-2.5 p-5"}>
        {items.map((it, i) => (
          <div key={i}>
            <div className="mb-1 flex items-baseline justify-between text-xs"><span className="text-foreground/90">{it.label}</span><span className="font-mono text-muted">{it.sub ?? `%${it.value}`}</span></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-elevated"><div className={`h-full ${color(it.tone)}`} style={{ width: `${Math.min(100, it.value)}%` }} /></div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function Kanban({ section }: { section: Section }) {
  const columns = (section.columns ?? []) as Array<{ title: string; items: Array<{ label: string; badge?: string; badgeTone?: Variant }> }>;
  return (
    <div className={`grid gap-3 md:grid-cols-${Math.min(columns.length, 4)}`}>
      {columns.map((col, i) => (
        <Card key={i}>
          <CardHeader className="pb-2"><CardTitle className="text-sm">{col.title}<span className="ml-2 text-xs font-normal text-muted">{col.items.length}</span></CardTitle></CardHeader>
          <CardContent className="space-y-2 pt-0">
            {col.items.map((it, j) => (
              <div key={j} className="rounded-lg border border-border p-2.5 text-xs">
                <p className="text-foreground/90">{it.label}</p>
                {it.badge && <Badge variant={it.badgeTone ?? "outline"} className="mt-1.5">{it.badge}</Badge>}
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export const REGISTRY: Record<string, (p: { section: Section }) => ReactNode> = {
  prose: Prose,
  metrics: MetricCards,
  cards: CardGrid,
  table: Table,
  badges: BadgeList,
  code: CodeBlock,
  callout: Callout,
  steps: Steps,
  keyvalue: KeyValue,
  progress: Progress,
  kanban: Kanban,
  aisim: AiSim,
};

export { Icon };
