"use client";

import { CliEquivalent } from "@/components/cli-equivalent";

import { Activity, Database, Puzzle, Palette, FileCode, Shield, GitBranch } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const activities = [
  { icon: Database, action: "Model güncellendi", target: "Customer", user: "admin", time: "5 dk önce", type: "schema" },
  { icon: Puzzle, action: "Modül etkinleştirildi", target: "E-Commerce v0.9.0", user: "admin", time: "1 saat önce", type: "module" },
  { icon: GitBranch, action: "Migration çalıştırıldı", target: "003_add_orders.sql", user: "system", time: "2 saat önce", type: "migration" },
  { icon: FileCode, action: "API endpoint oluşturuldu", target: "POST /api/products", user: "admin", time: "3 saat önce", type: "api" },
  { icon: Palette, action: "Tema renkleri değiştirildi", target: "Primary: #6366F1 → #4F46E5", user: "admin", time: "5 saat önce", type: "theme" },
  { icon: Shield, action: "Yetki eklendi", target: "editor → products.write", user: "admin", time: "1 gün önce", type: "auth" },
  { icon: Database, action: "Model oluşturuldu", target: "Order", user: "ai-copilot", time: "1 gün önce", type: "schema" },
  { icon: Database, action: "Model oluşturuldu", target: "OrderItem", user: "ai-copilot", time: "1 gün önce", type: "schema" },
  { icon: GitBranch, action: "Migration çalıştırıldı", target: "002_create_products.sql", user: "system", time: "2 gün önce", type: "migration" },
  { icon: Puzzle, action: "Modül yüklendi", target: "Media Manager v1.3.0", user: "admin", time: "3 gün önce", type: "module" },
];

const typeColors: Record<string, string> = {
  schema: "bg-indigo-600/10 text-indigo-400",
  module: "bg-emerald-600/10 text-emerald-400",
  migration: "bg-amber-600/10 text-amber-400",
  api: "bg-blue-600/10 text-blue-400",
  theme: "bg-purple-600/10 text-purple-400",
  auth: "bg-red-600/10 text-red-400",
};

export default function ActivityPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Activity Log</h1>
        <p className="text-sm text-neutral-400">Tüm sistem aktiviteleri ve değişiklik geçmişi</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-neutral-800">
            {activities.map((item, i) => (
              <div key={i} className="flex flex-col gap-2 px-4 py-3 hover:bg-neutral-800/30 transition-colors sm:flex-row sm:items-center sm:gap-4 sm:px-6 sm:py-4">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${typeColors[item.type]}`}>
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium text-neutral-200">{item.action}</span>
                    <span className="text-neutral-500"> — </span>
                    <span className="text-neutral-300">{item.target}</span>
                  </p>
                  <p className="text-xs text-neutral-500">
                    by <span className={item.user === "ai-copilot" ? "text-indigo-400" : "text-neutral-400"}>{item.user}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:shrink-0">
                  <Badge variant="outline" className="text-[10px]">{item.type}</Badge>
                  <span className="text-xs text-neutral-500">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <CliEquivalent tool="audit.tail" args={{ app: "marketplace" }} />

    </div>
  );
}
