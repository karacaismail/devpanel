import { useMemo, useState } from "react";
import { generateRows } from "../data/rows";
import { groupCount } from "../lib/report";
import { EquivalencePanel } from "../components/EquivalencePanel";

type GroupKey = "status" | "city";

/** Reports — grupla/say + bar grafiği (Ahmet birleştirmesi 2. parti). PII içermez. */
export function Reports() {
  const rows = useMemo(() => generateRows(1000), []);
  const [key, setKey] = useState<GroupKey>("status");
  const groups = useMemo(() => groupCount(rows, key), [rows, key]);
  const max = groups[0]?.count ?? 1;
  const active = rows.filter((r) => r.status === "active").length;

  return (
    <div>
      <header className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-lg text-ink">Reports — party</h1>
        <label className="ml-auto flex items-center gap-2 text-xs text-mute">
          grupla
          <select
            aria-label="grupla"
            value={key}
            onChange={(e) => setKey(e.target.value as GroupKey)}
            className="rounded border border-line bg-elev px-1.5 py-1 text-ink"
          >
            <option value="status">durum</option>
            <option value="city">şehir</option>
          </select>
        </label>
      </header>

      <div className="mb-4 grid grid-cols-3 gap-3">
        <div className="rounded-md border border-line bg-panel p-3">
          <p className="text-xs uppercase tracking-wide text-mute">toplam kayıt</p>
          <p className="mt-1 text-xl text-ink">{rows.length.toLocaleString("tr")}</p>
        </div>
        <div className="rounded-md border border-line bg-panel p-3">
          <p className="text-xs uppercase tracking-wide text-mute">aktif oranı</p>
          <p className="mt-1 text-xl text-ok">%{Math.round((active / rows.length) * 100)}</p>
        </div>
        <div className="rounded-md border border-line bg-panel p-3">
          <p className="text-xs uppercase tracking-wide text-mute">grup sayısı</p>
          <p className="mt-1 text-xl text-ink">{groups.length}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-md border border-line bg-panel p-3">
          <h2 className="mb-3 text-xs uppercase tracking-wide text-mute">Dağılım</h2>
          <ul className="flex flex-col gap-2">
            {groups.map((g) => (
              <li key={g.key} className="text-sm">
                <div className="mb-0.5 flex items-baseline justify-between">
                  <span className="text-ink">{g.key}</span>
                  <span className="font-mono text-xs text-mute">{g.count} · %{g.pct}</span>
                </div>
                <div className="h-2 overflow-hidden rounded bg-elev">
                  <div className="h-full bg-accent/80" style={{ width: `${(g.count / max) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="overflow-auto rounded-md border border-line">
          <table className="w-full text-sm">
            <thead className="bg-panel text-left text-xs uppercase tracking-wide text-mute">
              <tr>
                <th className="px-3 py-2 font-normal">{key === "status" ? "durum" : "şehir"}</th>
                <th className="px-3 py-2 font-normal">adet</th>
                <th className="px-3 py-2 font-normal">pay</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.key} className="border-t border-line/60">
                  <td className="px-3 py-1.5 text-ink">{g.key}</td>
                  <td className="px-3 py-1.5 font-mono text-mute">{g.count}</td>
                  <td className="px-3 py-1.5 font-mono text-mute">%{g.pct}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <EquivalencePanel
        action={{ tool: "report.run", args: { archetype: "party", "group-by": key } }}
      />
    </div>
  );
}
