import { useState } from "react";
import * as Switch from "@radix-ui/react-switch";
import { PaperPlaneTilt, PlugsConnected } from "@phosphor-icons/react";
import { WEBHOOKS, maskSecret } from "../data/integrations";
import { EquivalencePanel } from "../components/EquivalencePanel";
import { logAction } from "../lib/audit";

/** Webhooks — event aboneliği + teslimat geçmişi (Ahmet birleştirmesi). */
export function Webhooks() {
  const [hooks, setHooks] = useState(WEBHOOKS);

  const toggle = (id: string) => {
    const h = hooks.find((x) => x.id === id);
    setHooks((prev) => prev.map((x) => (x.id === id ? { ...x, active: !x.active } : x)));
    if (h) {
      logAction(
        { tool: h.active ? "webhook.disable" : "webhook.enable", args: { id } },
        `${id} webhook'u ${h.active ? "kapatıldı" : "açıldı"}`,
      );
    }
  };

  const testSend = (id: string) =>
    logAction({ tool: "webhook.test", args: { id } }, `${id} → test event gönderildi (imzalı)`);

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-lg text-ink">Webhooks</h1>
        <p className="text-sm text-mute">
          Event Kataloğu'ndaki event'lere dış sistem aboneliği. İmza anahtarı
          maskelidir; teslimat başarısızlıkları DLQ'ya düşer.
        </p>
      </header>

      <ul className="flex flex-col gap-3">
        {hooks.map((h) => (
          <li key={h.id} className="rounded-md border border-line bg-panel p-3">
            <div className="flex flex-wrap items-center gap-2">
              <PlugsConnected size={15} className="text-accent" />
              <h2 className="text-sm text-ink">{h.id}</h2>
              <code className="font-mono text-xs text-mute">{h.url}</code>
              <span className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => testSend(h.id)}
                  className="flex items-center gap-1 rounded border border-line px-2 py-1 text-xs text-mute hover:text-ink"
                >
                  <PaperPlaneTilt size={12} /> test gönder
                </button>
                <Switch.Root
                  checked={h.active}
                  onCheckedChange={() => toggle(h.id)}
                  aria-label={`${h.id} aktif`}
                  className="h-5 w-9 rounded-full border border-line bg-elev data-[state=checked]:bg-accent"
                >
                  <Switch.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-ink transition-transform data-[state=checked]:translate-x-4 data-[state=checked]:bg-accent-ink" />
                </Switch.Root>
              </span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
              {h.events.map((e) => (
                <code key={e} className="rounded border border-accent/40 px-1.5 py-0.5 font-mono text-accent">
                  {e}
                </code>
              ))}
              <span className="text-mute">imza: <code className="font-mono">{maskSecret(h.secret)}</code></span>
            </div>

            <div className="mt-2 flex items-center gap-1.5 text-xs text-mute">
              son teslimatlar:
              {h.deliveries.map((d, i) => (
                <span
                  key={i}
                  title={`${d.at} → HTTP ${d.code}`}
                  className={`inline-block h-2.5 w-2.5 rounded-full ${d.code < 400 ? "bg-ok" : "bg-danger"}`}
                />
              ))}
              <span>
                {h.deliveries.filter((d) => d.code < 400).length}/{h.deliveries.length} başarılı
              </span>
            </div>
          </li>
        ))}
      </ul>

      <EquivalencePanel action={{ tool: "webhook.list", args: { app: "marketplace" } }} />
    </div>
  );
}
