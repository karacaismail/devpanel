import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LiquidGlass, setConfig, supportsRealRefraction, type GlassConfig, DEFAULTS } from "@/liquid-glass";
import type { Section } from "../types";

/**
 * `glassdemo` section tipi — liquid-glass canlı vitrin.
 * Kaydırıcıları oynat → setConfig → tüm cam yüzeyler ANINDA güncellenir
 * (reaktif çekirdek; "JS değişince UI güncellenir" kanıtı).
 */
export function GlassDemo({ section }: { section: Section }) {
  const [cfg, setCfg] = useState<GlassConfig>({ ...DEFAULTS, depth: 56, radius: 28 });
  const real = supportsRealRefraction();

  const set = (patch: Partial<GlassConfig>) => {
    const next = { ...cfg, ...patch };
    setCfg(next);
    setConfig(next); // reaktif: bağlı tüm yüzeyleri güncelle
  };

  const sliders: Array<[keyof GlassConfig, string, number, number, number]> = [
    ["depth", "Mercek derinliği", 0, 120, 1],
    ["blur", "Buzlanma", 0, 12, 0.5],
    ["radius", "Köşe yarıçapı", 0, 48, 1],
    ["edge", "Kenar lens şiddeti", 0, 1, 0.05],
    ["chroma", "Kromatik aberasyon", 0, 6, 0.5],
    ["specular", "Specular parlama", 0, 1, 0.05],
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{String(section.title ?? "Liquid Glass — canlı")}</CardTitle>
        <CardDescription>
          {real
            ? "Gerçek refraksiyon aktif (SVG feDisplacementMap) — arka plan piksel-piksel kırılıyor."
            : "Bu tarayıcıda url() backdrop-filter yok → zengin buzlu cam fallback. Chromium'da gerçek mercek görünür."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
          {/* Sahne: renkli gradyan + MATEMATİK GRİD — cam kartlar bu çizgileri büker.
              Kırılma ancak desenli zeminde görünür; bu yüzden sahne grid taşır. */}
          <div className="relative grid min-h-72 place-items-center overflow-hidden rounded-xl p-6">
            {/* renkli zemin */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,#6366f1_0%,transparent_45%),radial-gradient(circle_at_80%_75%,#d946ef_0%,transparent_45%),linear-gradient(120deg,#0ea5e9,#10b981)]" />
            {/* grid çizgileri — camın altında bükülecek olan desen */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.25) 1px, transparent 1px)",
                backgroundSize: "64px 64px, 64px 64px, 16px 16px, 16px 16px",
              }}
            />
            <div className="relative grid grid-cols-2 gap-5">
              <LiquidGlass config={cfg} className="flex h-32 w-44 items-center justify-center rounded-2xl text-sm font-medium text-white">
                liquid glass
              </LiquidGlass>
              <LiquidGlass config={{ ...cfg, tint: "rgba(99,102,241,0.10)" }} className="flex h-32 w-44 items-center justify-center rounded-2xl text-sm font-medium text-white">
                üst katman
              </LiquidGlass>
            </div>
            <p className="absolute bottom-2 left-3 font-mono text-[10px] text-white/70">grid çizgileri camın altında bükülüyor — derinliği artır, kenara bak</p>
          </div>

          {/* Reaktif kontroller */}
          <div className="space-y-3">
            {sliders.map(([key, label, min, max, step]) => (
              <label key={key} className="block text-xs">
                <span className="flex justify-between text-muted"><span>{label}</span><span className="font-mono text-foreground/80">{cfg[key] as number}</span></span>
                <input
                  type="range" min={min} max={max} step={step}
                  value={cfg[key] as number}
                  onChange={(e) => set({ [key]: Number(e.target.value) } as Partial<GlassConfig>)}
                  className="mt-1 w-full accent-primary"
                />
              </label>
            ))}
            <p className="text-[10px] text-muted">Her kaydırma <code className="font-mono">setConfig()</code> çağırır → SVG filtresi yeniden üretilir → tüm cam yüzeyler anında güncellenir.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
