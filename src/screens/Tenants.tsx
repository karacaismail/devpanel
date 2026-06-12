import { useState } from "react";
import { Buildings, PaintBrush, PushPin } from "@phosphor-icons/react";
import { TENANTS } from "../data/tenants";
import { EquivalencePanel } from "../components/EquivalencePanel";
import { logAction } from "../lib/audit";

const EDITION_TONE: Record<string, string> = {
  enterprise: "border-accent/60 text-accent",
  standard: "border-line text-ink",
  lite: "border-line text-mute",
};

/** Tenant Yönetimi — edition, pinler, özelleştirme ayak izi (tek panel, çok tenant). */
export function Tenants() {
  const [tenants, setTenants] = useState(TENANTS);

  const setEdition = (id: string, edition: (typeof TENANTS)[number]["edition"]) => {
    setTenants((prev) => prev.map((t) => (t.id === id ? { ...t, edition } : t)));
    logAction({ tool: "tenant.edition.set", args: { tenant: id, edition } }, `${id} edition → ${edition}`);
  };

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-lg text-ink">Tenant Yönetimi</h1>
        <p className="text-sm text-mute">
          Edition, sürüm pinleri ve özelleştirme ayak izi — tüm özelleştirmeler
          tenant katmanında yaşar, core şema değişmez (E8).
        </p>
      </header>

      <div className="grid gap-3 lg:grid-cols-3">
        {tenants.map((t) => (
          <article key={t.id} className="rounded-md border border-line bg-panel p-3">
            <div className="flex items-center gap-2">
              <Buildings size={16} className="text-accent" />
              <h2 className="text-ink">{t.name}</h2>
              <code className="font-mono text-xs text-mute">{t.id}</code>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
              <span className={`rounded border px-1.5 py-0.5 ${EDITION_TONE[t.edition]}`}>
                {t.edition}
              </span>
              <span className="text-mute">üye: {t.since}</span>
            </div>

            <dl className="mt-3 grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 text-xs">
              <dt className="text-mute">custom field</dt>
              <dd className="text-ink">{t.customFields}</dd>
              <dt className="text-mute">tema override</dt>
              <dd className="flex items-center gap-1 text-ink">
                {t.themeOverride ? (
                  <>
                    <PaintBrush size={12} className="text-accent" /> var (AA ✓)
                  </>
                ) : (
                  "yok"
                )}
              </dd>
              <dt className="text-mute">workflow pin</dt>
              <dd className="text-ink">
                {t.workflowPins.length > 0 ? (
                  <span className="flex items-center gap-1">
                    <PushPin size={12} className="text-warn" />
                    {t.workflowPins.join(", ")}
                  </span>
                ) : (
                  "güncel sürüm"
                )}
              </dd>
              <dt className="text-mute">modüller</dt>
              <dd className="text-ink">{t.modules.length > 0 ? t.modules.join(", ") : "—"}</dd>
            </dl>

            <label className="mt-3 flex items-center gap-2 text-xs text-mute">
              edition
              <select
                value={t.edition}
                onChange={(e) => setEdition(t.id, e.target.value as typeof t.edition)}
                className="rounded border border-line bg-elev px-1.5 py-1 text-ink"
              >
                <option value="lite">lite</option>
                <option value="standard">standard</option>
                <option value="enterprise">enterprise</option>
              </select>
            </label>
          </article>
        ))}
      </div>

      <EquivalencePanel action={{ tool: "tenant.list", args: { app: "marketplace" } }} />
    </div>
  );
}
