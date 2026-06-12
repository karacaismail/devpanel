import { useState } from "react";
import { Warning } from "@phosphor-icons/react";
import type { WfTransition, WorkflowDef } from "../lib/workflow";

const POS: Record<string, { x: number; y: number }> = {
  draft: { x: 70, y: 120 },
  review: { x: 230, y: 60 },
  active: { x: 390, y: 120 },
  sold: { x: 550, y: 60 },
  archived: { x: 550, y: 180 },
};

/**
 * §5 — WorkflowGraph: geçişler tanımdan; izinsiz geçiş çizilemez.
 * Telafi eksik geçişler kırmızı kesikli çizilir.
 */
export function WorkflowGraph({
  wf,
  onSelect,
}: {
  wf: WorkflowDef;
  onSelect: (t: WfTransition | null) => void;
}) {
  const [selected, setSelected] = useState<WfTransition | null>(null);

  const pick = (t: WfTransition) => {
    const next = selected === t ? null : t;
    setSelected(next);
    onSelect(next);
  };

  return (
    <svg
      viewBox="0 0 640 240"
      role="img"
      aria-label={`${wf.id} durum makinesi`}
      className="w-full rounded-md border border-line bg-bg"
    >
      <defs>
        <marker id="arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" fill="var(--color-mute)" />
        </marker>
        <marker id="arrow-danger" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0,0 L8,4 L0,8 z" fill="var(--color-danger)" />
        </marker>
      </defs>

      {wf.transitions.map((t) => {
        const a = POS[t.from];
        const b = POS[t.to];
        if (!a || !b) return null;
        const danger = t.compensation === null;
        const isSel = selected === t;
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2 - 18;
        return (
          <g
            key={`${t.from}-${t.to}`}
            onClick={() => pick(t)}
            className="cursor-pointer"
          >
            <path
              d={`M ${a.x + 38} ${a.y} Q ${mx} ${my} ${b.x - 38} ${b.y}`}
              fill="none"
              stroke={danger ? "var(--color-danger)" : isSel ? "var(--color-accent)" : "var(--color-line)"}
              strokeWidth={isSel ? 2.5 : 1.5}
              strokeDasharray={danger ? "5 4" : undefined}
              markerEnd={`url(#${danger ? "arrow-danger" : "arrow"})`}
            />
            <text
              x={mx}
              y={my - 4}
              textAnchor="middle"
              fontSize="10"
              fill={danger ? "var(--color-danger)" : "var(--color-mute)"}
              className="select-none"
            >
              {t.role}
              {danger ? " ⚠ telafi yok" : ""}
            </text>
          </g>
        );
      })}

      {wf.states.map((s) => {
        const p = POS[s];
        if (!p) return null;
        return (
          <g key={s}>
            <rect
              x={p.x - 38}
              y={p.y - 16}
              width={76}
              height={32}
              rx={6}
              fill="var(--color-panel)"
              stroke="var(--color-line)"
            />
            <text
              x={p.x}
              y={p.y + 4}
              textAnchor="middle"
              fontSize="12"
              fill="var(--color-ink)"
              className="select-none"
            >
              {s}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function CompensationWarning({ items }: { items: WfTransition[] }) {
  if (items.length === 0) return null;
  return (
    <div
      role="alert"
      className="mt-3 flex items-start gap-2 rounded-md border border-danger/50 bg-danger/10 p-3 text-sm text-danger"
    >
      <Warning size={18} className="mt-0.5 shrink-0" />
      <div>
        Telafi (compensation) zorunlu — eksik geçişler:{" "}
        {items.map((t) => `${t.from} → ${t.to}`).join(", ")}. Bu tanım{" "}
        <strong>kaydedilemez</strong> (layer1-workflow).
      </div>
    </div>
  );
}
