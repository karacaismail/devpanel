/**
 * liquid-glass — gerçek mercek/su kırılması efekti için TS kütüphanesi.
 * CSS blur "buzlu cam"dır; gerçek refraksiyon SVG feDisplacementMap ile
 * arka planı piksel-piksel saptırarak elde edilir (Apple liquid-glass yaklaşımı).
 * Framework-agnostik çekirdek; React adaptörü ayrı.
 */

export interface GlassConfig {
  /** Mercek derinliği — feDisplacementMap scale. 0 = düz, 60+ = belirgin lens. */
  depth: number;
  /** Buzlanma (px) — feGaussianBlur. */
  blur: number;
  /** Köşe yarıçapı (px) — lens "pah"ının yoğunlaştığı bölge. */
  radius: number;
  /** Kenar lens şiddeti 0..1 — kenarlardaki kırılma artışı. */
  edge: number;
  /** Renksel sapma (kromatik aberasyon) px — kanal başına kayma. */
  chroma: number;
  /** Cam tonu rgba — yüzey rengi. */
  tint: string;
  /** Specular parlama yoğunluğu 0..1. */
  specular: number;
}

export const DEFAULTS: GlassConfig = {
  depth: 48,
  blur: 2,
  radius: 24,
  edge: 0.7,
  chroma: 1.5,
  tint: "rgba(255,255,255,0.06)",
  specular: 0.5,
};

export type GlassListener = (cfg: GlassConfig) => void;
