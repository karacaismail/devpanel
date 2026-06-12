/** Rapor çekirdeği — Ahmet'in report.ts kavramından: grupla & say. */

export interface GroupRow {
  key: string;
  count: number;
  pct: number;
}

export function groupCount<T extends object>(rows: T[], key: keyof T): GroupRow[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    const k = String(r[key]);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  const total = rows.length || 1;
  return [...map.entries()]
    .map(([k, count]) => ({ key: k, count, pct: Math.round((count / total) * 1000) / 10 }))
    .sort((a, b) => b.count - a.count);
}
