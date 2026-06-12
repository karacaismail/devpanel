/** Granülerlik seviyeleri — ADR-0008 Rev.2: yeni ad önde, metafor parantezde. */
export type LevelId =
  | "dag"
  | "kaya"
  | "buyuk-tas"
  | "orta-tas"
  | "kucuk-tas"
  | "cakil";

export interface GranularityLevel {
  id: LevelId;
  /** Yeni ad (önde gösterilir) */
  ad: string;
  /** Metafor (parantezde gösterilir) */
  metafor: string;
  /** Story point */
  sp: number;
  /** 0 = en büyük (Dağ). Komşuluk kuralı rank üzerinden işler. */
  rank: number;
}

export interface ArcheTypeFlags {
  pii: boolean;
  bitemporal: boolean;
  /** ISO-8601 süre, ör. "P5Y" */
  retention: string | null;
  audit: boolean;
}

export interface ArcheTypeField {
  name: string;
  type: string;
  required?: boolean;
  pii?: boolean;
  /** Tenant-scoped custom field (E8) — core şemada değil */
  custom?: boolean;
}

export interface ArcheTypeDef {
  id: string;
  name: string;
  scope: "kernel" | "app";
  flags: ArcheTypeFlags;
  fields: ArcheTypeField[];
  yaml: string;
  derived: {
    table: string;
    graphql: string[];
    rest: string[];
    surface: string;
    mcpTool: string;
    tests: string[];
  };
}

export interface SurfaceFieldDef {
  field: string;
  label: string;
  visible: boolean;
  widget: string;
}

export interface SurfaceDef {
  id: string;
  archetype: string;
  headless: boolean;
  fields: SurfaceFieldDef[];
  editionOverrides: Record<string, { hidden?: string[]; readonly?: string[] }>;
  yaml: string;
}

/** Panel aksiyonu → CLI/MCP eşdeğeri (AI-first ilke #1) */
export interface PanelAction {
  tool: string;
  args: Record<string, string | number | boolean>;
}

export interface ScaffoldFile {
  path: string;
  kind: "test" | "definition" | "fixture";
  content: string;
}

export interface ScaffoldPreview {
  ok: boolean;
  /** Komşuluk ihlalinde dolu */
  violation?: string;
  name?: string;
  level?: GranularityLevel;
  /** Test dosyası HER ZAMAN ilk sırada (test-önce, be-sdk) */
  files: ScaffoldFile[];
  action?: PanelAction;
}
