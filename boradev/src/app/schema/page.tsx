"use client";

import { CliEquivalent } from "@/components/cli-equivalent";

import { useState } from "react";
import {
  Database,
  Plus,
  Trash2,
  Code,
  Eye,
  Save,
  Wand2,
  ChevronDown,
  GripVertical,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useSchemaStore, type SchemaField, type FieldType } from "@/stores/schema-store";

const fieldTypes: { value: FieldType; label: string }[] = [
  { value: "string", label: "String" },
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "boolean", label: "Boolean" },
  { value: "date", label: "Date" },
  { value: "email", label: "Email" },
  { value: "url", label: "URL" },
  { value: "json", label: "JSON" },
  { value: "relation", label: "Relation" },
  { value: "enum", label: "Enum" },
  { value: "computed", label: "Computed" },
];

interface SampleField {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  unique: boolean;
  indexed: boolean;
  enumValues?: string[];
  relationModel?: string;
}

interface SampleModel {
  id: string;
  name: string;
  tableName: string;
  timestamps: boolean;
  softDelete: boolean;
  description: string;
  fields: SampleField[];
}

const sampleModels: SampleModel[] = [
  {
    id: "user",
    name: "User",
    tableName: "users",
    timestamps: true,
    softDelete: true,
    description: "Kullanıcı modeli",
    fields: [
      { id: "f1", name: "name", type: "string", required: true, unique: false, indexed: true },
      { id: "f2", name: "email", type: "email", required: true, unique: true, indexed: true },
      { id: "f3", name: "role", type: "enum", required: true, unique: false, indexed: true, enumValues: ["admin", "editor", "viewer"] },
      { id: "f4", name: "metadata", type: "json", required: false, unique: false, indexed: false },
    ],
  },
  {
    id: "product",
    name: "Product",
    tableName: "products",
    timestamps: true,
    softDelete: false,
    description: "Ürün modeli",
    fields: [
      { id: "p1", name: "title", type: "string", required: true, unique: false, indexed: true },
      { id: "p2", name: "price", type: "number", required: true, unique: false, indexed: false },
      { id: "p3", name: "description", type: "text", required: false, unique: false, indexed: false },
      { id: "p4", name: "category", type: "relation", required: false, unique: false, indexed: true, relationModel: "Category" },
    ],
  },
];

function generateTypeScript(model: SampleModel): string {
  const lines = [`interface ${model.name} {`];
  for (const f of model.fields) {
    const tsType = {
      string: "string", text: "string", number: "number", boolean: "boolean",
      date: "Date", email: "string", url: "string", json: "Record<string, unknown>",
      relation: f.relationModel || "unknown", enum: f.enumValues ? f.enumValues.map(v => `"${v}"`).join(" | ") : "string",
      computed: "unknown",
    }[f.type];
    lines.push(`  ${f.name}${f.required ? "" : "?"}: ${tsType};`);
  }
  if (model.timestamps) {
    lines.push("  createdAt: Date;");
    lines.push("  updatedAt: Date;");
  }
  if (model.softDelete) {
    lines.push("  deletedAt?: Date | null;");
  }
  lines.push("}");
  return lines.join("\n");
}

export default function SchemaPage() {
  const [activeModel, setActiveModel] = useState(sampleModels[0]);
  const [viewMode, setViewMode] = useState<"ui" | "code">("ui");
  const [aiPrompt, setAiPrompt] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Schema Builder</h1>
          <p className="text-sm text-neutral-400">Model ve field tanımlarını yönetin</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "ui" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("ui")}
          >
            <Eye className="mr-2 h-3 w-3" />
            Visual
          </Button>
          <Button
            variant={viewMode === "code" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("code")}
          >
            <Code className="mr-2 h-3 w-3" />
            Code
          </Button>
          <Button size="sm">
            <Save className="mr-2 h-3 w-3" />
            Kaydet
          </Button>
        </div>
      </div>

      {/* AI Prompt Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Wand2 className="hidden sm:block h-5 w-5 text-indigo-400 shrink-0" />
            <Input
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder='AI: "Bir BlogPost modeli oluştur..."'
              className="flex-1 border-indigo-900/50 bg-indigo-950/30"
            />
            <Button size="sm" className="w-full sm:w-auto shrink-0">
              <Wand2 className="mr-2 h-3 w-3" />
              Oluştur
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Model List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Modeller</CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {sampleModels.map((model) => (
              <button
                key={model.id}
                onClick={() => setActiveModel(model)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  activeModel.id === model.id
                    ? "bg-indigo-600/10 text-indigo-400"
                    : "text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                <Database className="h-4 w-4" />
                <div className="flex-1">
                  <p className="font-medium">{model.name}</p>
                  <p className="text-xs text-neutral-500">{model.fields.length} fields</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Field Editor */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{activeModel.name}</CardTitle>
                <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                  <span>Tablo: <code className="rounded bg-neutral-800 px-1.5 py-0.5">{activeModel.tableName}</code></span>
                  {activeModel.timestamps && <Badge variant="secondary">timestamps</Badge>}
                  {activeModel.softDelete && <Badge variant="secondary">soft-delete</Badge>}
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-3 w-3" />
                Field Ekle
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === "ui" ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-800 text-left text-xs text-neutral-500">
                      <th className="w-8 pb-3"></th>
                      <th className="pb-3 font-medium">Field Name</th>
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium text-center">Required</th>
                      <th className="pb-3 font-medium text-center">Unique</th>
                      <th className="pb-3 font-medium text-center">Indexed</th>
                      <th className="pb-3 font-medium">Extra</th>
                      <th className="w-10 pb-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/50">
                    {activeModel.fields.map((field) => (
                      <tr key={field.id} className="group hover:bg-neutral-800/30">
                        <td className="py-3 pr-2">
                          <GripVertical className="h-4 w-4 cursor-grab text-neutral-700 group-hover:text-neutral-500" />
                        </td>
                        <td className="py-3">
                          <code className="font-mono text-sm text-neutral-200">{field.name}</code>
                        </td>
                        <td className="py-3">
                          <Badge variant="outline">{field.type}</Badge>
                        </td>
                        <td className="py-3 text-center">
                          {field.required ? (
                            <span className="text-emerald-400">&#10003;</span>
                          ) : (
                            <span className="text-neutral-600">-</span>
                          )}
                        </td>
                        <td className="py-3 text-center">
                          {field.unique ? (
                            <span className="text-amber-400">&#10003;</span>
                          ) : (
                            <span className="text-neutral-600">-</span>
                          )}
                        </td>
                        <td className="py-3 text-center">
                          {field.indexed ? (
                            <span className="text-indigo-400">&#10003;</span>
                          ) : (
                            <span className="text-neutral-600">-</span>
                          )}
                        </td>
                        <td className="py-3">
                          {field.enumValues && (
                            <span className="text-xs text-neutral-500">
                              [{field.enumValues.join(", ")}]
                            </span>
                          )}
                          {field.relationModel && (
                            <span className="text-xs text-indigo-400">
                              → {field.relationModel}
                            </span>
                          )}
                        </td>
                        <td className="py-3">
                          <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                            <Trash2 className="h-3 w-3 text-red-400" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-lg bg-neutral-950 p-4">
                <pre className="font-mono text-sm text-neutral-300">
                  <code>{generateTypeScript(activeModel)}</code>
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Atonota S2 — Visual Schema Designer katmanı */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-neutral-100">Visual Schema Designer</p>
          <span className="rounded-full bg-neutral-700 px-2 py-0.5 text-[10px] text-neutral-300">Draft</span>
          <span className="ml-auto flex gap-1.5">
            <span className="rounded-md border border-neutral-700 px-2.5 py-1 text-xs text-neutral-300">Taslak kaydet</span>
            <span className="rounded-md border border-neutral-700 px-2.5 py-1 text-xs text-neutral-300">Geri al</span>
            <span className="rounded-md bg-indigo-600 px-2.5 py-1 text-xs text-white">Request Approval</span>
          </span>
        </div>
        <p className="mt-2 text-[11px] uppercase tracking-wider text-neutral-500">Araç kutusu — veri tipi draggable'ları</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {["String","Integer","Decimal","DateTime","JSON","Boolean","Enum","Advanced Link (FK)","Child Table","Attach"].map((t) => (
            <span key={t} className="cursor-grab rounded-full border border-neutral-700 px-2.5 py-1 font-mono text-[11px] text-neutral-300">{t}</span>
          ))}
        </div>
        <p className="mt-2 text-xs text-neutral-500">Tablo kartlarında ◆ = primary key, ⌁ = index. Model anında yansımaz — onay kapısından geçer (şelale).</p>
        <p className="mt-1 text-xs text-indigo-300">AI şema üretici: tuval köşesinden &quot;e-ticaret sepet sistemi şeması oluştur&quot; — diff olarak gelir.</p>
      </div>

      <CliEquivalent tool="schema.read" args={{ app: "marketplace" }} />

    </div>
  );
}
