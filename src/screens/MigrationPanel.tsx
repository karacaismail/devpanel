import { useState } from "react";
import { ArrowCounterClockwise, CheckCircle } from "@phosphor-icons/react";
import { diffSchemas } from "../lib/diff";
import { MIGRATION_QUEUE, type MigrationItem } from "../data/ops";
import { SchemaDiffViewer } from "../components/SchemaDiffViewer";
import { ConfirmDanger } from "../components/ConfirmDanger";
import { EquivalencePanel } from "../components/EquivalencePanel";
import { logAction } from "../lib/audit";

const BEFORE = [
  { name: "display_name", type: "string", required: true },
  { name: "email", type: "email", required: true, pii: true },
  { name: "phone", type: "phone", required: true, pii: true },
  { name: "legacy_code", type: "string" },
];
const AFTER = [
  { name: "display_name", type: "string", required: true },
  { name: "email", type: "email", required: true, pii: true },
  { name: "phone", type: "phone", required: false, pii: true },
  { name: "loyalty_tier", type: "string" },
];

/** P8 — Migration Paneli: diff → önizleme, LLM-review kuyruğu, uygula/geri al (d02). */
export function MigrationPanel() {
  const [queue, setQueue] = useState<MigrationItem[]>(MIGRATION_QUEUE);
  const [applying, setApplying] = useState<MigrationItem | null>(null);
  const diff = diffSchemas(BEFORE, AFTER);

  const apply = (id: string) => {
    setQueue((prev) => prev.map((m) => (m.id === id ? { ...m, status: "uygulandı" } : m)));
    logAction({ tool: "migration.apply", args: { id } }, `${id} migration uygulandı`);
  };
  const rollback = (id: string) => {
    setQueue((prev) => prev.map((m) => (m.id === id ? { ...m, status: "geri-alındı" } : m)));
    logAction({ tool: "migration.rollback", args: { id } }, `${id} geri alındı`, { tone: "danger" });
  };

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-lg text-ink">Migration Paneli</h1>
        <p className="text-sm text-mute">
          ArcheType diff'inden üretilen migration önizlemesi. LLM-review etiketi
          öneridir, karar değildir (d02).
        </p>
      </header>

      <h2 className="mb-2 text-xs uppercase tracking-wide text-mute">
        q-7: party diff önizlemesi
      </h2>
      <SchemaDiffViewer diff={diff} />

      <h2 className="mb-2 mt-5 text-xs uppercase tracking-wide text-mute">
        Kuyruk
      </h2>
      <ul className="flex flex-col gap-2">
        {queue.map((m) => (
          <li key={m.id} className="flex flex-wrap items-center gap-2 rounded-md border border-line bg-panel px-3 py-2 text-sm">
            <code className="font-mono text-accent">{m.id}</code>
            <span className="font-mono text-xs text-mute">{m.archetype}</span>
            <span className="text-ink">{m.summary}</span>
            {m.llmReview !== "—" && (
              <span className="rounded border border-warn/50 px-1.5 py-0.5 text-xs text-warn" title="öneri ≠ karar (d02)">
                LLM-review: {m.llmReview}
              </span>
            )}
            <span className="ml-auto flex items-center gap-1.5">
              {m.status === "kuyrukta" ? (
                <button
                  type="button"
                  onClick={() => setApplying(m)}
                  className="rounded bg-accent px-2.5 py-1 text-xs text-accent-ink"
                >
                  uygula
                </button>
              ) : m.status === "uygulandı" ? (
                <>
                  <span className="flex items-center gap-1 text-xs text-ok">
                    <CheckCircle size={13} /> uygulandı
                  </span>
                  <button
                    type="button"
                    onClick={() => rollback(m.id)}
                    className="flex items-center gap-1 rounded border border-line px-2 py-1 text-xs text-mute hover:text-ink"
                  >
                    <ArrowCounterClockwise size={13} /> geri al
                  </button>
                </>
              ) : (
                <span className="text-xs text-warn">geri alındı</span>
              )}
            </span>
          </li>
        ))}
      </ul>

      <ConfirmDanger
        open={applying !== null}
        onOpenChange={(o) => !o && setApplying(null)}
        name={applying?.id ?? ""}
        title={`Migration uygula: ${applying?.id ?? ""}`}
        description="Şema değişikliği tenant verisine dokunur; soft-drop GUARD'ları aktif."
        onConfirm={() => applying && apply(applying.id)}
      />

      <EquivalencePanel action={{ tool: "migration.apply", args: { id: "q-7", "dry-run": true } }} />
    </div>
  );
}
