"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CliEquivalent } from "@/components/cli-equivalent";

/** Ali güncellemesi — Feature Flags: ortam bazlı anahtarlar, tenant kapsamı. */

type Env = "dev" | "staging" | "prod";

interface FFlag {
  id: string;
  desc: string;
  scope: string;
  envs: Record<Env, boolean>;
}

const SEED: FFlag[] = [
  { id: "surface-fieldsets", desc: "Surface builder alan grubu desteği (FTR-58)", scope: "tüm tenant'lar", envs: { dev: true, staging: true, prod: false } },
  { id: "ai-auto-triage", desc: "Yeni issue'larda otomatik AI triage önerisi", scope: "tüm tenant'lar", envs: { dev: true, staging: false, prod: false } },
  { id: "bitemporal-ui", desc: "Data Browser'da asOf zaman gezgini", scope: "tenant: acme", envs: { dev: true, staging: true, prod: true } },
  { id: "new-onboarding", desc: "Eğitim Yolu v2 akışı", scope: "tenant: globex (pilot)", envs: { dev: true, staging: false, prod: false } },
];

const ENVS: Env[] = ["dev", "staging", "prod"];

export default function FlagsPage() {
  const [flags, setFlags] = useState(SEED);

  const toggle = (id: string, env: Env) =>
    setFlags((prev) =>
      prev.map((f) => (f.id === id ? { ...f, envs: { ...f.envs, [env]: !f.envs[env] } } : f)),
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-neutral-100">
          <Flag className="h-6 w-6 text-indigo-400" /> Feature Flags
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Ortam ve tenant kapsamlı anahtarlar — prod&apos;da açma işlemi audit&apos;e yazılır.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Anahtarlar</CardTitle>
          <CardDescription>{flags.length} flag · prod&apos;da {flags.filter((f) => f.envs.prod).length} açık</CardDescription>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-left text-xs uppercase tracking-wider text-neutral-500">
                <th className="pb-2 font-medium">flag</th>
                <th className="pb-2 font-medium">kapsam</th>
                {ENVS.map((e) => (
                  <th key={e} className="pb-2 text-center font-medium">{e}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {flags.map((f) => (
                <tr key={f.id} className="border-b border-neutral-800/60">
                  <td className="py-2.5">
                    <code className="font-mono text-xs text-neutral-100">{f.id}</code>
                    <p className="text-xs text-neutral-500">{f.desc}</p>
                  </td>
                  <td className="py-2.5">
                    <Badge variant="outline">{f.scope}</Badge>
                  </td>
                  {ENVS.map((e) => (
                    <td key={e} className="py-2.5 text-center">
                      <input
                        type="checkbox"
                        aria-label={`${f.id} ${e}`}
                        checked={f.envs[e]}
                        onChange={() => toggle(f.id, e)}
                        className="accent-indigo-500"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <CliEquivalent tool="flag.set" args={{ id: "surface-fieldsets", env: "prod", value: false }} />
    </div>
  );
}
