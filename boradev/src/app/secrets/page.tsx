"use client";

import { useState } from "react";
import { Lock, RotateCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { CliEquivalent } from "@/components/cli-equivalent";

const SECRETS = [
  { id: "SMTP_PASSWORD", scope: "prod", vault: "vault://mail/primary", rotated: "12 gün önce", policy: "90g", access: ["mail-worker"] },
  { id: "PAYMENT_API_SECRET", scope: "prod", vault: "vault://psp/main", rotated: "3 gün önce", policy: "30g", access: ["billing"] },
  { id: "WEBHOOK_SIGNING_KEY", scope: "tüm ortamlar", vault: "vault://hooks/sign", rotated: "bugün", policy: "30g", access: ["webhook-dispatcher"] },
  { id: "ANTHROPIC_API_KEY", scope: "dev/staging", vault: "vault://ai/anthropic", rotated: "1 gün önce", policy: "60g", access: ["ai-gateway"] },
];

export default function SecretsPage() {
  const [rotating, setRotating] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Lock}
        title="Sırlar"
        description="Ham değer panelde asla görünmez — yalnız vault referansı, rotasyon politikası ve erişim listesi. API Keys'ten farklıdır: anahtar kimlik, sır kimlik bilgisidir."
        lifecycle="Staged"
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Kasa referansları</CardTitle>
          <CardDescription>{SECRETS.length} sır · env-scope ayrımlı · erişim servis bazlı</CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-left text-xs uppercase tracking-wider text-neutral-500">
                <th className="pb-2 font-medium">sır</th>
                <th className="pb-2 font-medium">kapsam</th>
                <th className="pb-2 font-medium">vault</th>
                <th className="pb-2 font-medium">rotasyon</th>
                <th className="pb-2 font-medium">erişim</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {SECRETS.map((s) => (
                <tr key={s.id} className="border-b border-neutral-800/60">
                  <td className="py-2 font-mono text-xs text-neutral-100">{s.id}</td>
                  <td className="py-2">
                    <Badge variant={s.scope === "prod" ? "destructive" : "outline"}>{s.scope}</Badge>
                  </td>
                  <td className="py-2 font-mono text-[11px] text-neutral-500">{s.vault}</td>
                  <td className="py-2 text-xs text-neutral-400">{s.rotated} · politika {s.policy}</td>
                  <td className="py-2 text-xs text-neutral-500">{s.access.join(", ")}</td>
                  <td className="py-2 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={rotating === s.id}
                      onClick={() => setRotating(s.id)}
                    >
                      <RotateCw className="mr-1 h-3 w-3" />
                      {rotating === s.id ? "onay bekliyor" : "rotasyon"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {rotating && (
            <p className="mt-2 text-xs text-amber-400">
              {rotating} rotasyonu onay kapısına gönderildi — prod sırrı çift imza ister (release + platform-ops).
            </p>
          )}
        </CardContent>
      </Card>

      <CliEquivalent tool="secret.rotate" args={{ id: "WEBHOOK_SIGNING_KEY", "dry-run": true }} />
    </div>
  );
}
