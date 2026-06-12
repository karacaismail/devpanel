"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkles, Database, GitMerge, Palette, Braces, ScrollText, FlaskConical, Play } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CliEquivalent } from "@/components/cli-equivalent";

/**
 * AI Simülasyonları — deterministik, ağ'sız AI akışları (Ali'nin StreamingText
 * deseni + bizim "AI önerir, geliştirici onaylar" ilkesi). Demo asla kırılmaz:
 * her simülatörün her girdiye dürüst bir cevabı vardır.
 */

/* Akış efekti: çıktıyı karakter karakter yazar (reduced-motion'da anında). */
function useStream(full: string | null) {
  const [text, setText] = useState("");
  const timer = useRef<number | null>(null);
  useEffect(() => {
    if (timer.current) window.clearInterval(timer.current);
    if (!full) {
      setText("");
      return;
    }
    if (typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setText(full);
      return;
    }
    let i = 0;
    setText("");
    timer.current = window.setInterval(() => {
      i += 7;
      setText(full.slice(0, i));
      if (i >= full.length && timer.current) window.clearInterval(timer.current);
    }, 24);
    return () => {
      if (timer.current) window.clearInterval(timer.current);
    };
  }, [full]);
  return text;
}

function Stream({ out, done }: { out: string | null; done?: string }) {
  const text = useStream(out);
  if (!out) return null;
  const finished = text.length >= out.length;
  return (
    <div>
      <pre className="mt-3 overflow-auto whitespace-pre-wrap rounded-lg bg-neutral-950 p-3 font-mono text-xs leading-relaxed text-neutral-300">
        {text}
        {!finished && <span className="animate-pulse text-indigo-400">▌</span>}
      </pre>
      {finished && done && <p className="mt-2 text-xs text-emerald-400">{done}</p>}
    </div>
  );
}

/* ---------- deterministik üreticiler ---------- */

const TYPE_HINTS: Array<[RegExp, string]> = [
  [/email|eposta/, "email"], [/tarih|dogum|vade/, "date"], [/fiyat|tutar|adet|stok/, "number"],
  [/durum|oncelik|kategori|tip/, "enum"], [/telefon/, "phone"], [/aciklama|not/, "textarea"],
];

function genSchema(prompt: string): string {
  const p = prompt.toLocaleLowerCase("tr");
  const name = /(\w+) (modül|model|şema)/.exec(p)?.[1] ?? (p.includes("tica") ? "shop" : "tickets");
  const words = [...new Set(p.match(/[a-zçğıöşü_]{4,}/g) ?? [])]
    .filter((w) => !["modül", "model", "şema", "oluştur", "alan", "üret", "için"].includes(w))
    .slice(1, 5);
  const fields = (words.length > 0 ? words : ["title", "status", "owner"]).map((w) => {
    const t = TYPE_HINTS.find(([re]) => re.test(w))?.[1] ?? "string";
    return `  ${w}: { type: ${t}${t === "enum" ? ", values: [...]" : ""} }`;
  });
  return `# AI taslağı — diff olarak gelir, sen onaylarsın
name: ${name}
flags: { pii: SEÇ, audit: true }   # pii zorunlu seçim
fields:
${fields.join("\n")}
# İLK üretilecek dosya: tests/${name}.contract.test.ts (test-önce)`;
}

function genMigrationReview(id: string): string {
  return id === "q-7"
    ? `Migration ${id} risk analizi (dry-run):
• ADD COLUMN loyalty_tier ........ risk: DÜŞÜK (nullable, kilitleme yok)
• phone DROP NOT NULL ............ risk: DÜŞÜK (genişletici)
• legacy_code soft-drop .......... risk: ORTA — 2 rapor sorgusu bu kolonu okuyor
Öneri: rapor sorgularını _deprecated_ alias'a yönlendir, 30 gün sonra kalıcı DROP.
Karar senin — öneri ≠ karar (d02).`
    : `Migration ${id} risk analizi: tek adım, workflow bağı. Pinli tenant acme v2'de
kalacağı için davranış değişmez. risk: DÜŞÜK.`;
}

function genPalette(prompt: string): string {
  const seed = [...prompt].reduce((s, c) => s + c.charCodeAt(0), 0);
  const hue = seed % 360;
  const tone = prompt.toLocaleLowerCase("tr").includes("sıcak") ? "warm" : "cool";
  return `Palet önerisi ("${prompt || "varsayılan"}" · ${tone}):
--bg:     hsl(${hue} 30% 6%)    AA zemin
--panel:  hsl(${hue} 26% 10%)
--ink:    hsl(${hue} 20% 92%)   kontrast 15.2:1 ✓
--mute:   hsl(${hue} 12% 64%)   kontrast 6.1:1 ✓
--accent: hsl(${(hue + 24) % 360} 80% 68%)  kontrast 8.4:1 ✓
Tümü WCAG AA bekçisinden geçti — uygula dersen tenant token dosyası yazılır.`;
}

function genQuery(prompt: string): string {
  const p = prompt.toLocaleLowerCase("tr");
  const days = /(\d+)\s*gün/.exec(p)?.[1] ?? "30";
  const status = p.includes("pasif") ? "passive" : p.includes("blok") ? "blocked" : "active";
  const entity = p.includes("listing") || p.includes("ilan") ? "listings" : "parties";
  return `query AiUretti {
  ${entity}(
    filter: { status: ${status}, createdAfter: "-P${days}D" }
    page: { size: 50 }
  ) {
    id
    ${entity === "parties" ? "display_name\n    email      # maskeli döner" : "title\n    price"}
  }
}
# RLS: tenant_id otomatik; PII maskesi sorgu seviyesinde kaldırılaMAZ.`;
}

function genLogSummary(): string {
  return `Son 1 saatin log özeti (842 satır → 4 bulgu):
1. ⚠ mail birincil sağlayıcı p95 2.4s — eşik 2s. İkincile geçiş 2 kez tetiklendi.
2. ✗ DLQ +3: invoice.create v2 şema uyuşmazlığı (v1 tüketici billing'de).
3. ⚡ parties(filter) sorgularının %18'i index'siz order.placed_at filtreliyor.
4. ✓ RLS ihlal denemesi yok; PII erişimlerinin tamamı maskeli yüzeyden.
Önerilen aksiyonlar Issues'a taslak olarak eklenebilir — onayın olmadan hiçbiri açılmaz.`;
}

function genTest(prompt: string): string {
  const target = /[a-z_]{3,}/.exec(prompt.toLocaleLowerCase("tr"))?.[0] ?? "party";
  return `// İLK üretilen dosya — kırmızı başlar (test-önce)
import { describe, it, expect } from "vitest";

describe("${target} sözleşmesi", () => {
  it("tanım şemaya uyar", () => { /* şema fixture'ı */ });
  it("komşu tenant okuyamaz (RLS)", () => { /* iki tenant fixture'ı */ });
  it("pii alanları maskeli döner", () => { /* maskeli yüzey */ });
  it("audit: her yazma diff'iyle kaydedilir", () => { /* audit sink */ });
});`;
}

/* ---------- sayfa ---------- */

export default function AiSimulationsPage() {
  const [schemaPrompt, setSchemaPrompt] = useState("destek talepleri modülü: başlık, öncelik, eposta, vade tarihi");
  const [schemaOut, setSchemaOut] = useState<string | null>(null);
  const [migId, setMigId] = useState("q-7");
  const [migOut, setMigOut] = useState<string | null>(null);
  const [palettePrompt, setPalettePrompt] = useState("koyu yeşil, kurumsal ama sıcak");
  const [paletteOut, setPaletteOut] = useState<string | null>(null);
  const [queryPrompt, setQueryPrompt] = useState("son 30 günde eklenen aktif partyler");
  const [queryOut, setQueryOut] = useState<string | null>(null);
  const [logOut, setLogOut] = useState<string | null>(null);
  const [testPrompt, setTestPrompt] = useState("listing");
  const [testOut, setTestOut] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-neutral-100">
          <Sparkles className="h-6 w-6 text-indigo-400" /> AI Simülasyonları
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Altı deterministik AI akışı — hepsi diff/önizleme üretir, hiçbiri sormadan
          yazmaz. Gerçek modele bağlandığında arayüz aynı kalır.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-4 w-4 text-indigo-400" /> Şema üretici
            </CardTitle>
            <CardDescription>Doğal dil → modül taslağı; test dosyası İLK sırada.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input value={schemaPrompt} onChange={(e) => setSchemaPrompt(e.target.value)} aria-label="şema istemi" />
              <Button size="sm" onClick={() => setSchemaOut(genSchema(schemaPrompt))}>
                <Play className="mr-1 h-3 w-3" /> üret
              </Button>
            </div>
            <Stream out={schemaOut} done="Taslak hazır — Schema Builder'da diff olarak açılır." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <GitMerge className="h-4 w-4 text-indigo-400" /> Migration risk analizi
            </CardTitle>
            <CardDescription>LLM-review simülasyonu — öneri ≠ karar.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <select
                value={migId}
                onChange={(e) => setMigId(e.target.value)}
                aria-label="migration seç"
                className="h-9 rounded-md border border-neutral-800 bg-neutral-900 px-2 text-sm text-neutral-200"
              >
                <option value="q-7">q-7 (party)</option>
                <option value="q-6">q-6 (listing)</option>
              </select>
              <Button size="sm" onClick={() => setMigOut(genMigrationReview(migId))}>
                <Play className="mr-1 h-3 w-3" /> analiz et
              </Button>
            </div>
            <Stream out={migOut} done="Rapor Migration Paneli'ndeki kuyruğa iliştirildi." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Palette className="h-4 w-4 text-indigo-400" /> Tema paleti üretici
            </CardTitle>
            <CardDescription>Marka tonu → AA-doğrulanmış token seti.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input value={palettePrompt} onChange={(e) => setPalettePrompt(e.target.value)} aria-label="palet istemi" />
              <Button size="sm" onClick={() => setPaletteOut(genPalette(palettePrompt))}>
                <Play className="mr-1 h-3 w-3" /> öner
              </Button>
            </div>
            <Stream out={paletteOut} done="Theme Engine'de önizleme olarak açılabilir." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Braces className="h-4 w-4 text-indigo-400" /> Doğal dil → GraphQL
            </CardTitle>
            <CardDescription>Sorgu üretir; RLS ve PII maskesi pazarlık dışı.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input value={queryPrompt} onChange={(e) => setQueryPrompt(e.target.value)} aria-label="sorgu istemi" />
              <Button size="sm" onClick={() => setQueryOut(genQuery(queryPrompt))}>
                <Play className="mr-1 h-3 w-3" /> çevir
              </Button>
            </div>
            <Stream out={queryOut} done="API Explorer'a kopyalanabilir." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ScrollText className="h-4 w-4 text-indigo-400" /> Log anomali özeti
            </CardTitle>
            <CardDescription>Son saatin structured log&apos;u → 4 bulgu.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="sm" onClick={() => setLogOut(genLogSummary())}>
              <Play className="mr-1 h-3 w-3" /> özetle
            </Button>
            <Stream out={logOut} done="Bulgular Issues'a taslak olarak eklenebilir (onaylı)." />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FlaskConical className="h-4 w-4 text-indigo-400" /> Kontrat testi üretici
            </CardTitle>
            <CardDescription>Modül adı → kırmızı başlayan test iskeleti (test-önce).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input value={testPrompt} onChange={(e) => setTestPrompt(e.target.value)} aria-label="test hedefi" />
              <Button size="sm" onClick={() => setTestOut(genTest(testPrompt))}>
                <Play className="mr-1 h-3 w-3" /> üret
              </Button>
            </div>
            <Stream out={testOut} done="Test Runner'da kırmızı bölgede görünecek — tanım onu yeşile çevirir." />
          </CardContent>
        </Card>
      </div>

      <CliEquivalent tool="ai.simulate" args={{ mode: "deterministic", network: false }} />
    </div>
  );
}
