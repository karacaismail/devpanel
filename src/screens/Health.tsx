import { CheckCircle, Warning, XCircle } from "@phosphor-icons/react";
import { SERVICES, type ServiceHealth } from "../data/integrations";
import { EquivalencePanel } from "../components/EquivalencePanel";

const TONE: Record<ServiceHealth["status"], { cls: string; Icon: typeof CheckCircle }> = {
  ok: { cls: "text-ok", Icon: CheckCircle },
  degraded: { cls: "text-warn", Icon: Warning },
  down: { cls: "text-danger", Icon: XCircle },
};

/** Health — servis sağlık panosu (Ahmet birleştirmesi). Telemetri değil, kernel iç durumu. */
export function Health() {
  const degraded = SERVICES.filter((s) => s.status !== "ok").length;
  return (
    <div>
      <header className="mb-4 flex flex-wrap items-center gap-2">
        <h1 className="text-lg text-ink">Health</h1>
        {degraded === 0 ? (
          <span className="text-xs text-ok">tüm servisler sağlıklı</span>
        ) : (
          <span className="text-xs text-warn">{degraded} servis dikkat istiyor</span>
        )}
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => {
          const { cls, Icon } = TONE[s.status];
          return (
            <article key={s.id} className="rounded-md border border-line bg-panel p-3">
              <div className="flex items-center gap-2">
                <Icon size={16} className={cls} />
                <h2 className="text-sm text-ink">{s.name}</h2>
                <span className={`ml-auto text-xs ${cls}`}>{s.status}</span>
              </div>
              <p className="mt-1.5 text-xs text-mute">{s.detail}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-mute">
                <span>gecikme: {s.latency}</span>
                <span className="ml-auto">30g uptime: %{s.uptime}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded bg-elev">
                <div
                  className={`h-full ${s.status === "ok" ? "bg-ok" : s.status === "degraded" ? "bg-warn" : "bg-danger"}`}
                  style={{ width: `${s.uptime}%` }}
                />
              </div>
            </article>
          );
        })}
      </div>

      <EquivalencePanel action={{ tool: "health.check", args: { app: "marketplace" } }} />
    </div>
  );
}
