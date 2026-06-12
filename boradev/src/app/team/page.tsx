"use client";

import { Users, Bot } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CliEquivalent } from "@/components/cli-equivalent";

/** Ali güncellemesi — Team: insan + agent üyeler tek listede, rol ve son aktivite. */

const MEMBERS = [
  { name: "ismail", role: "owner / developer", kind: "insan", last: "şimdi çevrimiçi", scope: "tam yetki (entitlement)" },
  { name: "bora", role: "developer", kind: "insan", last: "1s önce", scope: "tanım katmanı" },
  { name: "ali", role: "developer", kind: "insan", last: "dün", scope: "tanım katmanı" },
  { name: "ahmet", role: "developer", kind: "insan", last: "2 gün önce", scope: "tanım katmanı" },
  { name: "vibebot", role: "agent (MCP)", kind: "agent", last: "11:42 (r-318)", scope: "party.read · scaffold" },
  { name: "migration-reviewer", role: "agent (MCP)", kind: "agent", last: "10:18 (r-317)", scope: "migration.review (dry-run)" },
];

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-neutral-100">
          <Users className="h-6 w-6 text-indigo-400" /> Team
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          İnsanlar ve agent&apos;lar aynı ekip listesinde — agent&apos;ların yetkisi
          scope&apos;la sınırlı, her koşusu Agent Runs&apos;ta.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Üyeler</CardTitle>
          <CardDescription>
            {MEMBERS.filter((m) => m.kind === "insan").length} insan ·{" "}
            {MEMBERS.filter((m) => m.kind === "agent").length} agent
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {MEMBERS.map((m) => (
            <div key={m.name} className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2.5 text-sm">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-800 text-xs text-neutral-300">
                {m.kind === "agent" ? <Bot className="h-3.5 w-3.5 text-indigo-400" /> : m.name[0].toUpperCase()}
              </span>
              <span className="text-neutral-100">{m.name}</span>
              <Badge variant={m.kind === "agent" ? "default" : "secondary"}>{m.role}</Badge>
              <code className="font-mono text-xs text-neutral-500">{m.scope}</code>
              <span className="ml-auto text-xs text-neutral-500">{m.last}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <CliEquivalent tool="team.list" args={{ app: "marketplace" }} />
    </div>
  );
}
