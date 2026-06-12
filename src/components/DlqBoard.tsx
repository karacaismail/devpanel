import { useState } from "react";
import { ArrowClockwise, CheckCircle } from "@phosphor-icons/react";
import { DLQ_ITEMS, type DlqItem } from "../data/ops";
import { logAction } from "../lib/audit";

/** §5 — DlqBoard: tek tık yeniden işle; nedeni ve yaşı görünür. */
export function DlqBoard() {
  const [items, setItems] = useState<DlqItem[]>(DLQ_ITEMS);
  const [done, setDone] = useState<string[]>([]);

  const retry = (id: string) => {
    const item = items.find((i) => i.id === id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setDone((prev) => [...prev, id]);
    if (item) {
      logAction(
        { tool: "dlq.retry", args: { id: item.id } },
        `${item.event} yeniden kuyruğa alındı`,
      );
    }
  };

  return (
    <div>
      {items.length === 0 ? (
        <p className="flex items-center gap-2 rounded-md border border-ok/40 bg-ok/10 p-3 text-sm text-ok">
          <CheckCircle size={16} /> DLQ boş — tüm event'ler işlendi.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((i) => (
            <li
              key={i.id}
              className="flex flex-wrap items-center gap-2 rounded-md border border-line bg-panel px-3 py-2 text-sm"
            >
              <code className="font-mono text-ink">{i.event}</code>
              <span className="text-mute">→ {i.consumer}</span>
              <span className="rounded border border-warn/50 px-1.5 py-0.5 text-xs text-warn">
                {i.reason}
              </span>
              <span className="text-xs text-mute">
                yaş: {i.age} · deneme: {i.attempts}
              </span>
              <button
                type="button"
                onClick={() => retry(i.id)}
                className="ml-auto flex items-center gap-1 rounded border border-line px-2 py-1 text-xs text-mute hover:text-ink"
              >
                <ArrowClockwise size={13} /> yeniden işle
              </button>
            </li>
          ))}
        </ul>
      )}
      {done.length > 0 && items.length > 0 && (
        <p className="mt-2 text-xs text-ok">
          {done.length} event yeniden kuyruğa alındı.
        </p>
      )}
    </div>
  );
}
