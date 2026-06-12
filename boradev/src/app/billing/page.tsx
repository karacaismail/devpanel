"use client";

import { useState } from "react";
import { CircleDollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { CliEquivalent } from "@/components/cli-equivalent";
import { cn } from "@/lib/utils";

/** Faz G — Faturalama & Ölçümleme (Stripe deseni): plan, abonelik, metering, fatura. */

type Tab = "plans" | "subs" | "metering" | "invoices";

const PLANS = [
  { name: "Starter", price: "₺990/ay", compute: "2 vCPU · 4GB", apps: "2 uygulama" },
  { name: "Growth", price: "₺2.900/ay", compute: "4 vCPU · 16GB", apps: "5 uygulama" },
  { name: "Enterprise", price: "özel", compute: "ayrılmış filo", apps: "sınırsız + SLA" },
];

const SUBS = [
  { tenant: "acme", plan: "Enterprise", state: "active", mrr: "₺18.400" },
  { tenant: "globex", plan: "Starter", state: "trialing", mrr: "₺0 (deneme 9g)" },
  { tenant: "initech", plan: "Growth", state: "past_due", mrr: "₺2.900" },
];

const METERING = [
  { tenant: "acme", compute: 71, storage: 44, aiToken: "9.1M", wallet: "₺1.240" },
  { tenant: "globex", compute: 18, storage: 12, aiToken: "0.4M", wallet: "₺180" },
  { tenant: "initech", compute: 9, storage: 6, aiToken: "0.1M", wallet: "₺0" },
];

const INVOICES = [
  { id: "INV-2026-0611", tenant: "acme", amount: "₺19.640", state: "paid" },
  { id: "INV-2026-0612", tenant: "initech", amount: "₺2.900", state: "open" },
  { id: "INV-2026-0584", tenant: "wayne-co", amount: "₺990", state: "void" },
];

const INV_VARIANT: Record<string, "success" | "warning" | "secondary"> = { paid: "success", open: "warning", void: "secondary" };

export default function BillingPage() {
  const [tab, setTab] = useState<Tab>("metering");

  return (
    <div className="space-y-6">
      <PageHeader
        icon={CircleDollarSign}
        title="Faturalama & Ölçümleme"
        description="Compute tabanlı planlar + kullanım ölçümleme (compute/storage/AI token) — tenant başına döküm, wallet/kredi bakiyesi, pro-rata fatura."
        lifecycle="Staged"
      />

      <div className="flex gap-1">
        {(
          [["plans", "Planlar"], ["subs", "Abonelikler"], ["metering", "Ölçümleme"], ["invoices", "Faturalar"]] as const
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

      {tab === "plans" && (
        <div className="grid gap-3 sm:grid-cols-3">
          {PLANS.map((p) => (
            <Card key={p.name}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{p.name}</CardTitle>
                <CardDescription className="text-lg text-neutral-100">{p.price}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 text-xs text-neutral-400">
                <p>{p.compute}</p>
                <p>{p.apps}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === "subs" && (
        <Card>
          <CardContent className="space-y-1.5 p-4">
            {SUBS.map((s) => (
              <div key={s.tenant} className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2 text-sm">
                <span className="text-neutral-100">{s.tenant}</span>
                <Badge variant="outline">{s.plan}</Badge>
                <Badge variant={s.state === "active" ? "success" : s.state === "trialing" ? "secondary" : "warning"}>{s.state}</Badge>
                <span className="ml-auto font-mono text-xs text-neutral-400">MRR {s.mrr}</span>
              </div>
            ))}
            <p className="pt-1 text-xs text-neutral-500">past_due → 7 gün sonra salt-okunur mod; veri asla silinmez (retention politikası).</p>
          </CardContent>
        </Card>
      )}

      {tab === "metering" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tenant başına kullanım</CardTitle>
            <CardDescription>AI token tüketimi gateway&apos;den, compute/storage filodan beslenir.</CardDescription>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-left text-xs uppercase tracking-wider text-neutral-500">
                  <th className="pb-2 font-medium">tenant</th>
                  <th className="pb-2 font-medium">compute</th>
                  <th className="pb-2 font-medium">storage</th>
                  <th className="pb-2 font-medium">ai token (ay)</th>
                  <th className="pb-2 font-medium">wallet</th>
                </tr>
              </thead>
              <tbody>
                {METERING.map((m) => (
                  <tr key={m.tenant} className="border-b border-neutral-800/60">
                    <td className="py-2 text-neutral-100">{m.tenant}</td>
                    {[m.compute, m.storage].map((v, i) => (
                      <td key={i} className="py-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-neutral-800">
                          <div className={v > 60 ? "h-full bg-amber-500" : "h-full bg-indigo-500"} style={{ width: `${v}%` }} />
                        </div>
                      </td>
                    ))}
                    <td className="py-2 font-mono text-xs text-neutral-300">{m.aiToken}</td>
                    <td className="py-2 font-mono text-xs text-neutral-300">{m.wallet}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {tab === "invoices" && (
        <Card>
          <CardContent className="space-y-1.5 p-4">
            {INVOICES.map((i) => (
              <div key={i.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2 text-sm">
                <code className="font-mono text-xs text-indigo-400">{i.id}</code>
                <span className="text-neutral-200">{i.tenant}</span>
                <span className="font-mono text-xs text-neutral-300">{i.amount}</span>
                <Badge variant={INV_VARIANT[i.state]} className="ml-auto">{i.state}</Badge>
              </div>
            ))}
            <p className="pt-1 text-xs text-neutral-500">Fatura oluştur/gönder yalnız billing rolünde; void işlemi isim-yazarak onay ister.</p>
          </CardContent>
        </Card>
      )}

      <CliEquivalent tool="billing.metering" args={{ period: "2026-06" }} />
    </div>
  );
}
