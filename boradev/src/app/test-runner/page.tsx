"use client";

import { FlaskConical, ShieldCheck, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CliEquivalent } from "@/components/cli-equivalent";
import { cn } from "@/lib/utils";

const SUITES = [
  { id: "t1", name: "party.contract.test.ts", kind: "kontrat", passed: 12, failed: 0 },
  { id: "t2", name: "listing.contract.test.ts", kind: "kontrat", passed: 9, failed: 1 },
  { id: "t3", name: "party.rls.test.ts — komşu tenant okuyamaz", kind: "rls", passed: 6, failed: 0 },
  { id: "t4", name: "listing.rls.test.ts — komşu tenant okuyamaz", kind: "rls", passed: 6, failed: 0 },
  { id: "t5", name: "party.pii-mask.test.ts", kind: "pii", passed: 4, failed: 0 },
  { id: "t6", name: "sdk check — sözleşme conformance", kind: "conformance", passed: 24, failed: 0 },
];

const SDK_CHECK = `$ sdk check
✓ şema tanımları geçerli (2/2)
✓ form projeksiyonları tutarlı (2/2)
✗ listing-flow: active→sold telafi (compensation) tanımsız
✓ RLS: komşu tenant okuyamaz (12/12)
✓ PII maskeleme zorunlu alanlarda aktif
24 sözleşmeden 23 yeşil — kırmızı panel kapatılamaz.`;

export default function TestRunnerPage() {
  const failed = SUITES.reduce((s, t) => s + t.failed, 0);
  const passed = SUITES.reduce((s, t) => s + t.passed, 0);
  const rls = SUITES.filter((t) => t.kind === "rls");
  const rest = SUITES.filter((t) => t.kind !== "rls");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-neutral-100">
          <FlaskConical className="h-6 w-6 text-indigo-400" /> Test Runner
        </h1>
        <Badge variant="success">{passed} yeşil</Badge>
        <Badge variant={failed > 0 ? "destructive" : "secondary"}>{failed} kırmızı</Badge>
      </div>

      {failed > 0 && (
        <div className="flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-600/10 p-4 text-sm text-red-400">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            <span className="font-semibold">Kırmızı test paneli — kapatılamaz bölge (test-önce ilkesi).</span>{" "}
            listing-flow active→sold telafi tanımsız. Tanım düzeltilmeden scaffold/migration akışları kilitli.
          </p>
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> &quot;Komşu tenant okuyamaz&quot; vitrini
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {rls.map((t) => (
            <div key={t.id} className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-600/5 px-3 py-2 text-sm">
              <FlaskConical className="h-3.5 w-3.5 text-emerald-400" />
              <code className="font-mono text-xs text-neutral-200">{t.name}</code>
              <span className="ml-auto text-xs text-emerald-400">{t.passed}/{t.passed + t.failed}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Üretilmiş kontrat testleri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {rest.map((t) => (
            <div
              key={t.id}
              className={cn(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                t.failed > 0 ? "border-red-500/30 bg-red-600/5" : "border-neutral-800"
              )}
            >
              <FlaskConical className={cn("h-3.5 w-3.5", t.failed > 0 ? "text-red-400" : "text-neutral-500")} />
              <code className="font-mono text-xs text-neutral-200">{t.name}</code>
              <Badge variant="outline">{t.kind}</Badge>
              <span className={cn("ml-auto text-xs", t.failed > 0 ? "text-red-400" : "text-emerald-400")}>
                {t.passed} ✓{t.failed > 0 ? ` · ${t.failed} ✗` : ""}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <pre className="overflow-auto rounded-lg border border-neutral-800 bg-neutral-950 p-4 font-mono text-xs leading-relaxed text-neutral-400">
        {SDK_CHECK}
      </pre>

      <CliEquivalent tool="check.run" args={{ app: "marketplace" }} />
    </div>
  );
}
