import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { ClockCounterClockwise, Copy, Play } from "@phosphor-icons/react";
import { DEFAULT_GQL_QUERY, GQL_MOCK_RESPONSE, REST_ENDPOINTS } from "../data/ops";
import { EquivalencePanel } from "../components/EquivalencePanel";
import { logAction } from "../lib/audit";

interface HistoryItem {
  at: string;
  query: string;
  label: string;
}

/** P6 — API Explorer: GraphQL playground + sorgu geçmişi + curl; REST/OpenAPI sekme (d07). */
export function ApiExplorer() {
  const [query, setQuery] = useState(DEFAULT_GQL_QUERY);
  const [response, setResponse] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const run = () => {
    setResponse(GQL_MOCK_RESPONSE);
    const label = /query\s+(\w+)/.exec(query)?.[1] ?? "adsız sorgu";
    setHistory((prev) =>
      [{ at: new Date().toLocaleTimeString("tr-TR", { hour12: false }), query, label }, ...prev].slice(0, 5),
    );
    logAction(
      { tool: "api.query", args: { lang: "graphql", tenant: "acme" } },
      `GraphQL sorgusu çalıştı: ${label}`,
      { toast: false },
    );
  };

  const copyCurl = () => {
    const curl = `curl -s https://kernel.local/graphql \\\n  -H 'content-type: application/json' \\\n  -H 'x-tenant: acme' \\\n  -d '${JSON.stringify({ query }).replaceAll("'", "'\\''")}'`;
    void navigator.clipboard?.writeText(curl).catch(() => {});
  };

  return (
    <div>
      <header className="mb-4 flex flex-wrap items-center gap-2">
        <h1 className="text-lg text-ink">API Explorer</h1>
        <label className="ml-auto flex items-center gap-2 text-xs text-mute">
          şema sürümü (pin)
          <select className="rounded border border-line bg-elev px-1.5 py-1 text-ink" defaultValue="2026-06">
            <option>2026-06</option>
            <option>2026-03</option>
            <option>2025-12</option>
          </select>
        </label>
      </header>

      <Tabs.Root defaultValue="graphql">
        <Tabs.List className="mb-3 flex gap-1 border-b border-line">
          {[
            ["graphql", "GraphQL"],
            ["rest", "REST / OpenAPI"],
          ].map(([v, l]) => (
            <Tabs.Trigger
              key={v}
              value={v}
              className="px-3 py-1.5 text-sm text-mute data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:text-ink"
            >
              {l}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="graphql">
          <div className="grid gap-3 lg:grid-cols-2">
            <div>
              <textarea
                aria-label="GraphQL sorgusu"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={12}
                spellCheck={false}
                className="w-full rounded-md border border-line bg-bg p-3 font-mono text-sm text-ink"
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={run}
                  className="flex items-center gap-1.5 rounded bg-accent px-3 py-1.5 text-sm text-accent-ink"
                >
                  <Play size={14} /> Çalıştır (tenant: acme)
                </button>
                <button
                  type="button"
                  onClick={copyCurl}
                  className="flex items-center gap-1.5 rounded border border-line px-3 py-1.5 text-sm text-mute hover:text-ink"
                >
                  <Copy size={13} /> copy as curl
                </button>
              </div>

              <h3 className="mb-1 mt-4 flex items-center gap-1.5 text-xs uppercase tracking-wide text-mute">
                <ClockCounterClockwise size={12} /> Sorgu geçmişi
              </h3>
              {history.length === 0 ? (
                <p className="text-xs text-mute/60">geçmiş boş — ilk sorgunu çalıştır</p>
              ) : (
                <ul className="flex flex-col gap-1">
                  {history.map((h, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => setQuery(h.query)}
                        className="flex w-full items-center gap-2 rounded border border-line bg-panel px-2 py-1 text-left text-xs text-mute hover:text-ink"
                      >
                        <span className="font-mono text-line">{h.at}</span>
                        <span className="font-mono text-ink">{h.label}</span>
                        <span className="ml-auto">geri yükle</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <pre className="min-h-48 overflow-auto rounded-md border border-line bg-bg p-3 font-mono text-xs text-mute">
              {response ?? "// Yanıt burada — PII alanları her zaman maskeli döner."}
            </pre>
          </div>
        </Tabs.Content>

        <Tabs.Content value="rest">
          <p className="mb-2 text-xs text-mute">
            REST/OpenAPI kurulumda açıldıysa görünür (d07) — bu app'te açık.
          </p>
          <ul className="flex flex-col gap-1">
            {REST_ENDPOINTS.map((e) => (
              <li key={e.method + e.path} className="flex items-center gap-3 rounded border border-line bg-panel px-3 py-1.5 text-sm">
                <span className={`w-14 font-mono text-xs ${e.method === "GET" ? "text-ok" : "text-warn"}`}>
                  {e.method}
                </span>
                <code className="font-mono text-ink">{e.path}</code>
                <span className="ml-auto text-xs text-mute">{e.desc}</span>
              </li>
            ))}
          </ul>
        </Tabs.Content>
      </Tabs.Root>

      <EquivalencePanel
        action={{ tool: "api.query", args: { lang: "graphql", tenant: "acme", schema: "2026-06" } }}
      />
    </div>
  );
}
