import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Flask, Plus } from "@phosphor-icons/react";
import type { ArcheTypeDef, ArcheTypeField } from "../lib/types";
import { logAction } from "../lib/audit";
import { getLevel } from "../lib/granularity";
import { LevelBadge, ScopeBadge } from "../components/LevelBadge";
import { EquivalencePanel } from "../components/EquivalencePanel";
import { YamlView } from "../components/YamlView";

function FlagChip({ name, on, value }: { name: string; on: boolean; value?: string }) {
  return (
    <span
      className={`rounded border px-2 py-0.5 text-xs ${
        on ? "border-pii/60 text-pii" : "border-line text-mute/60 line-through"
      }`}
    >
      {name}
      {value ? `: ${value}` : ""}
    </span>
  );
}

/**
 * P1 — ArcheType Studio (P0 kapsamı: okuma + bayraklar + doğurdukları).
 * Tanım-öncelikli: YAML tek doğruluk kaynağı; bu ekran onun projeksiyonudur.
 */
export function ArchetypeStudio({ archetypes }: { archetypes: ArcheTypeDef[] }) {
  const [selectedId, setSelectedId] = useState(archetypes[0]?.id);
  /* Tenant-scoped custom field'lar (E8) — core şemaya değil, tenant katmanına eklenir. */
  const [customFields, setCustomFields] = useState<Record<string, ArcheTypeField[]>>({});
  const [fName, setFName] = useState("");
  const [fType, setFType] = useState("string");
  const [fPii, setFPii] = useState<boolean | null>(null); // zorunlu seçim
  /* YAML düzenleme — elle YAML > görsel editör (ilke #2: tanım kazanır) */
  const [yamlOverrides, setYamlOverrides] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [yamlError, setYamlError] = useState<string | null>(null);
  const at = archetypes.find((a) => a.id === selectedId) ?? archetypes[0];
  if (!at) return null;

  const currentYaml = yamlOverrides[at.id] ?? at.yaml;

  const startEdit = () => {
    setDraft(currentYaml);
    setYamlError(null);
    setEditing(true);
  };

  const applyYaml = () => {
    if (!/^name:\s*\S+/m.test(draft)) {
      setYamlError("Geçersiz tanım: `name:` alanı zorunlu — YAML uygulanmadı.");
      return;
    }
    setYamlOverrides((prev) => ({ ...prev, [at.id]: draft }));
    setEditing(false);
    setYamlError(null);
    logAction(
      { tool: "archetype.yaml.apply", args: { id: at.id } },
      `${at.id} tanımı elle güncellendi (YAML kazanır)`,
    );
  };

  const allFields = [...at.fields, ...(customFields[at.id] ?? [])];
  const canAdd = fName.trim().length > 0 && fPii !== null;

  const addField = () => {
    if (!canAdd) return;
    const field: ArcheTypeField = {
      name: fName.trim(),
      type: fType,
      pii: fPii === true,
      custom: true,
    };
    setCustomFields((prev) => ({ ...prev, [at.id]: [...(prev[at.id] ?? []), field] }));
    logAction(
      { tool: "archetype.field.add", args: { archetype: at.id, name: field.name, type: fType, pii: fPii === true, tenant: "acme" } },
      `${at.id}.${field.name} custom field eklendi (tenant: acme)`,
    );
    setFName("");
    setFPii(null);
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <aside className="shrink-0 lg:w-56">
        <h2 className="mb-2 text-xs uppercase tracking-wide text-mute">
          ArcheType'lar
        </h2>
        <ul className="flex gap-1 overflow-auto lg:flex-col">
          {archetypes.map((a) => (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => setSelectedId(a.id)}
                className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm ${
                  a.id === at.id ? "bg-elev text-ink" : "text-mute hover:bg-panel"
                }`}
              >
                {a.name}
                <span className="ml-auto">
                  <ScopeBadge scope={a.scope} />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="min-w-0 grow">
        <header className="mb-3 flex flex-wrap items-center gap-2">
          <h1 className="text-lg text-ink">{at.name}</h1>
          <LevelBadge level={getLevel("buyuk-tas")} />
          <ScopeBadge scope={at.scope} />
        </header>

        <div className="mb-3 flex flex-wrap gap-1.5">
          <FlagChip name="pii" on={at.flags.pii} />
          <FlagChip name="bitemporal" on={at.flags.bitemporal} />
          <FlagChip
            name="retention"
            on={Boolean(at.flags.retention)}
            value={at.flags.retention ?? undefined}
          />
          <FlagChip name="audit" on={at.flags.audit} />
        </div>

        <Tabs.Root defaultValue="yaml">
          <Tabs.List className="mb-3 flex gap-1 border-b border-line">
            {[
              ["yaml", "Tanım (YAML)"],
              ["fields", "Alanlar"],
              ["derived", "Doğurdukları"],
            ].map(([v, label]) => (
              <Tabs.Trigger
                key={v}
                value={v}
                className="rounded-t px-3 py-1.5 text-sm text-mute data-[state=active]:border-b-2 data-[state=active]:border-accent data-[state=active]:text-ink"
              >
                {label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <Tabs.Content value="yaml">
            <div className="mb-2 flex items-center gap-2">
              <p className="text-xs text-mute">
                Elle YAML &gt; görsel editör — çakışmada YAML kazanır (ilke #2).
              </p>
              {!editing && (
                <button
                  type="button"
                  onClick={startEdit}
                  className="ml-auto rounded border border-line px-2 py-1 text-xs text-mute hover:text-ink"
                >
                  Düzenle
                </button>
              )}
            </div>

            {editing ? (
              <div className="flex flex-col gap-2">
                <textarea
                  aria-label="yaml editörü"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={14}
                  spellCheck={false}
                  className="w-full rounded-md border border-accent/40 bg-bg p-3 font-mono text-[0.8rem] leading-relaxed text-ink"
                />
                {yamlError && (
                  <p role="alert" className="text-sm text-danger">{yamlError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={applyYaml}
                    className="rounded bg-accent px-3 py-1.5 text-sm text-accent-ink"
                  >
                    Doğrula ve uygula
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="rounded border border-line px-3 py-1.5 text-sm text-mute hover:text-ink"
                  >
                    Vazgeç
                  </button>
                </div>
                <p className="text-xs text-mute">
                  Üretim hedefi: CodeMirror 6 + JSON-schema doğrulama; kaydet = diff onayı + commit.
                </p>
              </div>
            ) : (
              <YamlView value={currentYaml} />
            )}
          </Tabs.Content>

          <Tabs.Content value="fields">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-mute">
                  <th className="border-b border-line px-2 py-1.5 font-normal">Alan</th>
                  <th className="border-b border-line px-2 py-1.5 font-normal">Tip</th>
                  <th className="border-b border-line px-2 py-1.5 font-normal">Bayraklar</th>
                </tr>
              </thead>
              <tbody>
                {allFields.map((f) => (
                  <tr key={f.name} className="border-b border-line/50">
                    <td className="px-2 py-1.5 font-mono text-ink">{f.name}</td>
                    <td className="px-2 py-1.5 text-mute">{f.type}</td>
                    <td className="px-2 py-1.5">
                      <span className="flex flex-wrap gap-1">
                        {f.required && <FlagChip name="required" on />}
                        {f.pii && <FlagChip name="pii" on />}
                        {f.custom && (
                          <span className="rounded border border-accent/50 px-2 py-0.5 text-xs text-accent">
                            tenant-custom (E8)
                          </span>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <fieldset className="mt-4 rounded-md border border-line bg-panel p-3">
              <legend className="flex items-center gap-1.5 px-1 text-xs uppercase tracking-wide text-mute">
                <Plus size={13} /> Custom Field ekle (tenant: acme — E8)
              </legend>
              <div className="flex flex-wrap items-end gap-3">
                <label className="flex flex-col gap-1 text-xs text-mute">
                  alan adı
                  <input
                    aria-label="alan adı"
                    value={fName}
                    onChange={(e) => setFName(e.target.value)}
                    placeholder="loyalty_tier"
                    className="w-36 rounded border border-line bg-elev px-2 py-1.5 font-mono text-sm text-ink placeholder:text-mute/50"
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs text-mute">
                  tip
                  <select
                    aria-label="alan tipi"
                    value={fType}
                    onChange={(e) => setFType(e.target.value)}
                    className="rounded border border-line bg-elev px-2 py-1.5 text-sm text-ink"
                  >
                    {["string", "number", "boolean", "date", "email", "phone", "enum"].map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </label>
                <fieldset className="flex flex-col gap-1 text-xs text-mute">
                  <legend>PII bayrağı (zorunlu seçim)</legend>
                  <div className="flex gap-3 pt-1">
                    <label className="flex items-center gap-1 text-sm text-ink">
                      <input type="radio" name="pii-choice" aria-label="PII" checked={fPii === true} onChange={() => setFPii(true)} />
                      PII
                    </label>
                    <label className="flex items-center gap-1 text-sm text-ink">
                      <input type="radio" name="pii-choice" aria-label="PII değil" checked={fPii === false} onChange={() => setFPii(false)} />
                      PII değil
                    </label>
                  </div>
                </fieldset>
                <button
                  type="button"
                  disabled={!canAdd}
                  onClick={addField}
                  className="rounded bg-accent px-3 py-1.5 text-sm text-accent-ink disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Alan ekle
                </button>
              </div>
              <p className="mt-2 text-xs text-mute">
                Core şema değişmez; alan tenant katmanında yaşar ve migration gerektirmez.
                PII seçimi maskeleme + erişim günlüğünü otomatik bağlar.
              </p>
            </fieldset>
          </Tabs.Content>

          <Tabs.Content value="derived">
            <p className="mb-2 text-xs text-mute">
              Bu tanımdan üretilenler — panel yazmaz, tanım doğurur:
            </p>
            <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[max-content_1fr]">
              <dt className="text-mute">Tablo</dt>
              <dd className="font-mono text-ink">{at.derived.table}</dd>
              <dt className="text-mute">GraphQL</dt>
              <dd className="font-mono text-ink">{at.derived.graphql.join(" · ")}</dd>
              <dt className="text-mute">REST</dt>
              <dd className="font-mono text-ink">{at.derived.rest.join(" · ")}</dd>
              <dt className="text-mute">Varsayılan Surface</dt>
              <dd className="font-mono text-ink">{at.derived.surface}</dd>
              <dt className="text-mute">MCP tool</dt>
              <dd className="font-mono text-ink">{at.derived.mcpTool}</dd>
              <dt className="text-mute">Üretilmiş testler</dt>
              <dd>
                <ul className="flex flex-col gap-1">
                  {at.derived.tests.map((t) => (
                    <li key={t} className="flex items-center gap-1.5 font-mono text-ink">
                      <Flask size={14} className="text-ok" /> {t}
                    </li>
                  ))}
                </ul>
              </dd>
            </dl>
          </Tabs.Content>
        </Tabs.Root>

        <EquivalencePanel action={{ tool: "archetype.read", args: { id: at.id } }} />
      </div>
    </div>
  );
}
