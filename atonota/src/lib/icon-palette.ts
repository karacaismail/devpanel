/**
 * İkon-buton görsel dili — TEK KAYNAK (tasarım bütünlük ilkesi). Dock, komut adası
 * (⌘K) ve diğer ikon-butonlar buradan beslenir; hepsi aynı "outline renkli ikon +
 * hafif şeffaf kutu" dilini paylaşır. Sayfaya/ikona göre deterministik canlı renk.
 *
 * Not: class'lar tam string literal — Tailwind JIT tarayıcısının yakalaması için
 * dinamik birleştirme YOK. Her giriş [ikon-metin-rengi, hafif-arka-plan] çifti.
 */

/** Dock'ta yüzen ana sayfalar — sabit marka-eşli renk (her yerde aynı kalır). */
const PAGE_COLOR: Record<string, [string, string]> = {
  dashboard: ["text-amber-400", "bg-amber-500/10"],
  schema: ["text-sky-400", "bg-sky-500/10"],
  insights: ["text-violet-400", "bg-violet-500/10"],
  modules: ["text-fuchsia-400", "bg-fuchsia-500/10"],
  theme: ["text-pink-400", "bg-pink-500/10"],
  activity: ["text-emerald-400", "bg-emerald-500/10"],
};

/** Geri kalan tüm sayfalar için deterministik renk havuzu. */
const COLORS: [string, string][] = [
  ["text-amber-400", "bg-amber-500/10"],
  ["text-sky-400", "bg-sky-500/10"],
  ["text-violet-400", "bg-violet-500/10"],
  ["text-fuchsia-400", "bg-fuchsia-500/10"],
  ["text-pink-400", "bg-pink-500/10"],
  ["text-emerald-400", "bg-emerald-500/10"],
  ["text-cyan-400", "bg-cyan-500/10"],
  ["text-indigo-400", "bg-indigo-500/10"],
  ["text-rose-400", "bg-rose-500/10"],
  ["text-lime-400", "bg-lime-500/10"],
  ["text-orange-400", "bg-orange-500/10"],
  ["text-teal-400", "bg-teal-500/10"],
];

/**
 * Sayfa/ikon için [ikon rengi, hafif arka plan] çifti. Dock sayfaları sabit
 * eşlemeden; diğerleri isimden hash'lenir — her ikon her yerde AYNI rengi taşır.
 */
export function iconColor(page?: string, iconKey?: string): [string, string] {
  if (page && PAGE_COLOR[page]) return PAGE_COLOR[page];
  const key = iconKey ?? page ?? "?";
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
}
