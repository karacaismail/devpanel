import { create } from "zustand";

/**
 * Atonota K1 — Global bağlam store'u: org/tenant, ortam, rol, impersonation.
 * Tüm sayfalar bağlamı buradan okur; prod'da yıkıcı eylemler kilitlenir.
 */

export type Env = "development" | "staging" | "production";
export type Role = "developer" | "release-manager" | "platform-ops" | "viewer";

const BRANCHES: Record<Env, string> = {
  development: "feat/surface-fieldsets",
  staging: "release/1.8 · v1.8.0",
  production: "main · v1.7.2",
};

interface ContextState {
  org: string;
  env: Env;
  role: Role;
  impersonating: string | null;
  setOrg: (org: string) => void;
  setEnv: (env: Env) => void;
  setRole: (role: Role) => void;
  setImpersonating: (who: string | null) => void;
}

export const useContextStore = create<ContextState>((set) => ({
  org: "acme",
  env: "development",
  role: "developer",
  impersonating: null,
  setOrg: (org) => set({ org }),
  setEnv: (env) => set({ env }),
  setRole: (role) => set({ role }),
  setImpersonating: (impersonating) => set({ impersonating }),
}));

export const branchFor = (env: Env) => BRANCHES[env];
export const isProd = (env: Env) => env === "production";
/** Prod'da yıkıcı eylem kilidi — UI bileşenleri bu yardımcıyı kullanır. */
export const destructiveLocked = (env: Env) => isProd(env);
