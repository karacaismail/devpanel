/** P3 — Workflow durum makinesi (layer1-workflow, sus-versioning). */

export interface WfTransition {
  from: string;
  to: string;
  role: string;
  /** Telafi zorunlu alan — null ise sözleşme ihlali olarak raporlanır. */
  compensation: string | null;
}

export interface WorkflowDef {
  id: string;
  version: number;
  states: string[];
  transitions: WfTransition[];
  /** tenant → pinli sürüm */
  tenantPins: Record<string, number>;
}

export const LISTING_FLOW: WorkflowDef = {
  id: "listing-flow",
  version: 3,
  states: ["draft", "review", "active", "sold", "archived"],
  transitions: [
    { from: "draft", to: "review", role: "author", compensation: "geri çek (review → draft)" },
    { from: "review", to: "active", role: "moderator", compensation: "yayından kaldır (active → review)" },
    { from: "review", to: "draft", role: "moderator", compensation: "yeniden gönder (draft → review)" },
    // telafi eksik — kırmızı raporlanmalı, kaydedilemez:
    { from: "active", to: "sold", role: "system", compensation: null },
    { from: "active", to: "archived", role: "owner", compensation: "geri yükle (archived → active)" },
  ],
  tenantPins: { acme: 2 },
};

/** Yalnız tanımlı geçişler — izinsiz geçiş çizilemez (§5 WorkflowGraph). */
export function canTransition(wf: WorkflowDef, from: string, to: string): boolean {
  return wf.transitions.some((t) => t.from === from && t.to === to);
}

/** Telafi alanı boş geçişler — sözleşme ihlali listesi. */
export function missingCompensations(wf: WorkflowDef): WfTransition[] {
  return wf.transitions.filter((t) => t.compensation === null);
}

/** Tenant pinli sürüm; pin yoksa güncel. */
export function pinnedVersion(wf: WorkflowDef, tenant: string): number {
  return wf.tenantPins[tenant] ?? wf.version;
}

export interface TransitionValidation {
  ok: boolean;
  message?: string;
}

/**
 * Yeni geçiş validasyonu — UI bu kurallardan geçmeyen geçişi ÇİZEMEZ:
 * tanımlı durumlar, self-loop yok, duplicate yok, telafi zorunlu.
 */
export function validateNewTransition(
  wf: WorkflowDef,
  t: WfTransition,
): TransitionValidation {
  if (!wf.states.includes(t.from) || !wf.states.includes(t.to)) {
    return { ok: false, message: "Tanımsız durum — geçiş yalnız tanımlı durumlar arasında çizilebilir." };
  }
  if (t.from === t.to) {
    return { ok: false, message: "Self-loop çizilemez." };
  }
  if (canTransition(wf, t.from, t.to)) {
    return { ok: false, message: `${t.from} → ${t.to} zaten tanımlı.` };
  }
  if (!t.compensation || !t.compensation.trim()) {
    return { ok: false, message: "Telafi (compensation) zorunlu alandır (layer1-workflow)." };
  }
  return { ok: true };
}
