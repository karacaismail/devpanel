# Atonota Eksik Envanteri ve Uygulama Talimatı Raporu

> **DURUM (2026-06-12, ikinci geçiş): TÜM FAZLAR UYGULANDI.** Faz A (Q1–Q4 + K1) ✓ · Faz B (K2–K9 + taksonomi) ✓ · Faz C (S1, S6–S9, Y1–Y3) ✓ · Faz D (Y4–Y6, S11–S12, S17) ✓ · Faz E (Y7–Y8, S5, S10, S13) ✓ · Faz F (S2–S4, S14–S16) ✓ · Q4: orijinal 23 sayfaya CliEquivalent eklendi ✓. Doğrulama: kemik 14 + S-yaması 30 = **44 test yeşil** (izole harness); `next build` yerelde/CI'da koşulmalı. Açık kalan tek katman: Faz G (Pazar Yeri + Faturalama — tetikleyici bekliyor).

Tarih: 2026-06-12 · Kapsam: `boradev` birleşik konsolu (51 sayfa, 4 bölgeli kabuk) · Kaynak: Atonota araştırma raporları serisi (3 rapor) + uygulama sonrası öz-denetim bulguları.

Bu rapor talimat niteliğindedir: her madde "ne eksik → nereye eklenecek → nasıl eklenecek" biçiminde yazılmıştır. İlke korunacaktır: **gerekmedikçe yeni sayfa açılmayacak, mevcut sayfa geliştirilecek; gerektiğinde kapsayıcı ad ile yeniden adlandırılacaktır.**

---

## 1. Mevcut Durum Tespiti (Karşılanmış Olanlar)

Aşağıdakiler raporlardan panele aktarılmıştır ve yeniden yapılmayacaktır: dört bölgeli kabuk iskeleti (Global Context Bar, sağ Context Inspector, alt Dev Workspace çekmecesi, akordeon sol menü); Engines & Adapters sayfası (motor adlarının ana menüden çıkarılması kuralı dahil); Yönetişim & Kalite çekirdeği (REQ/ADR/RTM/CCB/sign-off/faz kapıları); AI Katmanı çekirdeği (BYOK, model routing, prompt registry, guardrail anahtarları, maliyet panosu); Tenant & Siteler, Ortam & Release adlandırmaları; prod geçişinde kırmızı uyarılı onay; "AI önerir, geliştirici onaylar" deseni ve CLI/MCP eşdeğeri ilkesi.

---

## 2. EKSİK ENVANTERİ — Talimatlar

### 2.1 Kabuk Derinleştirme (yeni sayfa YOK — mevcut bileşenler geliştirilecek)

| # | Eksik | Talimat | Hedef dosya |
|---|---|---|---|
| K1 | Ortam seçimi yalnızca görsel | Env/org/tenant bağlamı global store'a (zustand) taşınacak; tüm sayfalar bu bağlamı okuyacak, prod'da yıkıcı eylemler otomatik kilitlenecektir. | `global-context-bar` + yeni `stores/context-store` |
| K2 | Inspector statik | Sayfalar seçili nesneyi (satır/kart/düğüm) inspector'a besleyecek bir `selection-store` kurulacak; Özellikler sekmesi gerçek metadata JSON'u gösterecektir. İlişkili kayıtlar ve History alt sekmeleri eklenecektir. | `inspector-rail` + sayfa entegrasyonları |
| K3 | Alt çekmece sığ | Python konsolu ve DB shell sekmeleri eklenecek; Loglar sekmesine yavaş-sorgu monitörü (eşik aşan sorgular ayrı vitrin) ve ağ trafiği özeti eklenecektir. | `dev-dock` |
| K4 | Breadcrumb yok | Canvas başlığının üstüne hiyerarşik breadcrumb eklenecek; segmentler kardeş kayıtlara geçiş dropdown'u taşıyacaktır. | yeni `breadcrumb` bileşeni + layout |
| K5 | Impersonation banner yok | "Kullanıcı olarak görüntüle" modu eklenecek: aktif olduğunda tam genişlik uyarı bandı, hedef rol etiketi, Sonlandır eylemi ve audit kaydı zorunluluğu. | yeni `impersonation-banner` |
| K6 | Evrensel arama eksik | ⌘K paleti genişletilecek: niyet yönlendirici (komut/arama/soru), kapsam filtreleri (tenant/sayfa/log/ayar), son komutlar, bağlam çipi (tenant+env+sayfa), ajan modu anahtarı (sor/uygula/otopilot — otopilot prod'da devre dışı) ve kaynak atıf satırı. | `dynamic-island` / `keyboard-shortcuts` genişletmesi |
| K7 | Canvas header standardı yok | Her sayfa başlığına standart şerit eklenecektir: owner chip, lifecycle rozeti (Draft/Staged/Released), revizyon ID, compare/diff ve promote/approve eylemleri. Tek bir `PageHeader` bileşeni yazılıp sayfalara yayılacaktır. | yeni `page-header` + tüm sayfalar |
| K8 | Menü görünürlüğü filtresiz | Sidebar öğeleri üç filtreye bağlanacaktır: rol, kurulu capability, seçili kapsam. Yetkisiz öğe gizlenmeyecek, read-only rozetiyle gösterilecektir (şeffaflık kuralı). | `sidebar` + `context-store` |
| K9 | AI Context Modal yok | Proaktif öneri pop-up'ı eklenecek: yavaş sorgu algılandığında sağ alttan "indeks oluşturayım mı?" kartı; kabul → diff → onay → audit zinciri. | yeni `ai-context-modal` |

### 2.2 Taksonomi Yeniden Gruplama (sayfa eklemeden yeniden dağıtım)

Mevcut 9 grup, raporların görev-tabanlı üst kümelerine taşınacaktır: **Tasarla** (Schema, ArcheType, Forms, Surface, Fragments, ERD, Workflows, Domain, Email Templates, Theme, Code Editor) · **Yürüt** (Tenant & Siteler, Ortam & Release, Data, Migration, API, Events, Webhooks, Media, Scheduler, Logs, DLQ, Health, Terminal, Reports) · **Kontrol Et** (Test Runner, Activity, Permissions, API Keys, Yönetişim & Kalite, Docs) · **AI** (mevcut grup korunur) · **Platform** (Engines & Adapters, Settings, Team). Geçiş tek PR'da yapılacak, eski grup adları arama anahtar kelimesi olarak korunacaktır.

### 2.3 Mevcut Sayfa Geliştirmeleri (yeni sayfa YOK)

| # | Sayfa | Eklenecek (rapor karşılığı) |
|---|---|---|
| S1 | `/tenants` | 6 adımlı Provizyon Sihirbazı (ad/subdomain → bölge → plan → uygulamalar → DB izolasyonu → onay/dağıt); tenant detay sekmeleri: Overview (kaynak kullanımı), Apps, Domains & SSL, Backups (manuel tetikle + geri yükle), Site Config (anahtar/değer), DB Analyzer (yavaş sorgu/boyut), Jobs, Actions + **Dangerous Actions** (reset/drop — isim-yazarak onay). Filo-çapı metrik kartları (MAU/QPS/hata, sparkline'lı) liste üstüne eklenecektir. |
| S2 | `/schema` + `/erd` | Visual Schema Designer öğeleri: sol araç kutusu (veri tipi draggable rozetleri), tablo kartlarında PK/index ikonları, üst toolbar (Taslak kaydet / Geri al / **Request Approval**), model adında Draft rozeti. AI şema üretici girişi tuval köşesine taşınacaktır. |
| S3 | `/forms` | Smart Form Controller önizlemesi (model adından form üretimi), Advanced Link Combobox (debounced FK arama), grid tabanlı yerleşim tuvali, responsive viewport toggle'ları (mobil/tablet/masaüstü), erişilebilirlik denetim rozeti. |
| S4 | `/workflows` + `/code-editor` | Olay seçici (before_insert/on_update/on_submit/on_cancel), telafi (compensation) zorunlu alanı, durum düğümlerinde yetki bağlayıcı geçişler; code-editor'a tetikleyici bağlama + test/çalıştırma paneli + satır içi AI kod asistanı ("yorumdan fonksiyon üret" deseni). |
| S5 | `/permissions` | ABAC koşul politikaları ve ReBAC ilişki izinleri bölümleri; **İzin Değerlendirici** (kullanıcı+kaynak+scope simülasyonu → grant/deny çıktısı); composite rol desteği. |
| S6 | `/logs` | Log drain/export yapılandırması, kaynak/tenant/seviye filtre çubuğu standardı, yavaş-sorgu monitör sekmesi. |
| S7 | `/health` | Uptime monitör listesi (etkinleştir/devre dışı), incident banner alanı. |
| S8 | `/migration` | Versiyon yükseltme sihirbazı; bekleyen/uygulanmış ayrımı korunacaktır. |
| S9 | `/deployments` | Branch ağacı (prod en üstte), build detayında log sekmeleri (install/pip), mail catcher notu (dev/staging — prod'da gerçek gönderim uyarısı), **Release Dossier** kartı: build + migration planı + onay listesi + rollback planı + checksum tek pakette. |
| S10 | `/governance` | Eksik artefakt'lar eklenecek: **Deviation/Waiver** (sapma, süre, riski kabul eden, son tarih), **Design Baseline** (onaylı metadata snapshot'ı), Test Evidence'ın kanıt-ekli ayrı bölümü; release dossier'e çapraz bağ. |
| S11 | `/ai-platform` | Evals bölümü genişletilecek: versiyonlu dataset yönetimi, LLM-as-judge / kod evaluatörü / insan feedback seçimi, deney karşılaştırma tablosu, CI eval entegrasyon anahtarı. |
| S12 | `/agent-runs` | AI gözlemlenebilirlik birleştirmesi: trace listesine token/latency/maliyet kolonları, session görünümü, ajan grafiği, anotasyon kuyruğu (human feedback). |
| S13 | `/settings` | Güvenlik politikaları bölümü (login attempt limiti, parola politikası), proje bilgileri (ad/logo/renk), varsayılanlar (limit, telemetri anahtarı — kilitli). |
| S14 | `/docs` | TechDocs ağacı, SOP bölümü, sürüm seçici, indirilebilir export paketi, AI dokümantasyon asistanı girişi. |
| S15 | `/dependencies` | "Portföy & Bağımlılıklar" olarak yeniden adlandırılacak; programlar/ürün aileleri/ownership graph bölümleri eklenecektir. |
| S16 | `/modules` | Blueprint/Scaffold bölümü: create-from-template sihirbazı, capability rozetleri, versiyon etiketleri. |
| S17 | `/reports` | "Metrikler & Raporlar" olarak genişletilecek: özel pano oluşturucu (dataset/metric/dimension/filter seçicileri), doğal dil sorgu girişi. |

### 2.4 Yeni Sayfalar (mevcutta karşılığı yok — açılması gereklidir)

| # | Sayfa | Gerekçe ve içerik |
|---|---|---|
| Y1 | `/infrastructure` — Sunucu Filosu | Sunucu listesi (bölge/plan/kullanım/durum), ölçekleme kuralları (oto/yatay/dikey), bölgeler; sekmeli tek sayfa. Mevcut hiçbir sayfa altyapıyı taşımıyor. |
| Y2 | `/databases` — Veritabanları | Per-tenant DB listesi, DB metrikleri, shell/yedek/geri yükleme kısayolları. Tenant-per-DB birinci sınıf nesne olduğundan ayrı sayfa zorunludur. |
| Y3 | `/network` — Depolama, CDN & Ağ | DNS kayıtları, SSL sertifikaları, CDN/cache, bucket/depolama dökümü (onsite/offsite). |
| Y4 | `/traces` — Trace'ler | Trace listesi, span ağacı, P50/P99 latency dağılımı. Logs'tan ayrı tutulacaktır (OpenTelemetry üçlüsü kuralı). |
| Y5 | `/alerts` — Uyarılar | Kural listesi, eşik yapılandırıcı, bildirim kanalı eşleme (webhook/çağrı). |
| Y6 | `/vectors` — Embedding & Vektör Depoları | Depo listesi, embedding pipeline yapılandırması, indeks/koleksiyon yönetimi, benzerlik arama test paneli. |
| Y7 | `/identity` — Kimlik Sağlayıcılar & Oturumlar | Sekmeli: OAuth istemcileri (confidential/public, redirect/scope), IdP'ler (OIDC/SAML/LDAP federation), Sessions monitörü, MFA politikası. |
| Y8 | `/secrets` — Sırlar | Secret listesi (vault referanslı), rotasyon politikası, erişim denetimi, env-scope ayrımı. API Keys'ten ayrıdır: anahtar ≠ sır. |

### 2.5 Bilinçli Ertelenenler (tetikleyiciye bağlanmıştır — şimdi YAPILMAYACAK)

Pazar Yeri (vitrin, yayıncı paneli, inceleme kuyruğu, payouts) ve Faturalama & Ölçümleme (planlar, abonelikler, metering, faturalar) raporların kendi Faz-3 kuralı gereği çekirdek konsol stabilize olmadan açılmayacaktır. Tetikleyiciler: üçüncü-taraf geliştirici hacmi artarsa pazar yeri öne çekilecek; AI token maliyeti kritikleşirse Gateway semantik önbellek MVP'ye alınacaktır.

### 2.6 Kalite ve Doğrulama Borçları (en yüksek öncelik)

| # | Borç | Talimat |
|---|---|---|
| Q1 | boradev'de sıfır test | Vitest + Testing Library kurulacak; Vite panelindeki kemik sözleşmesi uyarlanacaktır: tüm sayfalar çöküşsüz render, her sayfada CLI/MCP eşdeğeri, kabuk bileşenleri daima mevcut, akordeon tek-açık davranışı. CI workflow'u (test + build) eklenecektir. |
| Q2 | `next build` doğrulanmadı | Üretim derlemesi yalnız sözdizimi/tip düzeyinde kontrol edildi (sandbox disk kısıtı). İlk iş olarak yerelde `npm run build` koşulacak; CI'da zorunlu kapı yapılacaktır. |
| Q3 | CLAUDE.md sözleşmesi yok | Vite panelindeki geliştirme sözleşmesi (test-önce, değişmezler, yasaklar, ekran ekleme reçetesi) boradev'e uyarlanıp köke konacaktır. |
| Q4 | CLI/MCP eşdeğeri yalnız taşınan sayfalarda | Bora'nın orijinal 24 sayfasına da `CliEquivalent` eklenecektir (UI=API=CLI ilkesi). |

---

## 3. Şelale Fazlaması (uygulama sırası — kapı geçilmeden sonraki başlamaz)

**Faz A — Temel ve Kanıt (kapı: CI yeşil):** Q1–Q4 + K1 (context store). Test altyapısı ve gerçek env state'i olmadan diğer fazlar başlamayacaktır.
**Faz B — Kabuk Derinleştirme (kapı: kabuk bileşen testleri):** K2–K9 + 2.2 taksonomi geçişi.
**Faz C — Yürütme Katmanı (kapı: tenant yaşam döngüsü uçtan uca):** S1, S9, Y1–Y3, S6–S8.
**Faz D — Gözlemlenebilirlik ve AI (kapı: trace→eval zinciri):** Y4–Y6, S11–S12, S17, K9 bağlantısı.
**Faz E — Kimlik ve Yönetişim Tamamlama (kapı: izin değerlendirici simülasyonu):** Y7–Y8, S5, S10, S13.
**Faz F — Tasarım Stüdyoları (kapı: schema draft→approval akışı):** S2–S4, S14–S16.
**Faz G — Gelir Katmanı:** 2.5 tetikleyicileri gerçekleşirse Pazar Yeri + Faturalama.

---

## 4. Sayım Özeti

Kabuk geliştirmesi: 9 kalem · Taksonomi: 1 geçiş · Mevcut sayfa geliştirmesi: 17 sayfa · Yeni sayfa: 8 (51 → 59) · Ertelenen: 2 domain (9-10 sayfa) · Kalite borcu: 4 kalem. Raporlardaki tüm yapısal öğeler bu envanterle ya karşılanmış, ya talimatlanmış, ya da tetikleyiciye bağlanmıştır; kapsam dışı bırakılan hiçbir madde yoktur.
