"use client";

import { Terminal, Bot, Copy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

/**
 * AI-first ilke (devpanel.md): her ekranın CLI ve MCP eşdeğeri görünür —
 * panel, agent'ın yapabildiklerinin insan-görünümüdür.
 */
export function CliEquivalent({
  tool,
  args,
}: {
  tool: string;
  args: Record<string, string | number | boolean>;
}) {
  const cli = `sdk ${tool.replace(/^sdk\./, "").split(".").join(" ")} ${Object.entries(args)
    .map(([k, v]) => (typeof v === "boolean" ? (v ? `--${k}` : "") : `--${k} ${v}`))
    .filter(Boolean)
    .join(" ")}`.trim();
  const mcp = JSON.stringify({ tool, arguments: args }, null, 2);

  return (
    <Card className="mt-6 border-neutral-800/80 bg-neutral-950">
      <CardContent className="p-4">
        <p className="mb-2 text-[11px] uppercase tracking-wider text-neutral-500">
          Bu ekranın agent eşdeğeri
        </p>
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 shrink-0 text-indigo-400" />
          <code className="grow break-all font-mono text-xs text-neutral-200">{cli}</code>
          <button
            type="button"
            aria-label="CLI olarak kopyala"
            onClick={() => void navigator.clipboard?.writeText(cli).catch(() => {})}
            className="rounded-md border border-neutral-800 p-1.5 text-neutral-500 hover:text-neutral-200"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
        <details className="mt-2">
          <summary className="flex cursor-pointer items-center gap-2 text-xs text-neutral-500 hover:text-neutral-300">
            <Bot className="h-3.5 w-3.5 text-indigo-400" /> MCP çağrısı
          </summary>
          <pre className="mt-2 overflow-auto rounded-lg bg-neutral-900 p-3 font-mono text-[11px] text-neutral-400">
            {mcp}
          </pre>
        </details>
      </CardContent>
    </Card>
  );
}
