"use client";

import { CliEquivalent } from "@/components/cli-equivalent";

import { useState } from "react";
import {
  Layers,
  Plus,
  GripVertical,
  Trash2,
  Settings,
  Eye,
  Code,
  Wand2,
  Type,
  Hash,
  Calendar,
  ToggleLeft,
  Mail,
  AlignLeft,
  List,
  Link2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const fieldIcons: Record<string, React.ElementType> = {
  text: Type,
  number: Hash,
  date: Calendar,
  toggle: ToggleLeft,
  email: Mail,
  textarea: AlignLeft,
  select: List,
  url: Link2,
};

interface FormField {
  id: string;
  type: string;
  label: string;
  name: string;
  required: boolean;
  placeholder?: string;
  options?: string[];
  width: "full" | "half";
}

const sampleForms = [
  { id: "contact", name: "İletişim Formu", fields: 5, status: "active" },
  { id: "register", name: "Kayıt Formu", fields: 8, status: "active" },
  { id: "feedback", name: "Geri Bildirim", fields: 4, status: "draft" },
  { id: "order", name: "Sipariş Formu", fields: 12, status: "active" },
];

const initialFields: FormField[] = [
  { id: "1", type: "text", label: "Ad Soyad", name: "full_name", required: true, placeholder: "Adınız ve soyadınız", width: "full" },
  { id: "2", type: "email", label: "E-posta", name: "email", required: true, placeholder: "ornek@email.com", width: "half" },
  { id: "3", type: "text", label: "Telefon", name: "phone", required: false, placeholder: "+90", width: "half" },
  { id: "4", type: "select", label: "Konu", name: "subject", required: true, options: ["Genel", "Destek", "Satış", "Diğer"], width: "full" },
  { id: "5", type: "textarea", label: "Mesaj", name: "message", required: true, placeholder: "Mesajınızı yazın...", width: "full" },
];

function generateFormSchema(fields: FormField[]): string {
  const lines = [
    'import { z } from "zod";',
    "",
    "const formSchema = z.object({",
  ];
  for (const f of fields) {
    let validator = "z.string()";
    if (f.type === "number") validator = "z.number()";
    if (f.type === "email") validator = "z.string().email()";
    if (f.type === "date") validator = "z.date()";
    if (f.type === "toggle") validator = "z.boolean()";
    if (f.type === "url") validator = "z.string().url()";
    if (f.type === "select" && f.options) {
      validator = `z.enum([${f.options.map((o) => `"${o}"`).join(", ")}])`;
    }
    if (!f.required && f.type !== "toggle") validator += ".optional()";
    lines.push(`  ${f.name}: ${validator},`);
  }
  lines.push("});");
  return lines.join("\n");
}

export default function FormsPage() {
  const [fields, setFields] = useState(initialFields);
  const [activeForm, setActiveForm] = useState("contact");
  const [viewMode, setViewMode] = useState<"builder" | "preview" | "code">("builder");

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Custom Forms</h1>
          <p className="text-sm text-neutral-400">Form builder ve validation schema yönetimi</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-neutral-800 p-0.5">
            {(["builder", "preview", "code"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors sm:px-3 ${
                  viewMode === m ? "bg-neutral-800 text-white" : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                {m === "builder" && <Layers className="h-3 w-3" />}
                {m === "preview" && <Eye className="h-3 w-3" />}
                {m === "code" && <Code className="h-3 w-3" />}
                <span className="hidden sm:inline">{m === "builder" ? "Builder" : m === "preview" ? "Preview" : "Schema"}</span>
              </button>
            ))}
          </div>
          <Button size="sm">
            <Plus className="mr-2 h-3 w-3" />
            Yeni Form
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Form List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Formlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {sampleForms.map((form) => (
              <button
                key={form.id}
                onClick={() => setActiveForm(form.id)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  activeForm === form.id
                    ? "bg-indigo-600/10 text-indigo-400"
                    : "text-neutral-300 hover:bg-neutral-800"
                }`}
              >
                <div>
                  <p className="font-medium">{form.name}</p>
                  <p className="text-xs text-neutral-500">{form.fields} fields</p>
                </div>
                <Badge variant={form.status === "active" ? "success" : "secondary"} className="text-[10px]">
                  {form.status}
                </Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Form Editor */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>İletişim Formu</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs">
                  <Wand2 className="mr-1 h-3 w-3" />
                  AI Field
                </Button>
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none text-xs">
                  <Plus className="mr-1 h-3 w-3" />
                  Field Ekle
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {viewMode === "builder" && (
              <div className="space-y-2">
                {fields.map((field) => {
                  const Icon = fieldIcons[field.type] || Type;
                  return (
                    <div
                      key={field.id}
                      className="group flex items-center gap-3 rounded-lg border border-neutral-800 p-3 hover:border-neutral-700"
                    >
                      <GripVertical className="h-4 w-4 cursor-grab text-neutral-700 group-hover:text-neutral-500" />
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-neutral-800">
                        <Icon className="h-4 w-4 text-neutral-400" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-neutral-200">{field.label}</span>
                          <code className="text-[10px] text-neutral-500 font-mono">{field.name}</code>
                          {field.required && (
                            <Badge variant="destructive" className="text-[10px]">required</Badge>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500">
                          {field.type} {field.width === "half" ? "• 50% width" : "• full width"}
                          {field.placeholder && ` • "${field.placeholder}"`}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px]">{field.type}</Badge>
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100">
                        <Settings className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100"
                        onClick={() => removeField(field.id)}
                      >
                        <Trash2 className="h-3 w-3 text-red-400" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            {viewMode === "preview" && (
              <div className="mx-auto max-w-lg space-y-4 rounded-lg border border-neutral-800 bg-neutral-950 p-6">
                <h3 className="text-lg font-semibold">İletişim Formu</h3>
                <div className="grid grid-cols-2 gap-4">
                  {fields.map((field) => (
                    <div key={field.id} className={field.width === "full" ? "col-span-2" : "col-span-1"}>
                      <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                        {field.label}
                        {field.required && <span className="ml-1 text-red-400">*</span>}
                      </label>
                      {field.type === "textarea" ? (
                        <textarea
                          placeholder={field.placeholder}
                          className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500"
                          rows={3}
                        />
                      ) : field.type === "select" ? (
                        <select className="w-full rounded-md border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-200">
                          <option value="">Seçin...</option>
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <Input type={field.type} placeholder={field.placeholder} />
                      )}
                    </div>
                  ))}
                </div>
                <Button className="w-full">Gönder</Button>
              </div>
            )}

            {viewMode === "code" && (
              <pre className="rounded-lg bg-neutral-950 p-4 text-xs font-mono text-neutral-300 overflow-auto">
                <code>{generateFormSchema(fields)}</code>
              </pre>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Atonota S3 — metadata-güdümlü form katmanı */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
        <p className="text-sm font-medium text-neutral-100">Smart Form Controller</p>
        <p className="mt-1 text-xs text-neutral-400">Yalnız model adını alır; alanları metadata&apos;dan dinamik üretir — form koda dökülmez, layout metadatası olarak saklanır.</p>
        <p className="mt-3 text-[11px] uppercase tracking-wider text-neutral-500">Advanced Link Combobox (FK — debounced arama)</p>
        <input readOnly value="party: &quot;Ayşe Yıl…&quot; (312 eşleşme, 18ms)" className="mt-1 w-full max-w-sm rounded-md border border-neutral-800 bg-neutral-950 px-3 py-1.5 font-mono text-xs text-neutral-300" />
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-neutral-500">viewport önizleme:</span>
          {["mobil 390px","tablet 834px","masaüstü 1440px"].map((v) => (
            <span key={v} className="rounded-md border border-neutral-700 px-2 py-1 text-neutral-300">{v}</span>
          ))}
          <span className="ml-auto rounded-full border border-emerald-500/40 px-2 py-0.5 text-emerald-400">a11y: AA ✓ · odak halkaları ✓</span>
        </div>
      </div>

      <CliEquivalent tool="form.read" args={{ app: "marketplace" }} />

    </div>
  );
}
