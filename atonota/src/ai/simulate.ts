/**
 * Atonota AI Simülasyon Motoru — deterministik, ağ'sız, TypeScript.
 * Doğal dil komutunu niyetine göre yönlendirir ve diff/önizleme üretir.
 * İlke: AI önerir, geliştirici onaylar; sessiz mutasyon yok.
 * Hem FloatingOrb hem ai-simulations sayfası bunu kullanır.
 */

export type Intent = "schema" | "palette" | "query" | "logs" | "test" | "module" | "explain";

export interface SimResult {
  intent: Intent;
  title: string;
  body: string;       // çok satırlı, kod/diff bloğu olabilir
  note: string;       // "öneri ≠ karar" türü kuyruk
  apply?: string;     // varsa uygulanacak CLI eşdeğeri
}

const TYPE_HINTS: Array<[RegExp, string]> = [
  [/e-?posta|email|mail/, "email"],
  [/tarih|dogum|vade|date/, "date"],
  [/fiyat|tutar|adet|stok|sayi|amount|price/, "number"],
  [/durum|öncelik|oncelik|kategori|tip|status/, "enum"],
  [/telefon|phone/, "phone"],
  [/açıklama|aciklama|not|yorum/, "textarea"],
];
const inferType = (n: string) => TYPE_HINTS.find(([re]) => re.test(n))?.[1] ?? "string";
const norm = (s: string) =>
  s.toLocaleLowerCase("tr").replaceAll("ç","c").replaceAll("ğ","g").replaceAll("ı","i").replaceAll("ö","o").replaceAll("ş","s").replaceAll("ü","u");

function classify(text: string): Intent {
  const t = norm(text);
  if (/(sema|schema|model|modul|tablo|alan ekle|crm|hrms)/.test(t)) return /modul/.test(t) ? "module" : "schema";
  if (/(renk|tema|palet|palette|theme|brand)/.test(t)) return "palette";
  if (/(sorgu|query|graphql|listele|getir|filtrele)/.test(t)) return "query";
  if (/(log|hata|anomali|yavas|slow)/.test(t)) return "logs";
  if (/(test|kontrat|contract)/.test(t)) return "test";
  return "explain";
}

function words(text: string): string[] {
  return [...new Set(norm(text).match(/[a-z_]{3,}/g) ?? [])]
    .filter((w) => !["sema","schema","model","modul","olustur","uret","icin","alan","ekle","bir","tablo","sistemi"].includes(w));
}

export function simulate(text: string): SimResult {
  const intent = classify(text);

  if (intent === "schema" || intent === "module") {
    const name = words(text)[0] ?? (intent === "module" ? "yeni_modul" : "tickets");
    const fields = (words(text).slice(1, 5).length ? words(text).slice(1, 5) : ["title", "status", "owner"]);
    const body = [
      "# AI taslağı — diff olarak gelir, sen onaylarsın",
      `name: ${name}`,
      "flags: { pii: SEÇ, audit: true }   # pii zorunlu seçim",
      "fields:",
      ...fields.map((w) => `  ${w}: { type: ${inferType(w)}${inferType(w) === "enum" ? ", values: [...]" : ""} }`),
      `# İLK üretilecek dosya: tests/${name}.contract.test.ts (test-önce)`,
    ].join("\n");
    return { intent, title: `${intent === "module" ? "Modül" : "Şema"} taslağı: ${name}`, body, note: "Taslak Schema Builder'da diff olarak açılır — onaysız yazılmaz.", apply: `sdk scaffold --name ${name} --test-first` };
  }

  if (intent === "palette") {
    const seed = [...text].reduce((s, c) => s + c.charCodeAt(0), 0);
    const hue = seed % 360;
    const body = [
      `# Palet önerisi (hue ${hue})`,
      `--bg:     hsl(${hue} 30% 6%)     AA zemin`,
      `--ink:    hsl(${hue} 20% 92%)    kontrast 15.2:1 ✓`,
      `--mute:   hsl(${hue} 12% 64%)    kontrast 6.1:1 ✓`,
      `--accent: hsl(${(hue + 24) % 360} 80% 68%)  kontrast 8.4:1 ✓`,
      "# Tümü WCAG AA bekçisinden geçti.",
    ].join("\n");
    return { intent, title: "Tema paleti", body, note: "AA altı değer kaydedilemez — uygula dersen tenant token dosyası yazılır.", apply: "sdk theme apply --tenant {{org}}" };
  }

  if (intent === "query") {
    const t = norm(text);
    const days = /(\d+)\s*gun/.exec(t)?.[1] ?? "30";
    const status = /pasif/.test(t) ? "passive" : /blok/.test(t) ? "blocked" : "active";
    const entity = /listing|ilan/.test(t) ? "listings" : "parties";
    const body = [
      "query AiUretti {",
      `  ${entity}(filter: { status: ${status}, createdAfter: "-P${days}D" }, page: { size: 50 }) {`,
      "    id",
      entity === "parties" ? "    email      # maskeli döner" : "    title price",
      "  }",
      "}",
      "# RLS: tenant_id otomatik; PII maskesi sorgu seviyesinde kaldırılaMAZ.",
    ].join("\n");
    return { intent, title: "Doğal dil → GraphQL", body, note: "API Explorer'a kopyalanabilir.", apply: "sdk api query --lang graphql" };
  }

  if (intent === "logs") {
    const body = [
      "Son 1 saatin log özeti (842 satır → 4 bulgu):",
      "1. ⚠ mail birincil sağlayıcı p95 2.4s — eşik 2s. İkincile 2 kez geçildi.",
      "2. ✗ DLQ +3: invoice.create v2 şema uyuşmazlığı (v1 tüketici billing).",
      "3. ⚡ parties(filter) %18'i index'siz order.placed_at filtreliyor.",
      "4. ✓ RLS ihlal denemesi yok; PII erişimleri maskeli yüzeyden.",
    ].join("\n");
    return { intent, title: "Log anomali özeti", body, note: "Önerilen aksiyonlar Issues'a taslak eklenebilir — onayın olmadan açılmaz.", apply: "sdk logs tail --level warn" };
  }

  if (intent === "test") {
    const target = words(text)[0] ?? "party";
    const body = [
      "// İLK üretilen dosya — kırmızı başlar (test-önce)",
      'import { describe, it, expect } from "vitest";',
      `describe("${target} sözleşmesi", () => {`,
      '  it("tanım şemaya uyar", () => { /* fixture */ });',
      '  it("komşu tenant okuyamaz (RLS)", () => { /* iki tenant */ });',
      '  it("pii alanları maskeli döner", () => { /* maskeli yüzey */ });',
      "});",
    ].join("\n");
    return { intent, title: `Kontrat testi: ${target}`, body, note: "Test Runner'da kırmızı bölgede görünür — tanım onu yeşile çevirir.", apply: `sdk test gen --target ${target}` };
  }

  return {
    intent: "explain",
    title: "Yanıt",
    body: `"${text.trim()}" — bağlamdaki kayıtlardan derlenen yanıt (deterministik demo).\nÖrnek isteyebilirsin: "crm şeması oluştur", "koyu yeşil palet", "son 30 günde aktif partyler", "logları özetle", "party için test üret".`,
    note: "Kaynak atfı: ADR-0008 · REQ-114 — AI yanıtı kayıt sistemi değildir.",
  };
}

export const SUGGESTIONS = [
  "crm şeması oluştur",
  "koyu yeşil, kurumsal palet",
  "son 30 günde eklenen aktif partyler",
  "logları özetle",
  "party için kontrat testi üret",
];

/**
 * Bir komut/önerinin geri-alınamaz (yıkıcı) olup olmadığını söyler. Apply diyaloğu
 * true dönerse isim-yazarak onay (ConfirmDanger deseni) ister. Deterministik.
 */
export function isDestructive(text: string): boolean {
  const t = norm(text);
  return /(sil|drop|kaldir|reset|sifirla|migration|migrate|production|prod|gonder|deploy|rollback|geri al|truncate|purge)/.test(t);
}
