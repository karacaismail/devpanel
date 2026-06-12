"use client";

import { useState } from "react";
import { KeyRound, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CliEquivalent } from "@/components/cli-equivalent";

/** Ali güncellemesi — API Keys: maskeli anahtarlar, scope'lu, son kullanım izli. */

interface ApiKey {
  id: string;
  label: string;
  prefix: string;
  scopes: string[];
  lastUsed: string;
  env: "dev" | "prod";
}

const SEED: ApiKey[] = [
  { id: "k1", label: "ERP entegrasyonu", prefix: "fk_live_a3x9", scopes: ["party.read", "order.read"], lastUsed: "2dk önce", env: "prod" },
  { id: "k2", label: "vibebot (MCP agent)", prefix: "fk_live_m1c7", scopes: ["scaffold", "data.query"], lastUsed: "1s önce", env: "prod" },
  { id: "k3", label: "lokal geliştirme", prefix: "fk_test_d8k2", scopes: ["*"], lastUsed: "dün", env: "dev" },
];

export default function ApiKeysPage() {
  const [keys, setKeys] = useState(SEED);
  const [created, setCreated] = useState<string | null>(null);

  const createKey = () => {
    const id = `k${keys.length + 1}`;
    setKeys((prev) => [
      ...prev,
      { id, label: "yeni anahtar", prefix: `fk_test_${id}x${keys.length}f`, scopes: ["party.read"], lastUsed: "—", env: "dev" },
    ]);
    setCreated("Anahtar yalnızca BİR KEZ tam gösterilir — kopyalayıp güvenli yere koy. Panelde hep maskeli kalır.");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-neutral-100">
          <KeyRound className="h-6 w-6 text-indigo-400" /> API Keys
        </h1>
        <Button size="sm" className="ml-auto" onClick={createKey}>
          <Plus className="mr-1 h-3 w-3" /> anahtar üret
        </Button>
      </div>
      <p className="-mt-4 text-sm text-neutral-400">
        Her anahtar scope&apos;ludur; geniş scope (prod yazma) ek onay ister. Ham
        anahtar asla saklanmaz — yalnız hash + prefix.
      </p>

      {created && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-600/10 p-3 text-xs text-amber-400">{created}</p>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Anahtarlar</CardTitle>
          <CardDescription>{keys.length} aktif anahtar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {keys.map((k) => (
            <div key={k.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2.5 text-sm">
              <span className="text-neutral-100">{k.label}</span>
              <code className="font-mono text-xs text-neutral-500">{k.prefix}••••••••</code>
              <Badge variant={k.env === "prod" ? "default" : "secondary"}>{k.env}</Badge>
              {k.scopes.map((s) => (
                <Badge key={s} variant="outline" className="font-mono">{s}</Badge>
              ))}
              <span className="ml-auto text-xs text-neutral-500">son kullanım: {k.lastUsed}</span>
              <Button
                size="sm"
                variant="ghost"
                aria-label={`${k.label} sil`}
                onClick={() => setKeys((prev) => prev.filter((x) => x.id !== k.id))}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <CliEquivalent tool="apikey.list" args={{ app: "marketplace" }} />
    </div>
  );
}
