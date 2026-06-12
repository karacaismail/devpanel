"use client";

import { Server } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { CliEquivalent } from "@/components/cli-equivalent";

const FLEET = [
  { id: "fra-app-01", region: "eu-central (FRA)", plan: "EPYC 16c/64GB", cpu: 38, mem: 61, role: "app", status: "ok" },
  { id: "fra-db-01", region: "eu-central (FRA)", plan: "EPYC 8c/64GB NVMe", cpu: 22, mem: 71, role: "db", status: "ok" },
  { id: "ist-edge-01", region: "tr-ist (IST)", plan: "8c/32GB", cpu: 12, mem: 30, role: "edge", status: "ok" },
  { id: "fra-worker-02", region: "eu-central (FRA)", plan: "4c/16GB", cpu: 84, mem: 77, role: "worker", status: "degraded" },
];

const SCALING = [
  { rule: "app: CPU > %70 (5dk)", action: "+1 instance (maks 6)", on: true },
  { rule: "worker: kuyruk > 500 iş", action: "+2 worker (maks 8)", on: true },
  { rule: "gece 02-06 ölçek küçült", action: "app → 2 instance", on: false },
];

export default function InfrastructurePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Server}
        title="Sunucu Filosu"
        description="Bölge, plan ve kullanım — ölçekleme kuralları tanımdan yönetilir; sunucuya elle dokunulmaz."
        lifecycle="Released"
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filo</CardTitle>
          <CardDescription>{FLEET.length} sunucu · 2 bölge · hibrit bulut hazır</CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-left text-xs uppercase tracking-wider text-neutral-500">
                <th className="pb-2 font-medium">sunucu</th>
                <th className="pb-2 font-medium">bölge</th>
                <th className="pb-2 font-medium">plan</th>
                <th className="pb-2 font-medium">cpu / bellek</th>
                <th className="pb-2 font-medium">rol</th>
                <th className="pb-2 font-medium">durum</th>
              </tr>
            </thead>
            <tbody>
              {FLEET.map((s) => (
                <tr key={s.id} className="border-b border-neutral-800/60">
                  <td className="py-2 font-mono text-xs text-neutral-100">{s.id}</td>
                  <td className="py-2 text-xs text-neutral-400">{s.region}</td>
                  <td className="py-2 text-xs text-neutral-400">{s.plan}</td>
                  <td className="py-2">
                    <div className="flex w-36 flex-col gap-1">
                      {[s.cpu, s.mem].map((v, i) => (
                        <div key={i} className="h-1.5 overflow-hidden rounded-full bg-neutral-800">
                          <div className={v > 80 ? "h-full bg-red-500" : v > 60 ? "h-full bg-amber-500" : "h-full bg-emerald-500"} style={{ width: `${v}%` }} />
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="py-2"><Badge variant="outline">{s.role}</Badge></td>
                  <td className="py-2"><Badge variant={s.status === "ok" ? "success" : "warning"}>{s.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ölçekleme kuralları</CardTitle>
          <CardDescription>Otomatik yatay ölçekleme — değişiklik onay kapısından geçer.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {SCALING.map((r) => (
            <div key={r.rule} className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2 text-sm">
              <code className="font-mono text-xs text-neutral-200">{r.rule}</code>
              <span className="text-xs text-neutral-500">→ {r.action}</span>
              <Badge variant={r.on ? "success" : "secondary"} className="ml-auto">{r.on ? "aktif" : "kapalı"}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <CliEquivalent tool="infra.fleet" args={{ region: "all" }} />
    </div>
  );
}
