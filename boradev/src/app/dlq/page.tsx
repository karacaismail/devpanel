"use client";

import { useState } from "react";
import { Inbox, RotateCw, CheckCircle2, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CliEquivalent } from "@/components/cli-equivalent";

interface DlqItem {
  id: string;
  event: string;
  consumer: string;
  reason: string;
  age: string;
  attempts: number;
}

const INITIAL: DlqItem[] = [
  { id: "d1", event: "invoice.create v2", consumer: "billing", reason: "şema uyuşmazlığı (v1 tüketici)", age: "2s 14d", attempts: 3 },
  { id: "d2", event: "order.completed v2", consumer: "loyalty-points", reason: "sandbox stopped iken teslim", age: "41d", attempts: 1 },
  { id: "d3", event: "party.merged v1", consumer: "search-index", reason: "timeout 5s", age: "12d", attempts: 2 },
];

const MAIL = [
  { name: "primary-smtp", success: 99.2, sent: 4180 },
  { name: "fallback-api", success: 97.8, sent: 312 },
  { name: "dev-sink (sandbox)", success: 100, sent: 86 },
];

export default function DlqPage() {
  const [items, setItems] = useState(INITIAL);
  const [retried, setRetried] = useState(0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-neutral-100">
          <Inbox className="h-6 w-6 text-indigo-400" /> Outbox / DLQ
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Teslim edilemeyen event&apos;ler — nedeni ve yaşıyla. Tek tık yeniden işle;
          başarısızlık webhook teslimatlarından da beslenir.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Dead Letter Queue</CardTitle>
          <CardDescription>
            {items.length} bekleyen event{retried > 0 ? ` · ${retried} yeniden kuyruğa alındı` : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {items.length === 0 ? (
            <p className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-600/10 p-4 text-sm text-emerald-400">
              <CheckCircle2 className="h-4 w-4" /> DLQ boş — tüm event&apos;ler işlendi.
            </p>
          ) : (
            items.map((i) => (
              <div key={i.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 px-4 py-3 text-sm">
                <code className="font-mono text-neutral-100">{i.event}</code>
                <span className="text-neutral-500">→ {i.consumer}</span>
                <Badge variant="warning">{i.reason}</Badge>
                <span className="text-xs text-neutral-500">yaş: {i.age} · deneme: {i.attempts}</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="ml-auto"
                  onClick={() => {
                    setItems((prev) => prev.filter((x) => x.id !== i.id));
                    setRetried((n) => n + 1);
                  }}
                >
                  <RotateCw className="mr-1 h-3 w-3" /> yeniden işle
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4 text-indigo-400" /> Mail zinciri sağlığı
          </CardTitle>
          <CardDescription>Sağlayıcı eşiğin altına düşerse zincir bir sonrakine geçer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {MAIL.map((p) => (
            <div key={p.name}>
              <div className="mb-1 flex items-baseline justify-between text-sm">
                <code className="font-mono text-xs text-neutral-200">{p.name}</code>
                <span className="text-xs text-neutral-500">
                  {p.sent.toLocaleString("tr")} gönderim ·{" "}
                  <span className={p.success >= 99 ? "text-emerald-400" : "text-amber-400"}>%{p.success}</span>
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-neutral-800">
                <div
                  className={p.success >= 99 ? "h-full bg-emerald-500" : "h-full bg-amber-500"}
                  style={{ width: `${p.success}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <CliEquivalent tool="dlq.list" args={{ app: "marketplace" }} />
    </div>
  );
}
