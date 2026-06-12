"use client";

import { useState } from "react";
import { Boxes, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/page-header";
import { CliEquivalent } from "@/components/cli-equivalent";

const STORES = [
  { id: "docs-embeddings", model: "text-embedding-3-small", dim: 1536, vectors: 12480, pipeline: "docs değişince otomatik", fresh: "%98" },
  { id: "party-similarity", model: "local-minilm", dim: 384, vectors: 48200, pipeline: "gece toplu (03:30)", fresh: "%100" },
  { id: "issue-dedup", model: "text-embedding-3-small", dim: 1536, vectors: 1430, pipeline: "issue açılınca", fresh: "%100" },
];

export default function VectorsPage() {
  const [q, setQ] = useState("webhook imza doğrulaması saat farkı");
  const [results, setResults] = useState<Array<{ text: string; score: number }> | null>(null);

  const search = () =>
    setResults([
      { text: "BUG-137: Webhook imza doğrulaması saat farkında 500 dönüyor", score: 0.93 },
      { text: "docs: webhook imzalama ve tolerans penceresi", score: 0.87 },
      { text: "BUG-112: zaman damgası kayması (kapalı)", score: 0.74 },
    ]);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Boxes}
        title="Vektör Depoları"
        description="Embedding pipeline'ları ve benzerlik araması — PII içeren alanlar embedding'e maskelenerek girer."
        lifecycle="Staged"
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Depolar</CardTitle>
          <CardDescription>{STORES.length} koleksiyon · pipeline'lar tanımdan tetiklenir</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {STORES.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2 text-sm">
              <code className="font-mono text-xs text-neutral-100">{s.id}</code>
              <Badge variant="outline" className="font-mono">{s.model}</Badge>
              <Badge variant="secondary">{s.dim}d</Badge>
              <span className="text-xs text-neutral-500">{s.vectors.toLocaleString("tr")} vektör · {s.pipeline}</span>
              <Badge variant="success" className="ml-auto">tazelik {s.fresh}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Search className="h-4 w-4 text-indigo-400" /> Benzerlik arama test paneli
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input aria-label="benzerlik sorgusu" value={q} onChange={(e) => setQ(e.target.value)} />
            <Button size="sm" onClick={search}>ara</Button>
          </div>
          {results && (
            <div className="mt-3 space-y-1.5">
              {results.map((r) => (
                <div key={r.text} className="flex items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2 text-xs">
                  <span className="text-neutral-200">{r.text}</span>
                  <Badge variant={r.score > 0.85 ? "success" : "secondary"} className="ml-auto font-mono">{r.score.toFixed(2)}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CliEquivalent tool="vector.query" args={{ store: "issue-dedup", "top-k": 3 }} />
    </div>
  );
}
