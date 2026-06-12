import type { GranularityLevel } from "../lib/types";
import { formatBadge } from "../lib/granularity";

/** Granülerlik rozeti — her iş öğesi bu rozetle gezer (ilke #4). */
export function LevelBadge({ level }: { level: GranularityLevel }) {
  return (
    <span className="inline-flex items-center rounded border border-line bg-elev px-2 py-0.5 text-xs text-accent whitespace-nowrap">
      {formatBadge(level)}
    </span>
  );
}

export function ScopeBadge({ scope }: { scope: "kernel" | "app" }) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs border ${
        scope === "kernel"
          ? "border-kernel text-kernel"
          : "border-line text-mute"
      }`}
    >
      {scope}
    </span>
  );
}
