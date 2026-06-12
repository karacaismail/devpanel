import type { PartyRow } from "../data/rows";
import { maskPii } from "../data/rows";

const PII_COLUMNS: ReadonlySet<keyof PartyRow> = new Set(["email", "phone"]);

/**
 * CSV export — PII kolonları HER ZAMAN maskeli çıkar (d03).
 * Ham PII'nin paneli terk etmesinin tek yolu yetkili API'dir, export değil.
 */
export function toCsv(rows: PartyRow[], cols: Array<keyof PartyRow>): string {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n;]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
  };
  const header = cols.join(",");
  const body = rows.map((r) =>
    cols
      .map((c) => {
        const raw = r[c];
        const val = PII_COLUMNS.has(c) ? maskPii(String(raw)) : raw;
        return esc(val);
      })
      .join(","),
  );
  return [header, ...body].join("\n");
}
