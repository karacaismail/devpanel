# Atonota — JSON-güdümlü Developer Console

Bora estetiği (shadcn/ui · Radix · Tailwind · koyu neutral + indigo) üzerine kurulu,
**içeriği tamamen `content/*.json`'dan gelen** AI-first geliştirici konsolu.
**Next.js YOK** — Vite + React 19 + TypeScript.

## Çalıştırma

```bash
cd atonota
rm -rf node_modules tsconfig.check.json   # sandbox'tan kalan symlink/artık varsa
npm install
npm run dev      # http://localhost:5173
npm test         # vitest — engine + içerik sözleşmesi
npm run build    # tsc -b + vite build
```

## Mimari — İçerik Motoru (engine)

UI hiçbir içeriği hard-code etmez. Akış:

```
content/pages/*.json  ──┐
content/nav.json        ├──►  engine/loader.ts  (import.meta.glob + JSON)
content/rules.json    ──┘            │
                                     ▼
   interpolate.ts (regex {{token}})  →  conditions.ts (güvenli koşul, eval YOK)
                                     ▼
              rules.ts (ECA: when→then aksiyonları)
                                     ▼
        Engine.tsx  →  registry.tsx (type → shadcn bileşeni)  →  React
```

- **JSON değişince dinamik render:** Vite HMR `import.meta.glob`'u yeniden değerlendirir; bağlam (org/env/rol) değişince motor otomatik yeniden render eder.
- **Token interpolasyonu:** `"{{org}} · {{env}}"` runtime bağlamından dolar; eksik token aynen kalır (şeffaflık).
- **ECA kuralları (`rules.json`):** `{ "when": "env == production", "then": "lock:destructive" }` → prod'da yıkıcı eylemler kilitlenir. Koşullar `eval()` olmadan regex ile değerlendirilir.
- **Bölüm tipleri (`registry.tsx`):** `prose · metrics · cards · table · badges · code · callout`. Yeni tip = registry'ye bir kayıt; JSON onu kullanır, başka kod değişmez.
- **AI-first:** her sayfanın `cli` alanı UI=CLI=API eşdeğerini üretir.

## Yeni sayfa eklemek

`content/pages/<id>.json` oluştur (id, title, group, sections[, cli]) ve
`content/nav.json`'a bir leaf ekle. Kod yazmaya gerek yok — engine render eder.

## Stack

Vite · React 19 · TypeScript (strict) · Tailwind v4 · shadcn/ui (Radix primitives + cva) ·
react-router-dom · zustand · lucide-react · vitest. Custom JS ihtiyaçları TypeScript ile çözülür.
