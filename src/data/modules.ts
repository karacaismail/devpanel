/** P4 — Module Manager mock verisi (d09: "Chrome extension kadar basit"). */

export interface ModuleManifest {
  id: string;
  name: string;
  version: string;
  author: string;
  license: "MIT" | "AGPL" | "Ticari";
  enabled: boolean;
  installed: boolean;
  sandbox: "running" | "stopped" | "blocked";
  /** Beyan edilen izinler — beyan dışı izin yok. */
  permissions: string[];
  note?: string;
}

export const MODULES: ModuleManifest[] = [
  {
    id: "loyalty-points",
    name: "Loyalty Points",
    version: "1.4.2",
    author: "acme-labs",
    license: "MIT",
    enabled: true,
    installed: true,
    sandbox: "running",
    permissions: ["party.read (maskeli)", "loyalty_ledger.write", "event: order.completed"],
  },
  {
    id: "review-badges",
    name: "Review Badges",
    version: "0.9.0",
    author: "community",
    license: "MIT",
    enabled: false,
    installed: true,
    sandbox: "stopped",
    permissions: ["listing.read", "surface: listing-default extend"],
  },
  {
    id: "fraud-guard",
    name: "Fraud Guard",
    version: "2.1.0",
    author: "thirdparty.io",
    license: "Ticari",
    enabled: true,
    installed: true,
    sandbox: "blocked",
    permissions: ["order.read"],
    note: "Beyan dışı erişim girişimi: ten_party doğrudan okuma — sandbox engelledi, modül karantinada.",
  },
];

export const REGISTRY: Array<Pick<ModuleManifest, "id" | "name" | "version" | "author" | "license"> & { downloads: number }> = [
  { id: "seo-meta", name: "SEO Meta", version: "3.0.1", author: "community", license: "MIT", downloads: 12840 },
  { id: "invoice-tr", name: "e-Fatura TR", version: "1.2.0", author: "fintech-tr", license: "Ticari", downloads: 4210 },
  { id: "ai-descriptions", name: "AI Descriptions", version: "0.5.0", author: "acme-labs", license: "MIT", downloads: 980 },
];

/** PermissionMatrix verisi — iki düzlem (E1): entitlement satırı kilitli. */
export const ROLES = ["admin", "developer", "agent (MCP)"] as const;
export const ACTIONS = ["read", "write", "execute", "configure"] as const;
export const MATRIX: Record<string, Record<string, boolean>> = {
  admin: { read: true, write: true, execute: true, configure: true },
  developer: { read: true, write: true, execute: true, configure: false },
  "agent (MCP)": { read: true, write: false, execute: true, configure: false },
};
