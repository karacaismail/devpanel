import { describe, expect, it } from "vitest";
import { interpolate, interpolateDeep } from "../interpolate";
import { evaluate } from "../conditions";
import { runRules, hasAction } from "../rules";
import type { EvalContext, Rule } from "../types";

const ctx: EvalContext = { org: "acme", env: "production", role: "developer", isProd: true };

describe("interpolate (regex token motoru)", () => {
  it("{{token}} bağlamdan dolar; eksik token aynen kalır", () => {
    expect(interpolate("org: {{org}} / env: {{env}}", ctx)).toBe("org: acme / env: production");
    expect(interpolate("{{ctx.role}} · {{yok}}", ctx)).toBe("developer · {{yok}}");
  });
  it("interpolateDeep nesne/dizi içinde özyineler", () => {
    const out = interpolateDeep({ a: "{{org}}", b: ["{{env}}", { c: "{{role}}" }] }, ctx);
    expect(out).toEqual({ a: "acme", b: ["production", { c: "developer" }] });
  });
});

describe("conditions (güvenli koşul — eval YOK)", () => {
  it("karşılaştırma operatörleri", () => {
    expect(evaluate("env == production", ctx)).toBe(true);
    expect(evaluate("role != viewer", ctx)).toBe(true);
    expect(evaluate("env == staging", ctx)).toBe(false);
  });
  it("&& ve || ve çıplak bayrak", () => {
    expect(evaluate("env == production && role == developer", ctx)).toBe(true);
    expect(evaluate("env == staging || role == developer", ctx)).toBe(true);
    expect(evaluate("isProd", ctx)).toBe(true);
    expect(evaluate("!isProd", ctx)).toBe(false);
  });
  it("when boşsa daima true", () => {
    expect(evaluate(undefined, ctx)).toBe(true);
  });
});

describe("ECA kural motoru", () => {
  const rules: Rule[] = [
    { id: "R1", when: "env == production", then: "lock:destructive" },
    { id: "R2", when: "role == viewer", then: "lock:write" },
  ];
  it("prod bağlamında destructive kilidi tetiklenir; viewer kuralı tetiklenmez", () => {
    const fired = runRules(rules, ctx);
    expect(hasAction(fired, "lock", "destructive")).toBe(true);
    expect(hasAction(fired, "lock", "write")).toBe(false);
    expect(fired[0].ruleId).toBe("R1");
  });
});
