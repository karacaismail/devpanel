import { useState } from "react";
import { useAuditStore } from "../lib/audit";
import { EquivalencePanel } from "../components/EquivalencePanel";

/** Audit Log (layer1-audit): kim, ne, ne zaman — her satır CLI eşdeğeri taşır. */
export function AuditLog() {
  const entries = useAuditStore((s) => s.entries);
  const [actor, setActor] = useState("all");
  const actors = [...new Set(entries.map((e) => e.actor))];
  const visible = entries.filter((e) => actor === "all" || e.actor === actor);

  return (
    <div>
      <header className="mb-4 flex flex-wrap items-center gap-2">
        <h1 className="text-lg text-ink">Audit Log</h1>
        <p className="text-sm text-mute">
          Panel ve agent aksiyonlarının tamamı — değiştirilemez kayıt (append-only).
        </p>
        <select
          aria-label="aktör filtresi"
          value={actor}
          onChange={(e) => setActor(e.target.value)}
          className="ml-auto rounded border border-line bg-elev px-1.5 py-1 text-xs text-ink"
        >
          <option value="all">tüm aktörler</option>
          {actors.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
      </header>

      <div className="overflow-auto rounded-md border border-line">
        <table className="w-full text-sm">
          <thead className="bg-panel text-left text-xs uppercase tracking-wide text-mute">
            <tr>
              <th className="px-3 py-2 font-normal">zaman</th>
              <th className="px-3 py-2 font-normal">aktör</th>
              <th className="px-3 py-2 font-normal">aksiyon</th>
              <th className="px-3 py-2 font-normal">CLI eşdeğeri</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((e) => (
              <tr key={e.id} className="border-t border-line/60 align-top">
                <td className="whitespace-nowrap px-3 py-1.5 font-mono text-xs text-mute">{e.ts}</td>
                <td className="whitespace-nowrap px-3 py-1.5 text-ink">
                  {e.actor.includes("MCP") ? (
                    <span className="text-accent">{e.actor}</span>
                  ) : (
                    e.actor
                  )}
                </td>
                <td className="px-3 py-1.5 text-ink">{e.summary}</td>
                <td className="px-3 py-1.5 font-mono text-xs text-mute">{e.cli}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <EquivalencePanel action={{ tool: "audit.tail", args: { limit: 200 } }} />
    </div>
  );
}
