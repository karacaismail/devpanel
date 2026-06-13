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
/** id → elemanın ölçülen boyutu; harita tam o boyutta üretilir (hizalama). */
const sizes = new Map<string, { w: number; h: number }>();
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

/**
 * Tarayıcı SVG filtresini backdrop-filter olarak GERÇEKTEN render ediyor mu?
 *
 * KRİTİK: CSS.supports("backdrop-filter","url(#x)") Safari'de YANLIŞLIKLA true
 * döner — Safari sözdizimini kabul eder ama WebKit bug 245510 nedeniyle
 * feDisplacementMap'i backdrop olarak render ETMEZ. Firefox da desteklemez.
 * SVG-backdrop refraksiyonu yalnız Blink (Chrome/Edge/Opera/Brave) motorunda
 * çalışır. Bu yüzden motoru navigator.vendor ile ayırt ediyoruz:
 *   Blink → "Google Inc."   ·   Safari → "Apple Computer, Inc."   ·   FF → ""
 */
export function supportsRealRefraction(): boolean {
  if (typeof CSS === "undefined" || !CSS.supports) return false;
  if (typeof navigator === "undefined") return false;
  const isBlink = /Google Inc\./.test(navigator.vendor || "");
  const cssOk =
    CSS.supports("backdrop-filter", "url(#x)") ||
    CSS.supports("-webkit-backdrop-filter", "url(#x)");
  return isBlink && cssOk;
}

/**
 * Yüzey stilleri TAMAMEN JS'te hesaplanır (CSS sınıfına bağımlı değil):
 *  - Blink: gerçek SVG refraksiyon (url) + hafif şeffaf ton.
 *  - Safari/iOS/Firefox: SVG-backdrop yok → OPAK buzlu cam (blur+saturate+
 *    brightness + yarı-opak panel zemini) → arka plan içeriği camdan SIZMAZ.
 * Blur cfg.blur'a bağlı (tweak'le ayarlanır).
 */
export function surfaceStyle(id: string, cfg: GlassConfig): Record<string, string> {
  if (supportsRealRefraction()) {
    return {
      backdropFilter: `url(#${id})`,
      WebkitBackdropFilter: `url(#${id})`,
      background: cfg.tint,
    };
  }
  const b = Math.max(0, cfg.blur * 1.3 + 6);
  const fb = `blur(${b.toFixed(1)}px) saturate(${Math.round(cfg.saturation * 135)}%) brightness(1.06)`;
  return {
    backdropFilter: fb,
    WebkitBackdropFilter: fb,
    // yarı-opak panel zemini — içerik sızmasını engeller (asıl çözüm bu)
    background: "rgba(17,24,46,0.74)",
  };
}


/** Verilen id için filtreyi (yeniden) üretir/enjekte eder. size verilirse saklanır. */
export function registerFilter(
  id: string,
  cfg: GlassConfig = current,
  size?: { w: number; h: number },
): void {
  const root = ensureRoot();
  if (!root) return;
  if (size && size.w > 0 && size.h > 0) sizes.set(id, size);
  const s = sizes.get(id);
  const existing = root.querySelector(`#${id}`);
  if (existing) existing.parentElement?.removeChild(existing);
  // <defs> sarmalı — harita elemanın gerçek boyutunda üretilir (kenar hizası).
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  defs.innerHTML = filterMarkup(id, cfg, s?.w, s?.h);
  root.appendChild(defs);
  registered.add(id);
}

/** Reaktif config — değişince tüm kayıtlı filtreler ve dinleyiciler güncellenir. */
export function setConfig(patch: Partial<GlassConfig>): void {
  current = { ...current, ...patch };
  registered.forEach((id) => registerFilter(id, current, sizes.get(id)));
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
  el.style.setProperty("--lg-tint", cfg.tint);
  el.style.setProperty("--lg-radius", `${cfg.radius}px`);
  el.style.setProperty("--lg-specular", String(cfg.specular));
  el.classList.add("lg-surface");
  const sync = () => {
    const rect = el.getBoundingClientRect();
    registerFilter(id, cfg, { w: Math.round(rect.width), h: Math.round(rect.height) });
    const s = surfaceStyle(id, cfg);
    el.style.backdropFilter = s.backdropFilter;
    (el.style as unknown as Record<string, string>)["webkitBackdropFilter"] = s.WebkitBackdropFilter;
    el.style.background = s.background;
  };
  sync();
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(sync) : null;
  ro?.observe(el);
  return () => {
    ro?.disconnect();
    el.classList.remove("lg-surface");
  };
}
