import { useMemo, useState } from "react";
import { EnvelopeSimple, FloppyDisk } from "@phosphor-icons/react";
import { EMAIL_TEMPLATES, SAMPLE_VARS } from "../data/integrations";
import { extractVariables, renderTemplate } from "../lib/template";
import { EquivalencePanel } from "../components/EquivalencePanel";
import { logAction } from "../lib/audit";

/** E-posta Şablonları — {{değişken}} motoru + canlı önizleme (Ahmet birleştirmesi). */
export function EmailTemplates() {
  const [selectedId, setSelectedId] = useState(EMAIL_TEMPLATES[0].id);
  const [bodies, setBodies] = useState<Record<string, string>>(
    Object.fromEntries(EMAIL_TEMPLATES.map((t) => [t.id, t.body])),
  );
  const tpl = EMAIL_TEMPLATES.find((t) => t.id === selectedId) ?? EMAIL_TEMPLATES[0];
  const body = bodies[tpl.id];
  const vars = useMemo(() => extractVariables(body), [body]);
  const preview = useMemo(() => renderTemplate(body, SAMPLE_VARS), [body]);

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-lg text-ink">E-posta Şablonları</h1>
        <p className="text-sm text-mute">
          {"{{değişken}}"} sözdizimi; eksik değişken önizlemede gizlenmez, aynen
          görünür — mail zinciri bu şablonları kullanır (be-mail-zinciri).
        </p>
      </header>

      <div className="flex flex-col gap-4 lg:flex-row">
        <aside className="shrink-0 lg:w-56">
          <ul className="flex gap-1 overflow-auto lg:flex-col">
            {EMAIL_TEMPLATES.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setSelectedId(t.id)}
                  className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm ${
                    t.id === tpl.id ? "bg-elev text-ink" : "text-mute hover:bg-panel"
                  }`}
                >
                  <EnvelopeSimple size={14} className={t.id === tpl.id ? "text-accent" : ""} />
                  {t.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="grid min-w-0 grow gap-4 lg:grid-cols-2">
          <section>
            <h2 className="mb-1.5 text-xs uppercase tracking-wide text-mute">
              Gövde — konu: <span className="font-mono text-ink">{tpl.subject}</span>
            </h2>
            <textarea
              aria-label="şablon gövdesi"
              value={body}
              onChange={(e) => setBodies((prev) => ({ ...prev, [tpl.id]: e.target.value }))}
              rows={12}
              spellCheck={false}
              className="w-full rounded-md border border-line bg-bg p-3 font-mono text-sm leading-relaxed text-ink"
            />
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-mute">değişkenler:</span>
              {vars.map((v) => (
                <code
                  key={v}
                  className={`rounded border px-1.5 py-0.5 font-mono ${
                    SAMPLE_VARS[v] != null ? "border-line text-ink" : "border-warn/50 text-warn"
                  }`}
                >
                  {`{{${v}}}`}
                </code>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                logAction({ tool: "template.save", args: { id: tpl.id } }, `${tpl.name} şablonu kaydedildi`)
              }
              className="mt-2 flex items-center gap-1.5 rounded bg-accent px-3 py-1.5 text-sm text-accent-ink"
            >
              <FloppyDisk size={14} /> Kaydet
            </button>
          </section>

          <section role="region" aria-label="Önizleme">
            <h2 className="mb-1.5 text-xs uppercase tracking-wide text-mute">
              Önizleme (örnek değerlerle)
            </h2>
            <div className="whitespace-pre-wrap rounded-md border border-line bg-panel p-4 text-sm leading-relaxed text-ink">
              {preview}
            </div>
          </section>
        </div>
      </div>

      <EquivalencePanel action={{ tool: "template.list", args: { app: "marketplace" } }} />
    </div>
  );
}
