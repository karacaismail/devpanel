import { PAGES } from "@/engine/loader";
import { evaluate } from "@/engine/conditions";
import type { EvalContext, Section } from "@/engine/types";

/**
 * Proaktif AI önerileri — deterministik, ağ'sız. Mevcut sayfanın JSON içeriğini
 * (callout/metric/table) bağlama göre tarar ve "AI bunu fark etti, çözmemi ister
 * misin?" türü TIKLANABILIR öneriler çıkarır. İlke korunur: AI önerir, geliştirici
 * onaylar — bu yalnız bir öneridir, otomatik aksiyon değil.
 */

export type ProactiveTone = "danger" | "warning" | "info";

export interface Proactive {
  tone: ProactiveTone;
  /** Kullanıcıya gösterilen kısa farkındalık metni. */
  text: string;
  /** Tıklanınca AI'a gönderilecek doğal-dil komutu. */
  command: string;
  /** Kaynağı (hangi section'dan geldi) — şeffaflık için. */
  source: string;
}

const visible = (s: Section, ctx: EvalContext) => !s.when || evaluate(s.when, ctx);

/** Tek bir callout/metric'ten doğal-dil bir "çöz" komutu türetir. */
function commandFor(tone: ProactiveTone, text: string): string {
  if (tone === "danger") return `Bu sorunu nasıl çözerim: ${trim(text)}`;
  if (tone === "warning") return `Bu uyarıyı incele ve öneri ver: ${trim(text)}`;
  return `Detaylandır: ${trim(text)}`;
}

const trim = (s: string) => (s.length > 90 ? `${s.slice(0, 87)}…` : s);
const toneOf = (t: unknown): ProactiveTone =>
  t === "danger" ? "danger" : t === "warning" || t === "warn" ? "warning" : "info";

/**
 * Sayfa kimliği + bağlamdan proaktif öneri listesi. Yalnız görünür (when geçen)
 * danger/warning callout'ları öneriye çevrilir — info/ok gürültüsü dışarıda kalır.
 * En kritik (danger) önce; en çok 4 öneri.
 */
export function proactiveFor(pageId: string, ctx: EvalContext): Proactive[] {
  const page = PAGES[pageId];
  if (!page) return [];
  const out: Proactive[] = [];

  for (const s of page.sections ?? []) {
    if (s.type !== "callout" || !visible(s, ctx)) continue;
    const tone = toneOf(s.tone);
    if (tone === "info") continue; // yalnız aksiyon gerektirenler
    const text = String(s.text ?? "").replaceAll("{{org}}", ctx.org).replaceAll("{{env}}", String(ctx.env));
    if (!text) continue;
    out.push({ tone, text, command: commandFor(tone, text), source: `${pageId}.callout` });
  }

  out.sort((a, b) => weight(b.tone) - weight(a.tone));
  return out.slice(0, 4);
}

const weight = (t: ProactiveTone) => (t === "danger" ? 2 : t === "warning" ? 1 : 0);

/**
 * Sayfaya özel hızlı komutlar — orb'un bağlama göre önerdiği "şunu dene" çipleri.
 * Sayfanın CLI tool'undan ve grubundan türetilir; içerik JSON'ı tek kaynak kalır.
 */
export function quickCommandsFor(pageId: string): string[] {
  const page = PAGES[pageId];
  if (!page) return [];
  // aisim section'ı varsa onun örnekleri en alakalı komutlardır
  const aisim = page.sections?.find((s) => s.type === "aisim");
  if (aisim && Array.isArray(aisim.examples)) return (aisim.examples as string[]).slice(0, 4);

  // yoksa sayfanın doğasına göre türet
  const g = page.group?.toLocaleLowerCase("tr") ?? "";
  if (g.includes("tasarla")) return ["bu modüle alan ekle", "şema diff'i göster", "kontrat testi üret"];
  if (g.includes("gözlemle")) return ["son hataları özetle", "anomali var mı?", "p95 latency raporu"];
  if (g.includes("yürüt")) return ["migration planı çıkar", "rollout durumu", "riskleri listele"];
  return ["bu sayfada ne yapabilirim?", "özet çıkar", "öneri ver"];
}
