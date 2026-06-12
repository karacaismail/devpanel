import * as Tabs from "@radix-ui/react-tabs";
import { LogStream } from "../components/LogStream";
import { DlqBoard } from "../components/DlqBoard";
import { MAIL_PROVIDERS } from "../data/ops";
import { EquivalencePanel } from "../components/EquivalencePanel";

/** P11 — Observability: structured log, outbox/DLQ, mail zinciri sağlığı (E2). */
export function Observability() {
  return (
    <div>
      <header className="mb-4">
        <h1 className="text-lg text-ink">Observability</h1>
        <p className="text-sm text-mute">
          Kernel iç durumu — kullanım telemetrisi değil (ADR-0006); trace_id/tenant filtreli structured log.
        </p>
      </header>

      <Tabs.Root defaultValue="logs">
        <Tabs.List className="mb-3 flex gap-1 border-b border-line">
          {[
            ["logs", "Log akışı"],
            ["dlq", "Outbox / DLQ"],
            ["mail", "Mail zinciri"],
          ].map(([v, l]) => (
            <Tabs.Trigger
              key={v}
              value={v}
              className="px-3 py-1.5 text-sm text-mute data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:text-ink"
            >
              {l}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        <Tabs.Content value="logs">
          <LogStream />
        </Tabs.Content>

        <Tabs.Content value="dlq">
          <DlqBoard />
        </Tabs.Content>

        <Tabs.Content value="mail">
          <ul className="flex flex-col gap-2">
            {MAIL_PROVIDERS.map((p) => (
              <li key={p.name} className="rounded-md border border-line bg-panel px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <code className="font-mono text-ink">{p.name}</code>
                  <span className="ml-auto text-xs text-mute">
                    {p.sent.toLocaleString("tr")} gönderim ·{" "}
                    <span className={p.success >= 99 ? "text-ok" : "text-warn"}>
                      %{p.success}
                    </span>
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded bg-elev">
                  <div
                    className={p.success >= 99 ? "h-full bg-ok" : "h-full bg-warn"}
                    style={{ width: `${p.success}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-mute">
            Sağlayıcı başarı oranı eşiğin altına düşerse zincir bir sonrakine geçer (be-mail-zinciri).
          </p>
        </Tabs.Content>
      </Tabs.Root>

      <EquivalencePanel
        action={{ tool: "logs.tail", args: { tenant: "acme", level: "warn", follow: true } }}
      />
    </div>
  );
}
