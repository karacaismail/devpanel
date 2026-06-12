import { useMemo, useState } from "react";
import { Warning } from "@phosphor-icons/react";
import { ARCHETYPES } from "../data/archetypes";
import { buildErd, type ErdNode } from "../lib/erd";
import { ScopeBadge } from "../components/LevelBadge";
import { EquivalencePanel } from "../components/EquivalencePanel";

const NODE_W = 210;
const ROW_H = 17;
const HEAD_H = 30;

/** ERD — şema ilişki haritası: ref(...) alanlarından TÜRETİLİR, elle çizilmez. */
export function Erd() {
  const erd = useMemo(() => buildErd(ARCHETYPES), []);
  const [selected, setSelected] = useState<string | null>(null);

  /* Basit yatay yerleşim — düğüm başına sabit sütun. */
  const pos: Record<string, { x: number; y: number }> = {};
  erd.nodes.forEach((n, i) => {
    pos[n.id] = { x: 30 + i * (NODE_W + 110), y: 36 + (i % 2) * 24 };
  });

  const nodeH = (n: ErdNode) => HEAD_H + n.fields.length * ROW_H + 8;
  const fieldY = (n: ErdNode, field: string) =>
    HEAD_H + n.fields.findIndex((f) => f.name === field) * ROW_H + ROW_H / 2;

  const broken = erd.edges.filter((e) => e.broken);
  const sel = erd.nodes.find((n) => n.id === selected);

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-lg text-ink">ERD — Şema Haritası</h1>
        <p className="text-sm text-mute">
          İlişkiler tanımdaki <code className="font-mono">ref(...)</code> alanlarından
          türetilir; bu diyagram düzenlenmez, tanım düzenlenir.
        </p>
      </header>

      {broken.length > 0 && (
        <div role="alert" className="mb-3 flex items-start gap-2 rounded-md border border-danger/50 bg-danger/10 p-3 text-sm text-danger">
          <Warning size={18} className="mt-0.5 shrink-0" />
          {broken.length} kırık ilişki: {broken.map((b) => `${b.from}.${b.field} → ${b.target}?`).join(", ")}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1fr_17rem]">
        <svg
          role="img"
          aria-label="şema ilişki diyagramı"
          viewBox="0 0 720 300"
          className="w-full rounded-lg border border-line bg-bg"
        >
          {/* Kenarlar — alan satırından hedef düğüme */}
          {erd.edges.map((e) => {
            const a = pos[e.from];
            const bNode = e.to ? erd.nodes.find((n) => n.id === e.to) : undefined;
            const b = e.to ? pos[e.to] : undefined;
            const an = erd.nodes.find((n) => n.id === e.from);
            if (!a || !an) return null;
            const sy = a.y + fieldY(an, e.field);
            const sx = b && b.x < a.x ? a.x : a.x + NODE_W;
            const ex = b ? (b.x < a.x ? b.x + NODE_W : b.x) : sx + 60;
            const ey = b && bNode ? b.y + HEAD_H / 2 + nodeH(bNode) / 4 : sy;
            const dir = b && b.x < a.x ? -1 : 1;
            const d = `M ${sx} ${sy} C ${sx + 55 * dir} ${sy}, ${ex - 55 * dir} ${ey}, ${ex} ${ey}`;
            return (
              <g key={e.id}>
                <path
                  d={d}
                  fill="none"
                  stroke={e.broken ? "var(--color-danger)" : "var(--color-accent)"}
                  strokeWidth={1.6}
                  strokeDasharray={e.broken ? "6 5" : undefined}
                  opacity={0.85}
                />
                <text
                  x={(sx + ex) / 2}
                  y={(sy + ey) / 2 - 6}
                  textAnchor="middle"
                  fontSize={10.5}
                  fill={e.broken ? "var(--color-danger)" : "var(--color-accent)"}
                  stroke="var(--color-bg)"
                  strokeWidth={3}
                  paintOrder="stroke"
                >
                  {e.field}
                </text>
                <circle cx={sx} cy={sy} r={3} fill="var(--color-accent)" />
              </g>
            );
          })}

          {/* Düğümler */}
          {erd.nodes.map((n) => {
            const p = pos[n.id];
            const h = nodeH(n);
            const isSel = selected === n.id;
            return (
              <g
                key={n.id}
                transform={`translate(${p.x},${p.y})`}
                role="button"
                tabIndex={0}
                aria-label={`düğüm: ${n.id}`}
                onClick={() => setSelected(isSel ? null : n.id)}
                className="cursor-pointer"
              >
                <rect
                  width={NODE_W}
                  height={h}
                  rx={9}
                  fill="var(--color-panel)"
                  stroke={n.hasBrokenRelation ? "var(--color-danger)" : isSel ? "var(--color-accent)" : "var(--color-line)"}
                  strokeWidth={isSel ? 2 : 1.2}
                />
                <text x={12} y={20} fontSize={12.5} fill="var(--color-ink)">
                  {n.label}
                </text>
                <text x={NODE_W - 12} y={20} fontSize={9} textAnchor="end" fill={n.scope === "kernel" ? "var(--color-kernel)" : "var(--color-mute)"}>
                  {n.scope}
                </text>
                <line x1={0} y1={HEAD_H - 4} x2={NODE_W} y2={HEAD_H - 4} stroke="var(--color-line)" />
                {n.fields.map((f, i) => (
                  <g key={f.name} transform={`translate(0,${HEAD_H + i * ROW_H})`}>
                    <text x={12} y={11} fontSize={10} fill={f.isRelation ? "var(--color-accent)" : "var(--color-ink)"} fontFamily="var(--font-mono)">
                      {f.isKey ? "◆ " : "  "}{f.name}
                    </text>
                    <text x={NODE_W - 12} y={11} fontSize={9} textAnchor="end" fill={f.pii ? "var(--color-pii)" : "var(--color-mute)"}>
                      {f.pii ? "pii" : f.type.length > 18 ? f.type.slice(0, 17) + "…" : f.type}
                    </text>
                  </g>
                ))}
              </g>
            );
          })}

          {/* Lejant */}
          <g transform="translate(30, 270)" fontSize={9.5} fill="var(--color-mute)">
            <text x={0} y={0}>◆ zorunlu</text>
            <text x={70} y={0} fill="var(--color-accent)">mavi: ref alanı</text>
            <text x={185} y={0} fill="var(--color-pii)">pii: maskeli alan</text>
            <text x={310} y={0} fill="var(--color-danger)">kesikli: kırık ilişki</text>
          </g>
        </svg>

        <aside className="rounded-md border border-line bg-panel p-3 text-sm">
          <h2 className="mb-2 text-xs uppercase tracking-wide text-mute">Inspector</h2>
          {sel ? (
            <>
              <div className="mb-2 flex items-center gap-2">
                <span className="font-mono text-ink">{sel.id}</span>
                <ScopeBadge scope={sel.scope} />
              </div>
              <ul className="flex flex-col gap-1 text-xs">
                {sel.fields.map((f) => (
                  <li key={f.name} className="flex items-center gap-2 rounded bg-elev px-2 py-1">
                    <code className="font-mono text-ink">{f.name}</code>
                    <span className="ml-auto text-mute">{f.type}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-mute">
                Alan eklemek için ArcheType Studio → Alanlar.
              </p>
            </>
          ) : (
            <p className="text-xs text-mute">Bir düğüme tıkla — alanları ve ilişkileri burada açılır.</p>
          )}
        </aside>
      </div>

      <EquivalencePanel action={{ tool: "erd.read", args: { app: "marketplace" } }} />
    </div>
  );
}
