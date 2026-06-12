"use client";

import { useState } from "react";
import { Boxes, ShieldAlert, FlaskConical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CliEquivalent } from "@/components/cli-equivalent";
import { cn } from "@/lib/utils";

interface AField {
  name: string;
  type: string;
  required?: boolean;
  pii?: boolean;
  custom?: boolean;
}

interface ArchetypeDef {
  id: string;
  scope: "kernel" | "app";
  flags: { pii: boolean; bitemporal: boolean; retention: string | null; audit: boolean };
  fields: AField[];
  derived: { table: string; graphql: string; rest: string; mcp: string; tests: string[] };
}

const ARCHETYPES: ArchetypeDef[] = [
  {
    id: "party",
    scope: "kernel",
    flags: { pii: true, bitemporal: false, retention: "P5Y", audit: true },
    fields: [
      { name: "display_name", type: "string", required: true },
      { name: "email", type: "email", required: true, pii: true },
      { name: "phone", type: "phone", pii: true },
      { name: "status", type: "enum(active|passive|blocked)", required: true },
      { name: "loyalty_tier", type: "string", custom: true },
    ],
    derived: {
      table: "ten_party (RLS: tenant_id)",
      graphql: "party(id) · parties(filter, page) · partyCreate · partyUpdate",
      rest: "GET/POST /api/party · PATCH /api/party/:id",
      mcp: "archetype.party.crud",
      tests: ["party.contract.test.ts", "party.rls.test.ts (komşu tenant okuyamaz)", "party.pii-mask.test.ts"],
    },
  },
  {
    id: "listing",
    scope: "app",
    flags: { pii: false, bitemporal: true, retention: null, audit: true },
    fields: [
      { name: "title", type: "string", required: true },
      { name: "price", type: "money", required: true },
      { name: "seller", type: "ref(party)", required: true },
      { name: "state", type: "workflow(listing-flow)", required: true },
    ],
    derived: {
      table: "ten_listing (RLS + bitemporal çift zaman)",
      graphql: "listing(id, asOf) · listings(filter, page) · listingCreate",
      rest: "GET/POST /api/listing",
      mcp: "archetype.listing.crud",
      tests: ["listing.contract.test.ts", "listing.rls.test.ts", "listing.bitemporal.test.ts"],
    },
  },
];

export default function ArchetypePage() {
  const [sel, setSel] = useState(ARCHETYPES[0]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-neutral-100">
          <Boxes className="h-6 w-6 text-indigo-400" /> ArcheType Studio
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Tanım tek doğruluk kaynağıdır: bayraklar (pii / bitemporal / retention / audit)
          neyin doğacağını belirler — tablo, API, MCP tool ve testler tanımdan türetilir.
        </p>
      </div>

      <div className="flex gap-2">
        {ARCHETYPES.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setSel(a)}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
              sel.id === a.id
                ? "border-indigo-500/40 bg-indigo-600/10 text-indigo-300"
                : "border-neutral-800 text-neutral-400 hover:bg-neutral-800"
            )}
          >
            <span className="font-mono">{a.id}</span>
            <Badge variant={a.scope === "kernel" ? "default" : "outline"}>{a.scope}</Badge>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Bayraklar &amp; Alanlar</CardTitle>
            <CardDescription className="flex flex-wrap gap-1.5 pt-1">
              <Badge variant={sel.flags.pii ? "destructive" : "secondary"}>pii: {String(sel.flags.pii)}</Badge>
              <Badge variant="secondary">bitemporal: {String(sel.flags.bitemporal)}</Badge>
              <Badge variant="secondary">retention: {sel.flags.retention ?? "—"}</Badge>
              <Badge variant="secondary">audit: {String(sel.flags.audit)}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {sel.fields.map((f) => (
              <div key={f.name} className="flex items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2 text-sm">
                <code className="font-mono text-xs text-neutral-100">{f.name}</code>
                <span className="text-xs text-neutral-500">{f.type}</span>
                <span className="ml-auto flex gap-1">
                  {f.required && <Badge variant="outline">required</Badge>}
                  {f.pii && <Badge variant="destructive">pii</Badge>}
                  {f.custom && <Badge variant="default">tenant-custom (E8)</Badge>}
                </span>
              </div>
            ))}
            <p className="flex items-start gap-2 pt-2 text-xs text-neutral-500">
              <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-400" />
              Custom field tenant katmanında yaşar — core şema değişmez, migration gerekmez;
              PII bayrağı zorunlu seçimdir ve maskeleme + erişim günlüğünü otomatik bağlar.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Doğurdukları</CardTitle>
            <CardDescription>Panel yazmaz — tanım doğurur.</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              {(
                [
                  ["Tablo", sel.derived.table],
                  ["GraphQL", sel.derived.graphql],
                  ["REST", sel.derived.rest],
                  ["MCP tool", sel.derived.mcp],
                ] as const
              ).map(([k, v]) => (
                <div key={k} className="flex flex-col gap-0.5">
                  <dt className="text-[11px] uppercase tracking-wider text-neutral-500">{k}</dt>
                  <dd className="font-mono text-xs text-neutral-200">{v}</dd>
                </div>
              ))}
              <div>
                <dt className="text-[11px] uppercase tracking-wider text-neutral-500">Üretilmiş testler</dt>
                <dd className="mt-1 space-y-1">
                  {sel.derived.tests.map((t) => (
                    <p key={t} className="flex items-center gap-1.5 font-mono text-xs text-neutral-200">
                      <FlaskConical className="h-3 w-3 text-emerald-400" /> {t}
                    </p>
                  ))}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>

      <CliEquivalent tool="archetype.read" args={{ id: sel.id }} />
    </div>
  );
}
