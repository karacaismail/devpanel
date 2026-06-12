import { Command, Warning } from "@phosphor-icons/react";
import { useUiStore, type ScreenId } from "../lib/store";
import { useAuditStore } from "../lib/audit";
import { ARCHETYPES } from "../data/archetypes";
import { MODULES } from "../data/modules";
import { CONTRACTS } from "../data/contracts";
import { DLQ_ITEMS, MIGRATION_QUEUE, MCP_TOOLS, TEST_SUITES } from "../data/ops";

/** Deterministik outbox throughput eğrisi (telemetri değil, kernel iç sayacı). */
const THROUGHPUT = [42, 51, 48, 63, 58, 71, 66, 80, 74, 88, 92, 85, 97, 90];

function Sparkline() {
  const max = Math.max(...THROUGHPUT);
  const pts = THROUGHPUT.map(
    (v, i) => `${(i / (THROUGHPUT.length - 1)) * 200},${36 - (v / max) * 32}`,
  ).join(" ");
  return (
    <svg viewBox="0 0 200 40" className="h-10 w-full" role="img" aria-label="outbox/saat eğrisi">
      <polyline points={pts} fill="none" stroke="var(--color-accent)" strokeWidth="1.5" />
      <polyline points={`0,40 ${pts} 200,40`} fill="var(--color-accent)" opacity="0.08" stroke="none" />
    </svg>
  );
}

interface Kpi {
  label: string;
  value: string;
  sub: string;
  to: ScreenId;
  tone?: "ok" | "warn" | "danger";
}

const TONE = { ok: "text-ok", warn: "text-warn", danger: "text-danger" } as const;

/** Genel Bakış — operasyon panosu: KPI, sağlık, son aksiyonlar. */
export function Overview() {
  const setScreen = useUiStore((s) => s.setScreen);
  const openPalette = useUiStore((s) => s.setPaletteOpen);
  const entries = useAuditStore((s) => s.entries);

  const failed = TEST_SUITES.reduce((s, t) => s + t.failed, 0);
  const blocked = MODULES.filter((m) => m.sandbox === "blocked").length;
  const violations = CONTRACTS.filter((c) => c.status === "violation").length;
  const queued = MIGRATION_QUEUE.filter((m) => m.status === "kuyrukta").length;

  const kpis: Kpi[] = [
    { label: "ArcheType", value: String(ARCHETYPES.length), sub: `${ARCHETYPES.filter((a) => a.scope === "kernel").length} kernel-paylaşımlı`, to: "archetype" },
    { label: "Conformance", value: failed > 0 ? `${failed} kırmızı` : "✓", sub: "sdk check", to: "tests", tone: failed > 0 ? "danger" : "ok" },
    { label: "Modüller", value: String(MODULES.length), sub: blocked > 0 ? `${blocked} karantinada` : "sandbox temiz", to: "modules", tone: blocked > 0 ? "danger" : "ok" },
    { label: "Kontratlar", value: String(CONTRACTS.length), sub: violations > 0 ? `${violations} sınır ihlali` : "ihlal yok", to: "domains", tone: violations > 0 ? "danger" : "ok" },
    { label: "Migration", value: String(queued), sub: "kuyrukta (LLM-review)", to: "migration", tone: queued > 0 ? "warn" : "ok" },
    { label: "DLQ", value: String(DLQ_ITEMS.length), sub: "bekleyen event", to: "observability", tone: DLQ_ITEMS.length > 0 ? "warn" : "ok" },
  ];

  return (
    <div>
      <header className="mb-4 flex flex-wrap items-center gap-2">
        <div>
          <h1 className="text-xl text-ink">marketplace · acme</h1>
          <p className="text-sm text-mute">
            Tanım katmanının görsel yüzü — panel UI yapar, tanım yazar.
          </p>
        </div>
        <button
          type="button"
          onClick={() => openPalette(true)}
          className="ml-auto flex items-center gap-2 rounded-md border border-line bg-panel px-3 py-2 text-sm text-mute hover:text-ink"
        >
          <Command size={16} className="text-accent" />
          <span className="font-mono">"crm dağ yap"</span>
          <kbd>⌘K</kbd>
        </button>
      </header>

      {failed > 0 && (
        <button
          type="button"
          onClick={() => setScreen("tests")}
          className="mb-4 flex w-full items-start gap-2 rounded-md border border-danger/50 bg-danger/10 p-3 text-left text-sm text-danger"
        >
          <Warning size={18} className="mt-0.5 shrink-0" />
          <span>
            <strong>Kırmızı test paneli (kapatılamaz):</strong> listing-flow
            active→sold telafi tanımsız — scaffold/migration akışları kilitli. İncele →
          </span>
        </button>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {kpis.map((k) => (
          <button
            key={k.label}
            type="button"
            onClick={() => setScreen(k.to)}
            className="rounded-md border border-line bg-panel p-3 text-left hover:border-accent/40"
          >
            <p className="text-xs uppercase tracking-wide text-mute">{k.label}</p>
            <p className={`mt-1 text-xl ${k.tone ? TONE[k.tone] : "text-ink"}`}>{k.value}</p>
            <p className="text-xs text-mute">{k.sub}</p>
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <section className="rounded-md border border-line bg-panel p-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xs uppercase tracking-wide text-mute">Outbox / saat</h2>
            <span className="font-mono text-sm text-ink">{THROUGHPUT.at(-1)} ev/dk</span>
          </div>
          <Sparkline />
        </section>

        <section className="rounded-md border border-line bg-panel p-3">
          <h2 className="mb-2 text-xs uppercase tracking-wide text-mute">MCP yüzeyi</h2>
          <p className="text-sm text-ink">
            {MCP_TOOLS.length} tool aktif — her panel ekranının agent eşdeğeri var.
          </p>
          <button
            type="button"
            onClick={() => setScreen("ai")}
            className="mt-2 rounded border border-line px-2 py-1 text-xs text-mute hover:text-ink"
          >
            AI Konsolu →
          </button>
        </section>

        <section className="rounded-md border border-line bg-panel p-3">
          <h2 className="mb-2 text-xs uppercase tracking-wide text-mute">Son aksiyonlar</h2>
          <ul className="flex flex-col gap-1.5">
            {entries.slice(0, 4).map((e) => (
              <li key={e.id} className="text-xs">
                <span className="text-mute">{e.ts}</span>{" "}
                <span className={e.actor.includes("MCP") ? "text-accent" : "text-mute"}>
                  {e.actor}
                </span>{" "}
                <span className="text-ink">{e.summary}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => setScreen("audit")}
            className="mt-2 rounded border border-line px-2 py-1 text-xs text-mute hover:text-ink"
          >
            Audit Log →
          </button>
        </section>
      </div>
    </div>
  );
}
