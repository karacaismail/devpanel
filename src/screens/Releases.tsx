import { useState } from "react";
import { PushPin, Tag } from "@phosphor-icons/react";
import { RELEASES } from "../data/releases";
import { TENANTS } from "../data/tenants";
import { EquivalencePanel } from "../components/EquivalencePanel";
import { logAction } from "../lib/audit";

/** Sürümler — şema release'leri, changelog ve tenant şema pinleri (sus-versioning). */
export function Releases() {
  const [pins, setPins] = useState<Record<string, string>>({
    acme: "2026-03",
    globex: "2026-06",
    initech: "2026-06",
  });

  const setPin = (tenant: string, release: string) => {
    setPins((prev) => ({ ...prev, [tenant]: release }));
    logAction({ tool: "release.pin", args: { tenant, release } }, `${tenant} şema pini → ${release}`);
  };

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-lg text-ink">Sürümler</h1>
        <p className="text-sm text-mute">
          Şema release'leri ve tenant pinleri — pin, tenant'ı kırıcı değişimden
          korur; köprü süresi sonunda güncellenmek zorundadır (sus-versioning).
        </p>
      </header>

      <div className="grid gap-3 lg:grid-cols-3">
        {RELEASES.map((r) => (
          <article
            key={r.id}
            className={`rounded-md border bg-panel p-3 ${r.current ? "border-accent/50" : "border-line"}`}
          >
            <div className="flex items-center gap-2">
              <Tag size={15} className={r.current ? "text-accent" : "text-mute"} />
              <h2 className="font-mono text-ink">{r.id}</h2>
              {r.current && (
                <span className="rounded border border-accent/50 px-1.5 py-0.5 text-xs text-accent">
                  güncel
                </span>
              )}
              <span className="ml-auto text-xs text-mute">{r.date}</span>
            </div>
            <h3 className="mb-1 mt-3 text-xs uppercase tracking-wide text-mute">Changelog</h3>
            <ul className="flex flex-col gap-1 text-sm text-ink">
              {r.changelog.map((c, i) => (
                <li key={i} className="rounded bg-elev px-2 py-1 text-xs">{c}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <h2 className="mb-2 mt-5 flex items-center gap-1.5 text-xs uppercase tracking-wide text-mute">
        <PushPin size={13} className="text-warn" /> Tenant şema pinleri
      </h2>
      <div className="overflow-auto rounded-md border border-line">
        <table className="w-full text-sm">
          <thead className="bg-panel text-left text-xs uppercase tracking-wide text-mute">
            <tr>
              <th className="px-3 py-2 font-normal">tenant</th>
              <th className="px-3 py-2 font-normal">pinli sürüm</th>
              <th className="px-3 py-2 font-normal">durum</th>
            </tr>
          </thead>
          <tbody>
            {TENANTS.map((t) => {
              const pinned = pins[t.id];
              const isCurrent = RELEASES.find((r) => r.id === pinned)?.current;
              return (
                <tr key={t.id} className="border-t border-line/60">
                  <td className="px-3 py-1.5 text-ink">{t.id}</td>
                  <td className="px-3 py-1.5">
                    <select
                      aria-label={`${t.id} pin`}
                      value={pinned}
                      onChange={(e) => setPin(t.id, e.target.value)}
                      className="rounded border border-line bg-elev px-1.5 py-1 font-mono text-xs text-ink"
                    >
                      {RELEASES.map((r) => (
                        <option key={r.id} value={r.id}>{r.id}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-1.5 text-xs">
                    {isCurrent ? (
                      <span className="text-ok">güncel</span>
                    ) : (
                      <span className="text-warn">eski sürümde — köprü aktif</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <EquivalencePanel action={{ tool: "release.list", args: { app: "marketplace" } }} />
    </div>
  );
}
