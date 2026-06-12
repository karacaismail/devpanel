/**
 * liquid-glass — gerçek mercek/su kırılması efekti için TS kütüphanesi.
 * CSS blur "buzlu cam"dır; gerçek refraksiyon SVG feDisplacementMap ile
 * arka planı piksel-piksel saptırarak elde edilir (Apple liquid-glass yaklaşımı).
 *
 * Tek katman blur yetersizdir. Bu kütüphane ÇOK KATMANLI çalışır:
 *  1. SDF + squircle bezel profilinden piksel-piksel hesaplanan displacement
 *     haritası → kenara yoğunlaşan gerçek mercek kırılması (kube.io yöntemi).
 *  2. Kromatik aberasyon: R/G/B kanalları farklı ölçeklerde saptırılır.
 *  3. Doygunluk + ilerleyen buzlanma katmanı.
 *  4. SDF'den üretilen specular rim haritası ekranda blend edilir.
 *  5. CSS tarafında: üst parlama, hareketli ışık huzmesi, iç parıltı, kenar rim.
 * Framework-agnostik çekirdek; React adaptörü ayrı.
 */

export interface GlassConfig {
  /** Mercek derinliği — feDisplacementMap scale (px). 0 = düz, 60+ = belirgin lens. */
  depth: number;
  /** Buzlanma (px) — feGaussianBlur. */
  blur: number;
  /** Köşe yarıçapı (px). */
  radius: number;
  /** Bezel (pah) genişliği (px) — kırılmanın yoğunlaştığı kenar bandı. */
  bezel: number;
  /** Kenar lens şiddeti 0..1 — kenarlardaki kırılma/specular kazancı. */
  edge: number;
  /** Renksel sapma (kromatik aberasyon) px — kanal başına ekstra kayma. */
  chroma: number;
  /** Doygunluk çarpanı — cam ışığı yoğunlaştırır (1 = nötr, 1.5 = canlı). */
  saturation: number;
  /** Cam tonu rgba — yüzey rengi. */
  tint: string;
  /** Specular parlama yoğunluğu 0..1. */
  specular: number;
}

export const DEFAULTS: GlassConfig = {
  depth: 64,
  blur: 1.5,
  radius: 28,
  bezel: 18,
  edge: 0.8,
  chroma: 2.5,
  saturation: 1.4,
  tint: "rgba(255,255,255,0.06)",
  specular: 0.6,
};

export type GlassListener = (cfg: GlassConfig) => void;
