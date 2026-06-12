"use client";

import { useMemo } from "react";
import { Share2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CliEquivalent } from "@/components/cli-equivalent";

/** Ali birleştirmesi — dairesel modül bağımlılık grafiği (DependencyGraph portu). */
const MODULES = [
  { id: "core", name: "Core (kernel)", deps: [] as string[] },
  { id: "identity", name: "Identity", deps: ["core"] },
  { id: "sales", name: "Sales", deps: ["core", "identity"] },
  { id: "billing", name: "Billing", deps: ["core", "sales"] },
  { id: "loyalty-points", name: "Loyalty Points", deps: ["sales", "identity"] },
  { id: "search-index", name: "Search Index", deps: ["sales"] },
  { id: "fraud-guard", name: "Fraud Guard", deps: ["sales"] },
];

export default function DependenciesPage() {
  const { nodes, edges } = useMemo(() => {
    const W = 640;
    const H = 380;
    const cx = W / 2;
    const cy = H / 2;
    const r = 140;
    const idx = new Map(MODULES.map((m, i) => [m.id, i]));
    const nodes = MODULES.map((m, i) => {
      const angle = (i / MODULES.length) * Math.PI * 2 - Math.PI / 2;
      return { ...m, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    });
    const edges = MODULES.flatMap((m) =>
      m.deps.filter((d) => idx.has(d)).map((d) => ({ from: idx.get(m.id)!, to: idx.get(d)! })),
    );
    return { nodes, edges };
  }, []);

  const dependents = (id: string) => MODULES.filter((m) => m.deps.includes(id)).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-neutral-100">
          <Share2 className="h-6 w-6 text-indigo-400" /> Portföy &amp; Bağımlılıklar
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Kaldırma sırası ve etki analizi için bağımlılık haritası — bir modül,
          kendisine bağımlı modüller varken kaldırılamaz.
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <svg viewBox="0 0 640 380" className="w-full">
            <defs>
              <marker id="dep-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#6366f1" opacity="0.6" />
              </marker>
            </defs>
            {edges.map((e, i) => {
              const a = nodes[e.from];
              const b = nodes[e.to];
              return (
                <line
                  key={i}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke="#404040"
                  strokeWidth={1.4}
                  markerEnd="url(#dep-arrow)"
                />
              );
            })}
            {nodes.map((n) => (
              <g key={n.id}>
                <circle cx={n.x} cy={n.y} r={26} fill="#171717" stroke={n.id === "core" ? "#6366f1" : "#404040"} strokeWidth={n.id === "core" ? 2 : 1.2} />
                <text x={n.x} y={n.y + 3} textAnchor="middle" fontSize={9.5} fill="#e5e5e5" className="select-none">
                  {n.id.length > 10 ? n.id.slice(0, 9) + "…" : n.id}
                </text>
              </g>
            ))}
          </svg>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Kaldırma etki analizi</CardTitle>
          <CardDescription>Ok yönü: bağımlı → bağımlılık.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {MODULES.map((m) => (
            <div key={m.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2 text-sm">
              <code className="font-mono text-xs text-neutral-100">{m.id}</code>
              <span className="text-xs text-neutral-500">
                bağımlılıkları: {m.deps.length > 0 ? m.deps.join(", ") : "—"}
              </span>
              <span className="ml-auto">
                {dependents(m.id) > 0 ? (
                  <Badge variant="warning">{dependents(m.id)} modül buna bağımlı — kaldırılamaz</Badge>
                ) : (
                  <Badge variant="success">güvenle kaldırılabilir</Badge>
                )}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Atonota S15 — Portföy: programlar, ürün aileleri, ownership */}
      <Card>
        <CardContent className="p-4 text-xs">
          <p className="text-sm font-medium text-neutral-100">Portföy</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-neutral-800 p-2.5"><p className="text-neutral-500">program</p><p className="text-neutral-200">SaaS Suite 2030</p><p className="mt-0.5 text-neutral-500">owner: ismail · faz: Metadata/UI freeze</p></div>
            <div className="rounded-lg border border-neutral-800 p-2.5"><p className="text-neutral-500">ürün aileleri</p><p className="text-neutral-200">CRM · HRMS · Commerce</p><p className="mt-0.5 text-neutral-500">3 aile · 7 modül · 2 blueprint</p></div>
            <div className="rounded-lg border border-neutral-800 p-2.5"><p className="text-neutral-500">ownership</p><p className="font-mono text-neutral-200">sales→bora · identity→ismail · billing→ali</p><p className="mt-0.5 text-neutral-500">sahipsiz düğüm yok ✓</p></div>
          </div>
          <p className="mt-2 text-neutral-500">CRM/HRMS/e-ticaret üst menü değil, bu portföydeki app ailesi nesneleridir (Backstage deseni).</p>
        </CardContent>
      </Card>

      <CliEquivalent tool="module.deps" args={{ app: "marketplace" }} />
    </div>
  );
}
