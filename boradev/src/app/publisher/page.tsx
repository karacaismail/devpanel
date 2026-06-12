"use client";

import { useState } from "react";
import { Megaphone, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { CliEquivalent } from "@/components/cli-equivalent";
import { cn } from "@/lib/utils";

/** Faz G — Yayıncı Paneli: releases/pricing/abonelik/analytics + payouts (Frappe deseni). */

type Tab = "releases" | "pricing" | "subs" | "payouts";

const RELEASES = [
  { v: "loyalty-points v1.5.0", state: "Awaiting Approval", note: "değişiklik: puan kuralları editörü" },
  { v: "loyalty-points v1.4.2", state: "Approved", note: "yayında — 1.240 site" },
  { v: "loyalty-points v1.4.0", state: "Rejected", note: "izin beyanı eksikti (party.write)" },
];

const STATE_VARIANT: Record<string, "warning" | "success" | "destructive"> = {
  "Awaiting Approval": "warning",
  Approved: "success",
  Rejected: "destructive",
};

const PLANS = [
  { name: "Free", price: "₺0", limit: "1 site · topluluk desteği" },
  { name: "Pro", price: "₺290/ay", limit: "5 site · e-posta desteği" },
  { name: "Scale", price: "₺990/ay", limit: "sınırsız · öncelikli destek" },
];

const SUBS = [
  { tenant: "acme", plan: "Scale", state: "active", since: "2025-12" },
  { tenant: "globex", plan: "Pro", state: "active", since: "2026-02" },
  { tenant: "wayne-co", plan: "Pro", state: "past_due", since: "2026-01" },
];

const PAYOUTS = [
  { period: "2026-05", gross: "₺14.230", share: "₺11.384 (%80)", state: "ödendi" },
  { period: "2026-06", gross: "₺9.840", share: "₺7.872 (%80)", state: "dönem açık" },
];

export default function PublisherPage() {
  const [tab, setTab] = useState<Tab>("releases");

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Megaphone}
        title="Yayıncı Paneli"
        description="Uygulamalarım: yayın akışı Draft → Awaiting Approval → Approved; fiyatlandırma esnek (free/paid/freemium + kullanım tabanlı — Frappe'nin 3-plan kısıtı başlangıç emsali)."
        lifecycle="Staged"
      />

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/50 px-4 py-3 text-sm">
        <span className="text-neutral-100">acme-labs</span>
        <Badge variant="success">yayıncı ✓</Badge>
        <span className="text-xs text-neutral-500">2 uygulama · 1.240 aktif site · ortalama puan 4.5</span>
        <span className="ml-auto text-xs text-neutral-500">geliştirici sözleşmesi: v3 imzalı</span>
      </div>

      <div className="flex gap-1">
        {(
          [["releases", "Yayınlar"], ["pricing", "Fiyatlandırma"], ["subs", "Abonelikler"], ["payouts", "Ödemeler"]] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn("rounded-lg px-3 py-1.5 text-sm", tab === id ? "bg-indigo-600/15 text-indigo-300" : "text-neutral-400 hover:bg-neutral-800")}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "releases" && (
        <Card>
          <CardContent className="space-y-1.5 p-4">
            {RELEASES.map((r) => (
              <div key={r.v} className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2 text-sm">
                <code className="font-mono text-xs text-neutral-100">{r.v}</code>
                <Badge variant={STATE_VARIANT[r.state]}>{r.state}</Badge>
                <span className="ml-auto text-xs text-neutral-500">{r.note}</span>
              </div>
            ))}
            <p className="pt-1 text-xs text-neutral-500">Yeni release inceleme kuyruğuna düşer — SLA 10 gün; red gerekçesi her zaman yazılır.</p>
          </CardContent>
        </Card>
      )}

      {tab === "pricing" && (
        <div className="grid gap-3 sm:grid-cols-3">
          {PLANS.map((p) => (
            <Card key={p.name}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{p.name}</CardTitle>
                <CardDescription className="text-lg text-neutral-100">{p.price}</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-neutral-400">{p.limit}</CardContent>
            </Card>
          ))}
          <p className="text-xs text-neutral-500 sm:col-span-3">Pro-rata faturalanır; kullanım-tabanlı bileşen (AI token) plan üstüne eklenebilir.</p>
        </div>
      )}

      {tab === "subs" && (
        <Card>
          <CardContent className="space-y-1.5 p-4">
            {SUBS.map((s) => (
              <div key={s.tenant} className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2 text-sm">
                <span className="text-neutral-100">{s.tenant}</span>
                <Badge variant="outline">{s.plan}</Badge>
                <Badge variant={s.state === "active" ? "success" : "warning"}>{s.state}</Badge>
                <span className="ml-auto text-xs text-neutral-500">başlangıç {s.since}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {tab === "payouts" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Wallet className="h-4 w-4 text-indigo-400" /> Ödeme geçmişi
            </CardTitle>
            <CardDescription>Gelir paylaşımı %80 yayıncı / %20 platform · ödeme: ayın 10&apos;u.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {PAYOUTS.map((p) => (
              <div key={p.period} className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2 text-sm">
                <code className="font-mono text-xs text-neutral-100">{p.period}</code>
                <span className="text-neutral-400">brüt {p.gross}</span>
                <span className="text-neutral-200">pay {p.share}</span>
                <Badge variant={p.state === "ödendi" ? "success" : "secondary"} className="ml-auto">{p.state}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <CliEquivalent tool="publisher.app" args={{ id: "loyalty-points" }} />
    </div>
  );
}
