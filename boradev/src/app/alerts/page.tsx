"use client";

import { useState } from "react";
import { BellRing } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { CliEquivalent } from "@/components/cli-equivalent";

interface AlertRule {
  id: string;
  rule: string;
  threshold: string;
  channel: string;
  on: boolean;
  fired: number;
}

const RULES: AlertRule[] = [
  { id: "a1", rule: "p99 latency", threshold: "> 2s (5dk pencere)", channel: "webhook → ops-slack", on: true, fired: 3 },
  { id: "a2", rule: "DLQ derinliği", threshold: "> 10 event", channel: "e-posta + çağrı", on: true, fired: 0 },
  { id: "a3", rule: "build başarısız", threshold: "staging/prod", channel: "webhook → ops-slack", on: true, fired: 1 },
  { id: "a4", rule: "AI bütçe", threshold: "> %80 aylık", channel: "e-posta", on: true, fired: 1 },
  { id: "a5", rule: "disk kullanımı", threshold: "> %85 (db sunucuları)", channel: "çağrı (gece dahil)", on: false, fired: 0 },
];

export default function AlertsPage() {
  const [rules, setRules] = useState(RULES);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={BellRing}
        title="Uyarılar"
        description="Eşik tabanlı kurallar ve bildirim kanalları — kural değişikliği audit'e yazılır."
        lifecycle="Released"
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Kurallar</CardTitle>
          <CardDescription>
            {rules.filter((r) => r.on).length}/{rules.length} aktif · son 7 günde {rules.reduce((s, r) => s + r.fired, 0)} tetiklenme
          </CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-left text-xs uppercase tracking-wider text-neutral-500">
                <th className="pb-2 font-medium">kural</th>
                <th className="pb-2 font-medium">eşik</th>
                <th className="pb-2 font-medium">kanal</th>
                <th className="pb-2 font-medium">7g</th>
                <th className="pb-2 font-medium">aktif</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => (
                <tr key={r.id} className="border-b border-neutral-800/60">
                  <td className="py-2 text-neutral-100">{r.rule}</td>
                  <td className="py-2 font-mono text-xs text-neutral-400">{r.threshold}</td>
                  <td className="py-2 text-xs text-neutral-400">{r.channel}</td>
                  <td className="py-2">
                    {r.fired > 0 ? <Badge variant="warning">{r.fired}×</Badge> : <span className="text-xs text-neutral-600">—</span>}
                  </td>
                  <td className="py-2">
                    <input
                      type="checkbox"
                      aria-label={`${r.rule} aktif`}
                      checked={r.on}
                      onChange={() => setRules((prev) => prev.map((x) => (x.id === r.id ? { ...x, on: !x.on } : x)))}
                      className="accent-indigo-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-neutral-500">
            Kanal eşleme: webhook / e-posta / çağrı — sessiz saat politikası tenant başına ayarlanabilir.
          </p>
        </CardContent>
      </Card>

      <CliEquivalent tool="alert.rules" args={{ app: "marketplace" }} />
    </div>
  );
}
