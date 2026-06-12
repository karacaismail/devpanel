#!/usr/bin/env python3
"""Atonota içerik üreteci — tüm content/pages/*.json + nav.json'ı basar.
devpanel/* alt projelerinin (boradan ana temel + boradev + alidev) birleşik
sayfa kümesini görev-tabanlı taksonomiyle, Bora estetiğine uygun JSON olarak üretir.
Kaynak yok-sayım: bash rm engelli ama write/truncate serbest — open(w) ile ezilir."""
import json, os

ROOT = os.path.join(os.path.dirname(__file__), "..")
os.makedirs(os.path.join(ROOT, "content", "pages"), exist_ok=True)

NAV = {"groups": []}
PAGES = {}

def grp(label, icon, items, minRole=None):
    g = {"label": label, "icon": icon, "items": [{"label": l, "page": p, "icon": i} for (p, l, i) in items]}
    if minRole: g["minRole"] = minRole
    NAV["groups"].append(g)

def page(pid, title, group, icon, lifecycle, tool, sections, desc=""):
    PAGES[pid] = {"id": pid, "title": title, "group": group, "icon": icon, "lifecycle": lifecycle,
                  "description": desc, "cli": {"tool": tool, "args": {"org": "{{org}}"}}, "sections": sections}

def metrics(*items): return {"type": "metrics", "items": [{"label": l, "value": v, "sub": s} for (l, v, s) in items]}
def cards(items, cols=3): return {"type": "cards", "cols": cols, "items": items}
def table(cols, rows, title=None):
    d = {"type": "table", "columns": cols, "rows": rows}
    if title: d["title"] = title
    return d
def badges(items): return {"type": "badges", "items": [({"label": x} if isinstance(x, str) else x) for x in items]}
def code(c): return {"type": "code", "code": c}
def callout(text, tone="warning", icon="ShieldAlert", when=None):
    d = {"type": "callout", "tone": tone, "icon": icon, "text": text}
    if when: d["when"] = when
    return d
def steps(items, title=None):
    d = {"type": "steps", "items": items}
    if title: d["title"] = title
    return d
def keyvalue(items, title=None):
    d = {"type": "keyvalue", "items": [{"k": k, "v": v} for (k, v) in items]}
    if title: d["title"] = title
    return d
def progress(items, title=None):
    d = {"type": "progress", "items": items}
    if title: d["title"] = title
    return d
def kanban(columns): return {"type": "kanban", "columns": columns}

# ===== GENEL BAKIŞ =====
page("dashboard", "{{org}} · Genel Bakış", "Genel Bakış", "LayoutDashboard", "Released", "console.overview", [
  metrics(("tenant","3","1 kernel-paylaşımlı"),("ortam","{{env}}","aktif bağlam"),("conformance","✓","sdk check"),("AI maliyet (ay)","$78","bütçe $120")),
  callout("Production bağlamındasın — e-postalar gerçekten gönderilir, geri-alınamaz eylemler çift imza ister.","danger","ShieldAlert","env == production"),
  callout("Staging — mail catcher aktif, e-postalar yakalanır.","warning","Mail","env == staging"),
  cards([
    {"title":"JSON Engine","icon":"Braces","body":"Sayfalar content/pages/*.json'dan parse edilir; {{token}} interpolasyonu + ECA kuralları runtime'da işler.","badge":"aktif","badgeTone":"success"},
    {"title":"Bora Estetiği","icon":"Palette","body":"shadcn/ui (Radix + Tailwind), koyu neutral + indigo — Next.js değil, Vite.","badge":"shadcn","badgeTone":"outline"},
    {"title":"AI-first","icon":"Bot","body":"Her sayfanın CLI/MCP eşdeğeri JSON'daki cli alanından üretilir.","badge":"UI=CLI=API","badgeTone":"outline"},
  ]),
], "Tüm içerik content/*.json'dan engine ile gelir — bu sayfayı düzenlemek için kod değil JSON değişir.")
page("activity","Aktivite & Audit","Genel Bakış","Activity","Released","audit.tail",[
  table(["zaman","aktör","aksiyon","CLI eşdeğeri"],[["14:08","vibebot (MCP)","order scaffold önizlemesi","sdk scaffold --name order --test-first"],["13:54","ismail","acme token güncellendi (AA ✓)","sdk theme apply --tenant acme"],["13:31","ismail","Loyalty Points etkinleştirildi","sdk module enable --id loyalty-points"]],"Append-only denetim akışı"),
], "Panel ve agent aksiyonlarının değiştirilemez kaydı; agent aksiyonları işaretli.")
page("insights","AI İçgörüler","Genel Bakış","Sparkles","Staged","copilot.insights",[
  cards([{"title":"Eksik index","icon":"Zap","body":"orders.placed_at filtresi index'siz — migration q-8 taslağı hazır.","badge":"optimizasyon","badgeTone":"warning"},{"title":"AA ihlal riski","icon":"Lightbulb","body":"accent rengi küçük metinde WCAG AA'yı geçemiyor — güvenli palet diff'i hazır.","badge":"içgörü","badgeTone":"secondary"},{"title":"Telafi eksiği","icon":"Wand2","body":"listing-flow active→sold compensation boş — tanım kilitli.","badge":"öneri","badgeTone":"default"}],1),
], "Proaktif tespitler — AI önerir, geliştirici onaylar; sessiz mutasyon yok.")
page("learn","Eğitim Yolu","Genel Bakış","GraduationCap","Released","learn.status",[
  progress([{"label":"İlerleme","value":33,"sub":"2/6 adım"}]),
  steps([{"label":"Granülerlik dilini öğren","note":"Dağ → Çakıl cetveli","done":True},{"label":"İlk scaffold önizlemen","note":"test dosyası İLK üretilir","done":True},{"label":"Şema bayraklarını incele","note":"pii/retention/audit"},{"label":"Kırmızı testi oku","note":"telafi eksiği neden kilitler?"}]),
], "Jr-öncesi vibecoder turu — amaç AI'ın ürettiğini anlayıp onaylamak.")
page("notifications","Bildirimler","Genel Bakış","Bell","Released","notification.list",[
  table(["tür","mesaj","zaman"],[["security","fraud-guard sandbox beyan dışı erişim denedi — karantinada","8d önce"],["deploy","staging v1.8.0 deploy edildi (2 change-set)","1s önce"],["ai","AI triage BUG-141 için şiddet önerisi bıraktı","32d önce"]]),
], "Olay akışı — sistem/dağıtım/güvenlik/AI kanalları.")
page("docs","Dokümantasyon","Genel Bakış","BookOpen","Released","docs.search",[
  cards([{"title":"TechDocs","icon":"BookOpen","body":"mimari/ · adapter/ · api/ · runbook/ · onboarding/"},{"title":"SOP","icon":"ScrollText","body":"rollback · incident · tenant taşıma · sır rotasyonu"},{"title":"AI Asistanı","icon":"Bot","body":"⌘K içinde '?' ile sor — yanıt kaynak atfıyla."}]),
], "docs-as-code ağacı, sürüm seçici, indirilebilir export paketi.")
grp("Genel Bakış","Compass",[("dashboard","Dashboard","LayoutDashboard"),("insights","AI İçgörüler","Sparkles"),("learn","Eğitim Yolu","GraduationCap"),("activity","Aktivite & Audit","Activity"),("notifications","Bildirimler","Bell"),("docs","Dokümantasyon","BookOpen")])

# ===== TASARLA =====
page("schema","Şema Tasarımcısı","Tasarla","Database","Draft","schema.read",[
  badges(["String","Integer","Decimal","DateTime","JSON","Boolean","Enum","Advanced Link (FK)","Child Table"]),
  table(["alan","tip","bayraklar"],[["display_name","string","required"],["email","email","required · pii"],["phone","phone","pii"],["status","enum(active|passive|blocked)","required"],["loyalty_tier","string","tenant-custom (E8)"]],"party (Büyük Taş · 13)"),
  callout("Yeni model anında yansımaz: Draft rozetiyle gelir, Request Approval ile staging'e itilir.","warning","ShieldAlert"),
], "ArcheType/DocType modelleri — tanım tek doğruluk kaynağı; AI şema üretici doğal dilden diff üretir.")
page("archetype","ArcheType Studio","Tasarla","Boxes","Draft","archetype.read",[
  keyvalue([("scope","kernel"),("pii","true"),("bitemporal","false"),("retention","P5Y"),("audit","true")],"party bayrakları"),
  table(["doğurduğu","değer"],[["tablo","ten_party (RLS)"],["GraphQL","party · parties · partyCreate"],["MCP tool","archetype.party.crud"],["testler","contract · rls · pii-mask"]],"Doğurdukları"),
], "Bayraklar (pii/bitemporal/retention/audit) neyin doğacağını belirler.")
page("fragments","Fragment Kitaplığı","Tasarla","Component","Released","fragment.list",[
  cards([{"title":"address","icon":"Component","body":"line1 · line2? · city · postal_code · country","badge":"party, order","badgeTone":"outline"},{"title":"money","icon":"Component","body":"amount · currency","badge":"listing, invoice","badgeTone":"outline"},{"title":"contact","icon":"Component","body":"email · phone? (pii MİRAS kalır)","badge":"party","badgeTone":"outline"}]),
], "Yeniden kullanılabilir alan grupları — bayraklar fragment'tan modüle miras kalır.")
page("forms","Form Builder","Tasarla","Layers","Draft","form.read",[
  cards([{"title":"Smart Form Controller","icon":"Layers","body":"Yalnız model adını alır; alanları metadata'dan üretir."},{"title":"Advanced Link Combobox","icon":"Search","body":"FK debounced arama — 312 eşleşme, 18ms."}],2),
  badges([{"label":"mobil 390px"},{"label":"tablet 834px"},{"label":"masaüstü 1440px"},{"label":"a11y AA ✓","tone":"success"}]),
], "Metadata-güdümlü form üreteci — kod değil layout metadatası.")
page("surface","Surface & Edition","Tasarla","Layers","Staged","surface.read",[
  table(["alan","görünür","widget"],[["display_name","✓","text"],["email","✓","email"],["phone","gizli","phone"],["status","✓","select"]],"party-default projeksiyonu"),
  code("# YAML patch\n~ phone.visible: false → true\nedition_overrides:\n  lite: { hidden: [phone, city] }\n  enterprise: { readonly: [status] }"),
], "Surface = projeksiyon; veri modeline dokunmaz. Headless anahtarı surface:none üretir.")
page("workflows","Workflow Designer","Tasarla","GitMerge","Draft","workflow.read",[
  table(["geçiş","rol","telafi"],[["draft → review","author","geri çek"],["review → active","moderator","yayından kaldır"],["active → sold","system","TANIMSIZ ⚠"],["active → archived","owner","geri yükle"]],"listing-flow geçişleri"),
  callout("active → sold geçişinin telafisi tanımsız — bu tanım kaydedilemez (layer1-workflow).","danger","AlertTriangle"),
], "Durum makinesi — geçişler tanımdan; telafi (compensation) zorunlu alandır.")
page("erd","ERD — Şema Haritası","Tasarla","Share2","Released","erd.read",[
  table(["ilişki","kaynak → hedef","durum"],[["seller","listing → party","ok"],["buyer","order → party","ok"],["customer","invoice → ghost","kırık ⚠"]]),
  callout("1 kırık ilişki: invoice.customer → ghost? — Contract tanımı gerekli.","danger","AlertTriangle"),
], "İlişkiler ref(...) alanlarından türetilir; diyagram düzenlenmez, tanım düzenlenir.")
page("domains","Domain & Contract","Tasarla","Network","Released","contract.list",[
  cards([{"title":"identity","icon":"Network","body":"party","badge":"kernel","badgeTone":"default"},{"title":"sales","icon":"Network","body":"listing, order","badge":"app","badgeTone":"outline"},{"title":"billing","icon":"Network","body":"invoice","badge":"app","badgeTone":"outline"}]),
  table(["üreten","tüketen","tür","durum"],[["sales","billing","event","ok"],["identity","sales","endpoint","ok"],["sales","catalog","endpoint","ihlal ⚠"]]),
], "Kaya sınırları — her ilişki bir Contract'tır; kontrat dışı erişim ihlaldir.")
page("modules","Module Manager","Tasarla","Puzzle","Released","module.list",[
  table(["modül","versiyon","sandbox","lisans"],[["loyalty-points","1.4.2","running","MIT"],["review-badges","0.9.0","stopped","MIT"],["fraud-guard","2.1.0","blocked ⚠","Ticari"]]),
  cards([{"title":"crm-starter","icon":"Puzzle","body":"Party, Deal, Pipeline","badge":"blueprint v2.1","badgeTone":"outline"},{"title":"hrms-core","icon":"Puzzle","body":"Employee, Leave, Payroll","badge":"v1.4","badgeTone":"outline"}],2),
], "Manifest/izin beyanı, WASM sandbox, registry — 'Chrome extension kadar basit'.")
page("dependencies","Portföy & Bağımlılıklar","Tasarla","Waypoints","Released","module.deps",[
  table(["modül","bağımlılıkları","etki"],[["core","—","6 modül buna bağımlı — kaldırılamaz"],["sales","core, identity","2 bağımlı"],["fraud-guard","sales","güvenle kaldırılabilir"]]),
  cards([{"title":"program","icon":"Compass","body":"SaaS Suite 2030 · owner ismail"},{"title":"ürün aileleri","icon":"Boxes","body":"CRM · HRMS · Commerce"},{"title":"ownership","icon":"Users","body":"sahipsiz düğüm yok ✓"}]),
], "Kaldırma sırası ve etki analizi — program/ürün ailesi/ownership.")
page("theme","Tema / Token","Tasarla","Palette","Staged","theme.apply",[
  progress([{"label":"metin / zemin","value":100,"sub":"15.2:1 ✓","tone":"ok"},{"label":"vurgu / zemin","value":100,"sub":"8.4:1 ✓","tone":"ok"},{"label":"ikincil / panel","value":100,"sub":"6.1:1 ✓","tone":"ok"}],"AA kontrast bekçisi"),
  badges([{"label":"09A (varsayılan)"},{"label":"Okyanus"},{"label":"Orman"},{"label":"Gece"}]),
  callout("AA kontrast altı değer kaydedilemez — token dışına CSS yazılamaz.","warning","Palette"),
], "Brand colors tenant-başına token override; çıktı theme token dosyası.")
page("code-editor","Code Editor","Tasarla","Braces","Released","def.edit",[
  code('{\n  "tenant": "acme",\n  "tokens": { "accent": "#6366f1" }\n}'),
  callout("Geçersiz JSON reddedilir; geçerli JSON biçimlenir. Kaydet = diff onayı (tanım kazanır).","ok","CheckCircle"),
], "Ham JSON/script görünümü — tanım her zaman bir toggle uzakta; satır içi AI kod asistanı.")
page("email-templates","E-posta Şablonları","Tasarla","Mail","Released","template.list",[
  code("Merhaba {{ad}},\n{{app}} hesabın hazır. Panele {{url}} adresinden gir.\n— {{app}} ekibi"),
  callout("Eksik değişken önizlemede gizlenmez, {{aynen}} görünür.","warning","Mail"),
], "{{değişken}} motoru + canlı önizleme — mail zinciri bu şablonları kullanır.")
grp("Tasarla","PencilRuler",[("schema","Şema Tasarımcısı","Database"),("archetype","ArcheType Studio","Boxes"),("fragments","Fragment Kitaplığı","Component"),("forms","Form Builder","Layers"),("surface","Surface & Edition","Layers"),("workflows","Workflow Designer","GitMerge"),("erd","ERD Haritası","Share2"),("domains","Domain & Contract","Network"),("modules","Module Manager","Puzzle"),("dependencies","Portföy & Bağımlılıklar","Waypoints"),("theme","Tema / Token","Palette"),("code-editor","Code Editor","Braces"),("email-templates","E-posta Şablonları","Mail")])

# ===== YÜRÜT =====
page("tenants","Tenant & Siteler","Yürüt","Building2","Released","tenant.list",[
  metrics(("tenant","3",""),("MAU","4.2K",""),("QPS","169",""),("hata","%0.21","")),
  table(["tenant","edition","bölge","DB","pin"],[["acme","enterprise","eu-central","1.2 GB","listing-flow v2"],["globex","lite","eu-central","310 MB","güncel"],["initech","standard","tr-ist","88 MB","güncel"]]),
  callout("Prod: tenant reset/drop kilitli — ECA kuralı R-prod-lock.","danger","Lock","env == production"),
], "Tenant-per-DB izolasyon; tüm özelleştirme tenant katmanında, core şema değişmez.")
page("data","Data Browser","Yürüt","Table2","Released","data.query",[
  badges([{"label":"tümü (1000)"},{"label":"active (612)","tone":"success"},{"label":"passive (240)"},{"label":"blocked (148)","tone":"destructive"}]),
  table(["#","ad","e-posta","şehir","durum"],[["1","Ayşe Yılmaz","ay***@***.com","İstanbul","active"],["4","Can Demir","ca***@***.com","Ankara","active"],["9","Elif Kaya","el***@***.com","İzmir","blocked"]]),
  callout("PII alanları maskeli; ham değer yalnız yetkili API'den, erişim günlüğüne yazılarak.","warning","ShieldAlert"),
], "Tenant-scoped veri gezgini (RLS farkındalıklı) — maskeli CSV export.")
page("migration","Migration Paneli","Yürüt","GitMerge","Staged","migration.apply",[
  code("+ loyalty_tier: string  (tenant: acme)\n~ phone: required → nullable\n- legacy_code  -- GUARD: 30 gün soft-drop"),
  steps([{"label":"uyumluluk taraması","done":True},{"label":"kuru koşu (staging)","done":True},{"label":"yedek al"},{"label":"uygula"},{"label":"doğrula"}],"Versiyon yükseltme sihirbazı"),
], "Şema diff → migration önizleme; LLM-review öneridir, karar değildir (d02).")
page("api-explorer","API Explorer","Yürüt","FileCode","Released","api.query",[
  code("query Parties {\n  parties(filter: { status: active }) {\n    id\n    email      # maskeli döner\n  }\n}"),
  table(["method","path","açıklama"],[["GET","/api/party","liste (RLS + maskeli)"],["POST","/api/party","oluştur (audit)"],["GET","/api/listing","bitemporal asOf"]]),
], "GraphQL playground + REST/OpenAPI + şema pinleme; copy-as-curl + sorgu geçmişi.")
page("events","Event Kataloğu","Yürüt","Radio","Released","event.list",[
  table(["event","v","üreten","aboneler"],[["order.completed","2","sales","billing, loyalty-points"],["party.merged","1","identity","search-index, sales"],["listing.published","1","sales","search-index, seo-meta"]]),
  code("event: order.completed\nversion: 2\npayload:\n  order_id: { type: uuid, required: true }\n  settlement: { type: object }  # v2'de eklendi"),
], "Outbox event'leri — payload şeması sözleşmedir; kırıcı değişiklik yeni versiyon açar.")
page("webhooks","Webhooks","Yürüt","Webhook","Released","webhook.list",[
  table(["abonelik","url","event","teslimat"],[["billing-sync","erp.acme.example/hooks","order.completed","3/4 ✓"],["search-reindex","search.internal","listing.published","2/2 ✓"]]),
  callout("İmza anahtarı maskeli (whsec_…); teslimat başarısızlıkları DLQ'ya düşer.","warning","Webhook"),
], "Event aboneliği + teslimat geçmişi + test gönderimi (imzalı).")
page("media","Media","Yürüt","Image","Released","media.list",[
  table(["dosya","tür","boyut","kullanım"],[["logo-acme.svg","image","8 KB","tema, e-posta"],["hero.png","image","240 KB","surface"],["kvkk.pdf","pdf","1.1 MB","e-posta"]]),
], "Tenant-scoped varlık kütüphanesi — kullanımdaki varlık silinemez.")
page("scheduler","Scheduler","Yürüt","Clock","Released","job.list",[
  table(["iş","cron","açıklama","durum"],[["outbox-sweeper","*/5 * * * *","5 dakikada bir","aktif"],["nightly-retention","0 3 * * *","her gün 03:00","aktif"],["dlq-reaper","30 7 * * 1-5","hafta içi 07:30","duraklatıldı"]]),
], "Zamanlanmış işler — cron tanımdan; açıklama ve sonraki çalışmalar türetilir.")
page("deployments","Ortam & Release","Yürüt","Rocket","Staged","deploy.run",[
  cards([{"title":"dev","icon":"Rocket","body":"{{env}} · build #321","badge":"yeşil","badgeTone":"success"},{"title":"staging","icon":"Rocket","body":"release/1.0 · #319","badge":"yeşil","badgeTone":"success"},{"title":"prod","icon":"Rocket","body":"main · v0.9.3","badge":"sağlıklı","badgeTone":"success"}]),
  code("Release Dossier v1.0.0\n  build #319 · checksum sha256:9f2a…c41\n  migration: q-7, q-8 (GUARD'lı)\n  rollback: #311 + DB snapshot 03:00\n  onaylar: mimari ✓ · release ✓ · güvenlik ◌ (1 imza eksik → kilitli)"),
], "dev → staging → prod hattı; change-set'ler changelog olur, rollback tek tık.")
page("environments","Ortamlar","Yürüt","Layers","Released","env.list",[
  table(["ortam","branch","build","mail"],[["development","feat/json-engine","#321 ✓","catcher"],["staging","release/1.0","#319 ✓","catcher"],["production","main","v0.9.3 ✓","GERÇEK gönderim"]]),
  callout("Üretim ortamı görsel olarak ayrışır; geri-alınamaz eylemler ek onay ister (Odoo.sh deseni).","danger","ShieldAlert"),
], "dev/staging/prod topolojisi + ortam değişkenleri + stage geçişi.")
page("databases","Veritabanları","Yürüt","Database","Released","db.list",[
  table(["tenant_db","boyut","bağlantı","RLS","yedek"],[["acme_db","1.2 GB","14/50","aktif","03:00 ✓"],["globex_db","310 MB","4/50","aktif","03:05 ✓"],["initech_db","88 MB","1/50","aktif","03:08 ✓"]]),
  callout("Geri yükleme isim-yazarak onay ister; prod'da release yöneticisi imzası gerekir.","warning","Lock"),
], "Tenant-per-DB: her kiracı fiziksel izole DB'de; RLS ek katmandır.")
page("infrastructure","Sunucu Filosu","Yürüt","Server","Released","infra.fleet",[
  table(["sunucu","bölge","plan","durum"],[["fra-app-01","eu-central","EPYC 16c/64GB","ok"],["fra-db-01","eu-central","EPYC 8c/64GB","ok"],["fra-worker-02","eu-central","4c/16GB","degraded ⚠"]]),
  progress([{"label":"fra-app-01 CPU","value":38},{"label":"fra-db-01 bellek","value":71,"tone":"warn"},{"label":"fra-worker-02 CPU","value":84,"tone":"danger"}]),
], "Bölge/plan/kullanım; ölçekleme kuralları tanımdan yönetilir.")
page("network","Depolama, CDN & Ağ","Yürüt","HardDrive","Released","network.dns",[
  table(["tip","ad","değer","cdn"],[["A","panel.acme.example","188.40.x.x","proxy"],["CNAME","cdn.acme.example","edge.atonota.net","proxy"]]),
  table(["bucket","tür","boyut"],[["media-acme","onsite","4.1 GB"],["backups-offsite","offsite (şifreli)","18.6 GB"]],"Depolama"),
], "DNS, SSL, CDN/cache, bucket dökümü — sertifikalar otomatik yenilenir.")
grp("Yürüt","Rocket",[("tenants","Tenant & Siteler","Building2"),("data","Data Browser","Table2"),("migration","Migration Paneli","GitMerge"),("api-explorer","API Explorer","FileCode"),("events","Event Kataloğu","Radio"),("webhooks","Webhooks","Webhook"),("media","Media","Image"),("scheduler","Scheduler","Clock"),("deployments","Ortam & Release","Rocket"),("environments","Ortamlar","Layers"),("databases","Veritabanları","Database"),("infrastructure","Sunucu Filosu","Server"),("network","Depolama, CDN & Ağ","HardDrive")])

# ===== GÖZLEMLE =====
page("logs","Loglar","Gözlemle","ScrollText","Released","logs.tail",[
  code("14:02:11 info  GraphQL parties(filter) 18ms — RLS tenant=acme\n14:02:09 warn  slow query 2340ms — index önerisi\n14:01:58 error DLQ +1 invoice.create v2 şema uyuşmazlığı"),
  callout("Yavaş sorgu vitrini (>1000ms) ayrı; log drain syslog://collector.internal:6514 aktif.","warning","Snail"),
], "trace_id/tenant/seviye filtreli structured log — telemetri değil (ADR-0006).")
page("traces","Trace'ler","Gözlemle","Waypoints","Released","trace.get",[
  metrics(("p50","84ms",""),("p95","410ms",""),("p99","2.3s","")),
  code("tr-8f31  POST /api/order  412ms\n ├ auth.verify (JWT+RLS)      8ms\n ├ db.tx ten_orders INSERT   96ms\n └ webhook.dispatch          240ms"),
], "OpenTelemetry üçlüsünün üçüncü ayağı — span ağacı + gecikme dağılımı.")
page("dlq","Outbox / DLQ","Gözlemle","Inbox","Released","dlq.list",[
  table(["event","tüketen","neden","yaş"],[["invoice.create v2","billing","şema uyuşmazlığı","2s 14d"],["order.completed v2","loyalty-points","sandbox stopped","41d"]]),
  progress([{"label":"primary-smtp","value":99,"sub":"%99.2","tone":"ok"},{"label":"fallback-api","value":98,"sub":"%97.8","tone":"warn"}],"Mail zinciri sağlığı"),
], "Teslim edilemeyen event'ler — tek tık yeniden işle; mail zinciri sağlığı.")
page("alerts","Uyarılar","Gözlemle","BellRing","Released","alert.rules",[
  table(["kural","eşik","kanal","7g"],[["p99 latency","> 2s","webhook → ops-slack","3×"],["DLQ derinliği","> 10","e-posta + çağrı","0"],["build başarısız","staging/prod","webhook","1×"]]),
], "Eşik tabanlı kurallar + bildirim kanalları — kural değişikliği audit'e yazılır.")
page("health","Health","Gözlemle","Heartbeat","Released","health.check",[
  table(["servis","durum","detay","uptime"],[["Kernel API","ok","p95 23ms","%99.98"],["PostgreSQL","ok","RLS aktif","%99.99"],["Mail zinciri","degraded","birincil yavaş","%97.8"],["WASM sandbox","degraded","fraud-guard karantinada","%99.2"]]),
], "Servis sağlık panosu + uptime monitörleri — kernel iç durumu.")
page("reports","Metrikler & Raporlar","Gözlemle","BarChart3","Released","report.run",[
  progress([{"label":"active","value":61,"sub":"612"},{"label":"passive","value":24,"sub":"240"},{"label":"blocked","value":15,"sub":"148","tone":"danger"}],"Durum dağılımı (party)"),
  callout("Özel pano oluşturucu: dataset/metric/dimension/filter + doğal dil sorgu (AI, diff ile).","ok","BarChart3"),
], "grupla/say + bar grafik + özel pano oluşturucu.")
page("terminal","Terminal","Gözlemle","TerminalSquare","Released","repl",[
  code("$ sdk archetype list\nparty    scope=kernel pii=true alan=5\nlisting  scope=app    pii=false alan=4\n$ sdk check\n24 sözleşmeden 23 yeşil — kırmızı panel kapatılamaz."),
], "Panel-içi sdk REPL — ⌘K'nin metin hâli; terminal/Python/DB shell sekmeleri.")
page("errors","Hata Takibi","Gözlemle","Bug","Released","error.groups",[
  table(["hata","sayı","son","etkilenen"],[["TypeError: cannot read 'edition'","23","12d","forms/preview"],["GraphQL timeout >5s","6","1s","tenant globex"]]),
], "Hata grupları + stack trace + etkilenen tenant — Issues'a issue üretilebilir.")
grp("Gözlemle","Activity",[("logs","Loglar","ScrollText"),("traces","Trace'ler","Waypoints"),("dlq","Outbox / DLQ","Inbox"),("alerts","Uyarılar","BellRing"),("health","Health","Heartbeat"),("reports","Metrikler & Raporlar","BarChart3"),("terminal","Terminal","TerminalSquare"),("errors","Hata Takibi","Bug")])

# ===== KONTROL ET =====
page("test-runner","Test Runner","Kontrol Et","FlaskConical","Released","check.run",[
  metrics(("yeşil","37",""),("kırmızı","1","")),
  table(["test","tür","sonuç"],[["party.contract.test.ts","kontrat","12 ✓"],["listing.contract.test.ts","kontrat","9 ✓ · 1 ✗"],["party.rls.test.ts","rls","6 ✓ — komşu tenant okuyamaz"]]),
  callout("Kırmızı test paneli kapatılamaz: listing-flow telafi tanımsız — scaffold/migration kilitli.","danger","AlertTriangle"),
], "Üretilmiş kontrat testleri + sdk check; 'komşu tenant okuyamaz' vitrini.")
page("governance","Yönetişim & Kalite","Kontrol Et","Landmark","Released","governance.rtm",[
  badges([{"label":"Need confirmed","tone":"success"},{"label":"Requirements baseline","tone":"success"},{"label":"Architecture review","tone":"success"},{"label":"Metadata/UI freeze","tone":"warning"},{"label":"Test readiness","tone":"outline"},{"label":"Production promotion","tone":"outline"}]),
  table(["requirement","tasarım","test","release","zincir"],[["REQ-112","ADR-0007","party.rls.test.ts","v0.9.3","tam"],["REQ-114","ADR-0010","pii-mask.test.ts","v0.9.3","tam"],["REQ-121","ADR-0008","—","—","eksik halka ⚠"]]),
  cards([{"title":"Deviation/Waiver","icon":"AlertTriangle","body":"WVR-3: telafi eksiğiyle staging — prod'a taşınamaz","badge":"2026-06-20","badgeTone":"warning"},{"title":"Design Baseline","icon":"Landmark","body":"baseline-2026.05.20 (42 model)","badge":"onaylı","badgeTone":"success"}],2),
], "Şelale kontrol katmanı: REQ → ADR → RTM → test kanıtı → release zinciri.")
page("issues","Issues","Kontrol Et","Bug","Released","issue.list",[
  table(["id","başlık","şiddet","durum"],[["BUG-141","PII maskesi CSV'de açık bırakıyor","high","açık"],["FTR-58","Surface alan grubu desteği","low","çalışılıyor"],["BUG-137","Webhook imza saat farkı 500","critical","kapandı"]]),
  callout("AI triage önerir, geliştirici karar verir; hata grupları tek tıkla issue olur.","ok","Wand2"),
], "AI triage'lı iş takibi — change-set üzerinden release changelog'una akar.")
page("roadmap","Roadmap","Kontrol Et","Map","Released","roadmap.read",[
  kanban([{"title":"Keşif","items":[{"label":"Çoklu dil içerik alanları","badge":"9 oy","badgeTone":"outline"}]},{"title":"Planlandı","items":[{"label":"asOf zaman gezgini","badge":"14 oy","badgeTone":"outline"}]},{"title":"Yapılıyor","items":[{"label":"Surface alan grubu","badge":"11 oy","badgeTone":"default"}]},{"title":"Yayında","items":[{"label":"AI triage","badge":"18 oy","badgeTone":"success"}]}]),
], "Issue'lardan beslenen yol haritası — oylar önceliklendirir.")
page("wbs","WBS / Backlog","Kontrol Et","ListTree","Released","wbs.read",[
  steps([{"label":"marketplace — App (Dağ · 34)","done":True},{"label":"sales — Domain (Kaya · 21)","done":True},{"label":"listing — ArcheType (Büyük Taş · 13)","done":True},{"label":"order — ArcheType (Büyük Taş · 13)"}]),
  callout("Komşuluk kuralı: seviye atlayan plan kaydedilemez. Toplam Σ 81 SP.","warning","ListTree"),
], "Tanımlardan türeyen SP kırılımı + 'AI'a tarif et' kutusu.")
page("permissions","Permissions","Kontrol Et","ShieldCheck","Released","role.list",[
  table(["rol \\ aksiyon","read","write","execute","configure"],[["admin (kilitli)","✓","✓","✓","✓"],["developer","✓","✓","✓","—"],["agent (MCP)","✓","—","✓","—"]]),
  code("simulate(user=bora, resource=ten_party, action=write, env=prod)\n→ DENY · ABAC 'prod yazma = release-manager' (pol-114)"),
], "RBAC + ABAC + ReBAC; İzin Değerlendirici (grant/deny simülasyonu).")
page("identity","Kimlik & Oturumlar","Kontrol Et","Fingerprint","Staged","identity.providers",[
  table(["sağlayıcı","tür","kullanıcı","durum"],[["acme-azuread","OIDC","41","aktif"],["globex-okta","SAML","12","aktif"],["legacy-ldap","LDAP federation","7","salt-okunur"]]),
  table(["oturum","cihaz","MFA"],[["ismail","MacBook · Safari","✓"],["vibebot (agent)","MCP oturumu","—"]],"Canlı oturumlar"),
], "OAuth istemcileri, IdP (OIDC/SAML/LDAP), oturumlar — MFA org genelinde zorunlu.")
page("secrets","Sırlar","Kontrol Et","Lock","Staged","secret.rotate",[
  table(["sır","kapsam","vault","rotasyon"],[["SMTP_PASSWORD","prod","vault://mail/primary","12g · 90g politika"],["PAYMENT_API_SECRET","prod","vault://psp/main","3g · 30g"],["WEBHOOK_SIGNING_KEY","tüm ortamlar","vault://hooks/sign","bugün · 30g"]]),
  callout("Ham değer panelde asla görünmez — vault referansı; prod sırrı çift imzalı rotasyon.","warning","Lock"),
], "Vault referanslı sırlar, rotasyon politikası, env-scope ayrımı (anahtar ≠ sır).")
page("api-keys","API Keys","Kontrol Et","KeyRound","Released","apikey.list",[
  table(["etiket","prefix","env","scope"],[["ERP entegrasyonu","fk_live_a3x9…","prod","party.read, order.read"],["vibebot (MCP)","fk_live_m1c7…","prod","scaffold, data.query"],["lokal","fk_test_d8k2…","dev","*"]]),
  callout("Anahtar yalnız bir kez tam gösterilir; panelde hep maskeli — hash + prefix saklanır.","warning","KeyRound"),
], "Scope'lu API anahtarları — oluştur/iptal/rotasyon, kullanım izli.")
grp("Kontrol Et","ShieldCheck",[("test-runner","Test Runner","FlaskConical"),("governance","Yönetişim & Kalite","Landmark"),("issues","Issues","Bug"),("roadmap","Roadmap","Map"),("wbs","WBS / Backlog","ListTree"),("permissions","Permissions","ShieldCheck"),("identity","Kimlik & Oturumlar","Fingerprint"),("secrets","Sırlar","Lock"),("api-keys","API Keys","KeyRound")])

# ===== AI =====
page("ai-copilot","AI Copilot","AI","Terminal","Released","copilot.chat",[
  cards([{"title":"Doğal dil → şema","icon":"Database","body":"'destek talepleri modülü' → diff"},{"title":"Migration review","icon":"GitMerge","body":"risk analizi (öneri ≠ karar)"},{"title":"Tema paleti","icon":"Palette","body":"AA-doğrulanmış token seti"}]),
  callout("AI önerir, geliştirici onaylar; source of truth asla AI konuşması değildir.","ok","Bot"),
], "Panel-içi AI chat — bağlama duyarlı, diff üretir, onayla uygulanır.")
page("ai-simulations","AI Simülasyonları","AI","Sparkles","Staged","ai.simulate",[
  cards([{"title":"Şema üretici","icon":"Database","body":"doğal dil → modül taslağı (test İLK)"},{"title":"Log anomali özeti","icon":"ScrollText","body":"842 satır → 4 bulgu"},{"title":"Kontrat testi üretici","icon":"FlaskConical","body":"kırmızı başlayan iskelet"}]),
], "Altı deterministik AI akışı — hepsi diff/önizleme üretir, sormadan yazmaz.")
page("ai-platform","AI Katmanı (Gateway)","AI","Cpu","Staged","ai.gateway.config",[
  table(["sağlayıcı","model","durum"],[["anthropic","claude-*","aktif"],["openai","gpt-*","aktif"],["local (ollama)","llama-*","yalnız dev"]]),
  table(["kural","model","fallback"],[["şema/kod","claude-sonnet","gpt-4o"],["özet/triage","claude-haiku","local"],["guardrail","local","claude-haiku"]],"Model yönlendirme"),
  progress([{"label":"bu ay (bütçe $120)","value":65,"sub":"$78.45","tone":"warn"}]),
], "Gateway, prompt registry, guardrails, maliyet — BYOK; otopilot prod'da kapalı.")
page("capabilities","Agent Yetkileri","AI","Bot","Released","agent.scope.set",[
  table(["scope","yazma","tablolar"],[["party.read","—","ten_party"],["scaffold","—","—"],["ledger.write","✓","ten_loyalty_ledger"]]),
  callout("Blast-radius: geniş yarıçap (3+ tablo yazma) isim-yazarak ek onay ister.","danger","ShieldAlert"),
], "MCP tool kataloğu + capability scope + canlı blast-radius hesabı.")
page("agent-runs","Agent Runs","AI","Bot","Released","agent.runs",[
  table(["id","agent","istem","durum"],[["r-318","vibebot","party'ye segment alanı ekle","ok"],["r-317","migration-reviewer","q-7 risk değerlendir","dry-run"],["r-316","vibebot","tüm tenant'lara ledger yazma","fail ⚠"]]),
  callout("r-316 REDDEDİLDİ: geniş blast-radius — isim-yazarak insan onayı gerekli.","danger","ShieldAlert"),
], "AI koşu geçmişi — adım adım tool çağrısı izli; geniş yetki insan onayında durur.")
page("vectors","Vektör Depoları","AI","Boxes","Staged","vector.query",[
  table(["depo","model","vektör","tazelik"],[["docs-embeddings","text-embedding-3-small","12.480","%98"],["party-similarity","local-minilm","48.200","%100"],["issue-dedup","text-embedding-3-small","1.430","%100"]]),
], "Embedding pipeline'ları + benzerlik araması — PII alanları maskelenerek girer.")
grp("AI","Wand2",[("ai-copilot","AI Copilot","Terminal"),("ai-simulations","AI Simülasyonları","Sparkles"),("ai-platform","AI Katmanı (Gateway)","Cpu"),("capabilities","Agent Yetkileri","Bot"),("agent-runs","Agent Runs","Bot"),("vectors","Vektör Depoları","Boxes")])

# ===== GELİR =====
page("marketplace","Pazar Yeri","Gelir","Store","Staged","marketplace.list",[
  table(["uygulama","kategori","puan","fiyat"],[["SEO Meta","raporlama","4.6","ücretsiz"],["e-Fatura TR","muhasebe","4.8","₺490/ay"],["AI Descriptions","ai","4.1","freemium"]]),
  callout("Her uygulama izin beyanıyla gelir, WASM sandbox'ta koşar; inceleme SLA'sı 10 gün.","warning","ShieldCheck"),
], "Üçüncü-taraf uygulama vitrini + otomatik kontrol + manuel onaylı inceleme kuyruğu.")
page("publisher","Yayıncı Paneli","Gelir","Megaphone","Staged","publisher.app",[
  table(["yayın","durum","not"],[["loyalty-points v1.5.0","Awaiting Approval","puan kuralları editörü"],["v1.4.2","Approved","yayında — 1.240 site"],["v1.4.0","Rejected","izin beyanı eksikti"]]),
  cards([{"title":"Free","icon":"Megaphone","body":"1 site · topluluk","badge":"₺0","badgeTone":"outline"},{"title":"Pro","icon":"Megaphone","body":"5 site","badge":"₺290/ay","badgeTone":"outline"},{"title":"Scale","icon":"Megaphone","body":"sınırsız","badge":"₺990/ay","badgeTone":"outline"}]),
], "Uygulamalarım: yayın akışı + fiyatlandırma + abonelik + %80/20 ödemeler.")
page("billing","Faturalama & Ölçümleme","Gelir","CircleDollarSign","Staged","billing.metering",[
  table(["tenant","plan","durum","MRR"],[["acme","Enterprise","active","₺18.400"],["globex","Starter","trialing","₺0 (9g)"],["initech","Growth","past_due","₺2.900"]]),
  progress([{"label":"acme compute","value":71,"tone":"warn"},{"label":"acme storage","value":44},{"label":"acme AI token","value":65,"sub":"9.1M"}],"Kullanım ölçümleme"),
], "Compute tabanlı planlar + kullanım ölçümleme (compute/storage/AI token) + wallet.")
grp("Gelir","CircleDollarSign",[("marketplace","Pazar Yeri","Store"),("publisher","Yayıncı Paneli","Megaphone"),("billing","Faturalama & Ölçümleme","CircleDollarSign")])

# ===== PLATFORM =====
page("platform","Engines & Adapters","Platform","Cog","Released","adapter.list",[
  cards([{"title":"Frappe","icon":"Boxes","body":"metadata + form (birincil)","badge":"ok","badgeTone":"success"},{"title":"Django","icon":"Boxes","body":"model-merkezli CRUD","badge":"ok","badgeTone":"success"},{"title":"Drupal","icon":"Boxes","body":"salt-okunur köprü","badge":"degraded","badgeTone":"warning"},{"title":"Odoo","icon":"Boxes","body":"workflow içe aktarımı","badge":"ok","badgeTone":"success"}],4),
  table(["yetenek","frappe","django","drupal","odoo"],[["şema tanımı","✓ birincil","✓","okuma","✓"],["workflow","✓","—","—","✓ birincil"],["RBAC","✓","✓","✓","✓"]],"Capability map"),
], "Motor adları ana menüde değil burada: Frappe/Django/Drupal/Odoo adapter olarak bağlanır.")
page("team","Team","Platform","Users","Released","team.list",[
  table(["üye","rol","scope","son"],[["ismail","owner/developer","tam yetki","çevrimiçi"],["bora","developer","tanım katmanı","1s önce"],["vibebot","agent (MCP)","party.read · scaffold","11:42"]]),
], "İnsanlar + agent'lar aynı listede — agent yetkisi scope'la sınırlı.")
page("settings","Settings","Platform","Settings","Released","app.config",[
  keyvalue([("login deneme limiti","5 / 15dk"),("parola politikası","min 12 · MFA zorunlu"),("telemetri","kapalı — kilitli (ADR-0006)"),("varsayılan retention","P5Y"),("panel dili","Türkçe")],"Güvenlik politikaları & varsayılanlar"),
], "Kurulum anahtarları app.yaml'a yazılır; kilitli kararlar gerekçeli görünür.")
grp("Platform","Cog",[("platform","Engines & Adapters","Cog"),("team","Team","Users"),("settings","Settings","Settings")],minRole="platform-ops")

# ---- yaz (open w; rm engelli ama truncate serbest) ----
written = 0
for pid, p in PAGES.items():
    with open(os.path.join(ROOT, "content", "pages", f"{pid}.json"), "w", encoding="utf-8") as f:
        json.dump(p, f, ensure_ascii=False, indent=2)
    written += 1
# silinemeyen artık dosyayı geçerli (dashboard kopyası) içerikle ez:
with open(os.path.join(ROOT, "content", "pages", "_writetest.json"), "w", encoding="utf-8") as f:
    json.dump(PAGES["dashboard"], f, ensure_ascii=False, indent=2)
with open(os.path.join(ROOT, "content", "nav.json"), "w", encoding="utf-8") as f:
    json.dump(NAV, f, ensure_ascii=False, indent=2)
print(f"sayfa: {written} · grup: {len(NAV['groups'])} · nav öğe: {sum(len(g['items']) for g in NAV['groups'])}")
