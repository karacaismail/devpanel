"use client";

import { useState } from "react";
import { Waypoints } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { CliEquivalent } from "@/components/cli-equivalent";
import { cn } from "@/lib/utils";

const TRACES = [
  {
    id: "tr-8f31",
    op: "POST /api/order",
    ms: 412,
    tenant: "acme",
    spans: [
      { name: "http.request", ms: 412, depth: 0 },
      { name: "auth.verify (JWT + RLS bağlamı)", ms: 8, depth: 1 },
      { name: "db.tx ten_orders INSERT", ms: 96, depth: 1 },
      { name: "outbox.enqueue order.completed", ms: 12, depth: 2 },
      { name: "webhook.dispatch billing-sync", ms: 240, depth: 1 },
    ],
  },
  {
    id: "tr-8f2c",
    op: "GET /api/party?filter",
    ms: 2340,
    tenant: "globex",
    spans: [
      { name: "http.request", ms: 2340, depth: 0 },
      { name: "db.query parties (index'siz tarama!)", ms: 2210, depth: 1 },
      { name: "pii.mask uygulandı", ms: 4, depth: 1 },
    ],
  },
];

const PCT = { p50: "84ms", p95: "410ms", p99: "2.3s" };

export default function TracesPage() {
  const [sel, setSel] = useState(TRACES[0]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Waypoints}
        title="Trace'ler"
        description="OpenTelemetry üçlüsünün üçüncü ayağı — istek yolculuğu span ağacıyla, gecikme dağılımıyla."
        lifecycle="Released"
      />

      <div className="grid grid-cols-3 gap-3">
        {Object.entries(PCT).map(([k, v]) => (
          <Card key={k}>
            <CardContent className="p-4">
              <p className="text-[11px] uppercase tracking-wider text-neutral-500">{k}</p>
              <p className={cn("mt-1 text-xl", k === "p99" ? "text-amber-400" : "text-neutral-100")}>{v}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[20rem_1fr]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Trace listesi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {TRACES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSel(t)}
                className={cn(
                  "w-full rounded-lg border px-3 py-2 text-left text-xs",
                  sel.id === t.id ? "border-indigo-500/40 bg-indigo-600/10" : "border-neutral-800 hover:bg-neutral-800/50"
                )}
              >
                <code className="font-mono text-neutral-100">{t.op}</code>
                <p className="mt-0.5 text-neutral-500">
                  {t.id} · {t.tenant} ·{" "}
                  <span className={t.ms > 1000 ? "text-red-400" : "text-emerald-400"}>{t.ms}ms</span>
                </p>
              </button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="font-mono text-base">{sel.id} — span ağacı</CardTitle>
            <CardDescription>{sel.op} · toplam {sel.ms}ms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {sel.spans.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-xs" style={{ marginLeft: s.depth * 18 }}>
                <span className="w-44 truncate font-mono text-neutral-300">{s.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded bg-neutral-900">
                  <div
                    className={s.ms > 1000 ? "h-full bg-red-500/70" : "h-full bg-indigo-500/70"}
                    style={{ width: `${Math.min(100, (s.ms / sel.ms) * 100)}%` }}
                  />
                </div>
                <span className="w-14 text-right font-mono text-neutral-500">{s.ms}ms</span>
              </div>
            ))}
            {sel.ms > 1000 && (
              <p className="pt-2 text-xs text-amber-400">
                AI önerisi: index&apos;siz tarama tespit edildi — Komut Merkezi&apos;nden &quot;? bu trace neden yavaş&quot; sorulabilir.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <CliEquivalent tool="trace.get" args={{ id: sel.id }} />
    </div>
  );
}
