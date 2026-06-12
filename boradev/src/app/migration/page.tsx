"use client";

import { useState } from "react";
import { GitMerge, CheckCircle2, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CliEquivalent } from "@/components/cli-equivalent";

const DIFF = [
  { tone: "text-emerald-400", line: "+ loyalty_tier: string  (tenant: acme)" },
  { tone: "text-amber-400", line: "~ phone: required → nullable" },
  { tone: "text-red-400", line: "- legacy_code: string" },
];

const STEPS = [
  "ALTER TABLE ten_party ADD COLUMN loyalty_tier TEXT;",
  "ALTER TABLE ten_party ALTER COLUMN phone DROP NOT NULL;",
  "-- GUARD: legacy_code 30 gün soft-drop (rename _deprecated_legacy_code); kalıcı DROP ayrı onay ister.",
];

interface QueueItem {
  id: string;
  module: string;
  summary: string;
  llm: string | null;
  status: "kuyrukta" | "uygulandı" | "geri-alındı";
}

const QUEUE: QueueItem[] = [
  { id: "q-7", module: "party", summary: "+loyalty_tier, phone nullable, legacy_code soft-drop", llm: "öneri-hazır", status: "kuyrukta" },
  { id: "q-6", module: "listing", summary: "+state workflow bağı (listing-flow v3)", llm: null, status: "uygulandı" },
];

export default function MigrationPage() {
  const [queue, setQueue] = useState(QUEUE);

  const set = (id: string, status: QueueItem["status"]) =>
    setQueue((prev) => prev.map((m) => (m.id === id ? { ...m, status } : m)));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-neutral-100">
          <GitMerge className="h-6 w-6 text-indigo-400" /> Migration Paneli
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Şema diff&apos;inden üretilen migration önizlemesi. LLM-review etiketi
          öneridir, karar değildir.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">q-7: party diff önizlemesi</CardTitle>
          <CardDescription>Alan ekle/sil/değiş renk kodlu; üretilecek migration altta.</CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="rounded-lg bg-neutral-950 p-4 font-mono text-sm leading-relaxed">
            {DIFF.map((d) => (
              <div key={d.line} className={d.tone}>{d.line}</div>
            ))}
          </pre>
          <div className="mt-3 rounded-lg border border-neutral-800 bg-neutral-950 p-4">
            <p className="mb-2 text-[11px] uppercase tracking-wider text-neutral-500">Üretilecek migration</p>
            {STEPS.map((s) => (
              <p key={s} className="font-mono text-xs leading-relaxed text-neutral-300">{s}</p>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Kuyruk</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {queue.map((m) => (
            <div key={m.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 px-4 py-3 text-sm">
              <code className="font-mono text-indigo-400">{m.id}</code>
              <Badge variant="outline" className="font-mono">{m.module}</Badge>
              <span className="text-neutral-300">{m.summary}</span>
              {m.llm && (
                <Badge variant="warning" title="öneri ≠ karar">LLM-review: {m.llm}</Badge>
              )}
              <span className="ml-auto flex items-center gap-2">
                {m.status === "kuyrukta" ? (
                  <Button size="sm" onClick={() => set(m.id, "uygulandı")}>uygula</Button>
                ) : m.status === "uygulandı" ? (
                  <>
                    <Badge variant="success" className="gap-1">
                      <CheckCircle2 className="h-3 w-3" /> uygulandı
                    </Badge>
                    <Button size="sm" variant="outline" onClick={() => set(m.id, "geri-alındı")}>
                      <RotateCcw className="mr-1 h-3 w-3" /> geri al
                    </Button>
                  </>
                ) : (
                  <Badge variant="warning">geri alındı</Badge>
                )}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Atonota S8 — versiyon yükseltme sihirbazı */}
      <Card>
        <CardContent className="p-4 text-xs">
          <p className="text-sm font-medium text-neutral-100">Versiyon yükseltme sihirbazı — şema 2026-03 → 2026-06</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {["uyumluluk taraması ✓", "pinli tenant analizi ✓ (acme köprüde)", "kuru koşu (staging) ✓", "yedek al", "uygula", "doğrula"].map((s, i) => (
              <span key={s} className={i < 3 ? "rounded-full border border-emerald-500/40 px-2 py-0.5 text-emerald-400" : "rounded-full border border-neutral-800 px-2 py-0.5 text-neutral-500"}>{s}</span>
            ))}
          </div>
          <p className="mt-2 text-neutral-500">Sonraki adım yedek almadan başlamaz; prod uygulaması release dossier imzaları tamamlanmadan kilitlidir.</p>
        </CardContent>
      </Card>

      <CliEquivalent tool="migration.apply" args={{ id: "q-7", "dry-run": true }} />
    </div>
  );
}
