import type { ScreenId } from "./store";

export interface ScreenMeta {
  id: ScreenId;
  label: string;
  group: string;
  keywords: string[];
}

/** Tek doğruluk kaynağı: ekran kayıt defteri — nav, breadcrumb, ⌘K araması, deep-link. */
export const SCREEN_REGISTRY: ScreenMeta[] = [
  { id: "overview", label: "Genel Bakış", group: "", keywords: ["dashboard", "ana", "ozet"] },
  { id: "learn", label: "Eğitim Yolu", group: "", keywords: ["onboarding", "tur", "ogren", "vibecoder"] },
  { id: "archetype", label: "ArcheType Studio", group: "Tanım", keywords: ["yaml", "bayrak", "pii", "alan", "custom field"] },
  { id: "surface", label: "Surface Builder", group: "Tanım", keywords: ["form", "projeksiyon", "headless", "edition"] },
  { id: "fragments", label: "Fragment Kitaplığı", group: "Tanım", keywords: ["parca", "adres", "money", "miras", "alan grubu"] },
  { id: "erd", label: "ERD — Şema Haritası", group: "Tanım", keywords: ["iliski", "diagram", "ref", "relation"] },
  { id: "workflow", label: "Workflow Designer", group: "Tanım", keywords: ["durum", "state", "telafi", "compensation", "surum"] },
  { id: "domains", label: "Domain & Contract", group: "Tanım", keywords: ["kaya", "sinir", "kontrat", "ihlal"] },
  { id: "data", label: "Data Browser", group: "Veri", keywords: ["tablo", "kayit", "rls", "tenant", "maske"] },
  { id: "migration", label: "Migration Paneli", group: "Veri", keywords: ["sema", "schema", "diff", "llm", "geri al"] },
  { id: "api", label: "API Explorer", group: "Veri", keywords: ["graphql", "rest", "openapi", "playground"] },
  { id: "events", label: "Event Kataloğu", group: "Veri", keywords: ["outbox", "yayin", "abone", "payload"] },
  { id: "webhooks", label: "Webhooks", group: "Veri", keywords: ["hook", "teslimat", "abonelik", "imza"] },
  { id: "reports", label: "Reports", group: "Veri", keywords: ["rapor", "grafik", "dagilim", "ozet"] },
  { id: "media", label: "Media", group: "Veri", keywords: ["dosya", "gorsel", "varlik", "upload"] },
  { id: "tests", label: "Test Runner", group: "Kalite & İşletim", keywords: ["kontrat", "kirmizi", "sdk check", "conformance"] },
  { id: "observability", label: "Observability", group: "Kalite & İşletim", keywords: ["log", "trace", "dlq", "outbox", "mail"] },
  { id: "audit", label: "Audit Log", group: "Kalite & İşletim", keywords: ["denetim", "kim", "aksiyon", "gecmis"] },
  { id: "scheduler", label: "Scheduler", group: "Kalite & İşletim", keywords: ["cron", "zamanlama", "is", "job"] },
  { id: "health", label: "Health", group: "Kalite & İşletim", keywords: ["saglik", "uptime", "servis", "durum"] },
  { id: "terminal", label: "Terminal", group: "Kalite & İşletim", keywords: ["repl", "konsol", "cli", "sdk"] },
  { id: "modules", label: "Module Manager", group: "Genişletme", keywords: ["eklenti", "plugin", "wasm", "sandbox", "registry"] },
  { id: "ai", label: "AI Konsolu", group: "Genişletme", keywords: ["mcp", "agent", "scope", "blast"] },
  { id: "wbs", label: "WBS / Backlog", group: "Genişletme", keywords: ["plan", "sp", "kirilim", "backlog"] },
  { id: "theme", label: "Tema / Token", group: "Genişletme", keywords: ["brand", "renk", "token", "kontrast", "aa"] },
  { id: "emails", label: "E-posta Şablonları", group: "Genişletme", keywords: ["mail", "template", "degisken", "sablon"] },
  { id: "tenants", label: "Tenant Yönetimi", group: "Yönetim", keywords: ["edition", "musteri", "pin", "kiraci"] },
  { id: "settings", label: "App Ayarları", group: "Yönetim", keywords: ["config", "rest", "retention", "dil", "locale"] },
  { id: "releases", label: "Sürümler", group: "Yönetim", keywords: ["release", "changelog", "pin", "sema surumu"] },
  { id: "roles", label: "Roles", group: "Yönetim", keywords: ["rbac", "izin", "yetki", "rol"] },
  { id: "code", label: "Code Editor", group: "Genişletme", keywords: ["json", "ham", "tanim", "duzenle"] },
];

function normalize(s: string): string {
  return s
    .toLocaleLowerCase("tr")
    .replaceAll("ğ", "g")
    .replaceAll("ü", "u")
    .replaceAll("ş", "s")
    .replaceAll("ı", "i")
    .replaceAll("ö", "o")
    .replaceAll("ç", "c")
    .trim();
}

/** ⌘K ekran araması: etiket + anahtar kelime, Türkçe-normalize substring. */
export function searchScreens(query: string): ScreenMeta[] {
  const q = normalize(query);
  if (!q) return [];
  return SCREEN_REGISTRY.filter(
    (s) =>
      normalize(s.label).includes(q) ||
      s.keywords.some((k) => normalize(k).includes(q)),
  ).slice(0, 5);
}

/** Deep-link: location.hash → ekran id. */
export function screenFromHash(hash: string): ScreenId | null {
  const id = hash.replace(/^#/, "");
  return SCREEN_REGISTRY.some((s) => s.id === id) ? (id as ScreenId) : null;
}

export function screenMeta(id: ScreenId): ScreenMeta {
  return SCREEN_REGISTRY.find((s) => s.id === id) ?? SCREEN_REGISTRY[0];
}
