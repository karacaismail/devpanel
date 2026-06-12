"use client";

import { useState } from "react";
import { Tags, Pin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CliEquivalent } from "@/components/cli-equivalent";

const RELEASES = [
  {
    id: "2026-06",
    date: "2026-06-01",
    current: true,
    changelog: [
      "party: +loyalty_tier custom field desteği (tenant katmanı)",
      "listing-flow v3: review → draft geri-gönderim geçişi",
      "GraphQL: parties(filter) sayfalama imzası netleşti",
    ],
  },
  {
    id: "2026-03",
    date: "2026-03-01",
    current: false,
    changelog: [
      "listing: bitemporal çift zaman ekseni",
      "order.completed v2: payload'a settlement bloğu",
      "REST: PATCH diff'leri audit'e zorunlu yazım",
    ],
  },
  {
    id: "2025-12",
    date: "2025-12-01",
    current: false,
    changelog: ["İlk kararlı şema — party, listing, order çekirdeği"],
  },
];

const TENANTS = ["acme", "globex", "initech"];

export default function ReleasesPage() {
  const [pins, setPins] = useState<Record<string, string>>({
    acme: "2026-03",
    globex: "2026-06",
    initech: "2026-06",
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-neutral-100">
          <Tags className="h-6 w-6 text-indigo-400" /> Sürümler
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Şema release&apos;leri ve tenant pinleri — pin, tenant&apos;ı kırıcı değişimden korur;
          köprü süresi sonunda güncellenmek zorundadır.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {RELEASES.map((r) => (
          <Card key={r.id} className={r.current ? "border-indigo-500/40" : undefined}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 font-mono text-base">
                {r.id}
                {r.current && <Badge>güncel</Badge>}
                <span className="ml-auto text-xs font-normal text-neutral-500">{r.date}</span>
              </CardTitle>
              <CardDescription>Changelog</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5">
              {r.changelog.map((c) => (
                <p key={c} className="rounded-md bg-neutral-950 px-3 py-1.5 text-xs text-neutral-300">
                  {c}
                </p>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Pin className="h-4 w-4 text-amber-400" /> Tenant şema pinleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-left text-xs uppercase tracking-wider text-neutral-500">
                <th className="pb-2 font-medium">tenant</th>
                <th className="pb-2 font-medium">pinli sürüm</th>
                <th className="pb-2 font-medium">durum</th>
              </tr>
            </thead>
            <tbody>
              {TENANTS.map((t) => {
                const current = pins[t] === RELEASES[0].id;
                return (
                  <tr key={t} className="border-b border-neutral-800/60">
                    <td className="py-2 text-neutral-200">{t}</td>
                    <td className="py-2">
                      <select
                        aria-label={`${t} pin`}
                        value={pins[t]}
                        onChange={(e) => setPins((prev) => ({ ...prev, [t]: e.target.value }))}
                        className="rounded-md border border-neutral-800 bg-neutral-900 px-2 py-1 font-mono text-xs text-neutral-200"
                      >
                        {RELEASES.map((r) => (
                          <option key={r.id} value={r.id}>{r.id}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2">
                      {current ? (
                        <Badge variant="success">güncel</Badge>
                      ) : (
                        <Badge variant="warning">eski sürümde — köprü aktif</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <CliEquivalent tool="release.list" args={{ app: "marketplace" }} />
    </div>
  );
}
