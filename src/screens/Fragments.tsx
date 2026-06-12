import { useState } from "react";
import { PuzzlePiece } from "@phosphor-icons/react";
import { FRAGMENTS } from "../data/tenants";
import { getLevel } from "../lib/granularity";
import { LevelBadge } from "../components/LevelBadge";
import { YamlView } from "../components/YamlView";
import { EquivalencePanel } from "../components/EquivalencePanel";

/** Fragment Kitaplığı (P1 alt-editörü) — yeniden kullanılabilir alan grupları. */
export function Fragments() {
  const [selectedId, setSelectedId] = useState(FRAGMENTS[0].id);
  const frag = FRAGMENTS.find((f) => f.id === selectedId) ?? FRAGMENTS[0];

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-lg text-ink">Fragment Kitaplığı</h1>
        <p className="text-sm text-mute">
          Yeniden kullanılabilir alan grupları — bayraklar (pii vb.) fragment'tan
          ArcheType'a miras kalır, kullanan tarafta kaldırılamaz.
        </p>
      </header>

      <div className="flex flex-col gap-4 lg:flex-row">
        <aside className="shrink-0 lg:w-64">
          <ul className="flex gap-1 overflow-auto lg:flex-col">
            {FRAGMENTS.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(f.id)}
                  className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm ${
                    f.id === frag.id ? "bg-elev text-ink" : "text-mute hover:bg-panel"
                  }`}
                >
                  <PuzzlePiece size={14} className={f.id === frag.id ? "text-accent" : ""} />
                  {f.name}
                  <span className="ml-auto text-xs text-mute">{f.usedBy.length} kullanım</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="min-w-0 grow">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <h2 className="font-mono text-ink">{frag.name}</h2>
            <LevelBadge level={getLevel("kucuk-tas")} />
            <span className="text-xs text-mute">kullananlar:</span>
            {frag.usedBy.map((u) => (
              <code key={u} className="rounded border border-line px-1.5 py-0.5 font-mono text-xs text-accent">
                {u}
              </code>
            ))}
          </div>

          <div className="mb-3 flex flex-wrap gap-1.5">
            {frag.fields.map((f) => (
              <span key={f} className="rounded border border-line bg-panel px-2 py-0.5 font-mono text-xs text-ink">
                {f}
              </span>
            ))}
          </div>

          <YamlView value={frag.yaml} />
        </div>
      </div>

      <EquivalencePanel action={{ tool: "fragment.list", args: { app: "marketplace" } }} />
    </div>
  );
}
