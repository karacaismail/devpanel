/**
 * 5 alanlı cron çözümleyici — Ahmet'in forge-dev-panel cron.ts'inden taşındı,
 * TR açıklama katmanı eklendi. Bağımlılıksız, saf.
 * Alanlar: dakika saat ay-günü ay hafta-günü. Desteklenen sözdizimi:
 * '*', tek değer, liste ("1,15"), aralık ("1-5"), adım ("*\/15", "0-30/10").
 */

export interface CronField {
  values: number[];
  wildcard: boolean;
}

export interface ParsedCron {
  minute: CronField;
  hour: CronField;
  dayOfMonth: CronField;
  month: CronField;
  dayOfWeek: CronField;
}

const SPECS: Record<keyof ParsedCron, { min: number; max: number }> = {
  minute: { min: 0, max: 59 },
  hour: { min: 0, max: 23 },
  dayOfMonth: { min: 1, max: 31 },
  month: { min: 1, max: 12 },
  dayOfWeek: { min: 0, max: 6 }, // 0 = Pazar
};

const ORDER: Array<keyof ParsedCron> = ["minute", "hour", "dayOfMonth", "month", "dayOfWeek"];

export const DAY_NAMES_TR = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"] as const;

function parseField(token: string, spec: { min: number; max: number }): CronField {
  const wildcard = token === "*";
  const set = new Set<number>();
  for (const part of token.split(",")) {
    if (part === "") throw new Error(`Boş cron alanı: "${token}"`);
    const [rangePart, stepPart] = part.split("/");
    let step = 1;
    if (stepPart !== undefined) {
      step = Number(stepPart);
      if (!Number.isInteger(step) || step < 1) throw new Error(`Geçersiz adım: "${part}"`);
    }
    let lo: number;
    let hi: number;
    if (rangePart === "*") {
      lo = spec.min;
      hi = spec.max;
    } else if (rangePart.includes("-")) {
      const [a, b] = rangePart.split("-").map(Number);
      lo = a;
      hi = b;
    } else {
      lo = Number(rangePart);
      hi = stepPart !== undefined ? spec.max : lo;
    }
    if (!Number.isInteger(lo) || !Number.isInteger(hi) || lo < spec.min || hi > spec.max || lo > hi) {
      throw new Error(`Aralık dışı cron alanı: "${part}" (${spec.min}-${spec.max})`);
    }
    for (let v = lo; v <= hi; v += step) set.add(v);
  }
  return { values: [...set].sort((a, b) => a - b), wildcard };
}

export function parseCron(expr: string): ParsedCron {
  const tokens = expr.trim().split(/\s+/).filter(Boolean);
  if (tokens.length !== 5) throw new Error(`Cron 5 alan ister, ${tokens.length} verildi: "${expr}"`);
  const out = {} as ParsedCron;
  ORDER.forEach((key, i) => {
    out[key] = parseField(tokens[i], SPECS[key]);
  });
  return out;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Pragmatik TR özet — yaygın kalıpları insan diline çevirir. */
export function describeCron(expr: string): string {
  const p = parseCron(expr);
  const everyN = (f: CronField, max: number): number | null => {
    if (f.values.length < 2) return null;
    const step = f.values[1] - f.values[0];
    if (f.values[0] !== 0) return null;
    for (let i = 1; i < f.values.length; i++) {
      if (f.values[i] - f.values[i - 1] !== step) return null;
    }
    return f.values.at(-1)! + step > max ? step : null;
  };

  const dowPart = p.dayOfWeek.wildcard
    ? null
    : p.dayOfWeek.values.map((d) => DAY_NAMES_TR[d]).join(", ");

  const minStep = everyN(p.minute, 59);
  if (minStep && p.hour.wildcard) {
    return `${minStep} dakikada bir${dowPart ? ` (${dowPart})` : ""}`;
  }

  if (p.minute.values.length === 1 && p.hour.values.length === 1) {
    const time = `${pad(p.hour.values[0])}:${pad(p.minute.values[0])}`;
    if (dowPart) return `her ${dowPart} ${time}`;
    if (!p.dayOfMonth.wildcard) {
      return `her ayın ${p.dayOfMonth.values.join(", ")}. günü ${time}`;
    }
    return `her gün ${time}`;
  }

  const hourStep = everyN(p.hour, 23);
  if (hourStep && p.minute.values.length === 1) {
    return `${hourStep} saatte bir (dk ${pad(p.minute.values[0])})`;
  }

  return expr; // çevrilemeyen kalıp ham gösterilir — demo asla kırılmaz
}

/** Verilen andan itibaren sonraki `count` çalışma zamanı (dakika çözünürlüğü). */
export function nextRuns(expr: string, from: Date, count = 3): Date[] {
  const p = parseCron(expr);
  const has = (f: CronField, v: number) => f.wildcard || f.values.includes(v);
  const out: Date[] = [];
  const cursor = new Date(from);
  cursor.setSeconds(0, 0);
  cursor.setMinutes(cursor.getMinutes() + 1);
  const LIMIT = 366 * 24 * 60; // 1 yıl emniyet sınırı
  for (let i = 0; i < LIMIT && out.length < count; i++) {
    const dowOk = has(p.dayOfWeek, cursor.getDay());
    const domOk = has(p.dayOfMonth, cursor.getDate());
    /* Standart cron: dom ve dow ikisi de kısıtlıysa OR birleşir. */
    const dayOk =
      !p.dayOfMonth.wildcard && !p.dayOfWeek.wildcard ? domOk || dowOk : domOk && dowOk;
    if (
      dayOk &&
      has(p.month, cursor.getMonth() + 1) &&
      has(p.hour, cursor.getHours()) &&
      has(p.minute, cursor.getMinutes())
    ) {
      out.push(new Date(cursor));
    }
    cursor.setMinutes(cursor.getMinutes() + 1);
  }
  return out;
}
