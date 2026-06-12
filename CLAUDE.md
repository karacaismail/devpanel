# CLAUDE.md — devpanel geliştirme sözleşmesi (KEMİK)

Bu dosya bağlayıcıdır. Bu repoda çalışan her AI oturumu ve geliştirici,
aşağıdaki kurallara uyar. Çelişki durumunda: `devpanel.md` gereksinim
analizi > bu dosya > yeni istek yorumu.

## Değişmezler (asla bozulmaz)

1. **Test-önce:** Her yeni özellik önce `src/__tests__/` altına kontrat
   testiyle gelir, sonra implementasyon. `npm test` ve `npm run build`
   yeşil olmadan iş bitmiş sayılmaz.
2. **Regresyon sözleşmesi:** `src/__tests__/` altındaki mevcut testler
   KEMİKTİR — davranış değişikliği gerektirmedikçe değiştirilmez,
   silinmez, gevşetilmez. Özellikle `kemik.test.tsx` iskeleti kilitler:
   tüm ekranlar render olur, Overview hariç her ekran EquivalencePanel
   (CLI/MCP eşdeğeri) taşır, TopBar + durum çubuğu daima var, deep-link çalışır.
3. **AI-first:** Yeni eklenen her ekran/aksiyon CLI + MCP eşdeğeri üretir
   (`EquivalencePanel` / `logAction`). Yazma aksiyonları `logAction` ile
   audit + toast'a düşer.
4. **Granülerlik:** Komşuluk kuralı (`checkNeighborhood`) UI'da engelleyicidir;
   seviye rozeti biçimi `Ad (Metafor · SP)`.
5. **Güvenlik desenleri:** Yıkıcı işlemler `ConfirmDanger` (isim-yazarak) ister;
   PII alanları maskeli + rozetli; AA kontrast altı tema değeri kaydedilemez.
6. **Görsel dil:** 09A token seti (`src/styles/global.css` `@theme`) tek kaynak —
   token dışına renk/CSS yazılmaz. Dark-first, Roboto (min 300), min 1rem,
   320px akışkan. Emoji yok; ikonlar yalnızca Phosphor.

## Yasaklar

Next.js · Flowbite · Redux · Supabase · hazır-temalı UI kitleri ·
telemetri/analytics · localStorage'a gizli veri · `__tests__` gevşetme.

## Stack (kilitli)

Vite SPA + React 19 + TypeScript strict · Tailwind v4 · Radix primitives ·
TanStack Table/Query · zustand · Phosphor · vitest + Testing Library.
Yeni bağımlılık eklemeden önce mevcutlarla çözülemediği gerekçelendirilir.

## Komutlar

```bash
npm test        # kontrat testleri — değişiklik sonrası ZORUNLU
npm run build   # tsc --noEmit + vite build — değişiklik sonrası ZORUNLU
npm run dev     # http://localhost:5173
```

## Yapı haritası

- `src/lib/` — saf mantık (granularity, contrast, cli, workflow, diff, blast,
  wbs, navigation, audit, store). UI'sız, testlenebilir; yeni iş kuralı buraya.
- `src/data/` — mock tanımlar; üretimde kernel API ile değişecek tek katman.
- `src/components/` — sahiplenilmiş, headless-üstü bileşenler.
- `src/screens/` — modül ekranları; her ekran `SCREEN_REGISTRY`'ye
  (`src/lib/navigation.ts`) kaydedilir; kayıt nav + ⌘K + breadcrumb +
  deep-link'i otomatik besler. `kemik.test.tsx` ekran sayısını kilitler —
  ekran ekleyince kayıt defteri, store `ScreenId` ve test birlikte güncellenir.

## Yeni ekran ekleme reçetesi

1. Kontrat testini yaz → 2. `ScreenId` + `SCREEN_REGISTRY` + `App.tsx`
   SCREENS/nav grubuna ekle → 3. Ekranda `EquivalencePanel` zorunlu →
4. Yazma aksiyonları `logAction`'dan geçer → 5. `npm test && npm run build`.
