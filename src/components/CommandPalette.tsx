import * as Dialog from "@radix-ui/react-dialog";
import { useMemo, useState } from "react";
import { ArrowRight, Flask, MagnifyingGlass, Warning } from "@phosphor-icons/react";
import { LEVELS, getLevel, parseCommand } from "../lib/granularity";
import { buildScaffoldPreview } from "../lib/cli";
import { searchScreens } from "../lib/navigation";
import { useUiStore } from "../lib/store";
import type { LevelId } from "../lib/types";
import { LevelBadge } from "./LevelBadge";
import { EquivalencePanel } from "./EquivalencePanel";

const EXAMPLES = ["crm dağ yap", "listing orta taş yap", "party büyük taş yap"];

/**
 * ⌘K komut paleti — doğal dil kabul eder (AI-first ilke #1).
 * Çıktı her zaman ÖNİZLEMEDİR (P0: yazma yok); komşuluk denetleyicisinden geçer.
 */
export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [input, setInput] = useState("");
  const [contextId, setContextId] = useState<LevelId>("dag");
  const setScreen = useUiStore((s) => s.setScreen);

  const parsed = useMemo(() => parseCommand(input), [input]);
  const preview = useMemo(
    () => (parsed ? buildScaffoldPreview(parsed, getLevel(contextId)) : null),
    [parsed, contextId],
  );
  /* Scaffold komutu öncelikli; değilse ekran navigasyonu öner. */
  const navHits = useMemo(
    () => (parsed ? [] : searchScreens(input)),
    [input, parsed],
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed left-1/2 top-[8vh] w-[min(44rem,calc(100vw-1.5rem))] -translate-x-1/2 rounded-lg border border-line bg-panel shadow-2xl focus:outline-none"
        >
          <Dialog.Title className="sr-only">Komut paleti</Dialog.Title>

          <div className="flex items-center gap-2 border-b border-line px-3 py-2">
            <MagnifyingGlass size={18} className="shrink-0 text-mute" />
            <input
              autoFocus
              role="combobox"
              aria-label="Komut"
              aria-expanded={Boolean(preview)}
              aria-controls="cp-preview"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Doğal dil komut: "crm dağ yap"'
              className="w-full bg-transparent py-1 text-ink placeholder:text-mute focus:outline-none"
            />
            <label className="flex shrink-0 items-center gap-1 text-xs text-mute">
              Bağlam
              <select
                value={contextId}
                onChange={(e) => setContextId(e.target.value as LevelId)}
                className="rounded border border-line bg-elev px-1 py-0.5 text-ink"
              >
                {LEVELS.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.ad} ({l.metafor})
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div id="cp-preview" className="max-h-[60vh] overflow-auto p-3">
            {!input && (
              <ul className="text-sm text-mute">
                {EXAMPLES.map((ex) => (
                  <li key={ex}>
                    <button
                      type="button"
                      onClick={() => setInput(ex)}
                      className="w-full rounded px-2 py-1.5 text-left hover:bg-elev hover:text-ink"
                    >
                      <span className="font-mono">{ex}</span>
                    </button>
                  </li>
                ))}
                <li className="px-2 pt-2 text-xs">
                  Her komut, granülerlik denetleyicisinden geçen bir scaffold
                  önizlemesi üretir; CLI/MCP eşdeğeri birlikte gösterilir.
                </li>
              </ul>
            )}

            {navHits.length > 0 && (
              <ul className="mb-2 flex flex-col gap-0.5">
                {navHits.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setScreen(s.id);
                        setInput("");
                        onOpenChange(false);
                      }}
                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-mute hover:bg-elev hover:text-ink"
                    >
                      <ArrowRight size={14} className="text-accent" />
                      Git → {s.label}
                      {s.group && (
                        <span className="ml-auto text-xs text-mute/60">{s.group}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {input && !parsed && navHits.length === 0 && (
              <p className="px-1 text-sm text-mute">
                Biçim: <span className="font-mono text-ink">&lt;ad&gt; &lt;seviye&gt; yap</span>{" "}
                — seviyeler: {LEVELS.map((l) => l.metafor).join(", ")}
              </p>
            )}

            {preview && !preview.ok && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-md border border-danger/50 bg-danger/10 p-3 text-sm text-danger"
              >
                <Warning size={18} className="mt-0.5 shrink-0" />
                <p>{preview.violation} Komşuluk kuralı: seviye atlayan plan kaydedilemez (ADR-0008).</p>
              </div>
            )}

            {preview && preview.ok && preview.level && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-ink">{preview.name}</span>
                  <LevelBadge level={preview.level} />
                  <span className="ml-auto rounded border border-warn/50 px-2 py-0.5 text-xs text-warn">
                    Önizleme — diske yazılmaz
                  </span>
                </div>

                {preview.files.map((f) => (
                  <div
                    key={f.path}
                    data-testid="scaffold-file"
                    className="rounded-md border border-line bg-bg"
                  >
                    <div className="flex items-center gap-2 border-b border-line px-3 py-1.5 text-sm">
                      {f.kind === "test" && (
                        <Flask size={15} className="text-ok" />
                      )}
                      <span className="font-mono text-ink">{f.path}</span>
                      <span
                        className={`ml-auto text-xs ${f.kind === "test" ? "text-ok" : "text-mute"}`}
                      >
                        {f.kind === "test" ? "test — İLK üretilir" : "tanım"}
                      </span>
                    </div>
                    <pre className="overflow-auto p-3 font-mono text-xs text-mute">
                      {f.content}
                    </pre>
                  </div>
                ))}

                {preview.action && <EquivalencePanel action={preview.action} />}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 border-t border-line px-3 py-1.5 text-xs text-mute">
            <span>
              <kbd>esc</kbd> kapat
            </span>
            <span>
              <kbd>⌘K</kbd> aç/kapat
            </span>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
