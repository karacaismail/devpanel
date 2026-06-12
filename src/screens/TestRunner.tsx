import { Flask, ShieldCheck, Warning } from "@phosphor-icons/react";
import { SDK_CHECK_OUTPUT, TEST_SUITES } from "../data/ops";
import { EquivalencePanel } from "../components/EquivalencePanel";

/** P9 — Test Runner: kontrat testleri + sdk check; kırmızı panel KAPATILAMAZ. */
export function TestRunner() {
  const failed = TEST_SUITES.reduce((s, t) => s + t.failed, 0);
  const passed = TEST_SUITES.reduce((s, t) => s + t.passed, 0);
  const rls = TEST_SUITES.filter((t) => t.kind === "rls");
  const rest = TEST_SUITES.filter((t) => t.kind !== "rls");

  return (
    <div>
      <header className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-lg text-ink">Test Runner</h1>
        <span className="text-sm text-ok">{passed} yeşil</span>
        <span className={`text-sm ${failed > 0 ? "text-danger" : "text-mute"}`}>
          {failed} kırmızı
        </span>
      </header>

      {failed > 0 && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2 rounded-md border border-danger/50 bg-danger/10 p-3 text-sm text-danger"
        >
          <Warning size={18} className="mt-0.5 shrink-0" />
          <div>
            <strong>Kırmızı test paneli — kapatılamaz bölge (ilke #3).</strong>{" "}
            listing.contract.test.ts: listing-flow active→sold telafi tanımsız.
            Tanım düzeltilmeden scaffold/migration akışları kilitli.
          </div>
        </div>
      )}

      <h2 className="mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wide text-mute">
        <ShieldCheck size={14} className="text-ok" /> "Komşu tenant okuyamaz" vitrini
      </h2>
      <ul className="mb-4 flex flex-col gap-1.5">
        {rls.map((t) => (
          <li key={t.id} className="flex items-center gap-2 rounded border border-ok/30 bg-ok/5 px-3 py-1.5 text-sm">
            <Flask size={14} className="text-ok" />
            <code className="font-mono text-ink">{t.name}</code>
            <span className="ml-auto text-xs text-ok">{t.passed}/{t.passed + t.failed}</span>
          </li>
        ))}
      </ul>

      <h2 className="mb-2 text-xs uppercase tracking-wide text-mute">Üretilmiş kontrat testleri</h2>
      <ul className="mb-4 flex flex-col gap-1.5">
        {rest.map((t) => (
          <li
            key={t.id}
            className={`flex items-center gap-2 rounded border px-3 py-1.5 text-sm ${
              t.failed > 0 ? "border-danger/40 bg-danger/5" : "border-line bg-panel"
            }`}
          >
            <Flask size={14} className={t.failed > 0 ? "text-danger" : "text-mute"} />
            <code className="font-mono text-ink">{t.name}</code>
            <span className="rounded border border-line px-1.5 py-0.5 text-xs text-mute">{t.kind}</span>
            <span className={`ml-auto text-xs ${t.failed > 0 ? "text-danger" : "text-ok"}`}>
              {t.passed} ✓{t.failed > 0 ? ` · ${t.failed} ✗` : ""}
            </span>
          </li>
        ))}
      </ul>

      <h2 className="mb-2 text-xs uppercase tracking-wide text-mute">sdk check</h2>
      <pre className="overflow-auto rounded-md border border-line bg-bg p-3 font-mono text-xs leading-relaxed text-mute">
        {SDK_CHECK_OUTPUT}
      </pre>

      <EquivalencePanel action={{ tool: "check.run", args: { app: "marketplace" } }} />
    </div>
  );
}
