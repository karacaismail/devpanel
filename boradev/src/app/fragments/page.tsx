"use client";

import { useState } from "react";
import { Component } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CliEquivalent } from "@/components/cli-equivalent";
import { cn } from "@/lib/utils";

const FRAGMENTS = [
  {
    id: "address",
    fields: ["line1", "line2?", "city", "postal_code", "country"],
    usedBy: ["party", "order"],
    yaml: `fragment: address
fields:
  line1:       { type: string, required: true }
  line2:       { type: string }
  city:        { type: string, required: true }
  postal_code: { type: string, required: true }
  country:     { type: iso-3166, required: true }`,
  },
  {
    id: "money",
    fields: ["amount", "currency"],
    usedBy: ["listing", "invoice"],
    yaml: `fragment: money
fields:
  amount:   { type: decimal(18,4), required: true }
  currency: { type: iso-4217, required: true }
# bitemporal modülde geçmiş kur sorgusu destekler`,
  },
  {
    id: "contact",
    fields: ["email", "phone?"],
    usedBy: ["party"],
    yaml: `fragment: contact
fields:
  email: { type: email, required: true, pii: true }
  phone: { type: phone, pii: true }
# pii bayrağı fragment'tan modüle MİRAS kalır — kaldırılamaz`,
  },
];

export default function FragmentsPage() {
  const [sel, setSel] = useState(FRAGMENTS[0]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-neutral-100">
          <Component className="h-6 w-6 text-indigo-400" /> Fragment Kitaplığı
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Yeniden kullanılabilir alan grupları — bayraklar (pii vb.) fragment&apos;tan
          modüle miras kalır, kullanan tarafta kaldırılamaz.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[16rem_1fr]">
        <div className="space-y-1.5">
          {FRAGMENTS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSel(f)}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                sel.id === f.id
                  ? "border-indigo-500/40 bg-indigo-600/10 text-indigo-300"
                  : "border-neutral-800 text-neutral-400 hover:bg-neutral-800"
              )}
            >
              <Component className="h-4 w-4" />
              <span className="font-mono">{f.id}</span>
              <span className="ml-auto text-xs text-neutral-500">{f.usedBy.length} kullanım</span>
            </button>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-mono text-base">
              {sel.id}
              <Badge variant="secondary">Fragment (Küçük Taş · 5)</Badge>
            </CardTitle>
            <CardDescription>
              kullananlar:{" "}
              {sel.usedBy.map((u) => (
                <Badge key={u} variant="outline" className="ml-1 font-mono">
                  {u}
                </Badge>
              ))}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {sel.fields.map((f) => (
                <Badge key={f} variant="secondary" className="font-mono font-normal">
                  {f}
                </Badge>
              ))}
            </div>
            <pre className="overflow-auto rounded-lg bg-neutral-950 p-4 font-mono text-xs leading-relaxed text-neutral-300">
              {sel.yaml}
            </pre>
          </CardContent>
        </Card>
      </div>

      <CliEquivalent tool="fragment.list" args={{ app: "marketplace" }} />
    </div>
  );
}
