"use client";

import { Map, ThumbsUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CliEquivalent } from "@/components/cli-equivalent";

/** Ali güncellemesi — Roadmap: aşama kolonları, oy destekli önceliklendirme. */

const STAGES = [
  {
    name: "Keşif",
    items: [
      { id: "FTR-61", title: "Çoklu dil içerik alanları (i18n field)", votes: 9 },
      { id: "FTR-62", title: "Tenant self-service tema editörü", votes: 5 },
    ],
  },
  {
    name: "Planlandı",
    items: [
      { id: "FTR-59", title: "Data Browser asOf zaman gezgini (bitemporal-ui)", votes: 14 },
      { id: "FTR-60", title: "Webhook yeniden deneme politikası editörü", votes: 6 },
    ],
  },
  {
    name: "Yapılıyor",
    items: [{ id: "FTR-58", title: "Surface builder alan grubu desteği", votes: 11 }],
  },
  {
    name: "Yayında",
    items: [
      { id: "FTR-54", title: "AI triage (issues)", votes: 18 },
      { id: "FTR-51", title: "Deploy hattı + rollback", votes: 13 },
    ],
  },
];

export default function RoadmapPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-neutral-100">
          <Map className="h-6 w-6 text-indigo-400" /> Roadmap
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Issue&apos;lardan beslenen yol haritası — oylar önceliklendirir, aşamalar
          change-set&apos;lerle ilerler.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {STAGES.map((s, idx) => (
          <Card key={s.name} className={idx === 2 ? "border-indigo-500/30" : undefined}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">{s.name}</CardTitle>
              <CardDescription>{s.items.length} kayıt</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {s.items.map((i) => (
                <div key={i.id} className="rounded-lg border border-neutral-800 p-3">
                  <code className="font-mono text-xs text-indigo-400">{i.id}</code>
                  <p className="mt-1 text-sm text-neutral-200">{i.title}</p>
                  <Badge variant="outline" className="mt-2 gap-1">
                    <ThumbsUp className="h-2.5 w-2.5" /> {i.votes}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <CliEquivalent tool="roadmap.read" args={{ app: "marketplace" }} />
    </div>
  );
}
