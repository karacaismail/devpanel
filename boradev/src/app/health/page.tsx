"use client";

import { CliEquivalent } from "@/components/cli-equivalent";

import { useState, useEffect } from "react";
import { Activity, Cpu, HardDrive, MemoryStick, Wifi, Database, Clock, Server, RefreshCw, Zap, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Metric {
  label: string;
  value: number;
  max: number;
  unit: string;
  icon: React.ElementType;
  color: string;
  status: "healthy" | "warning" | "critical";
}

const metrics: Metric[] = [
  { label: "CPU Kullanımı", value: 23, max: 100, unit: "%", icon: Cpu, color: "text-blue-400", status: "healthy" },
  { label: "RAM Kullanımı", value: 4.2, max: 8, unit: "GB", icon: MemoryStick, color: "text-purple-400", status: "healthy" },
  { label: "Disk Kullanımı", value: 45, max: 100, unit: "GB", icon: HardDrive, color: "text-amber-400", status: "healthy" },
  { label: "Network I/O", value: 12.5, max: 100, unit: "MB/s", icon: Wifi, color: "text-cyan-400", status: "healthy" },
];

const services = [
  { name: "Next.js Server", status: "running", uptime: "5 gün 12 saat", port: 3000, response: "2ms" },
  { name: "PostgreSQL", status: "running", uptime: "12 gün 3 saat", port: 5432, response: "1ms" },
  { name: "Redis", status: "running", uptime: "12 gün 3 saat", port: 6379, response: "<1ms" },
  { name: "Background Worker", status: "running", uptime: "5 gün 12 saat", port: null, response: "—" },
  { name: "Webhook Dispatcher", status: "running", uptime: "5 gün 12 saat", port: null, response: "—" },
  { name: "SMTP Server", status: "stopped", uptime: "—", port: 587, response: "—" },
];

const dbStats = [
  { label: "Active Connections", value: "8 / 100" },
  { label: "Queries / sec", value: "142" },
  { label: "Avg Query Time", value: "2.3ms" },
  { label: "DB Size", value: "256 MB" },
  { label: "Table Count", value: "24" },
  { label: "Cache Hit Ratio", value: "98.5%" },
];

const responseHistory = [65, 42, 78, 35, 52, 45, 38, 55, 42, 68, 45, 32, 48, 52, 38, 42, 55, 35, 42, 48];
const maxResponse = Math.max(...responseHistory);

export default function HealthPage() {
  const [uptimeSeconds, setUptimeSeconds] = useState(475200);

  useEffect(() => {
    const interval = setInterval(() => setUptimeSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (s: number) => {
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${d}g ${h}s ${m}d ${sec}sn`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Health</h1>
          <p className="text-sm text-neutral-400">Sistem durumu ve performans metrikleri</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-emerald-800/30 bg-emerald-950/20 px-3 py-1.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">All Systems Operational</span>
          </div>
          <Button variant="outline" size="sm"><RefreshCw className="mr-2 h-3 w-3" />Yenile</Button>
        </div>
      </div>

      {/* Uptime Banner */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-600/10">
                <Zap className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-200">Uptime</p>
                <p className="text-xs text-neutral-500 font-mono">{formatUptime(uptimeSeconds)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="text-left sm:text-right">
                <p className="text-xs text-neutral-500">Availability (30d)</p>
                <p className="text-lg font-bold text-emerald-400">99.97%</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-neutral-500">Avg Response</p>
                <p className="text-lg font-bold text-neutral-200">45ms</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-xs text-neutral-500">Requests (24h)</p>
                <p className="text-lg font-bold text-neutral-200">12.4K</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {metrics.map((m) => {
          const percent = (m.value / m.max) * 100;
          return (
            <Card key={m.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <m.icon className={cn("h-5 w-5", m.color)} />
                  <Badge variant={m.status === "healthy" ? "success" : m.status === "warning" ? "warning" : "destructive"} className="text-[9px]">
                    {m.status}
                  </Badge>
                </div>
                <p className="mt-3 text-2xl font-bold">{m.value}<span className="text-sm text-neutral-500 ml-0.5">{m.unit}</span></p>
                <p className="text-[10px] text-neutral-500">{m.label}</p>
                <div className="mt-2 h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", percent > 80 ? "bg-red-500" : percent > 60 ? "bg-amber-500" : "bg-emerald-500")}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Response Time Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-400" />
              Response Time (son 20 req)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-1 h-32">
              {responseHistory.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <div
                    className={cn("w-full rounded-t transition-all", v > 60 ? "bg-amber-500" : "bg-indigo-500")}
                    style={{ height: `${(v / maxResponse) * 100}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[9px] text-neutral-600">
              <span>20 req önce</span>
              <span>şimdi</span>
            </div>
          </CardContent>
        </Card>

        {/* Database Stats */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-400" />
              Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {dbStats.map((s) => (
                <div key={s.label} className="rounded-lg bg-neutral-800/30 p-2.5">
                  <p className="text-[10px] text-neutral-500">{s.label}</p>
                  <p className="mt-0.5 text-sm font-semibold text-neutral-200">{s.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Services */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Server className="h-4 w-4 text-blue-400" />
            Services
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
            {services.map((svc) => (
              <div key={svc.name} className="flex items-center gap-3 rounded-lg border border-neutral-800 p-3">
                <div className={cn("h-2.5 w-2.5 rounded-full", svc.status === "running" ? "bg-emerald-500" : "bg-red-500")} />
                <div className="flex-1">
                  <p className="text-xs font-medium text-neutral-200">{svc.name}</p>
                  <p className="text-[10px] text-neutral-500">
                    {svc.port && `Port ${svc.port} · `}{svc.uptime}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant={svc.status === "running" ? "success" : "destructive"} className="text-[9px]">{svc.status}</Badge>
                  {svc.response !== "—" && <p className="mt-0.5 text-[9px] text-neutral-600">{svc.response}</p>}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Atonota S7 — uptime monitörleri */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 text-xs">
        <p className="text-sm font-medium text-neutral-100">Uptime monitörleri</p>
        <div className="mt-2 space-y-1.5">
          {[["panel.acme.example /healthz","30sn","%99.98",true],["api GraphQL ping","60sn","%99.99",true],["webhook dispatcher","120sn","%99.2",true],["staging smoke","300sn","—",false]].map(([n,i,u,on]) => (
            <label key={n as string} className="flex items-center gap-2 rounded-lg border border-neutral-800 px-3 py-1.5">
              <input type="checkbox" defaultChecked={on as boolean} className="accent-indigo-500" />
              <code className="font-mono text-neutral-200">{n}</code>
              <span className="text-neutral-500">aralık {i}</span>
              <span className="ml-auto text-emerald-400">{u}</span>
            </label>
          ))}
        </div>
        <p className="mt-2 text-neutral-500">Incident banner alanı: aktif olay yok — eşik aşımında üst bantta görünür.</p>
      </div>

      <CliEquivalent tool="health.check" args={{ app: "marketplace" }} />

    </div>
  );
}
