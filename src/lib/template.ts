/**
 * {{değişken}} şablon motoru — Ahmet'in forge-dev-panel template.ts'inden taşındı.
 * Boşluk toleranslı ({{ ad }}), nokta destekli ({{user.email}}).
 */

const PLACEHOLDER = /\{\{\s*([\w.]+)\s*\}\}/g;

/** Şablondaki tekil değişken adları, ilk görülme sırasıyla. */
export function extractVariables(body: string): string[] {
  const out: string[] = [];
  for (const m of body.matchAll(PLACEHOLDER)) {
    if (!out.includes(m[1])) out.push(m[1]);
  }
  return out;
}

/**
 * Değişkenleri doldurur; karşılığı olmayan {{ad}} AYNEN kalır — önizleme,
 * eksik değişkeni gizlemek yerine gösterir ("demo asla kırılmaz" ilkesi).
 */
export function renderTemplate(body: string, vars: Record<string, string>): string {
  return body.replace(PLACEHOLDER, (whole, name: string) => {
    const v = vars[name];
    return v == null ? whole : v;
  });
}
