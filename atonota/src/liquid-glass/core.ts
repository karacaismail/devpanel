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

/** Tarayıcı url() backdrop-filter (gerçek displacement) destekliyor mu? */
export function supportsRealRefraction(): boolean {
  if (typeof CSS === "undefined" || !CSS.supports) return false;
  return (
    CSS.supports("backdrop-filter", "url(#x)") ||
    CSS.supports("-webkit-backdrop-filter", "url(#x)")
  );
}

/** Tarayıcı en azından blur backdrop-filter destekliyor mu? (Safari/iOS/Firefox) */
export function supportsBackdrop(): boolean {
  if (typeof CSS === "undefined" || !CSS.supports) return false;
  return (
    CSS.supports("backdrop-filter", "blur(2px)") ||
    CSS.supports("-webkit-backdrop-filter", "blur(2px)")
  );
}

/**
 * Platform-bağımsız backdrop-filter değeri:
 *  - Chromium: gerçek SVG refraksiyon filtresi (url)
 *  - Safari/iOS/Firefox: çok-katmanlı blur+saturate+brightness (CSS katmanlarıyla
 *    birlikte gerçek cam hissi). Blur cfg.blur'a bağlı → tweak'le kontrol edilir.
 *  - backdrop yoksa (eski): boş (yalnız tint + CSS katmanları)
 */
export function backdropValue(id: string, cfg: GlassConfig): string {
  if (supportsRealRefraction()) return `url(#${id})`;
  if (supportsBackdrop()) {
    const b = Math.max(0, cfg.blur * 1.4 + 2);
    return `blur(${b.toFixed(1)}px) saturate(${(cfg.saturation * 120).toFixed(0)}%) brightness(1.04)`;
  }
  return "none";
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
    const v = backdropValue(id, cfg);
    el.style.backdropFilter = v;
    (el.style as unknown as Record<string, string>)["webkitBackdropFilter"] = v;
  };
  sync();
  const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(sync) : null;
  ro?.observe(el);
  return () => {
    ro?.disconnect();
    el.classList.remove("lg-surface");
  };
}
