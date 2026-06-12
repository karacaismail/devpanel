import { useEffect, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import {
  LiquidGlass,
  setConfig,
  getConfig,
  subscribe,
  supportsRealRefraction,
  type GlassConfig,
} from "@/liquid-glass";

/**
 * Global liquid-glass ayar paneli — sağ kenarda dikey ortalı buton.
 * Her sayfada erişilebilir; setConfig ile o anki sayfadaki TÜM cam yüzeyleri
 * (ada, orb, kartlar, demo) anında günceller. Arka plan blur'u dahil tüm
 * katman parametreleri buradan set edilir.
 */
const SLIDERS: Array<[keyof GlassConfig, string, number, number, number]> = [
  ["depth", "Mercek derinliği", 0, 160, 1],
  ["bezel", "Bezel (pah)", 4, 48, 1],
  ["edge", "Kenar şiddeti", 0, 1, 0.05],
  ["chroma", "Kromatik aberasyon", 0, 8, 0.5],
  ["blur", "Arka plan blur", 0, 12, 0.5],
  ["saturation", "Doygunluk", 1, 2.5, 0.1],
  ["radius", "Köşe yarıçapı", 0, 48, 1],
  ["specular", "Specular parlama", 0, 1, 0.05],
];

export function GlassTweaker() {
  const [open, setOpen] = useState(false);
  const [cfg, setCfg] = useState<GlassConfig>(getConfig());
  const real = supportsRealRefraction();

  useEffect(() => subscribe(setCfg), []);

  const set = (k: keyof GlassConfig, v: number) => {
    setConfig({ [k]: v } as Partial<GlassConfig>);
  };

  return (
    <>
      {/* sağ kenar, dikey ortalı tetik buton */}
      <button
        type="button"
        aria-label="Liquid glass ayarları"
        onClick={() => setOpen((o) => !o)}
        className="fixed right-0 top-1/2 z-40 flex h-12 w-9 -translate-y-1/2 items-center justify-center rounded-l-xl border border-r-0 border-border bg-panel/90 text-muted backdrop-blur transition-colors hover:text-foreground"
      >
        <SlidersHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <LiquidGlass
          config={{ depth: 28, radius: 18, blur: 3, bezel: 14, edge: 0.7, specular: 0.6 }}
          className="fixed right-12 top-1/2 z-[60] flex w-72 -translate-y-1/2 flex-col gap-3 !rounded-2xl p-4 text-foreground shadow-2xl shadow-black/60"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Liquid Glass — ayarlar</span>
            <button type="button" aria-label="kapat" onClick={() => setOpen(false)} className="text-muted hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          </div>

          {SLIDERS.map(([key, label, min, max, step]) => (
            <label key={key} className="block text-xs">
              <span className="flex justify-between text-muted">
                <span>{label}</span>
                <span className="font-mono text-foreground/80">{Number(cfg[key]).toFixed(step < 1 ? 2 : 0)}</span>
              </span>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={cfg[key] as number}
                onChange={(e) => set(key, Number(e.target.value))}
                className="mt-1 w-full accent-primary"
              />
            </label>
          ))}

          <p className="text-[10px] text-muted">
            {real
              ? "Gerçek refraksiyon (Chromium). Değişiklik tüm cam yüzeylere anında uygulanır."
              : "Bu tarayıcıda blur fallback (Safari/iOS/Firefox). Arka plan blur'unu yukarıdan kıs."}
          </p>
        </LiquidGlass>
      )}
    </>
  );
}
