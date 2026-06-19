/**
 * Platform yardımcıları — kısayol etiketlerini işletim sistemine göre gösterir.
 * Mac'te ⌘ (Command), Linux/Windows'ta Ctrl. Tuş dinleyiciler zaten metaKey||ctrlKey
 * ile her ikisini yakalar; bu yalnız GÖRSEL etikettir.
 */
export const IS_MAC =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad|iPod/i.test(navigator.platform || navigator.userAgent);

/** Değiştirici tuş sembolü: "⌘" (mac) veya "⌃" (Ctrl, diğer). Yazı değil işaret. */
export const MOD_KEY = IS_MAC ? "⌘" : "⌃";

/** Bir harfle birleşik kısayol etiketi, ör. modShortcut("K") → "⌘K" / "⌃K". */
export function modShortcut(letter: string): string {
  return `${MOD_KEY}${letter}`;
}
