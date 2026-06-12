import { useMemo, useState } from "react";
import { CheckCircle, Warning } from "@phosphor-icons/react";
import { contrastRatio, hexToRgb, meetsAA } from "../lib/contrast";
import { EquivalencePanel } from "../components/EquivalencePanel";
import { logAction } from "../lib/audit";

/** 09A varsayılanları — tenant override yalnız token üzerinden (§4-a: kod yok). */
const DEFAULTS: Record<string, string> = {
  bg: "#0b0e14",
  panel: "#11151f",
  ink: "#e7eaf2",
  mute: "#949cb2",
  accent: "#7fb1ff",
};

/** AA-doğrulanmış hazır paletler — tenant'a başlangıç noktası. */
const PRESETS: Record<string, Record<string, string>> = {
  "09A (varsayılan)": DEFAULTS,
  Okyanus: { bg: "#071019", panel: "#0d1825", ink: "#e3edf7", mute: "#8fa3b8", accent: "#66d1ff" },
  Orman: { bg: "#0a120c", panel: "#101b12", ink: "#e8f2e8", mute: "#9ab09d", accent: "#7fe09a" },
  Gece: { bg: "#0d0b14", panel: "#14111f", ink: "#ece8f4", mute: "#9d96b0", accent: "#b79bff" },
};

/** AA bekçisinin denetlediği (ön plan, arka plan) çiftleri. */
const PAIRS: Array<[string, string, string]> = [
  ["ink", "bg", "metin / zemin"],
  ["ink", "panel", "metin / panel"],
  ["mute", "panel", "ikincil metin / panel"],
  ["accent", "bg", "vurgu / zemin"],
];

/**
 * P13 — Tema / Token Editörü. Brand colors tenant-başına token override;
 * AA kontrast altı değer KAYDEDİLEMEZ (canlı bekçi).
 */
export function ThemeEditor() {
  const [tokens, setTokens] = useState(DEFAULTS);
  const [diff, setDiff] = useState<string | null>(null);

  const checks = useMemo(
    () =>
      PAIRS.map(([fg, bg, label]) => {
        const valid = hexToRgb(tokens[fg]) && hexToRgb(tokens[bg]);
        const ratio = valid ? contrastRatio(tokens[fg], tokens[bg]) : 0;
        return { fg, bg, label, ratio, pass: valid ? meetsAA(tokens[fg], tokens[bg]) : false };
      }),
    [tokens],
  );
  const allPass = checks.every((c) => c.pass);

  const set = (key: string, value: string) => {
    setTokens((t) => ({ ...t, [key]: value }));
    setDiff(null);
  };

  const tokenFile = JSON.stringify({ tenant: "acme", tokens }, null, 2);

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-lg text-ink">Tema / Token Editörü</h1>
        <p className="text-sm text-mute">
          Brand colors — tenant-başına token override; token dışına CSS yazılamaz.
          Çıktı yalnızca theme token dosyasıdır.
        </p>
      </header>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {Object.entries(PRESETS).map(([name, preset]) => (
          <button
            key={name}
            type="button"
            onClick={() => {
              setTokens(preset);
              setDiff(null);
            }}
            className="rounded-full border border-line px-3 py-1 text-xs text-mute hover:border-accent/50 hover:text-ink"
          >
            {name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            if (typeof URL.createObjectURL === "function") {
              const url = URL.createObjectURL(new Blob([tokenFile], { type: "application/json" }));
              const a = document.createElement("a");
              a.href = url;
              a.download = "tokens.acme.json";
              a.click();
              URL.revokeObjectURL(url);
            }
          }}
          className="ml-auto rounded-full border border-line px-3 py-1 text-xs text-mute hover:text-ink"
        >
          JSON export
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="flex flex-col gap-2">
          {Object.entries(tokens).map(([name, value]) => (
            <div
              key={name}
              className="flex items-center gap-3 rounded border border-line bg-panel px-3 py-2"
            >
              <code className="w-20 font-mono text-sm text-ink">--{name}</code>
              <input
                type="color"
                value={hexToRgb(value) ? (value.startsWith("#") ? value : `#${value}`) : "#000000"}
                onChange={(e) => set(name, e.target.value)}
                aria-label={`token-${name}-renk`}
                className="h-7 w-9 cursor-pointer rounded border border-line bg-transparent"
              />
              <input
                value={value}
                onChange={(e) => set(name, e.target.value)}
                aria-label={`token-${name}`}
                className="w-28 rounded border border-line bg-elev px-2 py-1 font-mono text-sm text-ink"
              />
            </div>
          ))}

          <h2 className="mt-3 text-xs uppercase tracking-wide text-mute">
            AA kontrast bekçisi
          </h2>
          <ul className="flex flex-col gap-1 text-sm">
            {checks.map((c) => (
              <li
                key={c.label}
                className="flex items-center gap-2 rounded border border-line bg-panel px-3 py-1.5"
              >
                {c.pass ? (
                  <CheckCircle size={16} className="text-ok" />
                ) : (
                  <Warning size={16} className="text-danger" />
                )}
                <span className="text-mute">{c.label}</span>
                <span
                  className={`ml-auto font-mono ${c.pass ? "text-ok" : "text-danger"}`}
                >
                  {c.ratio.toFixed(2)} : 1
                </span>
              </li>
            ))}
          </ul>

          {!allPass && (
            <p role="alert" className="text-sm text-danger">
              AA kontrast altı değer kaydedilemez (≥ 4.5:1 gerekli).
            </p>
          )}

          <button
            type="button"
            disabled={!allPass}
            onClick={() => {
              setDiff(tokenFile);
              logAction(
                { tool: "theme.apply", args: { tenant: "acme", file: "themes/tokens.acme.json" } },
                "acme token diff'i hazırlandı (AA ✓)",
              );
            }}
            className="mt-1 self-start rounded bg-accent px-4 py-1.5 text-sm text-accent-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            Kaydet (diff önizle)
          </button>

          {diff && (
            <pre className="overflow-auto rounded border border-ok/40 bg-bg p-3 font-mono text-xs text-mute">
              {`+ themes/tokens.acme.json\n` + diff}
            </pre>
          )}
        </section>

        <section>
          <h2 className="mb-2 text-xs uppercase tracking-wide text-mute">
            Canlı önizleme (tenant: acme)
          </h2>
          <div
            className="rounded-md border border-line p-5"
            style={{ background: tokens.bg }}
          >
            <div
              className="rounded-md p-4"
              style={{ background: tokens.panel, color: tokens.ink }}
            >
              <p style={{ fontSize: "1.1rem" }}>Müşteri portalı</p>
              <p style={{ color: tokens.mute, fontSize: "0.9rem" }}>
                Bu kart, tenant token setiyle boyanır. Kontrast bekçisi
                geçmeden bu görünüm yayına alınamaz.
              </p>
              <button
                type="button"
                className="mt-3 rounded px-3 py-1.5 text-sm"
                style={{ background: tokens.accent, color: tokens.bg }}
              >
                Birincil eylem
              </button>
            </div>
          </div>
        </section>
      </div>

      <EquivalencePanel
        action={{
          tool: "theme.apply",
          args: { tenant: "acme", file: "themes/tokens.acme.json" },
        }}
      />
    </div>
  );
}
