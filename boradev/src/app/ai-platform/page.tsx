"use client";

import { useState } from "react";
import { Cpu, KeyRound, Route, BookText, ShieldCheck, Coins } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CliEquivalent } from "@/components/cli-equivalent";

/**
 * Atonota — AI Katmanı (LLMOps): Gateway/Model Routing · Prompt Registry ·
 * Guardrails & Evals · Kullanım/Maliyet. BYOK; kayıt sistemi AI değildir.
 */

const PROVIDERS = [
  { name: "anthropic", key: "sk-ant-…a3f9", models: "claude-*", status: "aktif" },
  { name: "openai", key: "sk-…k2d7", models: "gpt-*", status: "aktif" },
  { name: "local (ollama)", key: "—", models: "llama-*", status: "yalnız dev" },
];

const ROUTES = [
  { rule: "şema üretimi / kod", to: "claude-sonnet", fallback: "gpt-4o", why: "kalite öncelikli" },
  { rule: "özet / triage / sınıflandırma", to: "claude-haiku", fallback: "local", why: "maliyet öncelikli" },
  { rule: "guardrail denetimi (pre/post)", to: "local", fallback: "claude-haiku", why: "latency + gizlilik" },
];

const PROMPTS = [
  { id: "schema-draft", v: "v7", envs: ["dev", "staging", "prod"], note: "test dosyası İLK kuralı gömülü" },
  { id: "migration-review", v: "v4", envs: ["dev", "staging"], note: "öneri ≠ karar şablonu" },
  { id: "issue-triage", v: "v3", envs: ["dev"], note: "şiddet + benzer kayıt bağlama" },
];

const GUARDRAILS = {
  pre: [
    { name: "PII redaksiyon", on: true },
    { name: "Prompt injection tespiti", on: true },
    { name: "Hassas veri bloklama (secrets)", on: true },
  ],
  post: [
    { name: "Halüsinasyon kontrolü (kaynak atfı zorunlu)", on: true },
    { name: "Output filtreleme (yıkıcı komut)", on: true },
    { name: "Self-correction döngüsü", on: false },
  ],
};

export default function AiPlatformPage() {
  const [rails, setRails] = useState(GUARDRAILS);

  const toggle = (side: "pre" | "post", name: string) =>
    setRails((prev) => ({
      ...prev,
      [side]: prev[side].map((g) => (g.name === name ? { ...g, on: !g.on } : g)),
    }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-neutral-100">
          <Cpu className="h-6 w-6 text-indigo-400" /> AI Katmanı
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Gateway, prompt registry, guardrails ve maliyet — AI üretken ama sınırlı
          yetkili bir yardımcıdır; source of truth asla AI konuşması değildir.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <KeyRound className="h-4 w-4 text-indigo-400" /> Sağlayıcı anahtarları (BYOK)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {PROVIDERS.map((p) => (
              <div key={p.name} className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2 text-sm">
                <span className="text-neutral-100">{p.name}</span>
                <code className="font-mono text-xs text-neutral-500">{p.key}</code>
                <Badge variant="outline" className="font-mono">{p.models}</Badge>
                <Badge variant={p.status === "aktif" ? "success" : "secondary"} className="ml-auto">{p.status}</Badge>
              </div>
            ))}
            <p className="pt-1 text-xs text-neutral-500">Ham anahtar saklanmaz — secret vault referansı + rotasyon politikası.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Route className="h-4 w-4 text-indigo-400" /> Model yönlendirme (Gateway)
            </CardTitle>
            <CardDescription>Maliyet/latency/kalite tabanlı routing + fallback zinciri + semantik önbellek.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {ROUTES.map((r) => (
              <div key={r.rule} className="rounded-lg border border-neutral-800 px-3 py-2 text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-neutral-200">{r.rule}</span>
                  <code className="ml-auto font-mono text-xs text-indigo-300">{r.to}</code>
                  <span className="text-xs text-neutral-600">↘ {r.fallback}</span>
                </div>
                <p className="mt-0.5 text-xs text-neutral-500">{r.why} · cache TTL 1h · tenant bütçesine sayılır</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <BookText className="h-4 w-4 text-indigo-400" /> Prompt Registry
          </CardTitle>
          <CardDescription>Versiyonlu, ortam etiketli, rollback&apos;li — prod prompt&apos;u onaysız değişmez.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {PROMPTS.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2 text-sm">
              <code className="font-mono text-xs text-neutral-100">{p.id}</code>
              <Badge variant="default">{p.v}</Badge>
              {p.envs.map((e) => (
                <Badge key={e} variant={e === "prod" ? "destructive" : "outline"}>{e}</Badge>
              ))}
              <span className="ml-auto text-xs text-neutral-500">{p.note}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-indigo-400" /> Guardrails
            </CardTitle>
            <CardDescription>Pre-LLM ve Post-LLM kuralları — guardrail&apos;siz otopilot prod&apos;a kapalı.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {(["pre", "post"] as const).map((side) => (
              <div key={side}>
                <p className="mb-1.5 text-[11px] uppercase tracking-wider text-neutral-500">{side}-LLM</p>
                <div className="space-y-1.5">
                  {rails[side].map((g) => (
                    <label key={g.name} className="flex items-center gap-2 rounded-lg border border-neutral-800 px-2.5 py-1.5 text-xs text-neutral-300">
                      <input type="checkbox" checked={g.on} onChange={() => toggle(side, g.name)} className="accent-indigo-500" />
                      {g.name}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Coins className="h-4 w-4 text-indigo-400" /> Kullanım &amp; maliyet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {[
              ["bugün", "412K token", "$3.84", 38],
              ["bu hafta", "2.9M token", "$26.10", 61],
              ["bu ay (bütçe $120)", "9.1M token", "$78.45", 65],
            ].map(([label, tok, cost, pct]) => (
              <div key={label as string}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-neutral-400">{label}</span>
                  <span className="font-mono text-neutral-200">{tok} · {cost}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-neutral-800">
                  <div className="h-full bg-indigo-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
            <p className="pt-1 text-xs text-neutral-500">Döküm: model/sağlayıcı/tenant başına · bütçe aşımında uyarı + downgrade routing.</p>
          </CardContent>
        </Card>
      </div>

      {/* Atonota S11 — Evals genişletmesi */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Değerlendirmeler (Evals)</CardTitle>
          <CardDescription>Versiyonlu dataset · LLM-as-judge / kod / insan · deney karşılaştırma · CI kapısı.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          <div className="flex flex-wrap gap-1.5">
            {[["schema-draft-eval v3", "120 örnek"], ["triage-eval v2", "85 örnek"], ["query-gen-eval v1", "60 örnek"]].map(([n, c]) => (
              <span key={n} className="rounded-lg border border-neutral-800 px-2.5 py-1.5 font-mono text-neutral-300">{n} <span className="text-neutral-600">· {c}</span></span>
            ))}
          </div>
          <table className="w-full">
            <thead><tr className="border-b border-neutral-800 text-left text-[10px] uppercase tracking-wider text-neutral-500">
              <th className="pb-1.5 font-medium">deney</th><th className="pb-1.5 font-medium">model</th><th className="pb-1.5 font-medium">judge</th><th className="pb-1.5 font-medium">skor</th><th className="pb-1.5 font-medium">maliyet</th>
            </tr></thead>
            <tbody>
              <tr className="border-b border-neutral-800/60"><td className="py-1.5 font-mono text-neutral-200">exp-41</td><td className="py-1.5 text-neutral-400">claude-sonnet</td><td className="py-1.5 text-neutral-400">LLM-as-judge</td><td className="py-1.5 text-emerald-400">0.91</td><td className="py-1.5 text-neutral-500">$0.84</td></tr>
              <tr className="border-b border-neutral-800/60"><td className="py-1.5 font-mono text-neutral-200">exp-40</td><td className="py-1.5 text-neutral-400">claude-haiku</td><td className="py-1.5 text-neutral-400">kod evaluatörü</td><td className="py-1.5 text-amber-400">0.83</td><td className="py-1.5 text-neutral-500">$0.11</td></tr>
            </tbody>
          </table>
          <p className="text-neutral-500">CI eval kapısı: <Badge variant="success">açık</Badge> — skor &lt; 0.85 ise prompt versiyonu prod etiketi alamaz; insan feedback anotasyon kuyruğundan akar.</p>
        </CardContent>
      </Card>

      <CliEquivalent tool="ai.gateway.config" args={{ app: "marketplace" }} />
    </div>
  );
}
