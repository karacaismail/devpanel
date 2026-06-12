import type { SchemaDiff } from "../lib/diff";
import { migrationSteps } from "../lib/diff";

/** §5 — SchemaDiffViewer: alan ekle/sil/değiş renk kodlu; migration özeti altta. */
export function SchemaDiffViewer({ diff }: { diff: SchemaDiff }) {
  return (
    <div className="rounded-md border border-line bg-bg p-3 font-mono text-sm">
      {diff.added.map((f) => (
        <div key={`a-${f.name}`} className="text-ok">
          + {f.name}: {f.type}
          {f.required ? " (required)" : ""}
          {f.pii ? " [pii]" : ""}
        </div>
      ))}
      {diff.changed.map((c) => (
        <div key={`c-${c.name}`} className="text-warn">
          ~ {c.name}: {c.before.type}
          {c.before.required ? " required" : ""} → {c.after.type}
          {c.after.required ? " required" : " nullable"}
        </div>
      ))}
      {diff.removed.map((f) => (
        <div key={`r-${f.name}`} className="text-danger">
          - {f.name}: {f.type}
        </div>
      ))}

      <div className="mt-3 border-t border-line pt-2 text-xs text-mute">
        Üretilecek migration:
        {migrationSteps(diff).map((s, i) => (
          <div key={i} className="mt-1 text-ink/80">
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}
