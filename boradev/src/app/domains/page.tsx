"use client";

import { Network, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CliEquivalent } from "@/components/cli-equivalent";

const DOMAINS = [
  { id: "identity", scope: "kernel", modules: ["party"] },
  { id: "sales", scope: "app", modules: ["listing", "order"] },
  { id: "catalog", scope: "app", modules: ["category", "attribute-set"] },
  { id: "billing", scope: "app", modules: ["invoice"] },
] as const;

const CONTRACTS: Array<{ id: string; producer: string; consumer: string; kind: string; payload: string; ok: boolean; note?: string }> = [
  { id: "c1", producer: "sales", consumer: "billing", kind: "event", payload: "order.completed v2", ok: true },
  { id: "c2", producer: "identity", consumer: "sales", kind: "endpoint", payload: "GET /api/party/:id (maskeli)", ok: true },
  { id: "c3", producer: "catalog", consumer: "sales", kind: "event", payload: "category.updated v1", ok: true },
  { id: "c4", producer: "sales", consumer: "catalog", kind: "endpoint", payload: "ten_category doğrudan tablo okuması", ok: false, note: "Kaya sınırı ihlali: kontrat dışı erişim — Contract tanımı gerekli." },
];

export default function DomainsPage() {
  const violations = CONTRACTS.filter((c) => !c.ok);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-neutral-100">
          <Network className="h-6 w-6 text-indigo-400" /> Domain &amp; Contract Haritası
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Kaya sınırları — domain&apos;ler arası her ilişki bir Contract&apos;tır; kontrat dışı erişim ihlaldir.
        </p>
      </div>

      {violations.length > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-600/10 p-4 text-sm text-red-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            {violations.length} sınır ihlali:{" "}
            {violations.map((v) => `${v.producer} → ${v.consumer} (${v.payload})`).join("; ")}
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {DOMAINS.map((d) => (
          <Card key={d.id}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                {d.id}
                <Badge variant={d.scope === "kernel" ? "default" : "outline"}>{d.scope}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-1.5">
              {d.modules.map((m) => (
                <Badge key={m} variant="secondary" className="font-mono font-normal">
                  {m}
                </Badge>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Contract listesi — kim kime hangi event/endpoint</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-left text-xs uppercase tracking-wider text-neutral-500">
                <th className="pb-2 font-medium">üreten</th>
                <th className="pb-2 font-medium">tüketen</th>
                <th className="pb-2 font-medium">tür</th>
                <th className="pb-2 font-medium">yük</th>
                <th className="pb-2 font-medium">durum</th>
              </tr>
            </thead>
            <tbody>
              {CONTRACTS.map((c) => (
                <tr key={c.id} className="border-b border-neutral-800/60">
                  <td className="py-2 text-neutral-200">{c.producer}</td>
                  <td className="py-2 text-neutral-200">{c.consumer}</td>
                  <td className="py-2 text-neutral-400">{c.kind}</td>
                  <td className="py-2 font-mono text-xs text-neutral-400">{c.payload}</td>
                  <td className="py-2">
                    {c.ok ? (
                      <Badge variant="success">ok</Badge>
                    ) : (
                      <Badge variant="destructive" title={c.note}>
                        ihlal
                      </Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <CliEquivalent tool="contract.list" args={{ app: "marketplace" }} />
    </div>
  );
}
