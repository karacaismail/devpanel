"use client";

import { CliEquivalent } from "@/components/cli-equivalent";

import { useState } from "react";
import { BookOpen, Search, Wand2, Copy, Check, ChevronRight, FileText, Code, Database, Puzzle, Palette, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DocSection {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  pages: { title: string; description: string }[];
}

const sections: DocSection[] = [
  {
    id: "models", title: "Models", icon: Database, color: "text-indigo-400",
    pages: [
      { title: "User", description: "Kullanıcı modeli — id, name, email, role, metadata" },
      { title: "Product", description: "Ürün modeli — id, title, price, description, category" },
      { title: "Order", description: "Sipariş modeli — id, user_id, status, total" },
      { title: "OrderItem", description: "Sipariş kalemi — id, order_id, product_id, quantity, price" },
      { title: "Category", description: "Kategori modeli — id, name, slug, parent_id" },
      { title: "BlogPost", description: "Blog yazısı — id, title, content, author_id, slug" },
    ],
  },
  {
    id: "api", title: "API Endpoints", icon: Globe, color: "text-amber-400",
    pages: [
      { title: "GET /api/users", description: "Kullanıcı listesi — pagination, filtering, sorting" },
      { title: "POST /api/users", description: "Yeni kullanıcı oluştur — validation, unique email" },
      { title: "GET /api/products", description: "Ürün listesi — category filter, price range" },
      { title: "POST /api/orders", description: "Yeni sipariş oluştur — stock check, total calculation" },
    ],
  },
  {
    id: "modules", title: "Modules", icon: Puzzle, color: "text-emerald-400",
    pages: [
      { title: "Core", description: "Temel sistem fonksiyonları ve lifecycle hooks" },
      { title: "Authentication", description: "JWT, OAuth, RBAC kimlik doğrulama" },
      { title: "Media Manager", description: "Dosya upload, image processing" },
      { title: "API Gateway", description: "Rate limiting, versioning, auto-docs" },
    ],
  },
];

const generatedDoc = `# User Model

## Schema

| Field | Type | Required | Unique | Indexed |
|-------|------|----------|--------|---------|
| id | UUID | ✓ | ✓ | ✓ (PK) |
| name | VARCHAR(255) | ✓ | ✗ | ✓ |
| email | VARCHAR(255) | ✓ | ✓ | ✓ |
| role | ENUM(admin,editor,viewer) | ✓ | ✗ | ✓ |
| metadata | JSONB | ✗ | ✗ | ✗ |
| created_at | TIMESTAMP | ✓ | ✗ | ✗ |
| updated_at | TIMESTAMP | ✓ | ✗ | ✗ |

## API Endpoints

### List Users
\`\`\`
GET /api/users?page=1&limit=20&sort=created_at&filter[role]=admin
\`\`\`

### Create User
\`\`\`
POST /api/users
Content-Type: application/json

{
  "name": "Ahmet Yılmaz",
  "email": "ahmet@example.com",
  "role": "editor"
}
\`\`\`

### Response
\`\`\`json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Ahmet Yılmaz",
  "email": "ahmet@example.com",
  "role": "editor",
  "metadata": null,
  "createdAt": "2026-06-11T10:00:00.000Z",
  "updatedAt": "2026-06-11T10:00:00.000Z"
}
\`\`\`

## Validation Rules

- **name**: min 2, max 255 karakter
- **email**: geçerli email formatı, unique
- **role**: admin | editor | viewer (default: viewer)
- **metadata**: isteğe bağlı JSON objesi

## Relations

- \`Order.user_id\` → \`User.id\` (1:N)
- \`BlogPost.author_id\` → \`User.id\` (1:N)
`;

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("models");
  const [activePage, setActivePage] = useState("User");
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documentation</h1>
          <p className="text-sm text-neutral-400">Otomatik üretilmiş API ve model dokümantasyonu</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Wand2 className="mr-2 h-3 w-3" />
            Tümünü Regenerate Et
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <Card className="lg:col-span-1">
          <CardContent className="p-3">
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500" />
              <Input placeholder="Dokümantasyon ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 text-xs h-8" />
            </div>
            {sections.map((section) => (
              <div key={section.id} className="mb-3">
                <button
                  onClick={() => setActiveSection(section.id)}
                  className="flex w-full items-center gap-2 px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-500"
                >
                  <section.icon className={cn("h-3.5 w-3.5", section.color)} />
                  {section.title}
                  <Badge variant="secondary" className="ml-auto text-[8px]">{section.pages.length}</Badge>
                </button>
                <div className="mt-0.5 space-y-0.5">
                  {section.pages
                    .filter((p) => !search || p.title.toLowerCase().includes(search.toLowerCase()))
                    .map((page) => (
                    <button
                      key={page.title}
                      onClick={() => { setActiveSection(section.id); setActivePage(page.title); }}
                      className={cn(
                        "flex w-full items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] transition-colors",
                        activePage === page.title && activeSection === section.id
                          ? "bg-indigo-600/10 text-indigo-400"
                          : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200"
                      )}
                    >
                      <FileText className="h-3 w-3 shrink-0" />
                      <span className="truncate">{page.title}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Content */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">{activeSection}</Badge>
                <ChevronRight className="h-3 w-3 text-neutral-600" />
                <CardTitle>{activePage}</CardTitle>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="text-xs" onClick={() => { navigator.clipboard.writeText(generatedDoc); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>
                  {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
                  Copy MD
                </Button>
                <Button variant="outline" size="sm" className="text-xs"><Wand2 className="mr-1 h-3 w-3" />Regenerate</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert prose-sm max-w-none">
              {generatedDoc.split("\n").map((line, i) => {
                if (line.startsWith("# ")) return <h1 key={i} className="text-xl font-bold text-neutral-100 mt-0 mb-4">{line.slice(2)}</h1>;
                if (line.startsWith("## ")) return <h2 key={i} className="text-base font-semibold text-neutral-200 mt-6 mb-2 border-b border-neutral-800 pb-2">{line.slice(3)}</h2>;
                if (line.startsWith("### ")) return <h3 key={i} className="text-sm font-semibold text-neutral-300 mt-4 mb-1">{line.slice(4)}</h3>;
                if (line.startsWith("```")) {
                  return null;
                }
                if (line.startsWith("|")) {
                  const cells = line.split("|").filter(Boolean).map((c) => c.trim());
                  if (cells.every((c) => c.match(/^[-:]+$/))) return null;
                  return (
                    <div key={i} className="flex text-[10px] sm:text-[11px] font-mono border-b border-neutral-800/50 overflow-x-auto">
                      {cells.map((cell, j) => (
                        <span key={j} className={cn("flex-1 px-1.5 sm:px-2 py-1 whitespace-nowrap", j === 0 ? "text-neutral-200 font-medium" : "text-neutral-400")}>
                          {cell}
                        </span>
                      ))}
                    </div>
                  );
                }
                if (line.startsWith("- **")) {
                  const match = line.match(/- \*\*(.*?)\*\*: (.*)/);
                  if (match) return <p key={i} className="text-xs text-neutral-400 ml-2"><strong className="text-neutral-200">{match[1]}</strong>: {match[2]}</p>;
                }
                if (line.startsWith("- `")) {
                  return <p key={i} className="text-xs text-neutral-400 ml-2">{line.slice(2)}</p>;
                }
                if (line.trim() === "") return <div key={i} className="h-2" />;
                return <p key={i} className="text-xs text-neutral-400 leading-relaxed">{line}</p>;
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Atonota S14 — TechDocs/SOP/export */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-neutral-100">TechDocs</p>
          <select defaultValue="v1.8" className="rounded-md border border-neutral-800 bg-neutral-950 px-2 py-1 font-mono text-neutral-200">
            <option>v1.8</option><option>v1.7</option><option>v1.6</option>
          </select>
          <span className="ml-auto rounded-md border border-neutral-700 px-2.5 py-1 text-neutral-300">Export paketi indir (.zip)</span>
        </div>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <div className="rounded-lg border border-neutral-800 p-2.5"><p className="text-neutral-200">docs-as-code ağacı</p><p className="mt-0.5 font-mono text-neutral-500">mimari/ · adapter/ · api/ · runbook/ · onboarding/</p></div>
          <div className="rounded-lg border border-neutral-800 p-2.5"><p className="text-neutral-200">SOP</p><p className="mt-0.5 text-neutral-500">rollback prosedürü · incident müdahale · tenant taşıma · sır rotasyonu</p></div>
        </div>
        <p className="mt-2 text-indigo-300">AI dokümantasyon asistanı: ⌘K içinde &quot;?&quot; ile sor — yanıt kaynak atfıyla gelir.</p>
      </div>

      <CliEquivalent tool="docs.search" args={{ app: "marketplace" }} />

    </div>
  );
}
