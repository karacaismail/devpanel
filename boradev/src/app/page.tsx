"use client";

import { CliEquivalent } from "@/components/cli-equivalent";

import {
  Database,
  Puzzle,
  Palette,
  Terminal,
  Activity,
  ArrowRight,
  Zap,
  GitBranch,
  Server,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const stats = [
  { label: "Models", value: "12", icon: Database, change: "+2 bu hafta" },
  { label: "Modules", value: "8", icon: Puzzle, change: "3 aktif" },
  { label: "API Endpoints", value: "47", icon: Server, change: "Auto-generated" },
  { label: "Migrations", value: "23", icon: GitBranch, change: "Son: 2 saat önce" },
];

const quickActions = [
  { label: "Yeni Model Oluştur", href: "/schema", icon: Database, color: "bg-indigo-600/10 text-indigo-400" },
  { label: "Modül Ekle", href: "/modules", icon: Puzzle, color: "bg-emerald-600/10 text-emerald-400" },
  { label: "Tema Düzenle", href: "/theme", icon: Palette, color: "bg-purple-600/10 text-purple-400" },
  { label: "AI ile Oluştur", href: "/ai-copilot", icon: Terminal, color: "bg-amber-600/10 text-amber-400" },
];

const recentActivity = [
  { action: "Model güncellendi", target: "Customer", time: "5 dk önce", type: "update" as const },
  { action: "Modül etkinleştirildi", target: "E-Commerce", time: "1 saat önce", type: "success" as const },
  { action: "Migration çalıştırıldı", target: "003_add_orders", time: "2 saat önce", type: "info" as const },
  { action: "API endpoint oluşturuldu", target: "/api/products", time: "3 saat önce", type: "success" as const },
  { action: "Tema renkleri değiştirildi", target: "Brand Primary", time: "5 saat önce", type: "update" as const },
];

const activityBadge: Record<string, "success" | "warning" | "default"> = {
  update: "warning",
  success: "success",
  info: "default",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-100">Dashboard</h1>
          <p className="text-sm text-neutral-400">Proje durumu ve hızlı işlemler</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/ai-copilot">
            <Zap className="mr-2 h-4 w-4" />
            AI ile Başla
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-400">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                  <p className="mt-1 text-xs text-neutral-500">{stat.change}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600/10">
                  <stat.icon className="h-5 w-5 text-indigo-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Hızlı İşlemler</CardTitle>
            <CardDescription>Sık kullanılan işlemler</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-neutral-800"
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${action.color}`}>
                  <action.icon className="h-4 w-4" />
                </div>
                <span className="flex-1 text-sm font-medium text-neutral-200">{action.label}</span>
                <ArrowRight className="h-4 w-4 text-neutral-600" />
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Son Aktiviteler</CardTitle>
                <CardDescription>Sistemdeki son değişiklikler</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/activity">
                  <Activity className="mr-2 h-3 w-3" />
                  Tümü
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((item, i) => (
                <div
                  key={i}
                  className="flex flex-col gap-2 rounded-lg border border-neutral-800 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={activityBadge[item.type]}>
                      {item.action}
                    </Badge>
                    <span className="text-sm font-medium text-neutral-200">
                      {item.target}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-500">{item.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <CliEquivalent tool="panel.overview" args={{ app: "marketplace" }} />

    </div>
  );
}
