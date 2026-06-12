import { useMemo } from "react";
import { Terminal, Bot, Copy } from "lucide-react";
import type { PageDef } from "./types";
import { REGISTRY, Icon } from "./registry";
import { interpolateDeep } from "./interpolate";
import { evaluate } from "./conditions";
import { runRules, hasAction } from "./rules";
import { RULES } from "./loader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useContextStore, toEvalContext } from "@/store/context-store";

const LIFECYCLE_TONE = { Draft: "secondary", Staged: "warning", Released: "success" } as const;

/** JSON aksiyonu → CLI/MCP eşdeğeri (Atonota ilkesi: UI=CLI=API). */
function cliString(tool: string, args: Record<string, unknown> = {}) {
  const flags = Object.entries(args)
    .map(([k, v]) => (typeof v === "boolean" ? (v ? `--${k}` : "") : `--${k} ${String(v)}`))
    .filter(Boolean)
    .join(" ");
  return `sdk ${tool.replace(/\./g, " ")}${flags ? " " + flags : ""}`;
}

/**
 * Engine — bir PageDef JSON'unu React'e çevirir:
 *  1) bağlam ile interpolasyon (regex token),
 *  2) ECA kurallarını değerlendirir (prod kilidi vb.),
 *  3) `when` koşulunu geçen bölümleri registry üzerinden render eder.
 * JSON değişince (Vite HMR) ya da bağlam değişince otomatik yeniden render.
 */
export function Engine({ page }: { page: PageDef }) {
  const ctxState = useContextStore();
  const ctx = useMemo(() => toEvalContext(ctxState), [ctxState]);
  const fired = useMemo(() => runRules(RULES, ctx), [ctx]);
  const locked = hasAction(fired, "lock", "destructive");

  const resolved = useMemo(() => interpolateDeep(page, ctx), [page, ctx]);
  const sections = resolved.sections.filter((s) => evaluate(s.when, ctx));

  return (
    <div className="space-y-6">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <Icon name={resolved.icon} className="h-6 w-6 text-primary" />
            {resolved.title}
          </h1>
          {resolved.lifecycle && (
            <Badge variant={LIFECYCLE_TONE[resolved.lifecycle]} className="ml-auto">{resolved.lifecycle}</Badge>
          )}
          <Badge variant="outline" className="font-mono text-[10px]">{ctx.org} · {ctx.env}</Badge>
        </div>
        {resolved.description && <p className="mt-1 text-sm text-muted">{resolved.description}</p>}
      </header>

      {locked && (
        <div className="flex items-center gap-2 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
          <Icon name="ShieldAlert" className="h-4 w-4" />
          Production bağlamı — yıkıcı eylemler ECA kuralı ({fired.find((f) => f.action === "lock")?.ruleId}) ile kilitli.
        </div>
      )}

      {sections.map((section, i) => {
        const Comp = REGISTRY[section.type];
        if (!Comp) {
          return (
            <Card key={i}>
              <CardContent className="p-4 text-xs text-warn">
                Bilinmeyen bölüm tipi: <code className="font-mono">{section.type}</code> — registry&apos;ye ekleyin.
              </CardContent>
            </Card>
          );
        }
        return <Comp key={i} section={section} />;
      })}

      {resolved.cli && <CliEquivalent tool={resolved.cli.tool} args={resolved.cli.args} />}
    </div>
  );
}

function CliEquivalent({ tool, args }: { tool: string; args?: Record<string, unknown> }) {
  const cli = cliString(tool, args);
  const mcp = JSON.stringify({ tool, arguments: args ?? {} }, null, 2);
  return (
    <Card className="border-border/80 bg-background">
      <CardContent className="p-4">
        <p className="mb-2 text-[11px] uppercase tracking-wider text-muted">Bu ekranın agent eşdeğeri</p>
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 shrink-0 text-primary" />
          <code className="grow break-all font-mono text-xs">{cli}</code>
          <button type="button" aria-label="CLI kopyala" onClick={() => void navigator.clipboard?.writeText(cli).catch(() => {})} className="rounded-md border border-border p-1.5 text-muted hover:text-foreground">
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
        <details className="mt-2">
          <summary className="flex cursor-pointer items-center gap-2 text-xs text-muted"><Bot className="h-3.5 w-3.5 text-primary" /> MCP çağrısı</summary>
          <pre className="mt-2 overflow-auto rounded-lg bg-elevated p-3 font-mono text-[11px] text-muted">{mcp}</pre>
        </details>
      </CardContent>
    </Card>
  );
}
