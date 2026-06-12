"use client";

import { useState } from "react";
import { Rocket, RotateCcw, GitCommitHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CliEquivalent } from "@/components/cli-equivalent";

/** Ali güncellemesi — Deploy hattı: dev → staging → prod; change-set'ler changelog olur. */

type Env = "dev" | "staging" | "prod";

interface EnvState {
  name: Env;
  version: string;
  healthy: boolean;
  deployedAt: string;
}

const CHANGELOG = [
  { id: "cs1", issue: "BUG-137", summary: "Webhook imza doğrulamasında saat toleransı (±5dk)" },
  { id: "cs2", issue: "FTR-58", summary: "Surface builder: alan grubu desteği (1. faz)" },
];

function bump(v: string): string {
  const m = /v(\d+)\.(\d+)\.(\d+)/.exec(v);
  return m ? `v${m[1]}.${Number(m[2]) + 1}.0` : v;
}

export default function DeploymentsPage() {
  const [envs, setEnvs] = useState<EnvState[]>([
    { name: "dev", version: "v1.9.0", healthy: true, deployedAt: "bugün 10:42" },
    { name: "staging", version: "v1.8.0", healthy: true, deployedAt: "dün 17:05" },
    { name: "prod", version: "v1.7.2", healthy: true, deployedAt: "3 gün önce" },
  ]);
  const [log, setLog] = useState<string[]>([]);

  const deploy = (target: Env) => {
    setEnvs((prev) => {
      const order: Env[] = ["dev", "staging", "prod"];
      const src = order[order.indexOf(target) - 1];
      const srcVersion = src ? prev.find((e) => e.name === src)!.version : bump(prev[0].version);
      return prev.map((e) =>
        e.name === target ? { ...e, version: src ? srcVersion : srcVersion, deployedAt: "az önce" } : e,
      );
    });
    setLog((l) => [`${target} → deploy edildi (changelog: ${CHANGELOG.length} kayıt)`, ...l].slice(0, 6));
  };

  const rollback = (target: Env) => {
    setLog((l) => [`${target} → bir önceki sürüme geri alındı`, ...l].slice(0, 6));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-neutral-100">
          <Rocket className="h-6 w-6 text-indigo-400" /> Ortam &amp; Release
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Ortam hattı: dev → staging → prod. Issue&apos;lardan gelen change-set&apos;ler
          changelog&apos;u oluşturur; rollback tek tık.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {envs.map((e, i) => (
          <Card key={e.name} className={e.name === "prod" ? "border-indigo-500/30" : undefined}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                {e.name}
                <Badge variant={e.healthy ? "success" : "destructive"}>{e.healthy ? "sağlıklı" : "sorunlu"}</Badge>
              </CardTitle>
              <CardDescription>
                <span className="font-mono text-neutral-200">{e.version}</span> · {e.deployedAt}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Button size="sm" onClick={() => deploy(e.name)}>
                <Rocket className="mr-1 h-3 w-3" /> {i === 0 ? "yeni sürüm" : `${envs[i - 1].name} → ${e.name}`}
              </Button>
              <Button size="sm" variant="outline" onClick={() => rollback(e.name)}>
                <RotateCcw className="mr-1 h-3 w-3" /> rollback
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <GitCommitHorizontal className="h-4 w-4 text-indigo-400" /> Bekleyen changelog (change-set&apos;lerden)
          </CardTitle>
          <CardDescription>Issue → change-set → release köprüsü: yapılan iş kendi kaydını yazar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {CHANGELOG.map((c) => (
            <div key={c.id} className="flex items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2 text-sm">
              <code className="font-mono text-xs text-indigo-400">{c.issue}</code>
              <span className="text-neutral-300">{c.summary}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {log.length > 0 && (
        <div className="space-y-1">
          {log.map((l, i) => (
            <p key={i} className="font-mono text-xs text-emerald-400">✓ {l}</p>
          ))}
        </div>
      )}

      {/* Atonota S9 — branch ağacı + release dossier */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Branch ağacı</CardTitle>
            <CardDescription>prod en üstte; build logları: install.log / pip.log.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 font-mono text-xs">
            <p className="text-neutral-100">● main <span className="text-neutral-500">— prod · build #311</span> <Badge variant="success">yeşil</Badge></p>
            <p className="ml-4 text-neutral-300">└ release/1.8 <span className="text-neutral-500">— staging · #319</span> <Badge variant="success">yeşil</Badge></p>
            <p className="ml-8 text-neutral-300">└ feat/surface-fieldsets <span className="text-neutral-500">— dev · #321</span> <Badge variant="warning">testler koşuyor</Badge></p>
            <p className="mt-2 text-[11px] text-amber-400">mail catcher: dev/staging&apos;de e-postalar yakalanır — PROD&apos;da GERÇEKTEN gönderilir.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Release Dossier — v1.8.0</CardTitle>
            <CardDescription>Tek paket: kanıtsız release yok.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 text-xs">
            <p className="text-neutral-300">build: <code className="font-mono">#319</code> · checksum: <code className="font-mono text-neutral-500">sha256:9f2a…c41</code></p>
            <p className="text-neutral-300">migration planı: q-7, q-8 (GUARD&apos;lı) · rollback planı: #311&apos;e dön + DB snapshot 03:00</p>
            <p className="text-neutral-300">onaylar: mimari ✓ · release ✓ · güvenlik ◌ <Badge variant="warning" className="ml-1">1 imza eksik — promotion kilitli</Badge></p>
          </CardContent>
        </Card>
      </div>

      <CliEquivalent tool="deploy.run" args={{ env: "staging", "with-changelog": true }} />
    </div>
  );
}
