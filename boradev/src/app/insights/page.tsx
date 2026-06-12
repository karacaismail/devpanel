"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, Lightbulb, Zap, Wand2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CliEquivalent } from "@/components/cli-equivalent";

/** Ali birleştirmesi — InsightStrip + ProactiveTip + PromptChips desenleri. */

const INSIGHTS = [
  { kind: "optimization", icon: Zap, title: "Eksik index", body: "order.placed_at sık filtreleniyor ama index'siz — eklemek 1 tık, migration q-8 olarak kuyruğa girer.", route: "/data" },
  { kind: "insight", icon: Lightbulb, title: "Dokümantasyon boşluğu", body: "5 yeni endpoint auto-generated. API Explorer'da açıklama alanları boş.", route: "/api-explorer" },
  { kind: "insight", icon: Lightbulb, title: "AA ihlal riski", body: "Accent rengi küçük metinde WCAG AA'yı geçemiyor — Theme Engine'de güvenli alternatif hazır.", route: "/theme" },
  { kind: "feature", icon: Wand2, title: "Telafi eksiği", body: "listing-flow active→sold geçişinin compensation alanı boş — tanım kaydı kilitli.", route: "/test-runner" },
] as const;

const PROMPT_CHIPS = [
  { id: "blog", label: "Blog modülü oluştur", prompt: "Blog modülü oluştur: yazı, kategori ve etiket modelleriyle." },
  { id: "ecom", label: "E-ticaret şeması", prompt: "E-ticaret şeması üret: Product, Order, OrderItem ve Category." },
  { id: "palette", label: "WCAG AA renk paleti", prompt: "WCAG AA uyumlu bir marka renk paleti oluştur." },
  { id: "crud", label: "CRUD API endpoint'leri", prompt: "Product modeli için CRUD API endpoint'leri üret." },
  { id: "contact", label: "İletişim formu", prompt: "Bir iletişim formu oluştur: ad, e-posta, konu, mesaj." },
  { id: "fields", label: "Alan öner", prompt: "party modeline segment ve dogum_tarihi alanları ekle." },
];

const KIND_BADGE = {
  optimization: { label: "optimizasyon", variant: "warning" as const },
  insight: { label: "içgörü", variant: "secondary" as const },
  feature: { label: "öneri", variant: "default" as const },
};

export default function InsightsPage() {
  const [queued, setQueued] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-neutral-100">
          <Sparkles className="h-6 w-6 text-indigo-400" /> AI İçgörüler
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Copilot&apos;ın proaktif tespitleri — rota bazlı, oturum başına bir kez.
          AI önerir, geliştirici onaylar; sessiz mutasyon asla.
        </p>
      </div>

      <div className="space-y-2">
        {INSIGHTS.map((i) => {
          const kb = KIND_BADGE[i.kind];
          return (
            <Card key={i.title} className="border-indigo-500/20 bg-gradient-to-r from-indigo-600/5 to-transparent">
              <CardContent className="flex items-center gap-4 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-600/15 text-indigo-400">
                  <i.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-medium text-neutral-100">
                    {i.title} <Badge variant={kb.variant}>{kb.label}</Badge>
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-400">{i.body}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setQueued(i.title)}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                >
                  Copilot&apos;a sor <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </CardContent>
            </Card>
          );
        })}
        {queued && (
          <p className="text-xs text-emerald-400">&quot;{queued}&quot; Copilot kuyruğuna eklendi.</p>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Hazır istemler</CardTitle>
          <CardDescription>Copilot boş durumunda ve Spotlight&apos;ta görünen küratörlü çipler.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {PROMPT_CHIPS.map((c) => (
            <button
              key={c.id}
              type="button"
              title={c.prompt}
              onClick={() => setQueued(c.label)}
              className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:border-indigo-500/50 hover:text-indigo-300"
            >
              {c.label}
            </button>
          ))}
        </CardContent>
      </Card>

      <CliEquivalent tool="copilot.insights" args={{ app: "marketplace" }} />
    </div>
  );
}
