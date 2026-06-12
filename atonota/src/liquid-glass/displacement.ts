import type { GlassConfig } from "./types";

/**
 * Displacement + specular haritalarını ÜRETİR.
 *
 * Yöntem (kube.io / Apple liquid-glass): yuvarlatılmış dikdörtgenin işaretli
 * mesafe alanından (SDF) her piksel için kenara olan uzaklık çıkarılır; bezel
 * bandında "convex squircle" yükseklik profili H(t)=(1-(1-t)^4)^(1/4) uygulanır.
 * Yüzey eğimi (H') kırılma büyüklüğünü, SDF gradyanı ise yönü verir. Böylece
 * kırılma DÜZ merkezde sıfır, KENARDA en güçlü — gerçek mercek pahı.
 *
 * R kanalı = yatay sapma, G kanalı = dikey sapma (128 = nötr).
 * Ayrıca specular rim haritası: kenar normali ışığa bakınca parlar.
 *
 * Canvas yoksa (jsdom/SSR) zarif SVG-gradyan fallback'ine düşer.
 */

type Maps = { disp: string; spec: string };
const cache = new Map<string, Maps>();

function squircleHeight(t: number): number {
  // t: 0 (dış kenar) → 1 (iç düz yüzey). Convex squircle (Apple favori).
  const u = 1 - t;
  return Math.pow(1 - u * u * u * u, 0.25);
}

function makeCanvas(w: number, h: number): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;
  try {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
  } catch {
    return null;
  }
}

/** Köşe + kenar için SDF tabanlı gerçek harita (canvas). */
function buildReal(cfg: GlassConfig, w: number, h: number): Maps | null {
  const canvas = makeCanvas(w, h);
  if (!canvas) return null;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const r = Math.min(cfg.radius, Math.min(w, h) / 2 - 1);
  const bezel = Math.max(2, Math.min(cfg.bezel, Math.min(w, h) / 2 - r - 1 + cfg.bezel));
  const cx = w / 2;
  const cy = h / 2;
  const hx = w / 2;
  const hy = h / 2;

  // ışık yönü (sol-üst) — specular için
  const lx = -0.55;
  const ly = -0.83;

  // önce eğim normalizasyonu için maks eğim
  const slopeAt = (t: number) => {
    const e = 0.004;
    const a = squircleHeight(Math.max(0, t - e));
    const b = squircleHeight(Math.min(1, t + e));
    return (b - a) / (2 * e);
  };
  let maxSlope = 1e-6;
  for (let i = 0; i <= 64; i++) maxSlope = Math.max(maxSlope, slopeAt(i / 64));

  const disp = ctx.createImageData(w, h);
  const spec = ctx.createImageData(w, h);
  const dd = disp.data;
  const sd = spec.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const ax = x + 0.5 - cx;
      const ay = y + 0.5 - cy;
      const sx = Math.sign(ax) || 1;
      const sy = Math.sign(ay) || 1;
      const px = Math.abs(ax);
      const py = Math.abs(ay);
      const qx = px - (hx - r);
      const qy = py - (hy - r);

      // yön (dış normal) + kenara işaretli mesafe
      let nx: number, ny: number, sdist: number;
      if (qx > 0 && qy > 0) {
        const len = Math.hypot(qx, qy) || 1;
        nx = (qx / len) * sx;
        ny = (qy / len) * sy;
        sdist = len - r;
      } else if (qx > qy) {
        nx = sx;
        ny = 0;
        sdist = qx - r;
      } else {
        nx = 0;
        ny = sy;
        sdist = qy - r;
      }

      const distFromEdge = -sdist; // içeride pozitif
      let R = 128, G = 128; // nötr
      let sAlpha = 0;

      if (sdist < 0 && distFromEdge < bezel) {
        // bezel bandı içindeyiz
        const t = distFromEdge / bezel; // 0 kenar → 1 iç
        const mag = slopeAt(t) / maxSlope; // 0..1
        const k = mag * (0.5 + cfg.edge); // kenar şiddeti
        // pikseli içe doğru sapt (kırılma): -normal yönünde
        const vx = -nx * k;
        const vy = -ny * k;
        R = Math.max(0, Math.min(255, Math.round(128 + vx * 127)));
        G = Math.max(0, Math.min(255, Math.round(128 + vy * 127)));
        // specular: dış normal ışığa bakıyorsa parla, kenarda yoğun
        const ndotl = Math.max(0, nx * lx + ny * ly);
        sAlpha = Math.min(1, ndotl * mag * (0.6 + cfg.edge)) ;
      }

      dd[i] = R; dd[i + 1] = G; dd[i + 2] = 128; dd[i + 3] = 255;
      const a = Math.round(sAlpha * 255);
      sd[i] = 255; sd[i + 1] = 255; sd[i + 2] = 255; sd[i + 3] = a;
    }
  }

  ctx.putImageData(disp, 0, 0);
  const dispUrl = canvas.toDataURL("image/png");
  ctx.clearRect(0, 0, w, h);
  ctx.putImageData(spec, 0, 0);
  const specUrl = canvas.toDataURL("image/png");
  return { disp: dispUrl, spec: specUrl };
}

/** jsdom/SSR fallback — düz gradyan (gerçek değil ama hata vermez). */
function buildFallback(cfg: GlassConfig, w: number, h: number): Maps {
  const r = Math.min(cfg.radius, Math.min(w, h) / 2);
  const e = Math.round(60 + cfg.edge * 120);
  const lo = 128 - e / 2;
  const hi = 128 + e / 2;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><linearGradient id="x" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="rgb(${lo},128,128)"/><stop offset="0.5" stop-color="rgb(128,128,128)"/><stop offset="1" stop-color="rgb(${hi},128,128)"/></linearGradient></defs><rect width="${w}" height="${h}" rx="${r}" fill="url(#x)"/></svg>`;
  const url = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  return { disp: url, spec: url };
}

export function buildMaps(cfg: GlassConfig, w = 256, h = 160): Maps {
  const key = `${w}x${h}-r${Math.round(cfg.radius)}-b${Math.round(cfg.bezel)}-e${cfg.edge}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const maps = buildReal(cfg, w, h) ?? buildFallback(cfg, w, h);
  cache.set(key, maps);
  return maps;
}

/** Geriye dönük uyum — yalnız displacement data-URI. */
export function displacementDataUri(cfg: GlassConfig, w = 256, h = 160): string {
  return buildMaps(cfg, w, h).disp;
}

/**
 * SVG <filter> içeriği — ÇOK KATMAN:
 *  feImage(disp,spec) → kromatik 3'lü displace → screen blend → blur →
 *  saturate → specular rim screen blend.
 */
export function filterMarkup(id: string, cfg: GlassConfig): string {
  const { disp, spec } = buildMaps(cfg);
  const ch = cfg.chroma;
  const sat = cfg.saturation;
  return `
  <filter id="${id}" x="-30%" y="-30%" width="160%" height="160%" color-interpolation-filters="sRGB">
    <feImage href="${disp}" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="disp"/>
    <feImage href="${spec}" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="specmap"/>
    <feDisplacementMap in="SourceGraphic" in2="disp" scale="${cfg.depth + ch}" xChannelSelector="R" yChannelSelector="G" result="dR"/>
    <feColorMatrix in="dR" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="cR"/>
    <feDisplacementMap in="SourceGraphic" in2="disp" scale="${cfg.depth}" xChannelSelector="R" yChannelSelector="G" result="dG"/>
    <feColorMatrix in="dG" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="cG"/>
    <feDisplacementMap in="SourceGraphic" in2="disp" scale="${cfg.depth - ch}" xChannelSelector="R" yChannelSelector="G" result="dB"/>
    <feColorMatrix in="dB" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="cB"/>
    <feBlend in="cR" in2="cG" mode="screen" result="cRG"/>
    <feBlend in="cRG" in2="cB" mode="screen" result="refr"/>
    <feGaussianBlur in="refr" stdDeviation="${cfg.blur}" result="refrb"/>
    <feColorMatrix in="refrb" type="saturate" values="${sat}" result="sat"/>
    <feComponentTransfer in="specmap" result="specA">
      <feFuncA type="linear" slope="${cfg.specular}" intercept="0"/>
    </feComponentTransfer>
    <feBlend in="sat" in2="specA" mode="screen"/>
  </filter>`;
}
