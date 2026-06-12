import { useState } from "react";
import { Broadcast } from "@phosphor-icons/react";
import { EVENTS } from "../data/releases";
import { YamlView } from "../components/YamlView";
import { EquivalencePanel } from "../components/EquivalencePanel";

/** Event Kataloğu — kim yayınlar, kim dinler, payload şeması (kontratın event yüzü). */
export function EventCatalog() {
  const [selected, setSelected] = useState(EVENTS[0].name);
  const ev = EVENTS.find((e) => e.name === selected) ?? EVENTS[0];

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-lg text-ink">Event Kataloğu</h1>
        <p className="text-sm text-mute">
          Outbox'tan yayınlanan event'ler — payload şeması sözleşmedir; kırıcı
          değişiklik yeni versiyon açar, eski tüketiciye köprü kurulur.
        </p>
      </header>

      <div className="flex flex-col gap-4 lg:flex-row">
        <aside className="shrink-0 lg:w-72">
          <ul className="flex gap-1 overflow-auto lg:flex-col">
            {EVENTS.map((e) => (
              <li key={e.name}>
                <button
                  type="button"
                  onClick={() => setSelected(e.name)}
                  className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm ${
                    e.name === ev.name ? "bg-elev text-ink" : "text-mute hover:bg-panel"
                  }`}
                >
                  <Broadcast size={14} className={e.name === ev.name ? "text-accent" : ""} />
                  <span className="font-mono">{e.name}</span>
                  <span className="rounded border border-line px-1 text-xs">v{e.version}</span>
                  <span className="ml-auto text-xs text-mute">{e.ratePerHour}/sa</span>
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="min-w-0 grow">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
            <code className="font-mono text-ink">{ev.name} v{ev.version}</code>
            <span className="text-mute">üreten:</span>
            <code className="rounded border border-line px-1.5 py-0.5 font-mono text-xs text-ink">{ev.producer}</code>
            <span className="text-mute">aboneler:</span>
            {ev.subscribers.map((s) => (
              <code key={s} className="rounded border border-accent/40 px-1.5 py-0.5 font-mono text-xs text-accent">
                {s}
              </code>
            ))}
          </div>
          <h2 className="mb-1.5 text-xs uppercase tracking-wide text-mute">payload şeması</h2>
          <YamlView value={ev.payload} />
        </div>
      </div>

      <EquivalencePanel action={{ tool: "event.list", args: { app: "marketplace" } }} />
    </div>
  );
}
