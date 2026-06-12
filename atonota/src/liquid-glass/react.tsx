import { useEffect, useId, useRef, useState, type ReactNode, type HTMLAttributes } from "react";
import { Slot } from "@radix-ui/react-slot";
import { DEFAULTS, type GlassConfig } from "./types";
import { registerFilter, supportsRealRefraction, subscribe, getConfig } from "./core";

/**
 * React adaptörü — popüler UI kütüphaneleriyle uyumlu API:
 *  - className forward edilir (Tailwind/shadcn ile birleşir)
 *  - asChild (Radix Slot) ile herhangi bir bileşene giydirilebilir
 *  - config değişince (global store) otomatik yeniden render (reaktif)
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
  const cfgRef = useRef<GlassConfig>({ ...DEFAULTS, ...config });

  useEffect(() => {
    cfgRef.current = { ...DEFAULTS, ...getConfig(), ...config };
    registerFilter(id, cfgRef.current);
    // Global config değişince yeniden üret + render (JS değişince UI güncellenir).
    return subscribe((c) => {
      cfgRef.current = { ...c, ...config };
      registerFilter(id, cfgRef.current);
      force((n) => n + 1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(config)]);

  const real = supportsRealRefraction();
  const cfg = cfgRef.current;
  const Comp = asChild ? Slot : "div";

  return (
    <Comp
      data-lg=""
      className={`lg-surface ${className}`}
      style={{
        // @ts-expect-error CSS custom property
        "--lg-tint": cfg.tint,
        "--lg-radius": `${cfg.radius}px`,
        "--lg-specular": cfg.specular,
        backdropFilter: real ? `url(#${id})` : `blur(${cfg.blur + 8}px) saturate(150%)`,
        WebkitBackdropFilter: real ? `url(#${id})` : `blur(${cfg.blur + 8}px) saturate(150%)`,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Comp>
  );
}

export { useLiquidGlass } from "./use-liquid-glass";
