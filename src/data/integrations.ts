/** Scheduler, Webhooks, E-posta Şablonları, Health mock verisi (Ahmet birleştirmesi). */

export interface CronJob {
  id: string;
  name: string;
  cron: string;
  enabled: boolean;
  lastRun: { at: string; status: "ok" | "fail" };
}

export const JOBS: CronJob[] = [
  { id: "outbox-sweeper", name: "Outbox süpürücü", cron: "*/5 * * * *", enabled: true, lastRun: { at: "10:55", status: "ok" } },
  { id: "nightly-retention", name: "Retention temizliği", cron: "0 3 * * *", enabled: true, lastRun: { at: "03:00", status: "ok" } },
  { id: "weekly-digest", name: "Haftalık özet maili", cron: "0 9 * * 1", enabled: true, lastRun: { at: "Pzt 09:00", status: "ok" } },
  { id: "dlq-reaper", name: "DLQ yaşlandırma raporu", cron: "30 7 * * 1-5", enabled: false, lastRun: { at: "07:30", status: "fail" } },
];

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  secret: string;
  deliveries: Array<{ at: string; code: number }>;
}

export const WEBHOOKS: Webhook[] = [
  {
    id: "billing-sync",
    url: "https://erp.acme.example/hooks/forge",
    events: ["order.completed", "party.merged"],
    active: true,
    secret: "whsec_canli_anahtar",
    deliveries: [
      { at: "10:58", code: 200 },
      { at: "10:42", code: 200 },
      { at: "10:17", code: 500 },
      { at: "09:55", code: 200 },
    ],
  },
  {
    id: "search-reindex",
    url: "https://search.internal/reindex",
    events: ["listing.published"],
    active: true,
    secret: "whsec_ikinci_anahtar",
    deliveries: [
      { at: "10:51", code: 200 },
      { at: "10:31", code: 200 },
    ],
  },
];

export function maskSecret(s: string): string {
  return `${s.slice(0, 6)}…${"•".repeat(6)}`;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: "welcome",
    name: "Hoş geldin",
    subject: "{{app}} hesabın hazır",
    body: "Merhaba {{ad}},\n\n{{app}} hesabın oluşturuldu. Panele {{url}} adresinden girebilirsin.\n\nSevgiler,\n{{app}} ekibi",
  },
  {
    id: "invoice-due",
    name: "Fatura hatırlatma",
    subject: "Fatura vadesi yaklaşıyor",
    body: "Sayın {{ad}},\n\n{{tutar}} tutarındaki faturanızın son ödeme tarihi {{son_tarih}}.\n\n{{app}}",
  },
];

/** Önizleme örnek değerleri — eksik bırakılan değişken {{aynen}} görünür. */
export const SAMPLE_VARS: Record<string, string> = {
  ad: "İsmail",
  app: "Forge",
  url: "https://panel.acme.example",
  tutar: "1.250 TL",
  son_tarih: "2026-06-30",
};

export interface ServiceHealth {
  id: string;
  name: string;
  status: "ok" | "degraded" | "down";
  detail: string;
  latency: string;
  uptime: number; // % 30 gün
}

export const SERVICES: ServiceHealth[] = [
  { id: "kernel-api", name: "Kernel API (GraphQL)", status: "ok", detail: "p95 23ms", latency: "23ms", uptime: 99.98 },
  { id: "postgres", name: "PostgreSQL", status: "ok", detail: "RLS aktif · bağlantı havuzu 12/50", latency: "2ms", uptime: 99.99 },
  { id: "outbox", name: "Outbox worker", status: "ok", detail: "gecikme < 1sn", latency: "—", uptime: 99.95 },
  { id: "mail", name: "Mail zinciri", status: "degraded", detail: "birincil sağlayıcı yavaş — ikincil devrede", latency: "2.4s", uptime: 97.8 },
  { id: "sandbox", name: "WASM sandbox", status: "degraded", detail: "fraud-guard karantinada", latency: "—", uptime: 99.2 },
];
