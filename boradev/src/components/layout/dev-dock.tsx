"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, TerminalSquare, ScrollText, ListTodo, Snail, Database as DbIcon, Braces } from "lucide-react";
import { cn } from "@/lib/utils";
import { useContextStore } from "@/stores/context-store";

/**
 * Atonota — Dev Workspace (alt bölge): durum çubuğu + gizlenebilir çekmece.
 * Sekmeler: Terminal · Canlı Loglar · Arka Plan İşleri.
 */

type Tab = "terminal" | "logs" | "jobs" | "python" | "dbshell";

/* K3 — yavaş sorgu monitörü (eşik: 1000ms) */
const SLOW_QUERIES = [
  { sql: "SELECT * FROM orders JOIN order_items ...", ms: 2340, tenant: "acme", hint: "order.placed_at index önerisi hazır" },
  { sql: "SELECT count(*) FROM parties WHERE city ...", ms: 1410, tenant: "globex", hint: "city low-cardinality — partial index" },
];

const LOGS = [
  ["14:02:11", "info", "GraphQL parties(filter) 18ms — RLS: tenant_id=acme"],
  ["14:02:09", "warn", "slow query: SELECT * FROM orders JOIN ... (2340ms) — index önerisi hazır"],
  ["14:02:04", "info", "outbox flush: 12 event yayınlandı (order.completed v2)"],
  ["14:01:58", "error", "DLQ +1: invoice.create v2 şema uyuşmazlığı (billing v1 tüketici)"],
  ["14:01:51", "info", "build #319 staging: testler yeşil (24/24)"],
] as const;

const JOBS = [
  { name: "migration q-7 (party)", pct: 72, state: "uygulanıyor" },
  { name: "nightly-retention", pct: 100, state: "tamamlandı 03:00" },
  { name: "outbox-sweeper", pct: 100, state: "5 dk'da bir · sağlıklı" },
  { name: "embedding reindex (docs)", pct: 31, state: "kuyrukta 2/7" },
];

export function DevDock() {
  const env = useContextStore((s) => s.env);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("logs");
  const [cmd, setCmd] = useState("");
  const [terminalLines, setTerminalLines] = useState<string[]>([
    "atonota dev workspace — güvenli konteyner oturumu (read-only demo)",
    "$ sdk check",
    "24 sözleşmeden 23 yeşil — listing-flow telafi eksiği kırmızı.",
  ]);

  const runCmd = () => {
    if (!cmd.trim()) return;
    setTerminalLines((prev) => [
      ...prev,
      `$ ${cmd}`,
      "yetki: read-only oturum — yazma komutları onay kapısına yönlendirilir.",
    ]);
    setCmd("");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:left-64">
      {open && (
        <div className="border-t border-neutral-800 bg-neutral-950/95 backdrop-blur">
          <div className="flex items-center gap-1 border-b border-neutral-800/70 px-3 pt-2">
            {(
              [
                ["terminal", "Terminal", TerminalSquare],
                ["logs", "Canlı Loglar", ScrollText],
                ["jobs", "Arka Plan İşleri", ListTodo],
                ["python", "Python Konsolu", Braces],
                ["dbshell", "DB Shell", DbIcon],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-t-lg px-3 py-1.5 text-xs",
                  tab === id ? "bg-neutral-900 text-indigo-300" : "text-neutral-500 hover:text-neutral-300"
                )}
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
          </div>

          <div className="h-48 overflow-auto bg-neutral-950 p-3 font-mono text-[11.5px] leading-relaxed">
            {tab === "terminal" && (
              <div>
                {terminalLines.map((l, i) => (
                  <p key={i} className={l.startsWith("$") ? "text-indigo-300" : "text-neutral-400"}>{l}</p>
                ))}
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-indigo-400">$</span>
                  <input
                    aria-label="terminal komutu"
                    value={cmd}
                    onChange={(e) => setCmd(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && runCmd()}
                    className="flex-1 bg-transparent text-neutral-200 focus:outline-none"
                    placeholder="sdk …"
                  />
                </div>
              </div>
            )}
            {tab === "python" && (
              <div className="text-neutral-400">
                <p className="text-indigo-300">&gt;&gt;&gt; frappe.get_doc(&quot;Party&quot;, &quot;PTY-0001&quot;).status</p>
                <p>&apos;active&apos;</p>
                <p className="text-indigo-300">&gt;&gt;&gt; len(frappe.get_all(&quot;Listing&quot;, filters={'{'}&quot;state&quot;: &quot;active&quot;{'}'}))</p>
                <p>312</p>
                <p className="mt-1 text-neutral-600"># read-only konsol — yazma işlemi onay kapısına yönlendirilir (dev/staging).</p>
              </div>
            )}
            {tab === "dbshell" && (
              <div className="text-neutral-400">
                <p className="text-indigo-300">acme_db=&gt; EXPLAIN ANALYZE SELECT ... FROM ten_party LIMIT 10;</p>
                <p>Index Scan using ten_party_pkey (cost=0.29..1.4) (actual time=0.04ms)</p>
                <p className="mt-2 text-amber-400">— Yavaş sorgu monitörü (&gt;1000ms) —</p>
                {SLOW_QUERIES.map((q) => (
                  <p key={q.sql}>
                    <span className="text-red-400">{q.ms}ms</span>{" "}
                    <span className="text-neutral-500">[{q.tenant}]</span> {q.sql}{" "}
                    <span className="text-indigo-300">→ {q.hint}</span>
                  </p>
                ))}
              </div>
            )}
            {tab === "logs" &&
              LOGS.map(([t, lvl, msg], i) => (
                <p key={i} className="whitespace-nowrap">
                  <span className="text-neutral-600">{t} </span>
                  <span className={lvl === "error" ? "text-red-400" : lvl === "warn" ? "text-amber-400" : "text-neutral-500"}>
                    {String(lvl).padEnd(5)}
                  </span>{" "}
                  <span className="text-neutral-300">{msg}</span>
                </p>
              ))}
            {tab === "jobs" && (
              <div className="space-y-2.5 pr-2">
                {JOBS.map((j) => (
                  <div key={j.name}>
                    <div className="mb-1 flex justify-between text-neutral-300">
                      <span>{j.name}</span>
                      <span className="text-neutral-500">{j.state}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-neutral-800">
                      <div
                        className={cn("h-full", j.pct === 100 ? "bg-emerald-500" : "bg-indigo-500")}
                        style={{ width: `${j.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Durum çubuğu — her zaman görünür */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="dev workspace çekmecesi"
        className="flex w-full items-center gap-4 border-t border-neutral-800 bg-neutral-950 px-4 py-1.5 text-[11px] text-neutral-500 hover:text-neutral-300"
      >
        <span className="flex items-center gap-1.5">
          <span className={cn("h-1.5 w-1.5 rounded-full", env === "production" ? "bg-red-400" : "bg-emerald-400")} />
          env: {env} · build #319 yeşil
        </span>
        <span className="hidden items-center gap-1 text-amber-400/80 sm:flex">
          <Snail className="h-3 w-3" /> yavaş sorgu: {SLOW_QUERIES.length}
        </span>
        <span>işler: {JOBS.filter((j) => j.pct < 100).length} aktif</span>
        <span className="text-red-400/80">DLQ: 1</span>
        <span className="ml-auto flex items-center gap-1">
          terminal · loglar · işler {open ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
        </span>
      </button>
    </div>
  );
}
