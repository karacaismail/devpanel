import type { EvalContext } from "./types";

/**
 * Regex tabanlı token interpolasyonu: "{{env}}", "{{org}}", "{{ctx.foo}}".
 * JSON içeriği değişken taşıyabilir; motor runtime bağlamından doldurur.
 * Karşılığı olmayan token AYNEN kalır (eksik veri gizlenmez — şeffaflık).
 */
const TOKEN = /\{\{\s*(?:ctx\.)?([\w.]+)\s*\}\}/g;

export function interpolate(input: string, ctx: EvalContext): string {
  return input.replace(TOKEN, (whole, key: string) => {
    const v = ctx[key];
    return v === undefined || v === null ? whole : String(v);
  });
}

/** Nesne/dizi içindeki tüm string'leri özyinelemeli interpolate eder. */
export function interpolateDeep<T>(value: T, ctx: EvalContext): T {
  if (typeof value === "string") return interpolate(value, ctx) as unknown as T;
  if (Array.isArray(value)) return value.map((v) => interpolateDeep(v, ctx)) as unknown as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = interpolateDeep(v, ctx);
    return out as T;
  }
  return value;
}
