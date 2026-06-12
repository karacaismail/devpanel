"use client";

import { CliEquivalent } from "@/components/cli-equivalent";

import { useState } from "react";
import { Clock, Plus, Play, Pause, Trash2, RefreshCw, CheckCircle, XCircle, AlertTriangle, Wand2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CronJob {
  id: string;
  name: string;
  cron: string;
  description: string;
  handler: string;
  enabled: boolean;
  lastRun: string;
  lastStatus: "success" | "failed" | "running";
  nextRun: string;
  avgDuration: string;
}

const jobs: CronJob[] = [
  { id: "1", name: "Database Backup", cron: "0 2 * * *", description: "Günlük veritabanı yedeği", handler: "jobs/backup.ts", enabled: true, lastRun: "02:00 bugün", lastStatus: "success", nextRun: "02:00 yarın", avgDuration: "45s" },
  { id: "2", name: "Cache Cleanup", cron: "*/30 * * * *", description: "Süresi dolmuş cache temizleme", handler: "jobs/cache-cleanup.ts", enabled: true, lastRun: "10 dk önce", lastStatus: "success", nextRun: "20 dk sonra", avgDuration: "3s" },
  { id: "3", name: "Email Queue", cron: "*/5 * * * *", description: "Bekleyen e-postaları gönder", handler: "jobs/email-queue.ts", enabled: true, lastRun: "3 dk önce", lastStatus: "success", nextRun: "2 dk sonra", avgDuration: "8s" },
  { id: "4", name: "Report Generator", cron: "0 8 * * 1", description: "Haftalık rapor oluşturma", handler: "jobs/weekly-report.ts", enabled: true, lastRun: "Pazartesi 08:00", lastStatus: "success", nextRun: "Pazartesi 08:00", avgDuration: "2m 15s" },
  { id: "5", name: "Sitemap Generator", cron: "0 4 * * *", description: "Sitemap XML güncelleme", handler: "jobs/sitemap.ts", enabled: false, lastRun: "3 gün önce", lastStatus: "failed", nextRun: "—", avgDuration: "12s" },
  { id: "6", name: "Analytics Sync", cron: "0 */6 * * *", description: "Analitik verilerini senkronize et", handler: "jobs/analytics-sync.ts", enabled: true, lastRun: "4 saat önce", lastStatus: "success", nextRun: "2 saat sonra", avgDuration: "1m 30s" },
  { id: "7", name: "Token Cleanup", cron: "0 3 * * *", description: "Süresi dolmuş auth token temizleme", handler: "jobs/token-cleanup.ts", enabled: true, lastRun: "03:00 bugün", lastStatus: "success", nextRun: "03:00 yarın", avgDuration: "1s" },
];

const statusConfig = {
  success: { icon: CheckCircle, color: "text-emerald-400", badge: "success" as const },
  failed: { icon: XCircle, color: "text-red-400", badge: "destructive" as const },
  running: { icon: RefreshCw, color: "text-blue-400 animate-spin", badge: "default" as const },
};

function cronToHuman(cron: string): string {
  const parts = cron.split(" ");
  if (parts[0] === "0" && parts[1] !== "*") return `Her gün saat ${parts[1]}:00`;
  if (parts[0]?.startsWith("*/")) return `Her ${parts[0].replace("*/", "")} dakikada`;
  if (parts[4] === "1") return `Her Pazartesi saat ${parts[1]}:00`;
  if (parts[1]?.startsWith("*/")) return `Her ${parts[1].replace("*/", "")} saatte`;
  return cron;
}

export default function SchedulerPage() {
  const [jobList, setJobList] = useState(jobs);

  const toggleJob = (id: string) => {
    setJobList((prev) => prev.map((j) => j.id === id ? { ...j, enabled: !j.enabled } : j));
  };

  const activeCount = jobList.filter((j) => j.enabled).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Scheduled Jobs</h1>
          <p className="text-sm text-neutral-400">{activeCount} / {jobList.length} job aktif</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none"><Wand2 className="mr-2 h-3 w-3" />AI ile Oluştur</Button>
          <Button size="sm" className="flex-1 sm:flex-none"><Plus className="mr-2 h-3 w-3" />Yeni Job</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {jobList.map((job) => {
          const status = statusConfig[job.lastStatus];
          const StatusIcon = status.icon;
          return (
            <Card key={job.id} className={cn("transition-opacity", !job.enabled && "opacity-50")}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", job.enabled ? "bg-indigo-600/10" : "bg-neutral-800")}>
                      <Clock className={cn("h-5 w-5", job.enabled ? "text-indigo-400" : "text-neutral-500")} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-100">{job.name}</h3>
                      <code className="text-[10px] text-neutral-500 font-mono">{job.cron}</code>
                    </div>
                  </div>
                  <button onClick={() => toggleJob(job.id)} className="rounded-lg p-1.5 hover:bg-neutral-800 transition-colors">
                    {job.enabled ? <Pause className="h-4 w-4 text-neutral-400" /> : <Play className="h-4 w-4 text-neutral-500" />}
                  </button>
                </div>

                <p className="mt-2 text-xs text-neutral-400">{job.description}</p>
                <code className="mt-1 block text-[10px] text-neutral-600 font-mono">{job.handler}</code>

                <div className="mt-3 flex items-center justify-between text-[10px]">
                  <span className="text-neutral-500">{cronToHuman(job.cron)}</span>
                  <Badge variant={status.badge} className="text-[9px] gap-1">
                    <StatusIcon className={cn("h-2.5 w-2.5", status.color)} />
                    {job.lastStatus}
                  </Badge>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 border-t border-neutral-800 pt-3">
                  <div>
                    <p className="text-[9px] text-neutral-600">Son çalışma</p>
                    <p className="text-[10px] text-neutral-400">{job.lastRun}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-neutral-600">Sonraki</p>
                    <p className="text-[10px] text-neutral-400">{job.nextRun}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-neutral-600">Ort. süre</p>
                    <p className="text-[10px] text-neutral-400">{job.avgDuration}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <CliEquivalent tool="job.list" args={{ app: "marketplace" }} />

    </div>
  );
}
