"use client";

import { useState } from "react";
import { Radio } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CliEquivalent } from "@/components/cli-equivalent";
import { cn } from "@/lib/utils";

const EVENTS = [
  {
    name: "order.completed",
    version: 2,
    producer: "sales",
    subscribers: ["billing", "loyalty-points"],
    rate: 340,
    payload: `event: order.completed
version: 2
payload:
  order_id:   { type: uuid, required: true }
  buyer:      { type: ref(party), required: true }
  total:      { type: money, required: true }
  settlement: { type: object }   # v2'de eklendi
# v1 tüketicileri için uyum köprüsü: 2026-09'a dek`,
  },
  {
    name: "party.merged",
    version: 1,
    producer: "identity (kernel)",
    subscribers: ["search-index", "sales"],
    rate: 4,
    payload: `event: party.merged
version: 1
payload:
  winner_id: { type: uuid, required: true }
  loser_id:  { type: uuid, required: true }
# pii taşımaz — yalnız kimlik referansları`,
  },
  {
    name: "listing.published",
    version: 1,
    producer: "sales",
    subscribers: ["search-index", "seo-meta"],
    rate: 95,
    payload: `event: listing.published
version: 1
payload:
  listing_id:   { type: uuid, required: true }
  published_at: { type: timestamp, required: true }`,
  },
];

export default function EventsPage() {
  const [sel, setSel] = useState(EVENTS[0]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-neutral-100">
          <Radio className="h-6 w-6 text-indigo-400" /> Event Kataloğu
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Outbox&apos;tan yayınlanan event&apos;ler — payload şeması sözleşmedir; kırıcı
          değişiklik yeni versiyon açar.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
        <div className="space-y-1.5">
          {EVENTS.map((e) => (
            <button
              key={e.name}
              type="button"
              onClick={() => setSel(e)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                sel.name === e.name
                  ? "border-indigo-500/40 bg-indigo-600/10 text-indigo-300"
                  : "border-neutral-800 text-neutral-400 hover:bg-neutral-800"
              )}
            >
              <Radio className="h-4 w-4 shrink-0" />
              <span className="truncate font-mono text-xs">{e.name}</span>
              <Badge variant="outline" className="ml-auto">v{e.version}</Badge>
              <span className="text-[11px] text-neutral-500">{e.rate}/sa</span>
            </button>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-base">
              {sel.name} v{sel.version}
            </CardTitle>
            <CardDescription className="flex flex-wrap items-center gap-1.5">
              üreten: <Badge variant="secondary" className="font-mono font-normal">{sel.producer}</Badge>
              aboneler:
              {sel.subscribers.map((s) => (
                <Badge key={s} variant="outline" className="font-mono">{s}</Badge>
              ))}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-2 text-[11px] uppercase tracking-wider text-neutral-500">payload şeması</p>
            <pre className="overflow-auto rounded-lg bg-neutral-950 p-4 font-mono text-xs leading-relaxed text-neutral-300">
              {sel.payload}
            </pre>
          </CardContent>
        </Card>
      </div>

      <CliEquivalent tool="event.list" args={{ app: "marketplace" }} />
    </div>
  );
}
