import { Check, Lock, X } from "@phosphor-icons/react";
import { ACTIONS, MATRIX, ROLES } from "../data/modules";

/**
 * §5 — PermissionMatrix: iki-düzlem (E1).
 * Entitlement satırı (admin) kilitli görünür; hücre override'ları tenant düzlemi.
 */
export function PermissionMatrix() {
  return (
    <div className="overflow-auto rounded-md border border-line">
      <table className="w-full text-sm">
        <thead className="bg-panel">
          <tr>
            <th className="px-3 py-2 text-left font-normal text-mute">rol \ aksiyon</th>
            {ACTIONS.map((a) => (
              <th key={a} className="px-3 py-2 text-left font-normal text-mute">
                {a}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROLES.map((role) => {
            const locked = role === "admin";
            return (
              <tr key={role} className="border-t border-line/60">
                <td className="px-3 py-1.5 text-ink">
                  <span className="inline-flex items-center gap-1.5">
                    {role}
                    {locked && (
                      <Lock size={13} className="text-mute" aria-label="entitlement — kilitli" />
                    )}
                  </span>
                </td>
                {ACTIONS.map((a) => (
                  <td key={a} className={`px-3 py-1.5 ${locked ? "opacity-60" : ""}`}>
                    {MATRIX[role][a] ? (
                      <Check size={15} className="text-ok" aria-label="izinli" />
                    ) : (
                      <X size={15} className="text-mute/50" aria-label="izinsiz" />
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
