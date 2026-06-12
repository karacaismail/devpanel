import { UsersThree } from "@phosphor-icons/react";
import { PermissionMatrix } from "../components/PermissionMatrix";
import { ROLES } from "../data/modules";
import { EquivalencePanel } from "../components/EquivalencePanel";

const ROLE_DESC: Record<string, string> = {
  admin: "Entitlement düzlemi — kurulumda belirlenir, panelden değiştirilemez.",
  developer: "Tanım katmanında tam yetki; configure yalnız admin'de.",
  "agent (MCP)": "Yazma yetkisi scope'larla sınırlı; blast-radius bekçili (AI Konsolu).",
};

/** Roles — RBAC görünümü (Ahmet birleştirmesi 2. parti): iki-düzlem izin modeli (E1). */
export function Roles() {
  return (
    <div>
      <header className="mb-4">
        <h1 className="flex items-center gap-2 text-lg text-ink">
          <UsersThree size={18} className="text-accent" /> Roles
        </h1>
        <p className="text-sm text-mute">
          İki düzlem: entitlement (kilitli) × tenant override (hücre bazlı).
          Agent rolü insan rollerinden ayrı denetlenir.
        </p>
      </header>

      <div className="mb-4 grid gap-3 lg:grid-cols-3">
        {ROLES.map((r) => (
          <article key={r} className="rounded-md border border-line bg-panel p-3">
            <h2 className="text-sm text-ink">{r}</h2>
            <p className="mt-1 text-xs text-mute">{ROLE_DESC[r]}</p>
          </article>
        ))}
      </div>

      <PermissionMatrix />
      <p className="mt-2 text-xs text-mute">
        Hücre değişiklikleri audit'e yazılır; geniş yetki artışı isim-yazarak onay ister.
      </p>

      <EquivalencePanel action={{ tool: "role.list", args: { app: "marketplace" } }} />
    </div>
  );
}
