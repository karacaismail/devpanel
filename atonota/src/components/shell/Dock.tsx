import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Database, Sparkles, Puzzle, Palette, Activity } from "lucide-react";
import { FloatingDock, type DockLink } from "@/components/ui/floating-dock";
import { iconColor } from "@/lib/icon-palette";
import { cn } from "@/lib/utils";

/**
 * Atonota alt-orta Dock — Aceternity FloatingDock (spring magnification) üzerine
 * kurulu; en sık erişilen sayfalara renkli kısayol. İkon kutuları merkezi palet'ten
 * (icon-palette) gelir — komut adası ile aynı dil: outline ikon + hafif kutu.
 */
const PAGES: { page: string; title: string; Icon: typeof LayoutDashboard }[] = [
  { page: "dashboard", title: "Genel Bakış", Icon: LayoutDashboard },
  { page: "schema", title: "Şema", Icon: Database },
  { page: "insights", title: "AI İçgörüler", Icon: Sparkles },
  { page: "modules", title: "Modüller", Icon: Puzzle },
  { page: "theme", title: "Tema", Icon: Palette },
  { page: "activity", title: "Aktivite", Icon: Activity },
];

const toPath = (page: string) => (page === "dashboard" ? "/" : `/${page}`);

export function Dock() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const items: DockLink[] = PAGES.map((p) => {
    const [tc, bc] = iconColor(p.page);
    return {
      title: p.title,
      icon: <p.Icon className={cn("h-full w-full", tc)} />,
      className: bc,
      active: toPath(p.page) === pathname,
      onClick: () => navigate(toPath(p.page)),
    };
  });

  return (
    <div className="fixed bottom-3 left-1/2 z-40 -translate-x-1/2">
      <FloatingDock items={items} />
    </div>
  );
}
