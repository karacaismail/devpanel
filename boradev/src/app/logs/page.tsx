"use client";

import { CliEquivalent } from "@/components/cli-equivalent";

import { useState } from "react";
import {
  AlertTriangle,
  XCircle,
  Info,
  Bug,
  RefreshCw,
  Search,
  Terminal,
  Clock,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Filter,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type LogLevel = "error" | "warning" | "info" | "debug";

interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  source: string;
  timestamp: string;
  stack?: string;
  count?: number;
}

const logs: LogEntry[] = [
  {
    id: "1",
    level: "error",
    message: "TypeError: Cannot read properties of undefined (reading 'map')",
    source: "api/products/route.ts:45",
    timestamp: "22:10:15",
    count: 3,
    stack: `TypeError: Cannot read properties of undefined (reading 'map')
    at getProducts (api/products/route.ts:45:18)
    at async GET (api/products/route.ts:12:20)
    at async NextRequest (node_modules/next/dist/server/web/adapter.js:34:7)`,
  },
  {
    id: "2",
    level: "error",
    message: "PrismaClientKnownRequestError: Unique constraint violation on field 'email'",
    source: "api/users/route.ts:28",
    timestamp: "22:08:42",
    count: 1,
    stack: `PrismaClientKnownRequestError: Unique constraint violation on field 'email'
    at createUser (api/users/route.ts:28:5)
    at async POST (api/users/route.ts:8:20)`,
  },
  {
    id: "3",
    level: "warning",
    message: "Deprecation: 'findMany' without 'take' limit. Consider adding pagination.",
    source: "modules/blog/service.ts:67",
    timestamp: "22:05:30",
    count: 12,
  },
  {
    id: "4",
    level: "warning",
    message: "Slow query detected: SELECT * FROM orders JOIN... (2340ms)",
    source: "database/query-logger.ts",
    timestamp: "22:02:18",
    count: 5,
  },
  {
    id: "5",
    level: "info",
    message: "Migration 004_add_blog_posts successfully applied",
    source: "database/migrator.ts",
    timestamp: "21:55:00",
  },
  {
    id: "6",
    level: "info",
    message: "Module 'E-Commerce' enabled successfully",
    source: "modules/loader.ts",
    timestamp: "21:50:12",
  },
  {
    id: "7",
    level: "debug",
    message: "Cache invalidated for key: products:list:page=1",
    source: "cache/redis.ts:34",
    timestamp: "21:48:05",
  },
  {
    id: "8",
    level: "info",
    message: "Webhook delivered: order.created → https://api.example.com/hooks (200 OK, 120ms)",
    source: "webhooks/dispatcher.ts",
    timestamp: "21:45:33",
  },
  {
    id: "9",
    level: "debug",
    message: "Auth token refreshed for user: admin@metapanel.dev",
    source: "auth/middleware.ts:12",
    timestamp: "21:40:00",
  },
  {
    id: "10",
    level: "warning",
    message: "Rate limit approaching: 85/100 requests in current window",
    source: "middleware/rate-limiter.ts",
    timestamp: "21:38:22",
    count: 2,
  },
];

const levelConfig: Record<LogLevel, { icon: React.ElementType; color: string; bg: string }> = {
  error: { icon: XCircle, color: "text-red-400", bg: "bg-red-600/10" },
  warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-600/10" },
  info: { icon: Info, color: "text-blue-400", bg: "bg-blue-600/10" },
  debug: { icon: Bug, color: "text-neutral-400", bg: "bg-neutral-600/10" },
};

const levelBadge: Record<LogLevel, "destructive" | "warning" | "default" | "secondary"> = {
  error: "destructive",
  warning: "warning",
  info: "default",
  debug: "secondary",
};

export default function LogsPage() {
  const [filter, setFilter] = useState<LogLevel | "all">("all");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = logs.filter((log) => {
    if (filter !== "all" && log.level !== filter) return false;
    if (search && !log.message.toLowerCase().includes(search.toLowerCase()) && !log.source.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    error: logs.filter((l) => l.level === "error").length,
    warning: logs.filter((l) => l.level === "warning").length,
    info: logs.filter((l) => l.level === "info").length,
    debug: logs.filter((l) => l.level === "debug").length,
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">System Logs</h1>
          <p className="text-sm text-neutral-400">Hata logları ve sistem konsolu</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Trash2 className="mr-2 h-3 w-3" />
            Temizle
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-3 w-3" />
            Yenile
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(["error", "warning", "info", "debug"] as const).map((level) => {
          const config = levelConfig[level];
          const Icon = config.icon;
          return (
            <button
              key={level}
              onClick={() => setFilter(filter === level ? "all" : level)}
              className={cn(
                "rounded-xl border p-3 text-left transition-all",
                filter === level
                  ? "border-indigo-600/50 bg-indigo-950/20"
                  : "border-neutral-800 bg-neutral-900 hover:border-neutral-700"
              )}
            >
              <div className="flex items-center gap-2">
                <Icon className={cn("h-4 w-4", config.color)} />
                <span className="text-lg font-bold text-neutral-100">{counts[level]}</span>
              </div>
              <p className="mt-0.5 text-[10px] uppercase tracking-wider text-neutral-500">{level}</p>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <Input placeholder="Log ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Badge variant="secondary" className="text-[10px]">{filtered.length} kayıt</Badge>
        <div className="ml-auto flex items-center gap-1.5 text-[10px] text-neutral-600">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </div>
      </div>

      {/* Log Entries */}
      <Card>
        <CardContent className="p-0 divide-y divide-neutral-800/50">
          {filtered.map((log) => {
            const config = levelConfig[log.level];
            const Icon = config.icon;
            const isExpanded = expandedId === log.id;

            return (
              <div key={log.id} className="hover:bg-neutral-800/20 transition-colors">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left"
                >
                  <div className={cn("mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md", config.bg)}>
                    <Icon className={cn("h-3.5 w-3.5", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant={levelBadge[log.level]} className="text-[9px]">{log.level}</Badge>
                      {log.count && log.count > 1 && (
                        <Badge variant="secondary" className="text-[9px]">x{log.count}</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs font-mono text-neutral-200 truncate">{log.message}</p>
                    <p className="mt-0.5 text-[10px] text-neutral-600">{log.source}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="flex items-center gap-1 text-[10px] text-neutral-600">
                      <Clock className="h-3 w-3" />
                      {log.timestamp}
                    </span>
                    {log.stack && (
                      isExpanded ? <ChevronDown className="h-3 w-3 text-neutral-600" /> : <ChevronRight className="h-3 w-3 text-neutral-600" />
                    )}
                  </div>
                </button>

                {/* Stack Trace */}
                {isExpanded && log.stack && (
                  <div className="mx-4 mb-3 rounded-lg bg-neutral-950 border border-neutral-800 overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-900 border-b border-neutral-800">
                      <span className="text-[10px] text-neutral-500 font-mono">Stack Trace</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCopy(log.stack!, log.id); }}
                        className="text-neutral-500 hover:text-neutral-300"
                      >
                        {copied === log.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      </button>
                    </div>
                    <pre className="p-3 text-[10px] font-mono text-red-300/80 overflow-x-auto whitespace-pre">
                      {log.stack}
                    </pre>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
      {/* Atonota S6 — drain/export + yavaş sorgu vitrini */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-neutral-100">Log drain / export</p>
          <span className="rounded-md border border-neutral-700 px-2 py-0.5 font-mono text-neutral-300">syslog://collector.internal:6514</span>
          <span className="rounded-full border border-emerald-500/40 px-2 py-0.5 text-emerald-400">aktif · 30g saklama</span>
          <span className="ml-auto rounded-md border border-neutral-700 px-2.5 py-1 text-neutral-300">NDJSON export</span>
        </div>
        <p className="mt-3 text-[11px] uppercase tracking-wider text-amber-400">Yavaş sorgu vitrini (&gt;1000ms)</p>
        <p className="mt-1 font-mono text-neutral-400"><span className="text-red-400">2340ms</span> [acme] SELECT * FROM orders JOIN … <span className="text-indigo-300">→ index önerisi q-8 taslakta</span></p>
        <p className="font-mono text-neutral-400"><span className="text-red-400">1410ms</span> [globex] SELECT count(*) FROM parties WHERE city… <span className="text-indigo-300">→ partial index önerisi</span></p>
      </div>

      <CliEquivalent tool="logs.tail" args={{ app: "marketplace" }} />

    </div>
  );
}
