import { useState } from "react";
import * as Switch from "@radix-ui/react-switch";
import { CheckCircle, Warning } from "@phosphor-icons/react";
import { JOBS } from "../data/integrations";
import { describeCron, nextRuns } from "../lib/cron";
import { EquivalencePanel } from "../components/EquivalencePanel";
import { logAction } from "../lib/audit";

const fmt = (d: Date) =>
  d.toLocaleString("tr-TR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

/** Scheduler — cron işleri: TR açıklama + sonraki çalışmalar (Ahmet birleştirmesi). */
export function Scheduler() {
  const [jobs, setJobs] = useState(JOBS);

  const toggle = (id: string) => {
    const j = jobs.find((x) => x.id === id);
    setJobs((prev) => prev.map((x) => (x.id === id ? { ...x, enabled: !x.enabled } : x)));
    if (j) {
      logAction(
        { tool: j.enabled ? "job.pause" : "job.resume", args: { id } },
        `${j.name} ${j.enabled ? "duraklatıldı" : "devam ettirildi"}`,
      );
    }
  };

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-lg text-ink">Scheduler</h1>
        <p className="text-sm text-mute">
          Zamanlanmış işler — cron tanımdan okunur; açıklama ve sonraki
          çalışmalar otomatik türetilir.
        </p>
      </header>

      <ul className="flex flex-col gap-2">
        {jobs.map((j) => {
          const runs = nextRuns(j.cron, new Date(), 3);
          return (
            <li key={j.id} className="rounded-md border border-line bg-panel p-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm text-ink">{j.name}</h2>
                <code className="rounded border border-line px-1.5 py-0.5 font-mono text-xs text-mute">
                  {j.cron}
                </code>
                <span className="text-xs text-accent">{describeCron(j.cron)}</span>
                <span className="ml-auto flex items-center gap-1 text-xs">
                  {j.lastRun.status === "ok" ? (
                    <CheckCircle size={13} className="text-ok" />
                  ) : (
                    <Warning size={13} className="text-danger" />
                  )}
                  <span className={j.lastRun.status === "ok" ? "text-mute" : "text-danger"}>
                    son: {j.lastRun.at} · {j.lastRun.status}
                  </span>
                </span>
                <Switch.Root
                  checked={j.enabled}
                  onCheckedChange={() => toggle(j.id)}
                  aria-label={`${j.name} aktif`}
                  className="h-5 w-9 rounded-full border border-line bg-elev data-[state=checked]:bg-accent"
                >
                  <Switch.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-ink transition-transform data-[state=checked]:translate-x-4 data-[state=checked]:bg-accent-ink" />
                </Switch.Root>
              </div>
              <p className="mt-1.5 text-xs text-mute">
                sonraki: {j.enabled ? runs.map(fmt).join(" · ") : "duraklatıldı"}
              </p>
            </li>
          );
        })}
      </ul>

      <EquivalencePanel action={{ tool: "job.list", args: { app: "marketplace" } }} />
    </div>
  );
}
