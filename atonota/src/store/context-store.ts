import { create } from "zustand";
import type { EvalContext } from "@/engine/types";

export type Env = "development" | "staging" | "production";
export type Role = "viewer" | "developer" | "release-manager" | "platform-ops";

interface CtxState {
  org: string;
  env: Env;
  role: Role;
  setOrg: (v: string) => void;
  setEnv: (v: Env) => void;
  setRole: (v: Role) => void;
}

export const useContextStore = create<CtxState>((set) => ({
  org: "acme",
  env: "development",
  role: "developer",
  setOrg: (org) => set({ org }),
  setEnv: (env) => set({ env }),
  setRole: (role) => set({ role }),
}));

export const BRANCH: Record<Env, string> = {
  development: "feat/json-engine",
  staging: "release/1.0 · v1.0.0",
  production: "main · v0.9.3",
};

/** Store → motorun değerlendirme bağlamı. */
export function toEvalContext(s: Pick<CtxState, "org" | "env" | "role">): EvalContext {
  return { org: s.org, env: s.env, role: s.role, isProd: s.env === "production" };
}
