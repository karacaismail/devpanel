"use client";

import { useState } from "react";
import { Bot, ChevronDown, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CliEquivalent } from "@/components/cli-equivalent";

/** Ali güncellemesi — Agent Runs: AI agent koşu geçmişi, tool çağrısı izli. */

interface Run {
  id: string;
  agent: string;
  prompt: string;
  status: "ok" | "fail" | "dry-run";
  duration: string;
  at: string;
  steps: Array<{ tool: string; args: string; result: string }>;
}

const RUNS: Run[] = [
  {
    id: "r-318",
    agent: "vibebot",
    prompt: "party için segment alanı ekle ve listeleme surface'ına koy",
    status: "ok",
    duration: "4.2s",
    at: "11:42",
    steps: [
      { tool: "archetype.read", args: "{ id: party }", result: "tanım okundu (6 alan)" },
      { tool: "archetype.field.add", args: "{ name: segment, type: enum, pii: false }", result: "tenant-scoped alan eklendi" },
      { tool: "surface.update", args: "{ id: party-default, add: segment }", result: "YAML patch üretildi, diff onaylandı" },
      { tool: "check.run", args: "{}", result: "24/24 sözleşme yeşil" },
    ],
  },
  {
    id: "r-317",
    agent: "migration-reviewer",
    prompt: "q-7 migration'ını riske göre değerlendir",
    status: "dry-run",
    duration: "2.1s",
    at: "10:18",
    steps: [
      { tool: "migration.read", args: "{ id: q-7 }", result: "3 adım analiz edildi" },
      { tool: "migration.review", args: "{ id: q-7 }", result: "öneri: soft-drop GUARD yeterli, risk düşük (öneri ≠ karar)" },
    ],
  },
  {
    id: "r-316",
    agent: "vibebot",
    prompt: "tüm tenant'larda loyalty ledger'a yazma izni ver",
    status: "fail",
    duration: "0.4s",
    at: "09:55",
    steps: [
      { tool: "agent.scope.set", args: "{ scopes: [ledger.write, party.write, listing.write] }", result: "REDDEDİLDİ: geniş blast-radius — isim-yazarak insan onayı gerekli" },
    ],
  },
];

const STATUS_VARIANT = { ok: "success", fail: "destructive", "dry-run": "warning" } as const;

export default function AgentRunsPage() {
  const [open, setOpen] = useState<string | null>("r-318");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-neutral-100">
          <Bot className="h-6 w-6 text-indigo-400" /> Agent Runs
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Her AI koşusu adım adım tool çağrılarıyla kayıtlıdır — agent, panelin
          yapabildiğinden fazlasını yapamaz; geniş yetki insan onayında durur.
        </p>
      </div>

      <div className="space-y-2">
        {RUNS.map((r) => {
          const isOpen = open === r.id;
          return (
            <Card key={r.id}>
              <CardContent className="p-0">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : r.id)}
                  className="flex w-full flex-wrap items-center gap-2 px-4 py-3 text-left text-sm"
                >
                  {isOpen ? <ChevronDown className="h-4 w-4 text-neutral-500" /> : <ChevronRight className="h-4 w-4 text-neutral-500" />}
                  <code className="font-mono text-xs text-indigo-400">{r.id}</code>
                  <Badge variant="secondary">{r.agent}</Badge>
                  <span className="min-w-0 flex-1 truncate text-neutral-200">&quot;{r.prompt}&quot;</span>
                  <Badge variant={STATUS_VARIANT[r.status]}>{r.status}</Badge>
                  <span className="text-xs text-neutral-500">{r.duration} · {r.at}</span>
                </button>
                {isOpen && (
                  <div className="space-y-1.5 border-t border-neutral-800 px-4 py-3">
                    {r.steps.map((s, i) => (
                      <div key={i} className="flex flex-wrap items-baseline gap-2 text-xs">
                        <span className="font-mono text-neutral-600">{i + 1}.</span>
                        <code className="font-mono text-indigo-300">{s.tool}</code>
                        <code className="font-mono text-neutral-500">{s.args}</code>
                        <span className={s.result.startsWith("REDDEDİLDİ") ? "text-red-400" : "text-neutral-400"}>
                          → {s.result}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Atonota S12 — AI gözlemlenebilirlik */}
      <Card>
        <CardContent className="p-4 text-xs">
          <p className="text-sm font-medium text-neutral-100">AI gözlemlenebilirlik</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-neutral-800 p-2.5"><p className="text-neutral-500">bugünkü koşular</p><p className="font-mono text-neutral-200">18 run · 41K token · $0.62 · p95 3.8s</p></div>
            <div className="rounded-lg border border-neutral-800 p-2.5"><p className="text-neutral-500">ajan grafiği</p><p className="font-mono text-neutral-200">vibebot → migration-reviewer (2 devir) · döngü yok ✓</p></div>
            <div className="rounded-lg border border-neutral-800 p-2.5"><p className="text-neutral-500">anotasyon kuyruğu</p><p className="font-mono text-neutral-200">3 yanıt insan değerlendirmesi bekliyor → eval dataset&apos;ine akar</p></div>
          </div>
        </CardContent>
      </Card>

      <CliEquivalent tool="agent.runs" args={{ limit: 20 }} />
    </div>
  );
}
