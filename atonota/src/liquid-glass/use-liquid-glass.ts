import { useEffect, useRef } from "react";
import { applyGlass } from "./core";
import type { GlassConfig } from "./types";

/**
 * useLiquidGlass — herhangi bir ref'li elemana imperatif giydirme.
 * Ant Design / PrimeReact gibi className kabul eden bileşenlerle de uyumlu:
 * ref'i bileşenin kök DOM'una bağla.
 */
export function useLiquidGlass<T extends HTMLElement = HTMLDivElement>(config?: Partial<GlassConfig>) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    if (!ref.current) return;
    const id = `lg-hook-${Math.random().toString(36).slice(2, 8)}`;
    return applyGlass(ref.current, id, { ...(config as GlassConfig) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(config)]);
  return ref;
}
