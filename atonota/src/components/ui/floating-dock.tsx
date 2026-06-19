import { cn } from "@/lib/utils";
import { LayoutGrid } from "lucide-react";
import {
  AnimatePresence,
  type MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef, useState } from "react";

/**
 * Aceternity UI — FloatingDock. macOS-tarzı dock; spring tabanlı magnification.
 * Boyut imleç mesafesinden useMotionValue/useSpring ile imperatif güncellenir —
 * React re-render YOK → titremesiz, akışkan. (Atonota'ya uyarlandı: href yerine
 * onClick, gradient ikon arka planı, lucide mobil tetikleyici.)
 */
export interface DockLink {
  title: string;
  icon: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  /** İkon kutusu arka plan sınıfı (gradient vs). */
  className?: string;
}

export function FloatingDock({
  items,
  desktopClassName,
  mobileClassName,
}: {
  items: DockLink[];
  desktopClassName?: string;
  mobileClassName?: string;
}) {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
}

function FloatingDockMobile({ items, className }: { items: DockLink[]; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("relative block md:hidden", className)}>
      <AnimatePresence>
        {open && (
          <motion.div layoutId="nav" className="absolute inset-x-0 bottom-full mb-2 flex flex-col gap-2">
            {items.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10, transition: { delay: idx * 0.05 } }}
                transition={{ delay: (items.length - 1 - idx) * 0.05 }}
              >
                <button
                  type="button"
                  aria-label={item.title}
                  onClick={() => { item.onClick?.(); setOpen(false); }}
                  className={cn("flex h-10 w-10 items-center justify-center rounded-full shadow-lg", item.className ?? "bg-elevated")}
                >
                  <div className="h-4 w-4">{item.icon}</div>
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        aria-label="dock aç"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-panel/90 shadow-lg backdrop-blur"
      >
        <LayoutGrid className="h-5 w-5 text-foreground/70" />
      </button>
    </div>
  );
}

function FloatingDockDesktop({ items, className }: { items: DockLink[]; className?: string }) {
  const mouseX = useMotionValue(Infinity);
  return (
    <motion.div
      onMouseMove={(e) => mouseX.set(e.pageX)}
      onMouseLeave={() => mouseX.set(Infinity)}
      className={cn(
        "mx-auto hidden h-20 items-center gap-3 rounded-full border border-white/10 bg-panel/70 px-4 shadow-2xl shadow-black/50 backdrop-blur-xl md:flex",
        className,
      )}
    >
      {items.map((item) => (
        <IconContainer mouseX={mouseX} key={item.title} {...item} />
      ))}
    </motion.div>
  );
}

function IconContainer({ mouseX, title, icon, onClick, active, className }: DockLink & { mouseX: MotionValue<number> }) {
  const ref = useRef<HTMLButtonElement>(null);

  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const widthTransform = useTransform(distance, [-150, 0, 150], [44, 64, 44]);
  const heightTransform = useTransform(distance, [-150, 0, 150], [44, 64, 44]);
  const widthIconTransform = useTransform(distance, [-150, 0, 150], [22, 32, 22]);
  const heightIconTransform = useTransform(distance, [-150, 0, 150], [22, 32, 22]);

  const spring = { mass: 0.1, stiffness: 150, damping: 12 };
  const width = useSpring(widthTransform, spring);
  const height = useSpring(heightTransform, spring);
  const widthIcon = useSpring(widthIconTransform, spring);
  const heightIcon = useSpring(heightIconTransform, spring);

  const [hovered, setHovered] = useState(false);

  return (
    <button ref={ref} type="button" aria-label={title} onClick={onClick} className="relative flex items-center">
      <motion.div
        style={{ width, height }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "relative flex aspect-square items-center justify-center rounded-2xl shadow-lg shadow-black/30",
          className ?? "bg-elevated",
          active && "ring-2 ring-white/70",
        )}
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="absolute -top-9 left-1/2 w-fit whitespace-nowrap rounded-lg border border-border/60 bg-panel/95 px-2 py-1 text-[11px] font-medium text-foreground shadow-lg backdrop-blur"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div style={{ width: widthIcon, height: heightIcon }} className="flex items-center justify-center text-white">
          {icon}
        </motion.div>
      </motion.div>
    </button>
  );
}
