import type { GlassConfig } from "./types";

/**
 * Edge-lens displacement haritası üretir (data-URI SVG).
 * feDisplacementMap R/G kanallarını ofset olarak okur:
 *  - R kanalı  → yatay sapma  (sol→sağ gradyan)
 *  - G kanalı  → dikey sapma  (üst→alt gradyan)
 * Merkez nötr (128,128 = sapma yok); köşelere yaklaştıkça gradyan dikleşir,
 * böylece kırılma cam kenarında yoğunlaşır — gerçek mercek-pahı hissi.
 */
export function displacementDataUri(cfg: GlassConfig, w = 200, h = 140): string {
  const r = Math.min(cfg.radius, Math.min(w, h) / 2);
  // Kenar şiddeti: edge yükseldikçe köşe gradyanı sertleşir.
  const e = Math.round(60 + cfg.edge * 120); // gradyan kontrastı
  const lo = 128 - e / 2;
  const hi = 128 + e / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <linearGradient id="x" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="rgb(${lo},128,128)"/>
      <stop offset="0.5" stop-color="rgb(128,128,128)"/>
      <stop offset="1" stop-color="rgb(${hi},128,128)"/>
    </linearGradient>
    <linearGradient id="y" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="rgba(128,${lo},128,0.5)"/>
      <stop offset="0.5" stop-color="rgba(128,128,128,0)"/>
      <stop offset="1" stop-color="rgba(128,${hi},128,0.5)"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="url(#x)"/>
  <rect width="${w}" height="${h}" rx="${r}" ry="${r}" fill="url(#y)"/>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * SVG <filter> iç içeriği — feImage(map) → feDisplacementMap → blur → specular.
 * Kromatik aberasyon için üç ayrı (R/G/B) displace + birleştirme yapılır.
 */
export function filterMarkup(id: string, cfg: GlassConfig): string {
  const map = displacementDataUri(cfg);
  const ch = cfg.chroma;
  return `
  <filter id="${id}" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB">
    <feImage href="${map}" x="0" y="0" width="100%" height="100%" result="map" preserveAspectRatio="none"/>
    <feDisplacementMap in="SourceGraphic" in2="map" scale="${cfg.depth + ch}" xChannelSelector="R" yChannelSelector="G" result="rch"/>
    <feColorMatrix in="rch" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="rc"/>
    <feDisplacementMap in="SourceGraphic" in2="map" scale="${cfg.depth}" xChannelSelector="R" yChannelSelector="G" result="gch"/>
    <feColorMatrix in="gch" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="gc"/>
    <feDisplacementMap in="SourceGraphic" in2="map" scale="${cfg.depth - ch}" xChannelSelector="R" yChannelSelector="G" result="bch"/>
    <feColorMatrix in="bch" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="bc"/>
    <feBlend in="rc" in2="gc" mode="screen" result="rg"/>
    <feBlend in="rg" in2="bc" mode="screen" result="rgb"/>
    <feGaussianBlur in="rgb" stdDeviation="${cfg.blur}"/>
  </filter>`;
}
