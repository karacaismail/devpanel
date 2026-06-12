"use client";

import { useState } from "react";
import { Building2, Pin, Paintbrush, Plus, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CliEquivalent } from "@/components/cli-equivalent";
import { useSelectionStore } from "@/stores/selection-store";
import { useContextStore, destructiveLocked } from "@/stores/context-store";
import { cn } from "@/lib/utils";

type Edition = "lite" | "standard" | "enterprise";

interface Tenant {
  id: string;
  name: string;
  edition: Edition;
  customFields: number;
  themeOverride: boolean;
  pins: string[];
  modules: string[];
  since: string;
  region: string;
  dbSize: string;
}

const TENANTS: Tenant[] = [
  { id: "acme", name: "Acme A.Ş.", edition: "enterprise", customFields: 1, themeOverride: true, pins: ["listing-flow v2"], modules: ["loyalty-points", "fraud-guard"], since: "2025-11", region: "eu-central", dbSize: "1.2 GB" },
  { id: "globex", name: "Globex Ltd.", edition: "lite", customFields: 0, themeOverride: false, pins: [], modules: ["loyalty-points"], since: "2026-02", region: "eu-central", dbSize: "310 MB" },
  { id: "initech", name: "Initech", edition: "standard", customFields: 0, themeOverride: false, pins: [], modules: [], since: "2026-05", region: "tr-ist", dbSize: "88 MB" },
];

const EDITION_VARIANT: Record<Edition, "default" | "secondary" | "outline"> = {
  enterprise: "default",
  standard: "secondary",
  lite: "outline",
};

/* S1 — filo-çapı metrikler (sparkline'lı) */
const FLEET = [
  { label: "tenant", value: "3", spark: [1, 1, 2, 2, 2, 3, 3] },
  { label: "MAU", value: "4.2K", spark: [2.1, 2.6, 2.9, 3.3, 3.6, 4.0, 4.2] },
  { label: "QPS", value: "169", spark: [90, 120, 140, 130, 155, 160, 169] },
  { label: "hata oranı", value: "%0.21", spark: [0.4, 0.38, 0.3, 0.31, 0.25, 0.22, 0.21] },
];

function Spark({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 60},${22 - (v / max) * 18}`).join(" ");
  return (
    <svg viewBox="0 0 60 24" className="h-6 w-16">
      <polyline points={pts} fill="none" stroke="#6366f1" strokeWidth="1.5" />
    </svg>
  );
}

const WIZARD_STEPS = ["Ad / Subdomain", "Bölge", "Plan", "Uygulamalar", "DB İzolasyonu", "Onay & Dağıt"];

type Tab = "overview" | "apps" | "domains" | "backups" | "config" | "db" | "jobs" | "actions";

export default function TenantsPage() {
  const [tenants, setTenants] = useState(TENANTS);
  const select = useSelectionStore((s) => s.select);
  const env = useContextStore((s) => s.env);
  const [active, setActive] = useState<Tenant | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  /* S1 — provizyon sihirbazı */
  const [wizard, setWizard] = useState<number | null>(null);
  const [wName, setWName] = useState("yenico");
  const [dropConfirm, setDropConfirm] = useState("");

  const openTenant = (t: Tenant) => {
    setActive(t);
    setTab("overview");
    select({
      kind: "tenant",
      id: t.id,
      title: t.name,
      meta: { edition: t.edition, region: t.region, dbSize: t.dbSize, since: t.since },
      related: [
        { label: "Şema pinleri", href: "/releases" },
        { label: "Deploy hattı", href: "/deployments" },
        { label: "Veritabanı", href: "/databases" },
      ],
    });
  };

  const finishWizard = () => {
    setTenants((prev) => [
      ...prev,
      { id: wName, name: wName, edition: "standard", customFields: 0, themeOverride: false, pins: [], modules: ["crm-starter"], since: "2026-06", region: "eu-central", dbSize: "12 MB" },
    ]);
    setWizard(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-neutral-100">
          <Building2 className="h-6 w-6 text-indigo-400" /> Tenant &amp; Siteler
        </h1>
        <Button size="sm" className="ml-auto" onClick={() => setWizard(0)}>
          <Plus className="mr-1 h-3 w-3" /> Yeni tenant
        </Button>
      </div>
      <p className="-mt-4 text-sm text-neutral-400">
        Tenant yaşam döngüsü: provizyon → uygulamalar → domain/SSL → yedek → config — tüm özelleştirme tenant katmanında, core şema değişmez.
      </p>

      {/* S1 — filo metrikleri */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {FLEET.map((m) => (
          <Card key={m.label}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-neutral-500">{m.label}</p>
                <p className="mt-0.5 text-xl text-neutral-100">{m.value}</p>
              </div>
              <Spark data={m.spark} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* S1 — provizyon sihirbazı */}
      {wizard !== null && (
        <Card className="border-indigo-500/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Provizyon Sihirbazı</CardTitle>
            <CardDescription className="flex flex-wrap gap-1.5 pt-1">
              {WIZARD_STEPS.map((s, i) => (
                <span key={s} className={cn("rounded-full border px-2 py-0.5 text-[10px]", i < wizard ? "border-emerald-500/40 text-emerald-400" : i === wizard ? "border-indigo-500/50 text-indigo-300" : "border-neutral-800 text-neutral-600")}>
                  {i + 1}. {s}
                </span>
              ))}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
            {wizard === 0 && (
              <label className="flex items-center gap-2 text-xs text-neutral-500">
                subdomain
                <input value={wName} onChange={(e) => setWName(e.target.value)} className="rounded-md border border-neutral-800 bg-neutral-950 px-2 py-1.5 font-mono text-neutral-100" />
                <code className="text-neutral-500">.atonota.app</code>
              </label>
            )}
            {wizard === 1 && <p className="text-neutral-300">Bölge: <Badge variant="outline">eu-central (FRA)</Badge> <Badge variant="secondary">tr-ist</Badge> — veri egemenliği kuralı bölgeyi kilitleyebilir.</p>}
            {wizard === 2 && <p className="text-neutral-300">Plan: <Badge>standard</Badge> — compute tabanlı; yükseltme tenant detayından.</p>}
            {wizard === 3 && <p className="text-neutral-300">Kurulacak uygulamalar: <Badge variant="outline">crm-starter</Badge> <Badge variant="outline">hrms-core</Badge> (blueprint&apos;ten, test-önce scaffold).</p>}
            {wizard === 4 && <p className="text-neutral-300">DB izolasyonu: <Badge variant="default">per-tenant DB</Badge> — paylaşımlı şema YOK; RLS ek katmandır.</p>}
            {wizard === 5 && <p className="text-emerald-400">Özet hazır — &quot;Dağıt&quot; provizyon job&apos;ını kuyruğa atar; ilerleme alt çekmecede izlenir.</p>}
            <div className="mt-4 flex gap-2">
              <Button size="sm" variant="outline" onClick={() => (wizard === 0 ? setWizard(null) : setWizard(wizard - 1))}>
                {wizard === 0 ? "Vazgeç" : "Geri"}
              </Button>
              <Button size="sm" onClick={() => (wizard === 5 ? finishWizard() : setWizard(wizard + 1))}>
                {wizard === 5 ? "Dağıt" : "İleri"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {tenants.map((t) => (
          <Card key={t.id} onClick={() => openTenant(t)} className={cn("cursor-pointer transition-colors hover:border-indigo-500/40", active?.id === t.id && "border-indigo-500/50")}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                {t.name}
                <code className="font-mono text-xs text-neutral-500">{t.id}</code>
                <Badge variant={EDITION_VARIANT[t.edition]} className="ml-auto">{t.edition}</Badge>
              </CardTitle>
              <CardDescription className="text-xs">{t.region} · DB {t.dbSize} · üye {t.since}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-1.5 text-xs">
              <p className="flex justify-between"><span className="text-neutral-500">custom field</span><span className="text-neutral-200">{t.customFields}</span></p>
              <p className="flex justify-between"><span className="text-neutral-500">tema override</span><span className="flex items-center gap-1 text-neutral-200">{t.themeOverride ? <><Paintbrush className="h-3 w-3 text-indigo-400" /> var (AA ✓)</> : "yok"}</span></p>
              <p className="flex justify-between"><span className="text-neutral-500">workflow pin</span><span className="flex items-center gap-1 text-neutral-200">{t.pins.length > 0 ? <><Pin className="h-3 w-3 text-amber-400" /> {t.pins.join(", ")}</> : "güncel"}</span></p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* S1 — tenant detay sekmeleri */}
      {active && (
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="text-base">{active.name} — detay</CardTitle>
            <div className="flex flex-wrap gap-1 pt-2">
              {(
                [
                  ["overview", "Genel Bakış"], ["apps", "Uygulamalar"], ["domains", "Domainler & SSL"],
                  ["backups", "Yedekler"], ["config", "Site Config"], ["db", "DB Analyzer"],
                  ["jobs", "İşler"], ["actions", "Eylemler"],
                ] as const
              ).map(([id, label]) => (
                <button key={id} type="button" onClick={() => setTab(id)} className={cn("rounded-lg px-2.5 py-1.5 text-xs", tab === id ? "bg-indigo-600/15 text-indigo-300" : "text-neutral-400 hover:bg-neutral-800")}>
                  {label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent className="pt-4 text-xs">
            {tab === "overview" && (
              <div className="grid gap-2 sm:grid-cols-3">
                {[["CPU", 31], ["bellek", 58], ["depolama", 44]].map(([l, v]) => (
                  <div key={l as string} className="rounded-lg border border-neutral-800 p-2.5">
                    <p className="text-neutral-500">{l}</p>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-neutral-800"><div className="h-full bg-indigo-500" style={{ width: `${v}%` }} /></div>
                    <p className="mt-1 font-mono text-neutral-300">%{v}</p>
                  </div>
                ))}
                <p className="text-neutral-500 sm:col-span-3">plan: {active.edition} · outbound IP: 188.40.x.x · <span className="text-indigo-300">planı yükselt →</span></p>
              </div>
            )}
            {tab === "apps" && active.modules.map((m) => (
              <p key={m} className="flex items-center gap-2 border-b border-neutral-800/60 py-1.5"><code className="font-mono text-neutral-200">{m}</code><Badge variant="success">aktif</Badge><span className="ml-auto text-neutral-500">güncelle · kaldır</span></p>
            ))}
            {tab === "apps" && active.modules.length === 0 && <p className="text-neutral-500">Kurulu uygulama yok — sihirbazdan ya da blueprint&apos;ten kur.</p>}
            {tab === "domains" && (
              <div className="space-y-1.5">
                <p className="flex items-center gap-2"><code className="font-mono text-neutral-200">{active.id}.atonota.app</code><Badge variant="success">SSL ✓</Badge></p>
                <p className="flex items-center gap-2"><code className="font-mono text-neutral-200">panel.{active.id}.example</code><Badge variant="success">SSL ✓ oto-yenileme</Badge><span className="ml-auto text-indigo-300">domain ekle →</span></p>
              </div>
            )}
            {tab === "backups" && (
              <div className="space-y-1.5">
                {[["bu gece 03:00", "onsite", "412 MB"], ["dün 03:00", "offsite (şifreli)", "409 MB"]].map(([d, k, s]) => (
                  <p key={d as string} className="flex items-center gap-2"><span className="text-neutral-300">{d}</span><Badge variant="outline">{k}</Badge><span className="text-neutral-500">{s}</span><span className="ml-auto text-indigo-300">geri yükle…</span></p>
                ))}
                <Button size="sm" variant="outline">manuel yedek tetikle</Button>
              </div>
            )}
            {tab === "config" && (
              <pre className="rounded-lg bg-neutral-950 p-3 font-mono text-neutral-300">{`{"maintenance_mode": false, "max_upload_mb": 25, "locale": "tr"}`}</pre>
            )}
            {tab === "db" && (
              <div className="space-y-1">
                <p className="text-neutral-300">boyut: {active.dbSize} · bağlantı 14/50 · <span className="text-indigo-300">DB shell aç →</span></p>
                <p className="font-mono text-amber-400">yavaş sorgu: orders JOIN… 2340ms → index önerisi q-8</p>
              </div>
            )}
            {tab === "jobs" && (
              <p className="text-neutral-300">provizyon ✓ · son migration q-6 ✓ · gece yedeği ✓ — detaylar alt çekmecede (Arka Plan İşleri).</p>
            )}
            {tab === "actions" && (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {["migrate", "klonla (staging'e)", "taşı (bölge)"].map((a) => (
                    <Button key={a} size="sm" variant="outline">{a}</Button>
                  ))}
                </div>
                <div className="rounded-lg border border-red-500/30 bg-red-600/5 p-3">
                  <p className="flex items-center gap-1.5 text-red-400"><AlertTriangle className="h-3.5 w-3.5" /> Dangerous Actions — isim-yazarak onay{destructiveLocked(env) ? " · PROD: kilitli" : ""}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <input value={dropConfirm} onChange={(e) => setDropConfirm(e.target.value)} placeholder={active.id} className="rounded-md border border-neutral-800 bg-neutral-950 px-2 py-1 font-mono text-neutral-200" />
                    <Button size="sm" variant="destructive" disabled={dropConfirm !== active.id || destructiveLocked(env)}>reset</Button>
                    <Button size="sm" variant="destructive" disabled={dropConfirm !== active.id || destructiveLocked(env)}>drop</Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <CliEquivalent tool="tenant.list" args={{ app: "marketplace" }} />
    </div>
  );
}
