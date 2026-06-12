import { Warning } from "@phosphor-icons/react";
import { CONTRACTS, DOMAINS } from "../data/contracts";
import { ScopeBadge } from "../components/LevelBadge";
import { EquivalencePanel } from "../components/EquivalencePanel";

/** P5 — Domain & Contract Haritası: kaya sınırları + kontratlar + ihlaller. */
export function DomainMap() {
  const violations = CONTRACTS.filter((c) => c.status === "violation");

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-lg text-ink">Domain &amp; Contract Haritası</h1>
        <p className="text-sm text-mute">
          Kaya sınırları — domain'ler arası her ilişki bir Contract'tır; kontrat
          dışı erişim ihlaldir (sus-boundaries).
        </p>
      </header>

      {violations.length > 0 && (
        <div role="alert" className="mb-4 flex items-start gap-2 rounded-md border border-danger/50 bg-danger/10 p-3 text-sm text-danger">
          <Warning size={18} className="mt-0.5 shrink-0" />
          <div>
            {violations.length} sınır ihlali:{" "}
            {violations.map((v) => `${v.producer} → ${v.consumer} (${v.payload})`).join("; ")}
          </div>
        </div>
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {DOMAINS.map((d) => (
          <article key={d.id} className="rounded-md border border-line bg-panel p-3">
            <div className="flex items-center gap-2">
              <h2 className="text-ink">{d.name}</h2>
              <ScopeBadge scope={d.scope} />
            </div>
            <ul className="mt-2 flex flex-wrap gap-1">
              {d.archetypes.map((a) => (
                <li key={a} className="rounded border border-line px-1.5 py-0.5 font-mono text-xs text-mute">
                  {a}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <h2 className="mb-2 text-xs uppercase tracking-wide text-mute">
        Contract listesi (kim kime hangi event/endpoint)
      </h2>
      <div className="overflow-auto rounded-md border border-line">
        <table className="w-full text-sm">
          <thead className="bg-panel text-left text-xs uppercase tracking-wide text-mute">
            <tr>
              <th className="px-3 py-2 font-normal">üreten</th>
              <th className="px-3 py-2 font-normal">tüketen</th>
              <th className="px-3 py-2 font-normal">tür</th>
              <th className="px-3 py-2 font-normal">yük</th>
              <th className="px-3 py-2 font-normal">durum</th>
            </tr>
          </thead>
          <tbody>
            {CONTRACTS.map((c) => (
              <tr key={c.id} className={`border-t border-line/60 ${c.status === "violation" ? "bg-danger/5" : ""}`}>
                <td className="px-3 py-1.5 text-ink">{c.producer}</td>
                <td className="px-3 py-1.5 text-ink">{c.consumer}</td>
                <td className="px-3 py-1.5 text-mute">{c.kind}</td>
                <td className="px-3 py-1.5 font-mono text-xs text-mute">{c.payload}</td>
                <td className="px-3 py-1.5">
                  {c.status === "ok" ? (
                    <span className="text-ok">ok</span>
                  ) : (
                    <span className="text-danger" title={c.note}>
                      ihlal
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EquivalencePanel action={{ tool: "contract.list", args: { app: "marketplace" } }} />
    </div>
  );
}
