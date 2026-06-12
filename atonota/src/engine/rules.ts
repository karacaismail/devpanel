import type { EvalContext, Rule } from "./types";
import { evaluate } from "./conditions";

/**
 * ECA (Event-Condition-Action) motoru: rules.json'daki kurallar bağlama göre
 * değerlendirilir; tetiklenen aksiyonlar bir set olarak döner. UI bu set'i okur.
 * Örn: { when: "env == production", then: "lock:destructive" }
 */
export interface FiredAction {
  action: string;
  arg?: string;
  ruleId: string;
  note?: string;
}

export function runRules(rules: Rule[], ctx: EvalContext): FiredAction[] {
  const fired: FiredAction[] = [];
  for (const r of rules) {
    if (evaluate(r.when, ctx)) {
      const [action, arg] = r.then.split(":");
      fired.push({ action, arg, ruleId: r.id, note: r.note });
    }
  }
  return fired;
}

/** Belirli bir aksiyonun şu an aktif olup olmadığını sorar (ör. "lock", "destructive"). */
export function hasAction(fired: FiredAction[], action: string, arg?: string): boolean {
  return fired.some((f) => f.action === action && (arg === undefined || f.arg === arg));
}
