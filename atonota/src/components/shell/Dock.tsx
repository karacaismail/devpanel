import { useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Database, Sparkles, Puzzle, Palette, Activity } from "lucide-react";
import { FloatingDock, type DockLink } from "@/components/ui/floating-dock";

/**
 * Atonota alt-orta Dock — Aceternity FloatingDock (spring magnification) üzerine
 * kurulu; en sık erişilen sayfalara renkli kısayol. Gradient ikon kutuları,
 * imleçle akışkan büyüme, aktif sayfa göstergesi.
 */
const PAGES: { page: string; title: string; icon: React.ReactNode; grad: string }[] = [
  { page: "dashboard", title: "Genel Bakış", icon: <LayoutDashboard className="h-full w-full" />, grad: "bg-gradient-to-br from-amber-400 to-orange-500" },
  { page: "schema", title: "Şema", icon: <Database className="h-full w-full" />, grad: "bg-gradient-to-br from-sky-400 to-blue-600" },
  { page: "insights", title: "AI İçgörüler", icon: <Sparkles className="h-full w-full" />, grad: "bg-gradient-to-br from-violet-400 to-purple-600" },
  { page: "modules", title: "Modüller", icon: <Puzzle className="h-full w-full" />, grad: "bg-gradient-to-br from-fuchsia-400 to-pink-600" },
  { page: "theme", title: "Tema", icon: <Palette className="h-full w-full" />, grad: "bg-gradient-to-br from-pink-400 to-rose-600" },
  { page: "activity", title: "Aktivite", icon: <Activity className="h-full w-full" />, grad: "bg-gradient-to-br from-emerald-400 to-teal-600" },
];

const toPath = (page: string) => (page === "dashboard" ? "/" : `/${page}`);

export function Dock() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const items: DockLink[] = PAGES.map((p) => ({
    title: p.title,
    icon: p.icon,
    className: p.grad,
    active: toPath(p.page) === pathname,
    onClick: () => navigate(toPath(p.page)),
  }));

  return (
    <div className="fixed bottom-3 left-1/2 z-40 -translate-x-1/2">
      <FloatingDock items={items} />
    </div>
  );
}
