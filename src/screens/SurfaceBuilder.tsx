import { useMemo, useState } from "react";
import * as Switch from "@radix-ui/react-switch";
import { ArrowDown, ArrowUp, Eye, EyeSlash, LockSimple } from "@phosphor-icons/react";
import type { SurfaceDef, SurfaceFieldDef } from "../lib/types";
import { getLevel } from "../lib/granularity";
import { LevelBadge } from "../components/LevelBadge";
import { EquivalencePanel } from "../components/EquivalencePanel";
import { EmptyState } from "../components/EmptyState";
import { YamlView } from "../components/YamlView";

type Edition = "none" | "lite" | "enterprise";

/**
 * P2 — Surface Builder: görünürlük/sıra düzenleme YAML patch üretir;
 * edition önizlemesi hidden/readonly override'larını uygular (§4-c).
 * Veri modeline dokunmaz; yalnız projeksiyon.
 */
export function SurfaceBuilder({ surfaces }: { surfaces: SurfaceDef[] }) {
  const def = surfaces[0];
  const [headless, setHeadless] = useState(def?.headless ?? false);
  const [fields, setFields] = useState<SurfaceFieldDef[]>(def?.fields ?? []);
  const [edition, setEdition] = useState<Edition>("none");
  if (!def) return null;

  const ov = edition === "none" ? undefined : def.editionOverrides[edition];
  const hiddenByEdition = new Set(ov?.hidden ?? []);
  const readonlyByEdition = new Set(ov?.readonly ?? []);
  const previewFields = fields.filter((f) => f.visible && !hiddenByEdition.has(f.field));

  const toggleVisible = (field: string) =>
    setFields((prev) => prev.map((f) => (f.field === field ? { ...f, visible: !f.visible } : f)));

  const move = (index: number, dir: -1 | 1) =>
    setFields((prev) => {
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });

  /* Tanım-öncelikli: görsel değişiklik = YAML patch diff'i (ilke #2). */
  const patch = useMemo(() => {
    const lines: string[] = [];
    for (const f of fields) {
      const orig = def.fields.find((o) => o.field === f.field);
      if (orig && orig.visible !== f.visible) {
        lines.push(`~ ${f.field}.visible: ${orig.visible} → ${f.visible}`);
      }
    }
    const origOrder = def.fields.map((f) => f.field).join(",");
    const nowOrder = fields.map((f) => f.field).join(",");
    if (origOrder !== nowOrder) {
      lines.push(`~ fields sırası: [${nowOrder.replaceAll(",", ", ")}]`);
    }
    return lines;
  }, [fields, def.fields]);

  return (
    <div>
      <header className="mb-4 flex flex-wrap items-center gap-2">
        <h1 className="text-lg text-ink">{def.id}</h1>
        <LevelBadge level={getLevel("orta-tas")} />
        <span className="text-xs text-mute">
          projeksiyon: <code className="font-mono">{def.archetype}</code>
        </span>
        <label className="ml-auto flex items-center gap-2 text-sm text-mute">
          headless (surface: none)
          <Switch.Root
            checked={headless}
            onCheckedChange={setHeadless}
            aria-label="headless (surface: none)"
            className="h-5 w-9 rounded-full border border-line bg-elev data-[state=checked]:bg-accent"
          >
            <Switch.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-ink transition-transform data-[state=checked]:translate-x-4 data-[state=checked]:bg-accent-ink" />
          </Switch.Root>
        </label>
      </header>

      <div className="grid gap-4 lg:grid-cols-2">
        <section>
          <h2 className="mb-2 text-xs uppercase tracking-wide text-mute">
            Alanlar (sıra/görünürlük — tıkla/taşı)
          </h2>
          <ul className="flex flex-col gap-1">
            {fields.map((f, i) => (
              <li
                key={f.field}
                className="flex items-center gap-2 rounded border border-line bg-panel px-2 py-1.5 text-sm"
              >
                <button
                  type="button"
                  aria-label={`görünürlük: ${f.field}`}
                  onClick={() => toggleVisible(f.field)}
                  className="text-mute hover:text-ink"
                >
                  {f.visible ? <Eye size={15} className="text-accent" /> : <EyeSlash size={15} />}
                </button>
                <span className={f.visible ? "text-ink" : "text-mute"}>{f.label}</span>
                <code className="font-mono text-xs text-mute">{f.field}</code>
                {readonlyByEdition.has(f.field) && (
                  <span className="flex items-center gap-0.5 rounded border border-warn/50 px-1 py-0.5 text-xs text-warn">
                    <LockSimple size={10} /> readonly ({edition})
                  </span>
                )}
                <span className="ml-auto rounded border border-line px-1.5 py-0.5 text-xs text-mute">
                  {f.widget}
                </span>
                <span className="flex flex-col">
                  <button type="button" aria-label={`yukarı: ${f.field}`} onClick={() => move(i, -1)} className="text-mute hover:text-ink">
                    <ArrowUp size={11} />
                  </button>
                  <button type="button" aria-label={`aşağı: ${f.field}`} onClick={() => move(i, 1)} className="text-mute hover:text-ink">
                    <ArrowDown size={11} />
                  </button>
                </span>
              </li>
            ))}
          </ul>

          <h2 className="mb-2 mt-4 text-xs uppercase tracking-wide text-mute">YAML patch (commit'lenebilir)</h2>
          <pre className="rounded-md border border-line bg-bg p-3 font-mono text-xs leading-relaxed">
            {patch.length > 0 ? (
              patch.map((l, i) => (
                <div key={i} className="text-warn">{l}</div>
              ))
            ) : (
              <span className="text-mute">değişiklik yok — tanımla birebir</span>
            )}
          </pre>

          <h2 className="mb-2 mt-4 text-xs uppercase tracking-wide text-mute">edition_overrides</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {Object.entries(def.editionOverrides).map(([ed, o]) => (
              <li key={ed} className="rounded border border-line bg-panel px-2 py-1.5">
                <span className="text-accent">{ed}</span>
                <span className="text-mute">
                  {o.hidden ? ` · hidden → ${o.hidden.join(", ")}` : ""}
                  {o.readonly ? ` · readonly → ${o.readonly.join(", ")}` : ""}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section role="region" aria-label="Canlı önizleme">
          <div className="mb-2 flex items-center gap-2">
            <h2 className="text-xs uppercase tracking-wide text-mute">Canlı önizleme</h2>
            <label className="ml-auto flex items-center gap-1.5 text-xs text-mute">
              edition önizlemesi
              <select
                aria-label="edition önizlemesi"
                value={edition}
                onChange={(e) => setEdition(e.target.value as Edition)}
                className="rounded border border-line bg-elev px-1.5 py-1 text-ink"
              >
                <option value="none">— (taban)</option>
                <option value="lite">lite</option>
                <option value="enterprise">enterprise</option>
              </select>
            </label>
          </div>

          {headless ? (
            <EmptyState title="surface: none — bu projeksiyon UI üretmez">
              ArcheType yalnız GraphQL / REST / MCP üzerinden servis edilir.
              Tanım ve testler aynen yaşamaya devam eder.
            </EmptyState>
          ) : (
            <form className="flex flex-col gap-3 rounded-md border border-line bg-panel p-4">
              {previewFields.map((f) => (
                <label key={f.field} className="flex flex-col gap-1 text-sm">
                  <span className="flex items-center gap-1.5 text-mute">
                    {f.label}
                    {readonlyByEdition.has(f.field) && <LockSimple size={11} className="text-warn" />}
                  </span>
                  {f.widget === "select" ? (
                    <select disabled className="rounded border border-line bg-elev px-2 py-1.5 text-ink">
                      <option>active</option>
                    </select>
                  ) : (
                    <input
                      disabled
                      placeholder={f.field}
                      className="rounded border border-line bg-elev px-2 py-1.5 text-ink placeholder:text-mute/60"
                    />
                  )}
                </label>
              ))}
              {previewFields.length === 0 && (
                <p className="text-sm text-mute">Bu edition'da görünür alan kalmadı.</p>
              )}
            </form>
          )}
        </section>
      </div>

      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-mute">
          Tanım (YAML) — tek doğruluk kaynağı
        </summary>
        <div className="mt-2">
          <YamlView value={def.yaml} />
        </div>
      </details>

      <EquivalencePanel
        action={{ tool: "surface.read", args: { id: def.id, headless } }}
      />
    </div>
  );
}
