"use client";

import { useState } from "react";
import { Store, Star, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { CliEquivalent } from "@/components/cli-equivalent";
import { cn } from "@/lib/utils";

/** Faz G — Pazar Yeri: vitrin + inceleme kuyruğu (Frappe Marketplace deseni, 10 gün SLA). */

const CATEGORIES = ["tümü", "crm", "muhasebe", "iletişim", "ai", "raporlama"];

const APPS = [
  { id: "seo-meta", name: "SEO Meta", cat: "raporlama", rating: 4.6, installs: 12840, compat: "≥ v1.6", price: "ücretsiz" },
  { id: "invoice-tr", name: "e-Fatura TR", cat: "muhasebe", rating: 4.8, installs: 4210, compat: "≥ v1.7", price: "₺490/ay" },
  { id: "ai-descriptions", name: "AI Descriptions", cat: "ai", rating: 4.1, installs: 980, compat: "≥ v1.8", price: "freemium" },
  { id: "whatsapp-bridge", name: "WhatsApp Bridge", cat: "iletişim", rating: 4.4, installs: 2330, compat: "≥ v1.6", price: "₺290/ay" },
];

const REVIEW_QUEUE = [
  { id: "rev-88", app: "crm-dialer v2.1", auto: { syntax: true, security: true, perms: true }, state: "manuel incelemede", days: 3 },
  { id: "rev-87", app: "stock-sync v1.0", auto: { syntax: true, security: false, perms: true }, state: "otomatik kontrolde takıldı", days: 1 },
];

export default function MarketplacePage() {
  const [cat, setCat] = useState("tümü");
  const apps = APPS.filter((a) => cat === "tümü" || a.cat === cat);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Store}
        title="Pazar Yeri"
        description="Üçüncü-taraf uygulama vitrini — her uygulama izin beyanıyla gelir, WASM sandbox'ta koşar; inceleme SLA'sı 10 gündür."
        lifecycle="Staged"
      />

      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCat(c)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs",
              cat === c ? "border-indigo-500/50 bg-indigo-600/10 text-indigo-300" : "border-neutral-800 text-neutral-400 hover:text-neutral-200"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {apps.map((a) => (
          <Card key={a.id}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                {a.name}
                <Badge variant="outline" className="ml-auto">{a.cat}</Badge>
              </CardTitle>
              <CardDescription className="flex items-center gap-2 text-xs">
                <span className="flex items-center gap-0.5 text-amber-400">
                  <Star className="h-3 w-3 fill-amber-400" /> {a.rating}
                </span>
                {a.installs.toLocaleString("tr")} kurulum · uyum {a.compat}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-2">
              <Badge variant={a.price === "ücretsiz" ? "success" : "secondary"}>{a.price}</Badge>
              <Button size="sm" variant="outline" className="ml-auto">izin beyanını gör & kur</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4 text-indigo-400" /> İnceleme kuyruğu
          </CardTitle>
          <CardDescription>Otomatik kontroller (syntax / güvenlik / izin beyanı) + manuel onay — SLA: 10 gün.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {REVIEW_QUEUE.map((r) => (
            <div key={r.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2 text-sm">
              <code className="font-mono text-xs text-indigo-400">{r.id}</code>
              <span className="text-neutral-200">{r.app}</span>
              {Object.entries(r.auto).map(([k, ok]) => (
                <Badge key={k} variant={ok ? "success" : "destructive"}>{k} {ok ? "✓" : "✗"}</Badge>
              ))}
              <span className="ml-auto text-xs text-neutral-500">{r.state} · {r.days}. gün</span>
              <Button size="sm" variant="outline" disabled={Object.values(r.auto).some((v) => !v)}>onayla</Button>
              <Button size="sm" variant="ghost" className="text-red-400">reddet</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <CliEquivalent tool="marketplace.list" args={{ category: cat }} />
    </div>
  );
}
