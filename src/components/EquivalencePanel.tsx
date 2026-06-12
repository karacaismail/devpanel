import { Copy, Terminal, Robot } from "@phosphor-icons/react";
import type { PanelAction } from "../lib/types";
import { toCli, toMcp } from "../lib/cli";

function copy(text: string) {
  void navigator.clipboard?.writeText(text).catch(() => {});
}

/**
 * AI-first ilke #1: her panel ekranı/aksiyonu CLI ve MCP eşdeğerini
 * görünür üretir — "Copy as CLI / as MCP call".
 */
export function EquivalencePanel({ action }: { action: PanelAction }) {
  const cli = toCli(action);
  const mcp = toMcp(action);
  return (
    <section
      aria-label="CLI / MCP eşdeğeri"
      className="mt-4 rounded-md border border-line bg-panel p-3 text-sm"
    >
      <div className="mb-2 flex items-center gap-2 text-mute text-xs uppercase tracking-wide">
        Bu ekranın agent eşdeğeri
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <Terminal size={16} className="mt-0.5 shrink-0 text-accent" />
          <code className="grow break-all font-mono text-ink">{cli}</code>
          <button
            type="button"
            onClick={() => copy(cli)}
            className="shrink-0 rounded border border-line px-1.5 py-0.5 text-xs text-mute hover:text-ink"
            aria-label="CLI olarak kopyala"
          >
            <Copy size={14} />
          </button>
        </div>
        <details>
          <summary className="flex cursor-pointer items-center gap-2 text-mute">
            <Robot size={16} className="text-accent" /> MCP çağrısı
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                copy(mcp);
              }}
              className="ml-auto rounded border border-line px-1.5 py-0.5 text-xs hover:text-ink"
              aria-label="MCP çağrısı olarak kopyala"
            >
              <Copy size={14} />
            </button>
          </summary>
          <pre className="mt-2 overflow-auto rounded bg-bg p-2 font-mono text-xs text-mute">
            {mcp}
          </pre>
        </details>
      </div>
    </section>
  );
}
