import type { EvalContext } from "./types";

/**
 * Güvenli koşul değerlendirici — eval() YOK, regex ile parse edilir.
 * Desteklenen gramer:  <sol> <op> <sağ>   ve   "a && b", "a || b", "!a".
 * Operatörler: == != > >= < <=  ·  sol taraf bağlam anahtarı, sağ taraf değer.
 * Örnekler: "env == production" · "role != viewer" · "count > 0" · "env==prod && role==admin"
 */

const COMPARE = /^\s*([\w.]+)\s*(==|!=|>=|<=|>|<)\s*(.+?)\s*$/;

function coerce(raw: string): string | number | boolean {
  const t = raw.trim().replace(/^["']|["']$/g, "");
  if (t === "true") return true;
  if (t === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
  return t;
}

function evalComparison(expr: string, ctx: EvalContext): boolean {
  const m = COMPARE.exec(expr);
  if (!m) {
    // çıplak bayrak: "isProd" → bağlamda truthy mi?
    const key = expr.trim().replace(/^!/, "");
    const truthy = Boolean(ctx[key]);
    return expr.trim().startsWith("!") ? !truthy : truthy;
  }
  const [, key, op, rhsRaw] = m;
  const left = ctx[key];
  const right = coerce(rhsRaw);
  switch (op) {
    case "==": return left === right;
    case "!=": return left !== right;
    case ">": return Number(left) > Number(right);
    case ">=": return Number(left) >= Number(right);
    case "<": return Number(left) < Number(right);
    case "<=": return Number(left) <= Number(right);
    default: return false;
  }
}

export function evaluate(expr: string | undefined, ctx: EvalContext): boolean {
  if (!expr) return true;
  // && ve || (soldan sağa, basit; parantez yok — şart ifadeleri sade tutulur)
  if (expr.includes("&&")) return expr.split("&&").every((p) => evaluate(p.trim(), ctx));
  if (expr.includes("||")) return expr.split("||").some((p) => evaluate(p.trim(), ctx));
  return evalComparison(expr, ctx);
}
