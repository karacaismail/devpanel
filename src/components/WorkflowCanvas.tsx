import { useEffect, useRef, useState } from "react";
import { ArrowsIn, CornersOut, Minus, Plus } from "@phosphor-icons/react";
import type { WfTransition, WorkflowDef } from "../lib/workflow";

export interface Pos {
  x: number;
  y: number;
}

export type EdgeRef = { from: string; to: string };

const NODE_W = 132;
const NODE_H = 46;
const MIN_K = 0.25;
const MAX_K = 2.5;

interface CanvasProps {
  wf: WorkflowDef;
  positions: Record<string, Pos>;
  onMove: (state: string, pos: Pos) => void;
  selectedEdge: EdgeRef | null;
  selectedNode: string | null;
  onEdgeClick: (e: EdgeRef) => void;
  onNodeClick: (s: string) => void;
  connectFrom: string | null;
  onPortClick: (s: string) => void;
}

interface View {
  x: number;
  y: number;
  k: number;
}

function edgeAnchors(a: Pos, b: Pos, biDir: boolean, fromBefore: boolean) {
  const rightGoing = b.x >= a.x + NODE_W - 8;
  const off = biDir ? (fromBefore ? -11 : 11) : 0;
  const sy = a.y + NODE_H / 2 + off;
  const ey = b.y + NODE_H / 2 + off;
  if (rightGoing) {
    const sx = a.x + NODE_W;
    const ex = b.x;
    const cp = Math.max(48, (ex - sx) / 2);
    return { sx, sy, ex, ey, c1x: sx + cp, c2x: ex - cp };
  }
  const sx = a.x;
  const ex = b.x + NODE_W;
  const cp = Math.max(48, (sx - ex) / 2);
  return { sx, sy, ex, ey, c1x: sx - cp, c2x: ex + cp };
}

/**
 * Figma-sınıfı workflow tuvali — sahiplenilmiş SVG:
 * pan (boşluğu sürükle) · zoom (tekerlek, imleç-merkezli) · düğüm sürükleme ·
 * port'tan tıkla-bağla · bezier kenarlar · minimap. Bağımlılık yok.
 */
export function WorkflowCanvas({
  wf,
  positions,
  onMove,
  selectedEdge,
  selectedNode,
  onEdgeClick,
  onNodeClick,
  connectFrom,
  onPortClick,
}: CanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [view, setView] = useState<View>({ x: 40, y: 30, k: 1 });
  const drag = useRef<
    | { kind: "pan"; sx: number; sy: number; ox: number; oy: number }
    | { kind: "node"; id: string; sx: number; sy: number; ox: number; oy: number }
    | null
  >(null);

  /* İmleç-merkezli zoom — React onWheel pasif olduğundan native listener. */
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = svg.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      setView((v) => {
        const k = Math.min(MAX_K, Math.max(MIN_K, v.k * (1 - e.deltaY * 0.0012)));
        const f = k / v.k;
        return { k, x: cx - (cx - v.x) * f, y: cy - (cy - v.y) * f };
      });
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as Element).getAttribute("data-bg") !== null) {
      drag.current = { kind: "pan", sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y };
      svgRef.current?.setPointerCapture(e.pointerId);
    }
  };

  const startNodeDrag = (id: string) => (e: React.PointerEvent) => {
    e.stopPropagation();
    const p = positions[id];
    drag.current = { kind: "node", id, sx: e.clientX, sy: e.clientY, ox: p.x, oy: p.y };
    svgRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (d.kind === "pan") {
      setView((v) => ({ ...v, x: d.ox + (e.clientX - d.sx), y: d.oy + (e.clientY - d.sy) }));
    } else {
      onMove(d.id, {
        x: d.ox + (e.clientX - d.sx) / view.k,
        y: d.oy + (e.clientY - d.sy) / view.k,
      });
    }
  };

  const endDrag = () => {
    drag.current = null;
  };

  const zoomBy = (f: number) =>
    setView((v) => {
      const rect = svgRef.current?.getBoundingClientRect();
      const cx = (rect?.width ?? 800) / 2;
      const cy = (rect?.height ?? 480) / 2;
      const k = Math.min(MAX_K, Math.max(MIN_K, v.k * f));
      const ff = k / v.k;
      return { k, x: cx - (cx - v.x) * ff, y: cy - (cy - v.y) * ff };
    });

  const fit = () => {
    const xs = Object.values(positions);
    if (xs.length === 0) return;
    const minX = Math.min(...xs.map((p) => p.x)) - 50;
    const minY = Math.min(...xs.map((p) => p.y)) - 50;
    const maxX = Math.max(...xs.map((p) => p.x)) + NODE_W + 50;
    const maxY = Math.max(...xs.map((p) => p.y)) + NODE_H + 50;
    const rect = svgRef.current?.getBoundingClientRect();
    const w = rect?.width || 800;
    const h = rect?.height || 480;
    const k = Math.min(MAX_K, Math.max(MIN_K, Math.min(w / (maxX - minX), h / (maxY - minY))));
    setView({ k, x: (w - (maxX + minX) * k) / 2, y: (h - (maxY + minY) * k) / 2 });
  };

  const inDegree = (s: string) => wf.transitions.filter((t) => t.to === s).length;
  const outDegree = (s: string) => wf.transitions.filter((t) => t.from === s).length;

  /* Minimap geometrisi */
  const xs = Object.values(positions);
  const wMinX = Math.min(...xs.map((p) => p.x)) - 40;
  const wMinY = Math.min(...xs.map((p) => p.y)) - 40;
  const wMaxX = Math.max(...xs.map((p) => p.x)) + NODE_W + 40;
  const wMaxY = Math.max(...xs.map((p) => p.y)) + NODE_H + 40;
  const mmScale = Math.min(132 / (wMaxX - wMinX), 76 / (wMaxY - wMinY));

  return (
    <div className="relative overflow-hidden rounded-lg border border-line bg-bg">
      <svg
        ref={svgRef}
        role="application"
        aria-label={`${wf.id} durum makinesi tuvali`}
        className="block h-[480px] w-full touch-none select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        <defs>
          <pattern id="dotgrid" width={24} height={24} patternUnits="userSpaceOnUse">
            <circle cx={1.2} cy={1.2} r={1.2} fill="var(--color-line)" opacity={0.55} />
          </pattern>
          <marker id="wf-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--color-mute)" />
          </marker>
          <marker id="wf-arrow-accent" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--color-accent)" />
          </marker>
          <marker id="wf-arrow-danger" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--color-danger)" />
          </marker>
        </defs>

        <g transform={`translate(${view.x},${view.y}) scale(${view.k})`}>
          <rect data-bg x={-8000} y={-8000} width={16000} height={16000} fill="url(#dotgrid)" />

          {/* Kenarlar */}
          {wf.transitions.map((t) => {
            const a = positions[t.from];
            const b = positions[t.to];
            if (!a || !b) return null;
            const biDir = wf.transitions.some((o) => o.from === t.to && o.to === t.from);
            const g = edgeAnchors(a, b, biDir, t.from < t.to);
            const danger = t.compensation === null;
            const isSel = selectedEdge?.from === t.from && selectedEdge?.to === t.to;
            const stroke = danger
              ? "var(--color-danger)"
              : isSel
                ? "var(--color-accent)"
                : "var(--color-mute)";
            const marker = danger ? "wf-arrow-danger" : isSel ? "wf-arrow-accent" : "wf-arrow";
            const d = `M ${g.sx} ${g.sy} C ${g.c1x} ${g.sy}, ${g.c2x} ${g.ey}, ${g.ex} ${g.ey}`;
            const mx = (g.sx + 3 * g.c1x + 3 * g.c2x + g.ex) / 8;
            const my = (g.sy + 3 * g.sy + 3 * g.ey + g.ey) / 8;
            return (
              <g
                key={`${t.from}->${t.to}`}
                role="button"
                tabIndex={0}
                aria-label={`geçiş: ${t.from} → ${t.to}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdgeClick({ from: t.from, to: t.to });
                }}
                className="cursor-pointer"
              >
                <path d={d} fill="none" stroke="transparent" strokeWidth={16} />
                <path
                  d={d}
                  fill="none"
                  stroke={stroke}
                  strokeWidth={isSel ? 2.4 : 1.6}
                  strokeDasharray={danger ? "6 5" : undefined}
                  markerEnd={`url(#${marker})`}
                  opacity={isSel || danger ? 1 : 0.8}
                />
                <text
                  x={mx}
                  y={my - 7}
                  textAnchor="middle"
                  fontSize={10.5}
                  fill={danger ? "var(--color-danger)" : isSel ? "var(--color-accent)" : "var(--color-mute)"}
                  stroke="var(--color-bg)"
                  strokeWidth={3.5}
                  paintOrder="stroke"
                  className="select-none"
                >
                  {t.role}
                  {danger ? "  ⚠ telafi yok" : ""}
                </text>
              </g>
            );
          })}

          {/* Düğümler */}
          {wf.states.map((s) => {
            const p = positions[s];
            if (!p) return null;
            const isSel = selectedNode === s;
            const isConnSrc = connectFrom === s;
            const isConnTarget = connectFrom !== null && connectFrom !== s;
            const initial = inDegree(s) === 0;
            const terminal = outDegree(s) === 0;
            return (
              <g key={s} transform={`translate(${p.x},${p.y})`}>
                <g
                  role="button"
                  tabIndex={0}
                  aria-label={`durum: ${s}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onNodeClick(s);
                  }}
                  onPointerDown={startNodeDrag(s)}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <rect
                    width={NODE_W}
                    height={NODE_H}
                    rx={9}
                    fill="var(--color-panel)"
                    stroke={
                      isSel
                        ? "var(--color-accent)"
                        : isConnTarget
                          ? "var(--color-accent)"
                          : "var(--color-line)"
                    }
                    strokeWidth={isSel ? 2 : 1.2}
                    strokeDasharray={isConnTarget && !isSel ? "5 4" : undefined}
                  />
                  <rect width={3.5} height={NODE_H} rx={1.75} fill={initial ? "var(--color-ok)" : terminal ? "var(--color-kernel)" : "var(--color-accent)"} opacity={0.9} />
                  <text x={14} y={20} fontSize={12.5} fill="var(--color-ink)" className="select-none">
                    {s}
                  </text>
                  <text x={14} y={35} fontSize={9} fill="var(--color-mute)" className="select-none">
                    {initial ? "başlangıç" : terminal ? "uç durum" : `${inDegree(s)} gelen · ${outDegree(s)} giden`}
                  </text>
                </g>
                <circle
                  role="button"
                  aria-label={`bağlantı başlat: ${s}`}
                  cx={NODE_W}
                  cy={NODE_H / 2}
                  r={5.5}
                  fill={isConnSrc ? "var(--color-accent)" : "var(--color-elev)"}
                  stroke="var(--color-accent)"
                  strokeWidth={1.4}
                  className="cursor-crosshair"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPortClick(s);
                  }}
                />
              </g>
            );
          })}
        </g>
      </svg>

      {/* Zoom kontrolleri */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-md border border-line bg-panel/90 p-1 backdrop-blur">
        <button type="button" aria-label="uzaklaştır" onClick={() => zoomBy(1 / 1.25)} className="rounded p-1.5 text-mute hover:text-ink">
          <Minus size={13} />
        </button>
        <button
          type="button"
          aria-label="%100"
          onClick={() => setView({ x: 40, y: 30, k: 1 })}
          className="min-w-12 rounded px-1 py-0.5 text-center font-mono text-xs text-mute hover:text-ink"
        >
          {Math.round(view.k * 100)}%
        </button>
        <button type="button" aria-label="yakınlaştır" onClick={() => zoomBy(1.25)} className="rounded p-1.5 text-mute hover:text-ink">
          <Plus size={13} />
        </button>
        <button type="button" aria-label="sığdır" onClick={fit} className="rounded p-1.5 text-mute hover:text-ink">
          <CornersOut size={13} />
        </button>
      </div>

      {connectFrom && (
        <div className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full border border-accent/50 bg-panel/90 px-3 py-1 text-xs text-accent backdrop-blur">
          <ArrowsIn size={12} className="mr-1 inline" />
          bağlantı modu: <span className="font-mono">{connectFrom}</span> → hedef düğüme tıkla
        </div>
      )}

      {/* Minimap */}
      <svg
        aria-hidden
        className="absolute bottom-3 right-3 h-[76px] w-[132px] rounded border border-line bg-panel/90 backdrop-blur"
      >
        {wf.states.map((s) => {
          const p = positions[s];
          if (!p) return null;
          return (
            <rect
              key={s}
              x={(p.x - wMinX) * mmScale}
              y={(p.y - wMinY) * mmScale}
              width={NODE_W * mmScale}
              height={NODE_H * mmScale}
              rx={1.5}
              fill={selectedNode === s ? "var(--color-accent)" : "var(--color-mute)"}
              opacity={0.8}
            />
          );
        })}
      </svg>
    </div>
  );
}
