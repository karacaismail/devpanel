import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { CircleNotch, DownloadSimple, Power, ShieldWarning, Trash } from "@phosphor-icons/react";
import { MODULES, REGISTRY, type ModuleManifest } from "../data/modules";
import { ConfirmDanger } from "../components/ConfirmDanger";
import { PermissionMatrix } from "../components/PermissionMatrix";
import { EquivalencePanel } from "../components/EquivalencePanel";
import { logAction } from "../lib/audit";

const SANDBOX_TONE: Record<ModuleManifest["sandbox"], string> = {
  running: "text-ok",
  stopped: "text-mute",
  blocked: "text-danger",
};

/** P4 — Module Manager: manifest/izin beyanı, WASM sandbox, registry (d09). */
export function ModuleManager() {
  const [modules, setModules] = useState(MODULES);
  const [removing, setRemoving] = useState<ModuleManifest | null>(null);

  const toggle = (id: string) => {
    const m = modules.find((x) => x.id === id);
    setModules((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled, sandbox: m.enabled ? "stopped" : "running" } : m)),
    );
    if (m) {
      logAction(
        { tool: m.enabled ? "module.disable" : "module.enable", args: { id } },
        `${m.name} ${m.enabled ? "devre dışı bırakıldı" : "etkinleştirildi"}`,
      );
    }
  };

  const remove = (id: string) => {
    setModules((prev) => prev.filter((m) => m.id !== id));
    logAction(
      { tool: "module.remove", args: { id, "soft-delete": true } },
      `${id} kaldırıldı (30 gün soft-delete)`,
      { tone: "danger" },
    );
  };

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-lg text-ink">Module Manager</h1>
        <p className="text-sm text-mute">
          Kur/etkinleştir/kaldır — "Chrome extension kadar basit" (d09). Modüller
          WASM sandbox'ta koşar; beyan dışı izin yok, kernel'e dokunamaz.
        </p>
      </header>

      <Tabs.Root defaultValue="installed">
        <Tabs.List className="mb-3 flex gap-1 border-b border-line">
          <Tabs.Trigger
            value="installed"
            className="px-3 py-1.5 text-sm text-mute data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:text-ink"
          >
            Kurulu ({modules.length})
          </Tabs.Trigger>
          <Tabs.Trigger
            value="registry"
            className="px-3 py-1.5 text-sm text-mute data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:text-ink"
          >
            Module Registry
          </Tabs.Trigger>
          <Tabs.Trigger
            value="permissions"
            className="px-3 py-1.5 text-sm text-mute data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:text-ink"
          >
            İzin Matrisi
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="installed" className="flex flex-col gap-3">
          {modules.map((m) => (
            <article key={m.id} className="rounded-md border border-line bg-panel p-3">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-ink">{m.name}</h2>
                <code className="font-mono text-xs text-mute">
                  {m.id}@{m.version}
                </code>
                <span className="rounded border border-line px-1.5 py-0.5 text-xs text-mute">
                  {m.license}
                </span>
                <span className={`flex items-center gap-1 text-xs ${SANDBOX_TONE[m.sandbox]}`}>
                  <CircleNotch size={12} className={m.sandbox === "running" ? "animate-spin" : ""} />
                  sandbox: {m.sandbox}
                </span>
                <div className="ml-auto flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => toggle(m.id)}
                    className="flex items-center gap-1 rounded border border-line px-2 py-1 text-xs text-mute hover:text-ink"
                  >
                    <Power size={13} /> {m.enabled ? "devre dışı bırak" : "etkinleştir"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRemoving(m)}
                    className="flex items-center gap-1 rounded border border-danger/40 px-2 py-1 text-xs text-danger"
                  >
                    <Trash size={13} /> kaldır
                  </button>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-1.5">
                {m.permissions.map((p) => (
                  <span key={p} className="rounded border border-line px-1.5 py-0.5 text-xs text-mute">
                    {p}
                  </span>
                ))}
              </div>

              {m.note && (
                <p role="alert" className="mt-2 flex items-start gap-2 rounded border border-danger/40 bg-danger/10 p-2 text-xs text-danger">
                  <ShieldWarning size={15} className="mt-0.5 shrink-0" /> {m.note}
                </p>
              )}
            </article>
          ))}
        </Tabs.Content>

        <Tabs.Content value="registry">
          <ul className="flex flex-col gap-2">
            {REGISTRY.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-2 rounded-md border border-line bg-panel px-3 py-2 text-sm">
                <span className="text-ink">{r.name}</span>
                <code className="font-mono text-xs text-mute">{r.id}@{r.version}</code>
                <span className="text-xs text-mute">{r.author} · {r.license} · {r.downloads.toLocaleString("tr")} indirme</span>
                <button type="button" className="ml-auto flex items-center gap-1 rounded border border-line px-2 py-1 text-xs text-mute hover:text-ink">
                  <DownloadSimple size={13} /> kur (izin beyanını göster)
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-mute">
            Pazaryeri lisans şablonu: MIT-SDK sınırı — kernel AGPL, modül kiti MIT (§4-d).
          </p>
        </Tabs.Content>

        <Tabs.Content value="permissions">
          <PermissionMatrix />
          <p className="mt-2 text-xs text-mute">
            İki-düzlem (E1): entitlement satırı kilitli; tenant override hücre bazında.
          </p>
        </Tabs.Content>
      </Tabs.Root>

      <ConfirmDanger
        open={removing !== null}
        onOpenChange={(o) => !o && setRemoving(null)}
        name={removing?.id ?? ""}
        title={`Modülü kaldır: ${removing?.name ?? ""}`}
        description="Modül verisi 30 gün soft-delete'te tutulur."
        onConfirm={() => removing && remove(removing.id)}
      />

      <EquivalencePanel action={{ tool: "module.list", args: { app: "marketplace" } }} />
    </div>
  );
}
