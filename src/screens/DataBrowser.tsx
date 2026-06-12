import { useMemo, useState } from "react";
import { EntityTable } from "../components/EntityTable";
import { generateRows, type PartyRow } from "../data/rows";
import { getLevel } from "../lib/granularity";
import { LevelBadge } from "../components/LevelBadge";

type StatusFilter = "tümü" | PartyRow["status"];
const FILTERS: StatusFilter[] = ["tümü", "active", "passive", "blocked"];

/** P7 — Data Browser: EntityTable + durum filtre çipleri (RLS/PII farkındalıklı). */
export function DataBrowser() {
  const all = useMemo(() => generateRows(1000), []);
  const [status, setStatus] = useState<StatusFilter>("tümü");
  const rows = useMemo(
    () => (status === "tümü" ? all : all.filter((r) => r.status === status)),
    [all, status],
  );
  const count = (s: StatusFilter) =>
    s === "tümü" ? all.length : all.filter((r) => r.status === s).length;

  return (
    <div>
      <header className="mb-3 flex flex-wrap items-center gap-2">
        <h1 className="text-lg text-ink">Data Browser — party</h1>
        <LevelBadge level={getLevel("buyuk-tas")} />
        <span className="text-xs text-mute">PII alanları maskeli · satıra tıkla → audit geçmişi</span>
      </header>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setStatus(f)}
            aria-pressed={status === f}
            className={`rounded-full border px-3 py-1 text-xs ${
              status === f
                ? "border-accent bg-accent/10 text-accent"
                : "border-line text-mute hover:text-ink"
            }`}
          >
            {f} ({count(f)})
          </button>
        ))}
      </div>

      <EntityTable key={status} rows={rows} />
    </div>
  );
}
