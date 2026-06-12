/**
 * Atonota İçerik Motoru — tip sözleşmesi.
 * Tüm sayfa içeriği content/*.json'dan gelir; bu tipler JSON şemasını tanımlar.
 * UI hiçbir içeriği hard-code etmez; engine JSON → React'e çevirir.
 */

/** Bir sayfanın tek bölümü. `type` registry'deki bir bileşene eşlenir. */
export interface Section {
  type: string;
  /** ECA: bu bölüm yalnız koşul doğruysa render edilir (ör. "env == production"). */
  when?: string;
  /** Bölüme özel serbest alanlar (registry bileşeni yorumlar). */
  [key: string]: unknown;
}

export interface PageDef {
  id: string;
  title: string;
  icon?: string;
  group: string;
  description?: string;
  lifecycle?: "Draft" | "Staged" | "Released";
  /** Atonota ilkesi: her sayfanın CLI/MCP eşdeğeri. */
  cli?: { tool: string; args?: Record<string, unknown> };
  sections: Section[];
}

export interface NavLeaf {
  label: string;
  page: string; // PageDef.id
  icon?: string;
}

export interface NavGroup {
  label: string;
  icon?: string;
  minRole?: string;
  items: NavLeaf[];
}

export interface NavDef {
  groups: NavGroup[];
}

/** ECA kuralı: olay/koşul → aksiyon. Motor JSON'dan okur, runtime'da değerlendirir. */
export interface Rule {
  id: string;
  when: string; // ör. "env == production"
  then: string; // ör. "lock:destructive" | "show:prodBanner"
  note?: string;
}

/** Engine'in değerlendirme bağlamı — interpolasyon ve koşullar bunu okur. */
export interface EvalContext {
  org: string;
  env: string;
  role: string;
  [key: string]: string | number | boolean;
}
