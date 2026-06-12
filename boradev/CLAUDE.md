@AGENTS.md

# CLAUDE.md — MetaPanel (boradev) geliştirme sözleşmesi

Bu dosya bağlayıcıdır. Çelişkide: `docs/ATONOTA-EKSIK-ENVANTERI-RAPORU.md` > bu dosya > yeni istek yorumu.

## Değişmezler

1. **Test-önce:** Yeni davranış önce `src/__tests__/` altına kontrat testiyle gelir. `npm test` ve `npm run build` yeşil olmadan iş bitmiş sayılmaz. Mevcut testler KEMİKTİR — gevşetilmez.
2. **AI önerir, geliştirici onaylar:** Hiçbir AI yüzeyi onaysız mutation yapmaz; source of truth AI konuşması değildir. Otopilot, guardrails + audit olmadan prod'a kapalıdır.
3. **Bağlam store'dan okunur:** org/env/rol `stores/context-store` üzerinden; prod'da yıkıcı eylemler `destructiveLocked` ile kilitlenir.
4. **UI = CLI = API:** Her sayfa `CliEquivalent` taşır; yeni sayfa bu bileşensiz merge edilmez.
5. **Motor adları ana menüde görünmez:** Frappe/Django/Drupal/Odoo yalnızca `/platform` (Engines & Adapters) altındadır.
6. **Görsel dil:** neutral-950/900/800 + indigo; lucide ikonları; Card/Badge/Button kiti. Emoji yok.

## Yasaklar

Supabase (teknoloji olarak) · telemetri · localStorage'a gizli veri · test gevşetme · onaysız prod mutasyonu.

## Komutlar

```bash
npm test        # vitest — değişiklik sonrası ZORUNLU
npm run build   # next build — değişiklik sonrası ZORUNLU
npm run dev
```

## Yeni sayfa reçetesi

1. Kontrat testi yaz → 2. `src/app/<slug>/page.tsx` ("use client", PageHeader + CliEquivalent zorunlu) → 3. `sidebar.tsx` GROUPS'a ekle (görev-tabanlı doğru gruba) → 4. `npm test && npm run build`.
