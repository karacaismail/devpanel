"use client";

import { useMemo, useState } from "react";
import { Bot, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CliEquivalent } from "@/components/cli-equivalent";

const TOOLS = [
  { name: "archetype.party.crud", source: "party (otomatik)", ops: "read · create · update" },
  { name: "archetype.listing.crud", source: "listing (otomatik)", ops: "read · create · update" },
  { name: "sdk.scaffold", source: "kernel", ops: "preview · apply (test-önce)" },
  { name: "theme.apply", source: "kernel", ops: "apply (AA bekçili)" },
  { name: "data.query", source: "kernel", ops: "read (RLS + maske)" },
];

const SCOPES = [
  { id: "party.read", label: "Party okuma (maskeli)", writes: false, tables: ["ten_party"] },
  { id: "party.write", label: "Party yazma", writes: true, tables: ["ten_party"] },
  { id: "listing.read", label: "Listing okuma", writes: false, tables: ["ten_listing"] },
  { id: "listing.write", label: "Listing yazma", writes: true, tables: ["ten_listing"] },
  { id: "ledger.write", label: "Loyalty ledger yazma", writes: true, tables: ["ten_loyalty_ledger"] },
  { id: "scaffold", label: "Scaffold önerme (yazma yok)", writes: false, tables: [] },
];

export default function CapabilitiesPage() {
  const [selected, setSelected] = useState<string[]>(["party.read", "scaffold"]);
  const [saved, setSaved] = useState<string | null>(null);

  const blast = useMemo(() => {
    const active = SCOPES.filter((s) => selected.includes(s.id));
    const tables = [...new Set(active.flatMap((s) => s.tables))];
    const writeTables = new Set(active.filter((s) => s.writes).flatMap((s) => s.tables));
    const level = writeTables.size === 0 ? "dar" : writeTables.size >= 3 ? "geniş" : "orta";
    return { tables, level, needsApproval: level === "geniş" };
  }, [selected]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-neutral-100">
          <Bot className="h-6 w-6 text-indigo-400" /> Agent Yetkileri
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Panelin yaptığı her şeyin MCP eşdeğeri vardır — bu ekran agent&apos;ın
          yapabildiklerinin insan-görünümüdür. Scope daralt, blast-radius&apos;u gör.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">MCP tool kataloğu</CardTitle>
          <CardDescription>ArcheType başına otomatik üretilir.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {TOOLS.map((t) => (
            <div key={t.name} className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2 text-sm">
              <code className="font-mono text-xs text-neutral-100">{t.name}</code>
              <span className="text-xs text-neutral-500">{t.source}</span>
              <span className="ml-auto text-xs text-neutral-400">{t.ops}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Capability scope — vibebot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {SCOPES.map((s) => (
              <label key={s.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2 text-sm hover:bg-neutral-800/50">
                <input
                  type="checkbox"
                  checked={selected.includes(s.id)}
                  onChange={() => {
                    setSaved(null);
                    setSelected((prev) =>
                      prev.includes(s.id) ? prev.filter((x) => x !== s.id) : [...prev, s.id],
                    );
                  }}
                  className="accent-indigo-500"
                />
                <code className="font-mono text-xs text-neutral-100">{s.id}</code>
                <span className="text-xs text-neutral-500">{s.label}</span>
                {s.writes && <Badge variant="warning" className="ml-auto">yazma</Badge>}
              </label>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Blast-radius önizleme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>
              <span className="text-neutral-500">yarıçap: </span>
              <Badge variant={blast.level === "dar" ? "success" : blast.level === "orta" ? "warning" : "destructive"}>
                {blast.level}
              </Badge>
            </p>
            <p className="font-mono text-xs text-neutral-300">
              etkilenen tablolar: {blast.tables.length > 0 ? blast.tables.join(", ") : "—"}
            </p>
            {blast.needsApproval && (
              <p className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-600/10 p-3 text-xs text-red-400">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                Geniş yarıçap: kaydetmek isim-yazarak ek onay ister.
              </p>
            )}
            <Button size="sm" onClick={() => setSaved(`Scope kaydedildi (${blast.level} yarıçap) — audit'e yazıldı.`)}>
              Scope&apos;u kaydet
            </Button>
            {saved && <p className="text-xs text-emerald-400">{saved}</p>}
          </CardContent>
        </Card>
      </div>

      <CliEquivalent tool="agent.scope.set" args={{ agent: "vibebot", scopes: selected.join(",") }} />
    </div>
  );
}
