/**
 * liquid-glass — gerçek mercek/su kırılması efekti kütüphanesi (TS).
 * Çekirdek (framework'süz) + React adaptörü + reaktif config.
 *
 * Vanilla:  applyGlass(el, "id", { depth: 60 })
 * React:    <LiquidGlass config={{ depth: 60 }} className="rounded-2xl">…</LiquidGlass>
 * Reaktif:  setConfig({ depth: 80 })  → tüm yüzeyler anında güncellenir
 */
export * from "./types";
export { applyGlass, registerFilter, setConfig, getConfig, subscribe, supportsRealRefraction, supportsBackdrop, backdropValue } from "./core";
export { filterMarkup, displacementDataUri } from "./displacement";
export { LiquidGlass, useLiquidGlass } from "./react";
