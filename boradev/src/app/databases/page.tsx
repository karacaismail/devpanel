"use client";

import { Database } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { CliEquivalent } from "@/components/cli-equivalent";

const DBS = [
  { tenant: "acme", size: "1.2 GB", conn: "14/50", qps: 142, slow: 2, backup: "bu gece 03:00 ✓", rls: true },
  { tenant: "globex", size: "310 MB", conn: "4/50", qps: 23, slow: 0, backup: "bu gece 03:05 ✓", rls: true },
  { tenant: "initech", size: "88 MB", conn: "1/50", qps: 4, slow: 0, backup: "bu gece 03:08 ✓", rls: true },
];

export default function DatabasesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Database}
        title="Veritabanları"
        description="Tenant-per-DB: her kiracı fiziksel olarak izole veritabanında yaşar — RLS ek katmandır, yerine geçmez."
        lifecycle="Released"
      />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Per-tenant veritabanları</CardTitle>
          <CardDescription>{DBS.length} DB · tamamı şifreli yedekli (onsite + offsite)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {DBS.map((d) => (
            <div key={d.tenant} className="rounded-lg border border-neutral-800 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <code className="font-mono text-neutral-100">{d.tenant}_db</code>
                <Badge variant="outline">{d.size}</Badge>
                <Badge variant={d.rls ? "success" : "destructive"}>RLS aktif</Badge>
                {d.slow > 0 && <Badge variant="warning">{d.slow} yavaş sorgu</Badge>}
                <span className="ml-auto flex gap-2">
                  <Button size="sm" variant="outline">DB shell</Button>
                  <Button size="sm" variant="outline">yedekle</Button>
                  <Button size="sm" variant="ghost" className="text-amber-400">geri yükle…</Button>
                </span>
              </div>
              <p className="mt-1.5 font-mono text-[11px] text-neutral-500">
                bağlantı {d.conn} · {d.qps} qps · son yedek: {d.backup}
              </p>
            </div>
          ))}
          <p className="text-xs text-neutral-500">
            Geri yükleme isim-yazarak onay ister; prod&apos;da ayrıca release yöneticisi imzası gerekir.
          </p>
        </CardContent>
      </Card>

      <CliEquivalent tool="db.list" args={{ "per-tenant": true }} />
    </div>
  );
}
