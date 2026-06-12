"use client";

import { CliEquivalent } from "@/components/cli-equivalent";

import { useState } from "react";
import {
  Puzzle,
  Plus,
  Settings,
  Power,
  PowerOff,
  Search,
  Box,
  Shield,
  Image,
  Globe,
  ShoppingCart,
  Mail,
  BarChart3,
  FileText,
  Wand2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const iconMap: Record<string, React.ElementType> = {
  Box, Shield, Image, Globe, ShoppingCart, Mail, BarChart3, FileText,
};

interface ModuleItem {
  id: string;
  name: string;
  slug: string;
  version: string;
  description: string;
  enabled: boolean;
  dependencies: string[];
  icon: string;
  category: string;
}

const allModules: ModuleItem[] = [
  { id: "core", name: "Core", slug: "core", version: "1.0.0", description: "Temel sistem fonksiyonları ve lifecycle yönetimi", enabled: true, dependencies: [], icon: "Box", category: "System" },
  { id: "auth", name: "Authentication", slug: "auth", version: "2.1.0", description: "JWT, OAuth, RBAC tabanlı kimlik doğrulama ve yetkilendirme", enabled: true, dependencies: ["core"], icon: "Shield", category: "System" },
  { id: "media", name: "Media Manager", slug: "media", version: "1.3.0", description: "Dosya upload, image processing, CDN entegrasyonu", enabled: true, dependencies: ["core"], icon: "Image", category: "Content" },
  { id: "api", name: "API Gateway", slug: "api", version: "1.0.0", description: "REST & GraphQL auto-generation, rate limiting, versioning", enabled: true, dependencies: ["core", "auth"], icon: "Globe", category: "Infrastructure" },
  { id: "ecommerce", name: "E-Commerce", slug: "ecommerce", version: "0.9.0", description: "Ürün, sipariş, sepet ve ödeme yönetimi", enabled: false, dependencies: ["core", "auth", "media"], icon: "ShoppingCart", category: "Business" },
  { id: "notifications", name: "Notifications", slug: "notifications", version: "1.0.0", description: "Email, SMS, push notification ve in-app bildirimler", enabled: false, dependencies: ["core"], icon: "Mail", category: "Communication" },
  { id: "analytics", name: "Analytics", slug: "analytics", version: "0.5.0", description: "Event tracking, dashboard metrikleri, custom raporlama", enabled: false, dependencies: ["core", "auth"], icon: "BarChart3", category: "Intelligence" },
  { id: "cms", name: "CMS", slug: "cms", version: "1.2.0", description: "İçerik yönetimi, sayfa builder, SEO araçları", enabled: false, dependencies: ["core", "auth", "media"], icon: "FileText", category: "Content" },
];

export default function ModulesPage() {
  const [modules, setModules] = useState(allModules);
  const [filter, setFilter] = useState<"all" | "enabled" | "disabled">("all");
  const [search, setSearch] = useState("");

  const filtered = modules.filter((m) => {
    if (filter === "enabled" && !m.enabled) return false;
    if (filter === "disabled" && m.enabled) return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleModule = (id: string) => {
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  };

  const enabledCount = modules.filter((m) => m.enabled).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Modules</h1>
          <p className="text-sm text-neutral-400">
            {enabledCount} / {modules.length} modül aktif
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Wand2 className="mr-2 h-3 w-3" />
            AI ile Scaffold
          </Button>
          <Button size="sm" className="flex-1 sm:flex-none">
            <Plus className="mr-2 h-3 w-3" />
            Yeni Modül
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <Input
            placeholder="Modül ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex rounded-lg border border-neutral-800 p-0.5">
          {(["all", "enabled", "disabled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-neutral-800 text-neutral-100"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              {f === "all" ? "Tümü" : f === "enabled" ? "Aktif" : "Pasif"}
            </button>
          ))}
        </div>
      </div>

      {/* Module Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((mod) => {
          const Icon = iconMap[mod.icon] || Box;
          return (
            <Card
              key={mod.id}
              className={`transition-colors ${
                mod.enabled ? "border-neutral-800" : "border-neutral-800/50 opacity-60"
              }`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        mod.enabled
                          ? "bg-indigo-600/10 text-indigo-400"
                          : "bg-neutral-800 text-neutral-500"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-100">{mod.name}</h3>
                      <p className="text-xs text-neutral-500">v{mod.version}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => toggleModule(mod.id)}
                    disabled={mod.id === "core"}
                  >
                    {mod.enabled ? (
                      <Power className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <PowerOff className="h-4 w-4 text-neutral-500" />
                    )}
                  </Button>
                </div>

                <p className="mt-3 text-sm text-neutral-400">{mod.description}</p>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {mod.dependencies.map((dep) => (
                      <Badge key={dep} variant="secondary" className="text-[10px]">
                        {dep}
                      </Badge>
                    ))}
                    {mod.dependencies.length === 0 && (
                      <Badge variant="outline" className="text-[10px]">no deps</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-[10px]">{mod.category}</Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {/* Atonota S16 — Blueprint & Scaffold */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 text-xs">
        <p className="text-sm font-medium text-neutral-100">Blueprint&apos;ler — şablondan üret</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {[["crm-starter","Party, Deal, Pipeline","v2.1"],["hrms-core","Employee, Leave, Payroll","v1.4"],["commerce-base","Product, Order, Cart","v3.0"]].map(([n,c,v]) => (
            <div key={n as string} className="rounded-lg border border-neutral-800 p-2.5">
              <p className="flex items-center gap-1.5 font-mono text-neutral-200">{n}<span className="ml-auto rounded border border-neutral-700 px-1.5 text-[10px] text-neutral-400">{v}</span></p>
              <p className="mt-1 text-neutral-500">{c}</p>
              <p className="mt-1.5 text-indigo-300">scaffold: test dosyası İLK üretilir →</p>
            </div>
          ))}
        </div>
      </div>

      <CliEquivalent tool="module.list" args={{ app: "marketplace" }} />

    </div>
  );
}
