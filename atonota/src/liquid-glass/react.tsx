import { useEffect, useId, useRef, useState, type ReactNode, type HTMLAttributes, type Ref } from "react";
import { Slot } from "@radix-ui/react-slot";
import { DEFAULTS, type GlassConfig } from "./types";
import { registerFilter, subscribe, getConfig, backdropValue } from "./core";

/**
 * React adaptörü — popüler UI kütüphaneleriyle uyumlu API:
 *  - className forward edilir (Tailwind/shadcn ile birleşir)
 *  - asChild (Radix Slot) ile herhangi bir bileşene giydirilebilir
 *  - config değişince (global store) otomatik yeniden render (reaktif)
 *  - eleman boyutu ResizeObserver ile ölçülür → harita tam boyutta üretilir
 *    (kenar hizalama / trapping sorunu giderilir)
 *  - platform-bağımsız: Chromium gerçek refraksiyon, Safari/iOS/Firefox blur fallback
 */
export interface LiquidGlassProps extends HTMLAttributes<HTMLDivElement> {
  config?: Partial<GlassConfig>;
  asChild?: boolean;
  children?: ReactNode;
}

export function LiquidGlass({ config, asChild, className = "", style, children, ...rest }: LiquidGlassProps) {
  const rid = useId().replace(/[:]/g, "");
  const id = `lg-${rid}`;
  const [, force] = useState(0);
  const ref = useRef<HTMLElement | null>(null);
  const cfgRef = useRef<GlassConfig>({ ...DEFAULTS, ...config });
  const sizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  // boyut ölç + filtreyi o boyutta kaydet
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const r = el.getBoundingClientRect();
      const s = { w: Math.round(r.width), h: Math.round(r.height) };
      if (s.w !== sizeRef.current.w || s.h !== sizeRef.current.h) {
        sizeRef.current = s;
        registerFilter(id, cfgRef.current, s);
        force((n) => n + 1);
      }
    };
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // config (global + local) değişince yeniden üret + render
  useEffect(() => {
    cfgRef.current = { ...DEFAULTS, ...getConfig(), ...config };
    registerFilter(id, cfgRef.current, sizeRef.current);
    return subscribe((c) => {
      cfgRef.current = { ...c, ...config };
      registerFilter(id, cfgRef.current, sizeRef.current);
      force((n) => n + 1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(config)]);

  const cfg = cfgRef.current;
  const Comp = asChild ? Slot : "div";
  const backdrop = backdropValue(id, cfg);

  return (
    <Comp
      ref={ref as Ref<HTMLDivElement>}
      data-lg=""
      className={`lg-surface ${className}`}
      style={{
        // @ts-expect-error CSS custom property
        "--lg-tint": cfg.tint,
        "--lg-radius": `${cfg.radius}px`,
        "--lg-specular": cfg.specular,
        backdropFilter: backdrop,
        WebkitBackdropFilter: backdrop,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export { useLiquidGlass } from "./use-liquid-glass";
