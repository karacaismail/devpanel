/** P6/P8/P9/P11/P12 — operasyonel mock veriler. */

/* ---------- P11: Log akışı (deterministik üreteç) ---------- */
export interface LogLine {
  ts: string;
  level: "info" | "warn" | "error";
  tenant: string;
  trace: string;
  msg: string;
}

const LOG_MSGS: Array<[LogLine["level"], string]> = [
  ["info", "GraphQL parties(filter) 18ms — RLS: tenant_id=acme"],
  ["info", "outbox flush: 12 event yayınlandı (order.completed v2)"],
  ["warn", "mail sağlayıcı birincil yanıt 2.4s — eşik 2s, ikincile geçilmedi"],
  ["info", "MCP archetype.party.crud çağrısı — agent: vibebot, scope: read"],
  ["error", "DLQ: invoice.create tüketicisi 3. kez başarısız (şema v1≠v2)"],
  ["info", "migration q-7 LLM-review etiketi: öneri hazır (karar bekliyor)"],
  ["warn", "fraud-guard sandbox: beyan dışı syscall engellendi"],
  ["info", "sdk check: 24/24 sözleşme yeşil — conformance ✓"],
];

export function generateLogs(count: number, offset = 0): LogLine[] {
  const out: LogLine[] = [];
  for (let i = 0; i < count; i++) {
    const n = offset + i;
    const [level, msg] = LOG_MSGS[n % LOG_MSGS.length];
    const sec = String(n % 60).padStart(2, "0");
    const min = String((10 + Math.floor(n / 60)) % 60).padStart(2, "0");
    out.push({
      ts: `14:${min}:${sec}`,
      level,
      tenant: n % 3 === 0 ? "globex" : "acme",
      trace: `tr-${(1000 + n * 17) % 9999}`,
      msg,
    });
  }
  return out;
}

/* ---------- P11: Outbox / DLQ ---------- */
export interface DlqItem {
  id: string;
  event: string;
  consumer: string;
  reason: string;
  age: string;
  attempts: number;
}

export const DLQ_ITEMS: DlqItem[] = [
  { id: "d1", event: "invoice.create v2", consumer: "billing", reason: "şema uyuşmazlığı (v1 tüketici)", age: "2s 14d", attempts: 3 },
  { id: "d2", event: "order.completed v2", consumer: "loyalty-points", reason: "sandbox stopped iken teslim", age: "41d", attempts: 1 },
  { id: "d3", event: "party.merged v1", consumer: "search-index", reason: "timeout 5s", age: "12d", attempts: 2 },
];

export const MAIL_PROVIDERS = [
  { name: "primary-smtp", success: 99.2, sent: 4180 },
  { name: "fallback-api", success: 97.8, sent: 312 },
  { name: "dev-sink (sandbox)", success: 100, sent: 86 },
];

/* ---------- P9: Test Runner ---------- */
export interface TestSuite {
  id: string;
  name: string;
  kind: "kontrat" | "rls" | "pii" | "conformance";
  passed: number;
  failed: number;
}

export const TEST_SUITES: TestSuite[] = [
  { id: "t1", name: "party.contract.test.ts", kind: "kontrat", passed: 12, failed: 0 },
  { id: "t2", name: "listing.contract.test.ts", kind: "kontrat", passed: 9, failed: 1 },
  { id: "t3", name: "party.rls.test.ts — komşu tenant okuyamaz", kind: "rls", passed: 6, failed: 0 },
  { id: "t4", name: "listing.rls.test.ts — komşu tenant okuyamaz", kind: "rls", passed: 6, failed: 0 },
  { id: "t5", name: "party.pii-mask.test.ts", kind: "pii", passed: 4, failed: 0 },
  { id: "t6", name: "sdk check — sözleşme conformance", kind: "conformance", passed: 24, failed: 0 },
];

export const SDK_CHECK_OUTPUT = `$ sdk check
✓ archetype şemaları geçerli (2/2)
✓ surface projeksiyonları tutarlı (2/2)
✗ listing-flow: active→sold telafi (compensation) tanımsız
✓ RLS: komşu tenant okuyamaz (12/12)
✓ PII maskeleme zorunlu alanlarda aktif
24 sözleşmeden 23 yeşil — kırmızı panel kapatılamaz.`;

/* ---------- P8: Migration kuyruğu ---------- */
export interface MigrationItem {
  id: string;
  archetype: string;
  summary: string;
  llmReview: "öneri-hazır" | "bekliyor" | "—";
  status: "kuyrukta" | "uygulandı" | "geri-alındı";
}

export const MIGRATION_QUEUE: MigrationItem[] = [
  { id: "q-7", archetype: "party", summary: "+loyalty_tier (tenant: acme), phone NOT NULL kaldır, legacy_code soft-drop", llmReview: "öneri-hazır", status: "kuyrukta" },
  { id: "q-6", archetype: "listing", summary: "+state workflow bağı (listing-flow v3)", llmReview: "—", status: "uygulandı" },
];

/* ---------- P6: API Explorer ---------- */
export const DEFAULT_GQL_QUERY = `query Parties {
  parties(filter: { status: active }, page: { size: 3 }) {
    id
    display_name
    email      # pii: maskeli döner
    city
  }
}`;

export const GQL_MOCK_RESPONSE = JSON.stringify(
  {
    data: {
      parties: [
        { id: 1, display_name: "Ayşe Yılmaz", email: "ay***@***.com", city: "İstanbul" },
        { id: 4, display_name: "Can Demir", email: "ca***@***.com", city: "Ankara" },
        { id: 9, display_name: "Elif Kaya", email: "el***@***.com", city: "İzmir" },
      ],
    },
    extensions: { tenant: "acme", rls: true, schemaVersion: "2026-06" },
  },
  null,
  2,
);

export const REST_ENDPOINTS = [
  { method: "GET", path: "/api/party", desc: "Liste (RLS + maskeli PII)" },
  { method: "GET", path: "/api/party/:id", desc: "Tekil kayıt" },
  { method: "POST", path: "/api/party", desc: "Oluştur (audit zorunlu)" },
  { method: "PATCH", path: "/api/party/:id", desc: "Güncelle (diff audit'e yazılır)" },
  { method: "GET", path: "/api/listing", desc: "Liste (bitemporal asOf destekli)" },
  { method: "POST", path: "/api/listing", desc: "Oluştur (workflow: draft)" },
];

/* ---------- P12: MCP tool kataloğu ---------- */
export interface McpTool {
  name: string;
  source: string;
  ops: string;
}

export const MCP_TOOLS: McpTool[] = [
  { name: "archetype.party.crud", source: "party (otomatik)", ops: "read · create · update" },
  { name: "archetype.listing.crud", source: "listing (otomatik)", ops: "read · create · update" },
  { name: "sdk.scaffold", source: "kernel", ops: "preview · apply (test-önce)" },
  { name: "surface.read", source: "kernel", ops: "read" },
  { name: "theme.apply", source: "kernel", ops: "apply (AA bekçili)" },
  { name: "data.query", source: "kernel", ops: "read (RLS + maske)" },
];
