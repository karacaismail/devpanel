/**
 * Deterministik AI öneri motoru — Ahmet'in ai/engine.ts ilkesinin portu:
 * "AI önerir, geliştirici onaylar" — her çıktı uygula/reddet diff'idir,
 * sessiz mutasyon asla.
 */
import { ARCHETYPES } from "../data/archetypes";

export interface FieldProposal {
  kind: "field";
  archetype: string;
  field: { name: string; type: string; pii: boolean };
  summary: string;
}

export type Proposal = FieldProposal;

/** Ad → tip sezgisi (Ahmet'in NAME_TYPE_HINTS portu, TR genişletmeli). */
const TYPE_HINTS: Array<[RegExp, string]> = [
  [/email|eposta|e_posta/, "email"],
  [/url|link|site/, "url"],
  [/tarih|date|dogum|vade|deadline/, "date"],
  [/oncelik|durum|status|tip|kategori|seviye/, "enum"],
  [/adet|tutar|fiyat|sayi|miktar|yas|count|amount/, "number"],
  [/aciklama|not|yorum|sebep|description/, "textarea"],
  [/telefon|phone/, "phone"],
];

const PII_HINTS = /email|eposta|telefon|phone|tc_?no|adres|dogum/;

function inferType(name: string): string {
  for (const [re, t] of TYPE_HINTS) if (re.test(name)) return t;
  return "string";
}

/**
 * Doğal dil → öneri. Desteklenen niyet (P0): alan ekleme —
 * `"<archetype> için <alan_adi> alanı ekle"` esnek söz dizimi.
 * Anlaşılmayan istek null: UI dürüst bir "anlayamadım" gösterir.
 */
export function propose(text: string): Proposal | null {
  const t = text.toLocaleLowerCase("tr");
  const at = ARCHETYPES.find((a) => t.includes(a.id));
  const m = /([a-z0-9_çğıöşü]+)\s+alan[ıi]?\s+ekle/i.exec(t);
  if (!at || !m) return null;
  const name = m[1]
    .replaceAll("ç", "c").replaceAll("ğ", "g").replaceAll("ı", "i")
    .replaceAll("ö", "o").replaceAll("ş", "s").replaceAll("ü", "u");
  const type = inferType(name);
  return {
    kind: "field",
    archetype: at.id,
    field: { name, type, pii: PII_HINTS.test(name) },
    summary: `${at.id} ArcheType'ına tenant-scoped "${name}" (${type}) alanı`,
  };
}
