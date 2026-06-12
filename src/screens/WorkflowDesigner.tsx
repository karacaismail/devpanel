import { useMemo, useState } from "react";
import { FlowArrow, PushPin, Trash } from "@phosphor-icons/react";
import {
  LISTING_FLOW,
  missingCompensations,
  pinnedVersion,
  validateNewTransition,
  type WfTransition,
  type WorkflowDef,
} from "../lib/workflow";
import { WorkflowCanvas, type EdgeRef, type Pos } from "../components/WorkflowCanvas";
import { CompensationWarning } from "../components/WorkflowGraph";
import { ConfirmDanger } from "../components/ConfirmDanger";
import { EquivalencePanel } from "../components/EquivalencePanel";
import { LevelBadge } from "../components/LevelBadge";
import { getLevel } from "../lib/granularity";
import { logAction } from "../lib/audit";

const DEFAULT_POS: Record<string, Pos> = {
  draft: { x: 30, y: 180 },
  review: { x: 240, y: 60 },
  active: { x: 450, y: 180 },
  sold: { x: 680, y: 90 },
  archived: { x: 680, y: 280 },
};

/**
 * P3 — Workflow Designer (Figma-sınıfı tuval).
 * Tüm düzenlemeler tanım kurallarından geçer: izinsiz/duplicate/telafisiz
 * geçiş çizilemez; eksik telafi tanım kaydını kilitler (layer1-workflow).
 */
export function WorkflowDesigner() {
  const [wf, setWf] = useState<WorkflowDef>({
    ...LISTING_FLOW,
    transitions: [...LISTING_FLOW.transitions],
  });
  const [positions, setPositions] = useState<Record<string, Pos>>(DEFAULT_POS);
  const [selectedEdge, setSelectedEdge] = useState<EdgeRef | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [pending, setPending] = useState<EdgeRef | null>(null);
  const [newRole, setNewRole] = useState("");
  const [newComp, setNewComp] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [editComp, setEditComp] = useState("");
  const [deleting, setDeleting] = useState<EdgeRef | null>(null);

  const missing = useMemo(() => missingCompensations(wf), [wf]);
  const edge: WfTransition | undefined = selectedEdge
    ? wf.transitions.find((t) => t.from === selectedEdge.from && t.to === selectedEdge.to)
    : undefined;

  const selectEdge = (e: EdgeRef) => {
    const t = wf.transitions.find((x) => x.from === e.from && x.to === e.to);
    setSelectedEdge(e);
    setSelectedNode(null);
    setPending(null);
    setEditComp(t?.compensation ?? "");
    setFormError(null);
  };

  const nodeClick = (s: string) => {
    if (connectFrom && connectFrom !== s) {
      setPending({ from: connectFrom, to: s });
      setConnectFrom(null);
      setSelectedEdge(null);
      setSelectedNode(null);
      setNewRole("");
      setNewComp("");
      setFormError(null);
      return;
    }
    setSelectedNode(s);
    setSelectedEdge(null);
    setPending(null);
  };

  const portClick = (s: string) => {
    setConnectFrom((prev) => (prev === s ? null : s));
    setPending(null);
  };

  const addPending = () => {
    if (!pending) return;
    const t: WfTransition = {
      from: pending.from,
      to: pending.to,
      role: newRole.trim() || "",
      compensation: newComp.trim() || null,
    };
    const v = validateNewTransition(wf, { ...t, role: t.role || "developer", compensation: t.compensation ?? "" });
    if (!v.ok) {
      setFormError(v.message ?? "geçersiz geçiş");
      return;
    }
    const final: WfTransition = { ...t, role: t.role || "developer" };
    setWf((prev) => ({ ...prev, transitions: [...prev.transitions, final] }));
    logAction(
      { tool: "workflow.transition.add", args: { id: wf.id, from: t.from, to: t.to } },
      `${wf.id}: ${t.from} → ${t.to} geçişi çizildi (telafili)`,
    );
    setPending(null);
    selectEdge({ from: t.from, to: t.to });
  };

  const applyCompensation = () => {
    if (!edge || !editComp.trim()) return;
    setWf((prev) => ({
      ...prev,
      transitions: prev.transitions.map((t) =>
        t.from === edge.from && t.to === edge.to ? { ...t, compensation: editComp.trim() } : t,
      ),
    }));
    logAction(
      { tool: "workflow.transition.update", args: { id: wf.id, from: edge.from, to: edge.to } },
      `${edge.from} → ${edge.to} telafisi tanımlandı`,
    );
  };

  const deleteEdge = () => {
    if (!deleting) return;
    setWf((prev) => ({
      ...prev,
      transitions: prev.transitions.filter((t) => !(t.from === deleting.from && t.to === deleting.to)),
    }));
    logAction(
      { tool: "workflow.transition.remove", args: { id: wf.id, from: deleting.from, to: deleting.to } },
      `${deleting.from} → ${deleting.to} geçişi silindi`,
      { tone: "danger" },
    );
    setSelectedEdge(null);
    setDeleting(null);
  };

  return (
    <div>
      <header className="mb-3 flex flex-wrap items-center gap-2">
        <h1 className="flex items-center gap-2 text-lg text-ink">
          <FlowArrow size={18} className="text-accent" /> {wf.id}
        </h1>
        <LevelBadge level={getLevel("orta-tas")} />
        <label className="ml-auto flex items-center gap-2 text-xs text-mute">
          sürüm
          <select defaultValue={wf.version} className="rounded border border-line bg-elev px-1.5 py-1 text-ink">
            {[1, 2, 3].map((v) => (
              <option key={v} value={v}>v{v}{v === wf.version ? " (güncel)" : ""}</option>
            ))}
          </select>
        </label>
        <span className="flex items-center gap-1 rounded border border-warn/50 px-2 py-0.5 text-xs text-warn">
          <PushPin size={11} /> acme → v{pinnedVersion(wf, "acme")} pinli
        </span>
      </header>

      <CompensationWarning items={missing} />

      <div className="mt-3 grid gap-4 xl:grid-cols-[1fr_19rem]">
        <div>
          <WorkflowCanvas
            wf={wf}
            positions={positions}
            onMove={(s, p) => setPositions((prev) => ({ ...prev, [s]: p }))}
            selectedEdge={selectedEdge}
            selectedNode={selectedNode}
            onEdgeClick={selectEdge}
            onNodeClick={nodeClick}
            connectFrom={connectFrom}
            onPortClick={portClick}
          />
          <p className="mt-1.5 text-xs text-mute/70">
            Boşluğu sürükle: pan · tekerlek: zoom · düğümü sürükle: taşı · sağdaki
            porta tıkla → hedef düğüm: geçiş çiz. İzinsiz geçiş çizilemez.
          </p>
        </div>

        <aside role="complementary" className="rounded-md border border-line bg-panel p-3 text-sm">
          {pending ? (
            <>
              <h2 className="mb-2 text-xs uppercase tracking-wide text-mute">Yeni geçiş</h2>
              <p className="mb-3 font-mono text-ink">
                {pending.from} → {pending.to}
              </p>
              <label className="mb-2 flex flex-col gap-1 text-xs text-mute">
                rol
                <input
                  aria-label="yeni rol"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  placeholder="moderator"
                  className="rounded border border-line bg-elev px-2 py-1.5 text-sm text-ink placeholder:text-mute/50"
                />
              </label>
              <label className="mb-2 flex flex-col gap-1 text-xs text-mute">
                telafi — zorunlu
                <input
                  aria-label="yeni telafi"
                  value={newComp}
                  onChange={(e) => setNewComp(e.target.value)}
                  placeholder="geri al (compensation)"
                  className="rounded border border-line bg-elev px-2 py-1.5 text-sm text-ink placeholder:text-mute/50"
                />
              </label>
              {formError && (
                <p role="alert" className="mb-2 text-xs text-danger">{formError}</p>
              )}
              <div className="flex gap-2">
                <button type="button" onClick={addPending} className="rounded bg-accent px-3 py-1.5 text-sm text-accent-ink">
                  Geçişi ekle
                </button>
                <button type="button" onClick={() => setPending(null)} className="rounded border border-line px-3 py-1.5 text-sm text-mute hover:text-ink">
                  Vazgeç
                </button>
              </div>
            </>
          ) : edge ? (
            <>
              <h2 className="mb-2 text-xs uppercase tracking-wide text-mute">Geçiş</h2>
              <p className="mb-1 font-mono text-ink">
                {edge.from} → {edge.to}
              </p>
              <dl className="mb-3 grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 text-xs">
                <dt className="text-mute">rol</dt>
                <dd className="text-ink">{edge.role}</dd>
                <dt className="text-mute">telafi</dt>
                <dd className={edge.compensation ? "text-ink" : "text-danger"}>
                  {edge.compensation ?? "TANIMSIZ — kayıt kilitli"}
                </dd>
              </dl>
              <label className="mb-2 flex flex-col gap-1 text-xs text-mute">
                telafi düzenle
                <input
                  aria-label="telafi düzenle"
                  value={editComp}
                  onChange={(e) => setEditComp(e.target.value)}
                  placeholder="örn. satışı iptal et"
                  className="rounded border border-line bg-elev px-2 py-1.5 text-sm text-ink placeholder:text-mute/50"
                />
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={applyCompensation}
                  disabled={!editComp.trim()}
                  className="rounded bg-accent px-3 py-1.5 text-sm text-accent-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Uygula
                </button>
                <button
                  type="button"
                  onClick={() => setDeleting({ from: edge.from, to: edge.to })}
                  className="flex items-center gap-1 rounded border border-danger/40 px-3 py-1.5 text-sm text-danger"
                >
                  <Trash size={13} /> Geçişi sil
                </button>
              </div>
            </>
          ) : selectedNode ? (
            <>
              <h2 className="mb-2 text-xs uppercase tracking-wide text-mute">Durum</h2>
              <p className="mb-2 font-mono text-ink">{selectedNode}</p>
              <dl className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 text-xs">
                <dt className="text-mute">gelen</dt>
                <dd className="text-ink">
                  {wf.transitions.filter((t) => t.to === selectedNode).map((t) => t.from).join(", ") || "—"}
                </dd>
                <dt className="text-mute">giden</dt>
                <dd className="text-ink">
                  {wf.transitions.filter((t) => t.from === selectedNode).map((t) => t.to).join(", ") || "—"}
                </dd>
              </dl>
              <p className="mt-3 text-xs text-mute">
                Yeni geçiş için düğümün sağındaki porta tıkla.
              </p>
            </>
          ) : (
            <>
              <h2 className="mb-2 text-xs uppercase tracking-wide text-mute">Inspector</h2>
              <p className="text-xs text-mute">
                Bir düğüme ya da kenara tıkla. Geçiş çizmek için kaynak düğümün
                <span className="text-accent"> portuna</span> tıklayıp hedef düğümü seç.
                Telafi (compensation) her geçişte zorunludur.
              </p>
            </>
          )}
        </aside>
      </div>

      <ConfirmDanger
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
        name={deleting ? `${deleting.from}-${deleting.to}` : ""}
        title="Geçişi sil"
        description="Bu geçişi kullanan kayıtlar bir sonraki migration'da denetlenir."
        onConfirm={deleteEdge}
      />

      <EquivalencePanel
        action={{ tool: "workflow.read", args: { id: wf.id, version: wf.version } }}
      />
    </div>
  );
}
