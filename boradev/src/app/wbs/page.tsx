"use client";

import { useState } from "react";
import { ListTree, CheckCircle2, Circle, Sparkles, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CliEquivalent } from "@/components/cli-equivalent";

/** Granülerlik cetveli (ADR-0008 Rev.2): yeni ad önde, metafor parantezde. */
const LEVELS = [
  { id: "dag", ad: "App", metafor: "Dağ", sp: 34, rank: 0 },
  { id: "kaya", ad: "Domain", metafor: "Kaya", sp: 21, rank: 1 },
  { id: "buyuk-tas", ad: "ArcheType", metafor: "Büyük Taş", sp: 13, rank: 2 },
  { id: "orta-tas", ad: "Surface/Workflow", metafor: "Orta Taş", sp: 8, rank: 3 },
  { id: "kucuk-tas", ad: "Fragment", metafor: "Küçük Taş", sp: 5, rank: 4 },
  { id: "cakil", ad: "Alan", metafor: "Çakıl", sp: 3, rank: 5 },
] as const;

type LevelId = (typeof LEVELS)[number]["id"];
const badge = (id: LevelId) => {
  const l = LEVELS.find((x) => x.id === id)!;
  return `${l.ad} (${l.metafor} · ${l.sp})`;
};

interface Node {
  id: string;
  name: string;
  level: LevelId;
  done?: boolean;
  depth: number;
}

const TREE: Node[] = [
  { id: "root", name: "marketplace", level: "dag", depth: 0 },
  { id: "sales", name: "sales", level: "kaya", depth: 1 },
  { id: "listing", name: "listing", level: "buyuk-tas", done: true, depth: 2 },
  { id: "listing-surface", name: "listing-default surface", level: "orta-tas", done: true, depth: 3 },
  { id: "listing-flow", name: "listing-flow workflow", level: "orta-tas", depth: 3 },
  { id: "order", name: "order", level: "buyuk-tas", depth: 2 },
  { id: "identity", name: "identity (kernel)", level: "kaya", depth: 1 },
  { id: "party", name: "party", level: "buyuk-tas", done: true, depth: 2 },
];

const TOTAL_SP = TREE.reduce((s, n) => s + LEVELS.find((l) => l.id === n.level)!.sp, 0);

/** Komşuluk kuralı: bağlamın altına yalnızca BİR alt seviye eklenebilir. */
function checkNeighborhood(contextRank: number, targetRank: number): string | null {
  if (targetRank === contextRank + 1) return null;
  if (targetRank <= contextRank) return "Bağlamın altına aynı ya da daha büyük seviye eklenemez.";
  const skipped = LEVELS.filter((l) => l.rank > contextRank && l.rank < targetRank)
    .map((l) => l.ad)
    .join(" → ");
  return `Seviye atlanamaz — aradaki seviyeler: ${skipped}.`;
}

export default function WbsPage() {
  const [ai, setAi] = useState("");

  /* "AI'a tarif et" — bağlam: sales (Domain/Kaya, rank 1) */
  const parsed = (() => {
    const m = /([a-z0-9_]+)\s+(dağ|kaya|büyük taş|orta taş|küçük taş|çakıl)\s+yap/i.exec(
      ai.toLocaleLowerCase("tr"),
    );
    if (!m) return null;
    const map: Record<string, LevelId> = {
      "dağ": "dag", kaya: "kaya", "büyük taş": "buyuk-tas",
      "orta taş": "orta-tas", "küçük taş": "kucuk-tas", "çakıl": "cakil",
    };
    const level = LEVELS.find((l) => l.id === map[m[2]])!;
    return { name: m[1], level, violation: checkNeighborhood(1, level.rank) };
  })();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-neutral-100">
          <ListTree className="h-6 w-6 text-indigo-400" /> WBS / Backlog
        </h1>
        <Badge variant="outline" className="font-mono">Σ {TOTAL_SP} SP</Badge>
        <Badge variant="success">komşuluk denetimi temiz — plan kaydedilebilir</Badge>
      </div>

      <Card>
        <CardContent className="space-y-1.5 p-4">
          {TREE.map((n) => (
            <div
              key={n.id}
              className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2 text-sm"
              style={{ marginLeft: n.depth * 20 }}
            >
              {n.done ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <Circle className="h-4 w-4 text-neutral-600" />
              )}
              <span className="text-neutral-100">{n.name}</span>
              <Badge variant="secondary" className="font-normal">{badge(n.level)}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-indigo-400" /> AI&apos;a tarif et
          </CardTitle>
          <CardDescription>Bağlam: sales — Domain (Kaya · 21). Komşuluk denetiminden geçer.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            aria-label="AI'a tarif et"
            value={ai}
            onChange={(e) => setAi(e.target.value)}
            placeholder='"payment büyük taş yap"'
            className="font-mono"
          />
          {parsed && (
            <p className={`mt-3 flex items-start gap-2 text-sm ${parsed.violation ? "text-red-400" : "text-emerald-400"}`}>
              {parsed.violation && <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
              {parsed.violation
                ? parsed.violation
                : `Plan önerisi: sales altına "${parsed.name}" — ${badge(parsed.level.id)}. Scaffold testi İLK üretir.`}
            </p>
          )}
        </CardContent>
      </Card>

      <CliEquivalent tool="wbs.read" args={{ app: "marketplace" }} />
    </div>
  );
}
