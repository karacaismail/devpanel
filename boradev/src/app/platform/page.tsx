"use client";

import { Cog, Layers3, Stethoscope } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CliEquivalent } from "@/components/cli-equivalent";

/**
 * Atonota — Engines & Adapters: kaynak motorlar ana navigasyonda DEĞİL,
 * yalnızca burada görünür. Ana nav "hangi işi yapıyorum" sorusuna cevap verir;
 * bu sayfa "hangi motor altta çalışıyor" sorusuna.
 */

const ADAPTERS = [
  { name: "Frappe Adapter", v: "15.x", health: "ok", caps: ["DocType", "REST", "RQ jobs", "permissions"], note: "metadata + form üretimi birincil kaynak" },
  { name: "Django Adapter", v: "5.x", health: "ok", caps: ["ORM models", "admin bridge", "migrations"], note: "model-merkezli CRUD köprüsü" },
  { name: "Drupal Adapter", v: "11.x", health: "degraded", caps: ["content types", "views"], note: "salt-okunur köprü — yazma kapalı" },
  { name: "Odoo Adapter", v: "19.x", health: "ok", caps: ["modules", "workflows", "studio import"], note: "iş akışı içe aktarımı" },
];

const CAPABILITY_MAP = [
  { cap: "Model / şema tanımı", frappe: "✓ birincil", django: "✓", drupal: "okuma", odoo: "✓" },
  { cap: "Form / görünüm üretimi", frappe: "✓ birincil", django: "—", drupal: "okuma", odoo: "✓" },
  { cap: "Workflow / durum makinesi", frappe: "✓", django: "—", drupal: "—", odoo: "✓ birincil" },
  { cap: "Background jobs", frappe: "✓ birincil", django: "✓", drupal: "—", odoo: "✓" },
  { cap: "İzin matrisi (RBAC)", frappe: "✓", django: "✓", drupal: "✓", odoo: "✓" },
];

const OVERRIDE_ORDER = [
  "1. Tenant override (en yüksek öncelik)",
  "2. App tanımı (atonota metadata)",
  "3. Adapter eşlemesi",
  "4. Motor varsayılanı (en düşük)",
];

const DIAGNOSTICS = [
  ["14:01", "ok", "frappe: doctype sync 42 model, 0 çakışma"],
  ["13:55", "warn", "drupal: views eşlemesinde 2 alan karşılıksız — okuma moduna düşürüldü"],
  ["13:40", "ok", "odoo: workflow import (3 durum makinesi) doğrulandı"],
];

export default function PlatformPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-neutral-100">
          <Cog className="h-6 w-6 text-indigo-400" /> Engines &amp; Adapters
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Meta-framework çekirdeği: Frappe/Django/Drupal/Odoo motorları adapter
          olarak buraya bağlanır — ana navigasyon motor adı değil, iş adı taşır.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ADAPTERS.map((a) => (
          <Card key={a.name} className={a.health === "degraded" ? "border-amber-500/30" : undefined}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                {a.name}
                <Badge variant={a.health === "ok" ? "success" : "warning"} className="ml-auto">{a.health}</Badge>
              </CardTitle>
              <CardDescription className="font-mono text-xs">{a.v}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {a.caps.map((c) => (
                  <Badge key={c} variant="outline" className="font-mono text-[10px]">{c}</Badge>
                ))}
              </div>
              <p className="mt-2 text-xs text-neutral-500">{a.note}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Layers3 className="h-4 w-4 text-indigo-400" /> Capability map
          </CardTitle>
          <CardDescription>Hangi yetenek hangi motordan gelir; &quot;birincil&quot; çakışmada kazanır.</CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-left text-xs uppercase tracking-wider text-neutral-500">
                <th className="pb-2 font-medium">yetenek</th>
                <th className="pb-2 font-medium">frappe</th>
                <th className="pb-2 font-medium">django</th>
                <th className="pb-2 font-medium">drupal</th>
                <th className="pb-2 font-medium">odoo</th>
              </tr>
            </thead>
            <tbody>
              {CAPABILITY_MAP.map((r) => (
                <tr key={r.cap} className="border-b border-neutral-800/60">
                  <td className="py-2 text-neutral-200">{r.cap}</td>
                  {[r.frappe, r.django, r.drupal, r.odoo].map((v, i) => (
                    <td key={i} className={`py-2 text-xs ${v.includes("birincil") ? "text-indigo-300" : v === "—" ? "text-neutral-700" : "text-neutral-400"}`}>
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Override önceliği</CardTitle>
            <CardDescription>Aynı tanım birden çok kaynaktan gelirse sıralama:</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {OVERRIDE_ORDER.map((o) => (
              <p key={o} className="rounded-lg border border-neutral-800 px-3 py-2 text-xs text-neutral-300">{o}</p>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Stethoscope className="h-4 w-4 text-indigo-400" /> Diagnostics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 font-mono text-xs">
            {DIAGNOSTICS.map(([t, lvl, msg]) => (
              <p key={msg as string}>
                <span className="text-neutral-600">{t} </span>
                <span className={lvl === "ok" ? "text-emerald-400" : "text-amber-400"}>{String(lvl).padEnd(4)}</span>{" "}
                <span className="text-neutral-300">{msg}</span>
              </p>
            ))}
          </CardContent>
        </Card>
      </div>

      <CliEquivalent tool="adapter.list" args={{ "with-diagnostics": true }} />
    </div>
  );
}
