# devpanel — Developer Panel (enterprise prototip)

`devpanel.md` gereksinim analizinin (ADR-0007..0010, be-kararlar) uygulaması: P0 çekirdeği + P1–P13 modüllerinin tamamı.
Drupal admin / Frappe Desk / Django Admin sınıfı, **geliştirici odaklı**; son-kullanıcı paneli kapsam dışı.

## Çalıştırma

```bash
npm install
npm test        # kontrat testleri (bileşenlerden ÖNCE yazıldı)
npm run dev     # http://localhost:5173
npm run build   # tsc + vite production build
```

Gereksinim: Node 20+ (macOS arm64 ve Debian amd64 doğrulandı varsayımıyla aynı lockfile).

## Modül kapsamı (devpanel.md §3)

P0 çekirdeği: ArcheType Studio (bayraklar + doğurdukları) · Surface Builder (headless anahtarı + canlı önizleme) · CommandPalette (⌘K, "crm dağ yap" → scaffold ÖNİZLEME, yazma yok) · Data Browser (PII maskeli EntityTable) · Tema/Token Editörü (AA bekçisi).

Enterprise genişleme (P3–P12): Workflow Designer (durum makinesi SVG, telafi-zorunlu denetimi, tenant pinleme) · Module Manager (manifest/izin beyanı, WASM sandbox durumu, registry, PermissionMatrix E1) · Domain & Contract Haritası (kaya sınırları + ihlal uyarıları) · API Explorer (GraphQL playground + REST/OpenAPI + şema pinleme) · Migration Paneli (SchemaDiffViewer, LLM-review kuyruğu, uygula/geri al) · Test Runner (kapatılamaz kırmızı panel, "komşu tenant okuyamaz" vitrini, sdk check) · WBS/Backlog (SP kırılımı, ağaçta komşuluk denetimi, "AI'a tarif et") · Observability (canlı LogStream, DlqBoard, mail zinciri) · AI Konsolu (MCP tool kataloğu, CapabilityScopeEditor, blast-radius + geniş yarıçapta ek onay).

Kurumsal davranışlar: tüm yıkıcı işlemler isim-yazarak onay (`ConfirmDanger`) · her ekranda CLI/MCP eşdeğeri (`EquivalencePanel`) · komşuluk kuralı hem palette hem WBS ağacında engelleyici · alt durum çubuğu (conformance / migration kuyruğu / DLQ, tıklanınca ilgili panele gider) · 320px akışkan, dark-first, Roboto 300, min 1rem.

Deneyim katmanı: Genel Bakış = operasyon panosu (tıklanabilir KPI kartları, outbox sparkline, son aksiyonlar) · TopBar (breadcrumb, ⌘K arama, bildirim merkezi, env seçici, kullanıcı) · Audit Log ekranı (layer1-audit: her aksiyon aktör + CLI eşdeğeriyle append-only; agent aksiyonları işaretli) · tüm yazma aksiyonları `logAction` üzerinden audit + toast üretir · ⌘K paleti ekran navigasyonu yapar ("Git → …", Türkçe-normalize arama) · deep-link (`#migration` gibi hash ↔ ekran).

## Stack (devpanel.md §6 kararları)

Vite SPA + React 19 + TypeScript · Tailwind v4 (09A token köprüsü `src/styles/global.css` `@theme` bloğu) · Radix UI primitive (Dialog/Tabs/Switch) — headless, sahiplenilmiş görsel dil · TanStack Table + Query · zustand · Phosphor ikonları · vitest + Testing Library. **Yok:** Next.js, Flowbite, Redux, hazır-temalı kit, telemetri.

P0'da bilinçli sade tutulanlar (üretim hedefi §6'da): route katmanı (hedef TanStack Router), YAML editörü (hedef CodeMirror 6 + şema doğrulama), tablo sanal kaydırma (hedef ≥100k satır), react-hook-form+zod form altyapısı.

## Dizin yapısı

```
src/
  __tests__/    kontrat testleri (test-önce — kaynak sırası budur)
  lib/          granularity (komşuluk), contrast (AA), cli (CLI/MCP), workflow, diff, blast, wbs, store
  data/         mock tanımlar: archetypes/surfaces, modules, contracts, ops (log/DLQ/test/migration/MCP)
  components/   CommandPalette, EntityTable, EquivalencePanel, WorkflowGraph, SchemaDiffViewer,
                LogStream, DlqBoard, PermissionMatrix, ConfirmDanger, YamlView, LevelBadge, EmptyState
  screens/      ArchetypeStudio, SurfaceBuilder, WorkflowDesigner, ModuleManager, DomainMap,
                ApiExplorer, DataBrowser, MigrationPanel, TestRunner, WbsBacklog, Observability,
                AiConsole, ThemeEditor, Overview
```

## Deploy notu

Statik SPA: `npm run build` → `dist/`. GitHub private repo → Actions ile build → Hetzner (Debian/amd64) üzerinde herhangi bir statik sunucu (Caddy/nginx) yeterli; Node çalışma zamanı gerekmez.
