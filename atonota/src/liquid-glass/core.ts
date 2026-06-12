import { DEFAULTS, type GlassConfig, type GlassListener } from "./types";
import { filterMarkup } from "./displacement";

/**
 * Çekirdek motor — framework'süz. Tek bir paylaşılan <svg> içine filtreleri
 * enjekte eder, reaktif config tutar; config değişince TÜM bağlı yüzeyler
 * otomatik güncellenir (gözlemci deseni → "JS değişince UI güncellenir").
 *
 * Gerçek refraksiyon desteği yalnızca url() backdrop-filter'ı işleyen
 * tarayıcılarda (Chromium) aktif olur; aksi halde zarif CSS fallback (blur+saturate).
 */

let svgRoot: SVGSVGElement | null = null;
const registered = new Set<string>();
let listeners: GlassListener[] = [];
let current: GlassConfig = { ...DEFAULTS };

function ensureRoot(): SVGSVGElement | null {
  if (typeof document === "undefined") return null;
  if (svgRoot) return svgRoot;
  const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  el.setAttribute("aria-hidden", "true");
  el.setAttribute("width", "0");
  el.setAttribute("height", "0");
  el.style.position = "absolute";
  el.style.pointerEvents = "none";
  el.id = "lg-svg-root";
  document.body.appendChild(el);
  svgRoot = el;
  return el;
}

/** Tarayıcı url() backdrop-filter (gerçek displacement) destekliyor mu? */
export function supportsRealRefraction(): boolean {
  if (typeof CSS === "undefined" || !CSS.supports) return false;
  return (
    CSS.supports("backdrop-filter", "url(#x)") ||
    CSS.supports("-webkit-backdrop-filter", "url(#x)")
  );
}

/** Verilen id için filtreyi (yeniden) üretir/enjekte eder. */
export function registerFilter(id: string, cfg: GlassConfig = current): void {
  const root = ensureRoot();
  if (!root) return;
  const existing = root.querySelector(`#${id}`);
  if (existing) existing.parentElement?.removeChild(existing);
  const tpl = document.createElementNS("http://www.w3.org/2000/svg", "g");
  tpl.innerHTML = filterMarkup(id, cfg);
  // <defs> sarmalı
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  defs.innerHTML = filterMarkup(id, cfg);
  root.appendChild(defs);
  registered.add(id);
}

/** Reaktif config — değişince tüm kayıtlı filtreler ve dinleyiciler güncellenir. */
export function setConfig(patch: Partial<GlassConfig>): void {
  current = { ...current, ...patch };
  registered.forEach((id) => registerFilter(id, current));
  listeners.forEach((l) => l(current));
}

export function getConfig(): GlassConfig {
  return current;
}

export function subscribe(l: GlassListener): () => void {
  listeners.push(l);
  return () => { listeners = listeners.filter((x) => x !== l); };
}

/**
 * Framework-agnostik uygulama: bir elemana liquid-glass yüzeyi giydirir.
 * Geri döndürülen temizleyici, gözlemcileri kaldırır.
 */
export function applyGlass(el: HTMLElement, id: string, cfg: GlassConfig = current): () => void {
  registerFilter(id, cfg);
  const real = supportsRealRefraction();
  el.style.setProperty("--lg-tint", cfg.tint);
  el.classList.add("lg-surface");
  if (real) {
    el.style.backdropFilter = `url(#${id})`;
    (el.style as unknown as Record<string, string>)["webkitBackdropFilter"] = `url(#${id})`;
  } else {
    // Fallback: gerçek refraksiyon yoksa zengin buzlu cam.
    el.style.backdropFilter = `blur(${cfg.blur + 8}px) saturate(150%)`;
    (el.style as unknown as Record<string, string>)["webkitBackdropFilter"] = `blur(${cfg.blur + 8}px) saturate(150%)`;
  }
  return () => { el.classList.remove("lg-surface"); };
}
