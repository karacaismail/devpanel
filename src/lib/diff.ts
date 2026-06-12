/** P8 — ArcheType şema diff'i → migration önizleme (d02). */

export interface FieldSpec {
  name: string;
  type: string;
  required?: boolean;
  pii?: boolean;
}

export interface FieldChange {
  name: string;
  before: FieldSpec;
  after: FieldSpec;
}

export interface SchemaDiff {
  added: FieldSpec[];
  removed: FieldSpec[];
  changed: FieldChange[];
}

export function diffSchemas(before: FieldSpec[], after: FieldSpec[]): SchemaDiff {
  const bMap = new Map(before.map((f) => [f.name, f]));
  const aMap = new Map(after.map((f) => [f.name, f]));
  const added = after.filter((f) => !bMap.has(f.name));
  const removed = before.filter((f) => !aMap.has(f.name));
  const changed: FieldChange[] = [];
  for (const f of after) {
    const prev = bMap.get(f.name);
    if (
      prev &&
      (prev.type !== f.type ||
        Boolean(prev.required) !== Boolean(f.required) ||
        Boolean(prev.pii) !== Boolean(f.pii))
    ) {
      changed.push({ name: f.name, before: prev, after: f });
    }
  }
  return { added, removed, changed };
}

/**
 * Üretilecek migration özeti. Sıra sözleşmesi:
 * 1) ekleme (güvenli) 2) değişiklik 3) silme — en sonda ve GUARD'lı
 * (geri alınabilirlik; d02: LLM önerisi ≠ karar).
 */
export function migrationSteps(diff: SchemaDiff): string[] {
  const steps: string[] = [];
  for (const f of diff.added) {
    steps.push(
      `ALTER TABLE ten_x ADD COLUMN ${f.name} ${f.type.toUpperCase()}${f.required ? " NOT NULL DEFAULT ''" : ""};`,
    );
  }
  for (const c of diff.changed) {
    if (Boolean(c.before.required) && !c.after.required) {
      steps.push(`ALTER TABLE ten_x ALTER COLUMN ${c.name} DROP NOT NULL;`);
    } else {
      steps.push(`-- ${c.name}: ${JSON.stringify(c.before)} → ${JSON.stringify(c.after)}`);
    }
  }
  for (const f of diff.removed) {
    steps.push(
      `-- GUARD: ${f.name} 30 gün soft-drop (rename _deprecated_${f.name}); kalıcı DROP ayrı onay ister.`,
    );
  }
  return steps;
}
