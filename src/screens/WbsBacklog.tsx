import { useMemo, useState } from "react";
import { CheckCircle, Circle, Sparkle, Warning } from "@phosphor-icons/react";
import { WBS_TREE, totalSp, validatePlan, type WbsNode } from "../lib/wbs";
import { getLevel, parseCommand, checkNeighborhood } from "../lib/granularity";
import { LevelBadge } from "../components/LevelBadge";
import { EquivalencePanel } from "../components/EquivalencePanel";

function Node({ node, depth = 0 }: { node: WbsNode; depth?: number }) {
  return (
    <>
      <li
        className="flex flex-wrap items-center gap-2 rounded border border-line bg-panel px-3 py-1.5 text-sm"
        style={{ marginLeft: depth * 20 }}
      >
        {node.done ? (
          <CheckCircle size={15} className="text-ok" aria-label="tamam" />
        ) : (
          <Circle size={15} className="text-mute" aria-label="bekliyor" />
        )}
        <span className="text-ink">{node.name}</span>
        <LevelBadge level={getLevel(node.level)} />
        <span className="ml-auto font-mono text-xs text-mute">Σ {totalSp(node)} SP</span>
      </li>
      {(node.children ?? []).map((c) => (
        <Node key={c.id} node={c} depth={depth + 1} />
      ))}
    </>
  );
}

/** P10 — WBS/Backlog: tanımlardan türeyen SP kırılımı + komşuluk denetleyicisi + "AI'a tarif et". */
export function WbsBacklog() {
  const violations = useMemo(() => validatePlan(WBS_TREE), []);
  const [aiInput, setAiInput] = useState("");
  const parsed = parseCommand(aiInput);
  const aiCheck = parsed
    ? checkNeighborhood(getLevel("kaya"), parsed.level)
    : null;

  return (
    <div>
      <header className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="text-lg text-ink">WBS / Backlog</h1>
        <span className="font-mono text-sm text-mute">toplam Σ {totalSp(WBS_TREE)} SP</span>
        {violations.length === 0 ? (
          <span className="flex items-center gap-1 text-xs text-ok">
            <CheckCircle size={14} /> komşuluk denetimi temiz — plan kaydedilebilir
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs text-danger">
            <Warning size={14} /> {violations.length} ihlal — plan kaydedilemez
          </span>
        )}
      </header>

      <ul className="flex flex-col gap-1.5">
        <Node node={WBS_TREE} />
      </ul>

      <section className="mt-5 rounded-md border border-line bg-panel p-3">
        <h2 className="mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wide text-mute">
          <Sparkle size={14} className="text-accent" /> AI'a tarif et (bağlam: sales — Domain/Kaya)
        </h2>
        <input
          aria-label="AI'a tarif et"
          value={aiInput}
          onChange={(e) => setAiInput(e.target.value)}
          placeholder='"payment büyük taş yap" — komşuluk denetiminden geçer'
          className="w-full rounded border border-line bg-elev px-2 py-1.5 font-mono text-sm text-ink placeholder:text-mute/50"
        />
        {parsed && aiCheck && (
          <p className={`mt-2 text-sm ${aiCheck.ok ? "text-ok" : "text-danger"}`}>
            {aiCheck.ok
              ? `Plan önerisi: sales altına "${parsed.name}" — ${getLevel(parsed.level.id).ad} (${parsed.level.metafor} · ${parsed.level.sp} SP). Scaffold testi İLK üretir.`
              : aiCheck.message}
          </p>
        )}
      </section>

      <EquivalencePanel action={{ tool: "wbs.read", args: { app: "marketplace" } }} />
    </div>
  );
}
