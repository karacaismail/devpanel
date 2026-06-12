"use client";

import { CliEquivalent } from "@/components/cli-equivalent";

import { useState } from "react";
import { Database, ZoomIn, ZoomOut, Maximize2, Download, Wand2, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ERDModel {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  fields: { name: string; type: string; pk?: boolean; fk?: string }[];
}

interface ERDRelation {
  from: string;
  fromField: string;
  to: string;
  toField: string;
  type: "1:N" | "N:1" | "1:1" | "N:M";
}

const models: ERDModel[] = [
  {
    id: "user", name: "User", color: "border-indigo-600", x: 50, y: 50,
    fields: [
      { name: "id", type: "UUID", pk: true },
      { name: "name", type: "VARCHAR(255)" },
      { name: "email", type: "VARCHAR(255)" },
      { name: "role", type: "ENUM" },
      { name: "metadata", type: "JSONB" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
  },
  {
    id: "product", name: "Product", color: "border-emerald-600", x: 380, y: 50,
    fields: [
      { name: "id", type: "UUID", pk: true },
      { name: "title", type: "VARCHAR(255)" },
      { name: "price", type: "NUMERIC" },
      { name: "description", type: "TEXT" },
      { name: "category_id", type: "UUID", fk: "Category" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
  },
  {
    id: "order", name: "Order", color: "border-amber-600", x: 50, y: 320,
    fields: [
      { name: "id", type: "UUID", pk: true },
      { name: "user_id", type: "UUID", fk: "User" },
      { name: "status", type: "ENUM" },
      { name: "total", type: "NUMERIC" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
  },
  {
    id: "order_item", name: "OrderItem", color: "border-pink-600", x: 380, y: 320,
    fields: [
      { name: "id", type: "UUID", pk: true },
      { name: "order_id", type: "UUID", fk: "Order" },
      { name: "product_id", type: "UUID", fk: "Product" },
      { name: "quantity", type: "INTEGER" },
      { name: "price", type: "NUMERIC" },
    ],
  },
  {
    id: "category", name: "Category", color: "border-cyan-600", x: 680, y: 50,
    fields: [
      { name: "id", type: "UUID", pk: true },
      { name: "name", type: "VARCHAR(255)" },
      { name: "slug", type: "VARCHAR(255)" },
      { name: "parent_id", type: "UUID", fk: "Category" },
    ],
  },
  {
    id: "blog_post", name: "BlogPost", color: "border-purple-600", x: 680, y: 280,
    fields: [
      { name: "id", type: "UUID", pk: true },
      { name: "title", type: "VARCHAR(255)" },
      { name: "content", type: "TEXT" },
      { name: "author_id", type: "UUID", fk: "User" },
      { name: "published_at", type: "TIMESTAMP" },
      { name: "slug", type: "VARCHAR(255)" },
    ],
  },
];

const relations: ERDRelation[] = [
  { from: "order", fromField: "user_id", to: "user", toField: "id", type: "N:1" },
  { from: "order_item", fromField: "order_id", to: "order", toField: "id", type: "N:1" },
  { from: "order_item", fromField: "product_id", to: "product", toField: "id", type: "N:1" },
  { from: "product", fromField: "category_id", to: "category", toField: "id", type: "N:1" },
  { from: "blog_post", fromField: "author_id", to: "user", toField: "id", type: "N:1" },
];

export default function ERDPage() {
  const [zoom, setZoom] = useState(1);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">ERD Diagram</h1>
          <p className="text-sm text-neutral-400">{models.length} model · {relations.length} relation</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm"><Wand2 className="mr-2 h-3 w-3" />AI Analiz</Button>
          <Button variant="outline" size="sm"><Download className="mr-2 h-3 w-3" />SVG Export</Button>
          <div className="flex items-center rounded-lg border border-neutral-800">
            <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))} className="p-1.5 hover:bg-neutral-800 rounded-l-lg"><ZoomOut className="h-3.5 w-3.5 text-neutral-400" /></button>
            <span className="px-2 text-[10px] text-neutral-500 min-w-[40px] text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))} className="p-1.5 hover:bg-neutral-800 rounded-r-lg"><ZoomIn className="h-3.5 w-3.5 text-neutral-400" /></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Diagram */}
        <Card className="lg:col-span-3 overflow-hidden">
          <CardContent className="p-0">
            <div className="relative overflow-auto bg-neutral-950 bg-[radial-gradient(circle,_#1f293740_1px,_transparent_1px)] bg-[size:20px_20px]" style={{ height: "560px" }}>
              <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left", padding: "24px" }}>
                {/* Relation Lines (simplified) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                  {relations.map((rel, i) => {
                    const from = models.find((m) => m.id === rel.from);
                    const to = models.find((m) => m.id === rel.to);
                    if (!from || !to) return null;
                    const x1 = from.x + 140;
                    const y1 = from.y + 40;
                    const x2 = to.x + 140;
                    const y2 = to.y + 40;
                    return (
                      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#374151" strokeWidth="1.5" strokeDasharray="4 4" />
                    );
                  })}
                </svg>

                {/* Model Cards */}
                {models.map((model) => (
                  <div
                    key={model.id}
                    onClick={() => setSelectedModel(selectedModel === model.id ? null : model.id)}
                    className={cn(
                      "absolute w-[260px] rounded-xl border-t-2 bg-neutral-900 shadow-xl cursor-pointer transition-all hover:shadow-2xl",
                      model.color,
                      selectedModel === model.id && "ring-1 ring-indigo-500 shadow-indigo-500/10"
                    )}
                    style={{ left: model.x, top: model.y }}
                  >
                    <div className="flex items-center gap-2 border-b border-neutral-800 px-3 py-2">
                      <Database className="h-3.5 w-3.5 text-neutral-400" />
                      <span className="text-sm font-semibold text-neutral-100">{model.name}</span>
                      <Badge variant="secondary" className="ml-auto text-[8px]">{model.fields.length} fields</Badge>
                    </div>
                    <div className="p-2 space-y-0.5">
                      {model.fields.map((field) => (
                        <div key={field.name} className="flex items-center gap-2 rounded px-2 py-1 hover:bg-neutral-800/50">
                          <span className={cn(
                            "text-[10px] font-mono",
                            field.pk ? "text-amber-400 font-bold" : field.fk ? "text-indigo-400" : "text-neutral-300"
                          )}>
                            {field.name}
                          </span>
                          <span className="ml-auto text-[9px] text-neutral-600 font-mono">{field.type}</span>
                          {field.pk && <Badge variant="warning" className="text-[7px] px-1 py-0">PK</Badge>}
                          {field.fk && <Badge variant="default" className="text-[7px] px-1 py-0">FK</Badge>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Info Panel */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3"><CardTitle className="text-sm">Relations</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {relations.map((rel, i) => (
              <div key={i} className="rounded-lg border border-neutral-800 p-2.5">
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="font-mono font-medium text-neutral-200">{rel.from}</span>
                  <ArrowRight className="h-3 w-3 text-neutral-600" />
                  <span className="font-mono font-medium text-neutral-200">{rel.to}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <code className="text-[9px] text-neutral-500">{rel.fromField} → {rel.toField}</code>
                  <Badge variant="outline" className="ml-auto text-[8px]">{rel.type}</Badge>
                </div>
              </div>
            ))}

            <div className="border-t border-neutral-800 pt-3 mt-3 space-y-2">
              <h4 className="text-xs font-medium text-neutral-400">Özet</h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-neutral-800/50 p-2 text-center">
                  <p className="text-lg font-bold text-neutral-100">{models.length}</p>
                  <p className="text-[9px] text-neutral-500">Models</p>
                </div>
                <div className="rounded-lg bg-neutral-800/50 p-2 text-center">
                  <p className="text-lg font-bold text-neutral-100">{relations.length}</p>
                  <p className="text-[9px] text-neutral-500">Relations</p>
                </div>
                <div className="rounded-lg bg-neutral-800/50 p-2 text-center">
                  <p className="text-lg font-bold text-neutral-100">{models.reduce((a, m) => a + m.fields.length, 0)}</p>
                  <p className="text-[9px] text-neutral-500">Fields</p>
                </div>
                <div className="rounded-lg bg-neutral-800/50 p-2 text-center">
                  <p className="text-lg font-bold text-neutral-100">{models.reduce((a, m) => a + m.fields.filter((f) => f.fk).length, 0)}</p>
                  <p className="text-[9px] text-neutral-500">Foreign Keys</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Atonota S2 — tasarımcı lejantı */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 text-xs text-neutral-400">
        <p className="text-[11px] uppercase tracking-wider text-neutral-500">Lejant</p>
        <p className="mt-1.5">◆ primary key · ⌁ index · düz çizgi One-to-Many · çift çizgi Many-to-Many · kesikli kırmızı: kırık ilişki</p>
        <p className="mt-1">Diyagram tanımdan türetilir — düzenleme Schema Builder&apos;da, onay kapısıyla yapılır.</p>
      </div>

      <CliEquivalent tool="erd.read" args={{ app: "marketplace" }} />

    </div>
  );
}
