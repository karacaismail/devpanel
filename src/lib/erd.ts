/**
 * ERD türetme — Ahmet'in forge-dev-panel erd.ts kavramı, bizim ArcheTypeDef
 * tipine uyarlandı. Tanım tek doğruluk kaynağı: ERD, ref(...) alanlarından
 * türetilir; elle çizilmez. Kırık ilişki (hedefsiz ref) tespit edilir.
 */
import type { ArcheTypeDef, ArcheTypeField } from "./types";

export interface ErdField {
  name: string;
  type: string;
  isKey: boolean;
  isRelation: boolean;
  relationTarget?: string;
  pii: boolean;
}

export interface ErdNode {
  id: string;
  label: string;
  scope: "kernel" | "app";
  fields: ErdField[];
  hasBrokenRelation: boolean;
}

export interface ErdEdge {
  id: string;
  from: string;
  to?: string;
  field: string;
  target: string;
  broken: boolean;
}

export interface Erd {
  nodes: ErdNode[];
  edges: ErdEdge[];
}

const REF_RE = /^ref\((\w+)\)$/;

function toErdField(f: ArcheTypeField): ErdField {
  const m = REF_RE.exec(f.type);
  return {
    name: f.name,
    type: f.type,
    isKey: Boolean(f.required),
    isRelation: m !== null,
    relationTarget: m?.[1],
    pii: Boolean(f.pii),
  };
}

export function buildErd(archetypes: ArcheTypeDef[]): Erd {
  const ids = new Set(archetypes.map((a) => a.id));
  const edges: ErdEdge[] = [];

  for (const a of archetypes) {
    for (const f of a.fields) {
      const m = REF_RE.exec(f.type);
      if (!m) continue;
      const target = m[1];
      const broken = !ids.has(target);
      edges.push({
        id: `${a.id}.${f.name}->${target}`,
        from: a.id,
        to: broken ? undefined : target,
        field: f.name,
        target,
        broken,
      });
    }
  }

  const brokenSources = new Set(edges.filter((e) => e.broken).map((e) => e.from));

  const nodes: ErdNode[] = archetypes.map((a) => ({
    id: a.id,
    label: a.name,
    scope: a.scope,
    fields: a.fields.map(toErdField),
    hasBrokenRelation: brokenSources.has(a.id),
  }));

  return { nodes, edges };
}
