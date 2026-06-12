"use client";

import { useState } from "react";
import { Landmark, FileCheck2, GitCompareArrows, Stamp, CircleDot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CliEquivalent } from "@/components/cli-equivalent";
import { cn } from "@/lib/utils";

/**
 * Atonota — Yönetişim & Kalite (şelale kontrol katmanı):
 * Requirements → ADR → Traceability → Test Evidence → Change Request → Gates → Sign-off.
 */

const REQUIREMENTS = [
  { id: "REQ-112", text: "Tenant verileri fiziksel olarak izole edilmeli (per-DB)", v: "test", apps: ["kernel"], status: "doğrulandı" },
  { id: "REQ-114", text: "PII alanları her yüzeyde maskeli sunulmalı", v: "test", apps: ["crm", "kernel"], status: "doğrulandı" },
  { id: "REQ-121", text: "Şema değişikliği onaysız üretime çıkamamalı", v: "inceleme", apps: ["kernel"], status: "baseline" },
  { id: "REQ-128", text: "AI eylemleri açık insan onayı gerektirmeli (otopilot kapalı)", v: "analiz", apps: ["ai-layer"], status: "taslak" },
];

const ADRS = [
  { id: "ADR-0007", title: "kernel/core/app/module katmanlaması", impact: "tüm modüller" },
  { id: "ADR-0008", title: "Granülerlik cetveli + komşuluk kuralı", impact: "WBS, scaffold" },
  { id: "ADR-0010", title: "Surface/Domain/Workflow ayrımı", impact: "forms, workflows" },
];

const TRACE = [
  { req: "REQ-112", design: "ADR-0007", test: "party.rls.test.ts", release: "v1.7.2", ok: true },
  { req: "REQ-114", design: "ADR-0010", test: "party.pii-mask.test.ts", release: "v1.7.2", ok: true },
  { req: "REQ-121", design: "ADR-0008", test: "—", release: "—", ok: false },
];

const GATES: Array<{ name: string; ok: boolean; current?: boolean }> = [
  { name: "Need confirmed", ok: true },
  { name: "Requirements baseline", ok: true },
  { name: "Architecture review", ok: true },
  { name: "Metadata/UI freeze", ok: false, current: true },
  { name: "Integration contract review", ok: false },
  { name: "Test readiness", ok: false },
  { name: "UAT / Operational readiness", ok: false },
  { name: "Production promotion", ok: false },
];

const CHANGE_REQUESTS = [
  { id: "CR-31", title: "party.loyalty_tier alanı (acme talebi)", risk: "düşük", chain: ["ismail ✓", "mimari ✓", "release ◌"] },
  { id: "CR-29", title: "listing-flow v3 telafi düzeltmesi", risk: "orta", chain: ["ali ✓", "mimari ◌"] },
];

export default function GovernancePage() {
  const [signed, setSigned] = useState<string[]>([]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-neutral-100">
          <Landmark className="h-6 w-6 text-indigo-400" /> Yönetişim &amp; Kalite
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Şelale kontrol katmanı: her nesnenin hangi gereksinimden doğduğu, hangi
          incelemede onaylandığı ve hangi release ile çıktığı görünür — kanıtlanabilir izlenebilirlik.
        </p>
      </div>

      {/* Faz kapıları */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CircleDot className="h-4 w-4 text-indigo-400" /> Yaşam döngüsü kapıları (Phase Gates)
          </CardTitle>
          <CardDescription>Kapı geçilmeden sonraki faz başlamaz; her kapının success criteria&apos;sı ve onaylayanı vardır.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-1.5">
            {GATES.map((g, i) => (
              <div key={g.name} className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-[11px]",
                    g.ok
                      ? "border-emerald-500/40 bg-emerald-600/10 text-emerald-400"
                      : g.current
                        ? "border-amber-500/50 bg-amber-600/10 text-amber-400"
                        : "border-neutral-800 text-neutral-500"
                  )}
                >
                  {g.name}
                </span>
                {i < GATES.length - 1 && <span className="text-neutral-700">→</span>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Requirements */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Requirements register</CardTitle>
            <CardDescription>Doğrulama yöntemi ve etkilenen uygulamalarla.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {REQUIREMENTS.map((r) => (
              <div key={r.id} className="rounded-lg border border-neutral-800 px-3 py-2 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <code className="font-mono text-xs text-indigo-400">{r.id}</code>
                  <span className="text-neutral-200">{r.text}</span>
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Badge variant="outline">doğrulama: {r.v}</Badge>
                  {r.apps.map((a) => (
                    <Badge key={a} variant="secondary" className="font-mono">{a}</Badge>
                  ))}
                  <Badge variant={r.status === "doğrulandı" ? "success" : r.status === "baseline" ? "default" : "warning"}>
                    {r.status}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ADR */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">ADR kitaplığı</CardTitle>
            <CardDescription>Mimari kararlar — etki alanıyla.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {ADRS.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2 text-sm">
                <code className="font-mono text-xs text-indigo-400">{a.id}</code>
                <span className="text-neutral-200">{a.title}</span>
                <Badge variant="outline" className="ml-auto">{a.impact}</Badge>
              </div>
            ))}
            <p className="pt-1 text-xs text-neutral-500">
              Yeni ADR taslağını AI önerebilir; karar metni insan imzası olmadan baseline&apos;a giremez.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Traceability */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <GitCompareArrows className="h-4 w-4 text-indigo-400" /> İzlenebilirlik matrisi (RTM)
          </CardTitle>
          <CardDescription>Requirement → tasarım → test kanıtı → release zinciri.</CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-left text-xs uppercase tracking-wider text-neutral-500">
                <th className="pb-2 font-medium">requirement</th>
                <th className="pb-2 font-medium">tasarım</th>
                <th className="pb-2 font-medium">test kanıtı</th>
                <th className="pb-2 font-medium">release</th>
                <th className="pb-2 font-medium">zincir</th>
              </tr>
            </thead>
            <tbody>
              {TRACE.map((t) => (
                <tr key={t.req} className="border-b border-neutral-800/60 font-mono text-xs">
                  <td className="py-2 text-indigo-400">{t.req}</td>
                  <td className="py-2 text-neutral-300">{t.design}</td>
                  <td className="py-2 text-neutral-300">{t.test}</td>
                  <td className="py-2 text-neutral-300">{t.release}</td>
                  <td className="py-2">
                    {t.ok ? <Badge variant="success">tam</Badge> : <Badge variant="warning">eksik halka</Badge>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Change requests + sign-off */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileCheck2 className="h-4 w-4 text-indigo-400" /> Change Request (CCB)
            </CardTitle>
            <CardDescription>Etki analizi + onay zinciri olmadan değişiklik yok.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {CHANGE_REQUESTS.map((c) => (
              <div key={c.id} className="rounded-lg border border-neutral-800 px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <code className="font-mono text-xs text-indigo-400">{c.id}</code>
                  <span className="text-neutral-200">{c.title}</span>
                  <Badge variant={c.risk === "düşük" ? "success" : "warning"} className="ml-auto">risk: {c.risk}</Badge>
                </div>
                <p className="mt-1 font-mono text-xs text-neutral-500">onay zinciri: {c.chain.join(" → ")}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Stamp className="h-4 w-4 text-indigo-400" /> Sign-off defteri
            </CardTitle>
            <CardDescription>Faz kapısı imzaları — kim, ne zaman, hangi kanıtla.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {["Requirements baseline — ismail · 2026-05-02", "Architecture review — mimari kurul · 2026-05-20"].map((s) => (
              <p key={s} className="rounded-lg border border-emerald-500/20 bg-emerald-600/5 px-3 py-2 text-xs text-neutral-300">✓ {s}</p>
            ))}
            <Button
              size="sm"
              variant="outline"
              disabled={signed.includes("freeze")}
              onClick={() => setSigned((p) => [...p, "freeze"])}
            >
              {signed.includes("freeze") ? "Metadata/UI freeze imzalandı ✓" : "Metadata/UI freeze imzala"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Atonota S10 — eksik artefakt'lar */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Deviation / Waiver</CardTitle></CardHeader>
          <CardContent className="space-y-1.5 text-xs">
            <div className="rounded-lg border border-amber-500/30 bg-amber-600/5 p-2.5">
              <p className="text-neutral-200">WVR-3: listing-flow telafi eksiği ile staging&apos;e devam</p>
              <p className="mt-1 text-neutral-500">süre: 2026-06-20&apos;ye kadar · riski kabul eden: ismail (owner) · prod&apos;a TAŞINAMAZ</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Design Baseline</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-xs">
            <p className="font-mono text-neutral-300">baseline-2026.05.20 <Badge variant="success" className="ml-1">onaylı</Badge></p>
            <p className="text-neutral-500">metadata snapshot (42 model) + UI map + 4 entegrasyon kontratı — değişiklik yalnız CR ile.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-base">Test Evidence</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-xs">
            <p className="text-neutral-300">REQ-112 → party.rls.test.ts <Badge variant="success" className="ml-1">kanıt ekli</Badge></p>
            <p className="text-neutral-300">REQ-114 → pii-mask.test.ts <Badge variant="success" className="ml-1">kanıt ekli</Badge></p>
            <p className="text-neutral-300">REQ-121 → <Badge variant="warning">kanıt bekliyor</Badge> — release dossier&apos;e bağlanmadan kapı geçilmez.</p>
          </CardContent>
        </Card>
      </div>

      <CliEquivalent tool="governance.rtm" args={{ app: "marketplace", format: "matrix" }} />
    </div>
  );
}
