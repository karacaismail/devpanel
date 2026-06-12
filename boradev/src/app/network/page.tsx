"use client";

import { HardDrive, Globe, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { CliEquivalent } from "@/components/cli-equivalent";

const DNS = [
  { type: "A", name: "panel.acme.example", value: "188.40.x.x", proxy: true },
  { type: "CNAME", name: "cdn.acme.example", value: "edge.atonota.net", proxy: true },
  { type: "TXT", name: "_dmarc.acme.example", value: "v=DMARC1; p=quarantine", proxy: false },
];

const SSL = [
  { domain: "panel.acme.example", expires: "2026-08-30", auto: true },
  { domain: "*.globex.example", expires: "2026-07-12", auto: true },
];

const STORAGE = [
  { bucket: "media-acme", size: "4.1 GB", kind: "onsite", objects: 1240 },
  { bucket: "backups-offsite", size: "18.6 GB", kind: "offsite (şifreli)", objects: 96 },
];

export default function NetworkPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={HardDrive}
        title="Depolama, CDN & Ağ"
        description="DNS, SSL, cache ve bucket'lar — domain bağlama tenant detayından, sertifikalar otomatik yenilenir."
        lifecycle="Released"
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4 text-indigo-400" /> DNS kayıtları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {DNS.map((r) => (
              <div key={r.name} className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2 text-xs">
                <Badge variant="outline" className="font-mono">{r.type}</Badge>
                <code className="font-mono text-neutral-100">{r.name}</code>
                <code className="font-mono text-neutral-500">{r.value}</code>
                {r.proxy && <Badge variant="default" className="ml-auto">CDN proxy</Badge>}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="h-4 w-4 text-emerald-400" /> SSL sertifikaları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {SSL.map((s) => (
              <div key={s.domain} className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2 text-xs">
                <code className="font-mono text-neutral-100">{s.domain}</code>
                <span className="text-neutral-500">bitiş: {s.expires}</span>
                <Badge variant={s.auto ? "success" : "warning"} className="ml-auto">{s.auto ? "oto-yenileme" : "manuel"}</Badge>
              </div>
            ))}
            <p className="pt-1 text-xs text-neutral-500">CDN cache: statik varlık TTL 7g · API yanıtı cache&apos;lenmez (RLS).</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Depolama</CardTitle>
          <CardDescription>Onsite/offsite ayrımı — offsite yedekler her zaman şifrelidir.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {STORAGE.map((b) => (
            <div key={b.bucket} className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2 text-sm">
              <code className="font-mono text-xs text-neutral-100">{b.bucket}</code>
              <Badge variant="outline">{b.kind}</Badge>
              <span className="ml-auto text-xs text-neutral-500">{b.objects.toLocaleString("tr")} nesne · {b.size}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <CliEquivalent tool="network.dns" args={{ zone: "acme.example" }} />
    </div>
  );
}
