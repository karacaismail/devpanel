"use client";

import { useState } from "react";
import { Layers, Eye, EyeOff, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CliEquivalent } from "@/components/cli-equivalent";

interface SField {
  field: string;
  label: string;
  visible: boolean;
  widget: string;
}

const INITIAL: SField[] = [
  { field: "display_name", label: "Ad", visible: true, widget: "text" },
  { field: "email", label: "E-posta", visible: true, widget: "email" },
  { field: "phone", label: "Telefon", visible: false, widget: "phone" },
  { field: "city", label: "Şehir", visible: true, widget: "text" },
  { field: "status", label: "Durum", visible: true, widget: "select" },
];

const EDITIONS = {
  none: { hidden: [] as string[], readonly: [] as string[] },
  lite: { hidden: ["phone", "city"], readonly: [] as string[] },
  enterprise: { hidden: [] as string[], readonly: ["status"] },
};

export default function SurfacePage() {
  const [fields, setFields] = useState(INITIAL);
  const [headless, setHeadless] = useState(false);
  const [edition, setEdition] = useState<keyof typeof EDITIONS>("none");
  const ov = EDITIONS[edition];
  const preview = fields.filter((f) => f.visible && !ov.hidden.includes(f.field));
  const patch = fields.filter((f) => INITIAL.find((o) => o.field === f.field)!.visible !== f.visible);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-neutral-100">
          <Layers className="h-6 w-6 text-indigo-400" /> Surface &amp; Edition
        </h1>
        <Badge variant="secondary">party-default · projeksiyon: party</Badge>
        <label className="ml-auto flex items-center gap-2 text-xs text-neutral-400">
          headless (surface: none)
          <input type="checkbox" checked={headless} onChange={(e) => setHeadless(e.target.checked)} className="accent-indigo-500" />
        </label>
      </div>
      <p className="-mt-4 text-sm text-neutral-400">
        Surface = projeksiyondur; veri modeline dokunmaz. Görsel değişiklik YAML
        patch&apos;i üretir, edition override aynı mekanizmadır.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Alanlar (görünürlük)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {fields.map((f) => (
              <div key={f.field} className="flex items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2 text-sm">
                <button
                  type="button"
                  aria-label={`görünürlük: ${f.field}`}
                  onClick={() => setFields((prev) => prev.map((x) => (x.field === f.field ? { ...x, visible: !x.visible } : x)))}
                  className="text-neutral-500 hover:text-neutral-200"
                >
                  {f.visible ? <Eye className="h-4 w-4 text-indigo-400" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <span className={f.visible ? "text-neutral-100" : "text-neutral-500"}>{f.label}</span>
                <code className="font-mono text-xs text-neutral-500">{f.field}</code>
                {ov.readonly.includes(f.field) && (
                  <Badge variant="warning" className="gap-1"><Lock className="h-2.5 w-2.5" /> readonly ({edition})</Badge>
                )}
                <Badge variant="outline" className="ml-auto">{f.widget}</Badge>
              </div>
            ))}
            <div className="rounded-lg bg-neutral-950 p-3">
              <p className="mb-1 text-[11px] uppercase tracking-wider text-neutral-500">YAML patch (commit&apos;lenebilir)</p>
              {patch.length === 0 ? (
                <p className="font-mono text-xs text-neutral-500">değişiklik yok — tanımla birebir</p>
              ) : (
                patch.map((f) => (
                  <p key={f.field} className="font-mono text-xs text-amber-400">
                    ~ {f.field}.visible: {String(!f.visible)} → {String(f.visible)}
                  </p>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              Canlı önizleme
              <select
                aria-label="edition önizlemesi"
                value={edition}
                onChange={(e) => setEdition(e.target.value as keyof typeof EDITIONS)}
                className="rounded-md border border-neutral-800 bg-neutral-900 px-2 py-1 text-xs font-normal text-neutral-200"
              >
                <option value="none">— taban</option>
                <option value="lite">lite (hidden: phone, city)</option>
                <option value="enterprise">enterprise (readonly: status)</option>
              </select>
            </CardTitle>
            <CardDescription>edition_overrides canlı uygulanır.</CardDescription>
          </CardHeader>
          <CardContent>
            {headless ? (
              <div className="rounded-lg border border-dashed border-neutral-700 p-8 text-center">
                <p className="text-sm text-neutral-200">surface: none — bu projeksiyon UI üretmez</p>
                <p className="mt-1 text-xs text-neutral-500">
                  ArcheType yalnız GraphQL / REST / MCP üzerinden servis edilir; tanım ve testler yaşamaya devam eder.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {preview.map((f) => (
                  <div key={f.field}>
                    <p className="mb-1 flex items-center gap-1.5 text-xs text-neutral-500">
                      {f.label}
                      {ov.readonly.includes(f.field) && <Lock className="h-3 w-3 text-amber-400" />}
                    </p>
                    <div className="rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-neutral-600">
                      {f.field}
                    </div>
                  </div>
                ))}
                {preview.length === 0 && <p className="text-sm text-neutral-500">Bu edition&apos;da görünür alan kalmadı.</p>}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CliEquivalent tool="surface.read" args={{ id: "party-default", headless }} />
    </div>
  );
}
