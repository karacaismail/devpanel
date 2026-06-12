"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Plus,
  Database,
  Puzzle,
  Palette,
  Code,
  Eye,
  Save,
  Wand2,
  Download,
  Play,
  RotateCcw,
  Layers,
  FileCode,
  Settings,
  Sparkles,
  BarChart3,
  Shield,
  GitBranch,
  Table2,
  AlertTriangle,
  Filter,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DockAction {
  label: string;
  icon: React.ElementType;
  color: string;
  href?: string;
  onClick?: () => void;
}

const dockConfigs: Record<string, { title: string; actions: DockAction[] }> = {
  "/": {
    title: "Dashboard",
    actions: [
      { label: "Yeni Model", icon: Database, color: "text-indigo-400 hover:bg-indigo-600/20", href: "/schema" },
      { label: "AI Copilot", icon: Sparkles, color: "text-pink-400 hover:bg-pink-600/20", href: "/ai-copilot" },
      { label: "Modül Ekle", icon: Puzzle, color: "text-emerald-400 hover:bg-emerald-600/20", href: "/modules" },
      { label: "Tema", icon: Palette, color: "text-purple-400 hover:bg-purple-600/20", href: "/theme" },
      { label: "Metrikler", icon: BarChart3, color: "text-amber-400 hover:bg-amber-600/20", href: "/activity" },
    ],
  },
  "/schema": {
    title: "Schema",
    actions: [
      { label: "Yeni Model", icon: Plus, color: "text-indigo-400 hover:bg-indigo-600/20" },
      { label: "Field Ekle", icon: Database, color: "text-emerald-400 hover:bg-emerald-600/20" },
      { label: "AI Generate", icon: Wand2, color: "text-pink-400 hover:bg-pink-600/20" },
      { label: "Code View", icon: Code, color: "text-amber-400 hover:bg-amber-600/20" },
      { label: "Kaydet", icon: Save, color: "text-cyan-400 hover:bg-cyan-600/20" },
    ],
  },
  "/modules": {
    title: "Modules",
    actions: [
      { label: "Yeni Modül", icon: Plus, color: "text-emerald-400 hover:bg-emerald-600/20" },
      { label: "AI Scaffold", icon: Wand2, color: "text-pink-400 hover:bg-pink-600/20" },
      { label: "Tümünü Etkinleştir", icon: Play, color: "text-blue-400 hover:bg-blue-600/20" },
      { label: "Ayarlar", icon: Settings, color: "text-neutral-400 hover:bg-neutral-600/20" },
    ],
  },
  "/forms": {
    title: "Forms",
    actions: [
      { label: "Yeni Form", icon: Plus, color: "text-cyan-400 hover:bg-cyan-600/20" },
      { label: "Field Ekle", icon: Layers, color: "text-indigo-400 hover:bg-indigo-600/20" },
      { label: "Preview", icon: Eye, color: "text-emerald-400 hover:bg-emerald-600/20" },
      { label: "Schema", icon: Code, color: "text-amber-400 hover:bg-amber-600/20" },
      { label: "AI Öner", icon: Wand2, color: "text-pink-400 hover:bg-pink-600/20" },
    ],
  },
  "/theme": {
    title: "Theme",
    actions: [
      { label: "AI Palette", icon: Wand2, color: "text-pink-400 hover:bg-pink-600/20" },
      { label: "Export CSS", icon: Download, color: "text-emerald-400 hover:bg-emerald-600/20" },
      { label: "Preview", icon: Eye, color: "text-blue-400 hover:bg-blue-600/20" },
      { label: "Reset", icon: RotateCcw, color: "text-amber-400 hover:bg-amber-600/20" },
    ],
  },
  "/api-explorer": {
    title: "API",
    actions: [
      { label: "Test Et", icon: Play, color: "text-emerald-400 hover:bg-emerald-600/20" },
      { label: "Export", icon: Download, color: "text-blue-400 hover:bg-blue-600/20" },
      { label: "AI Docs", icon: Wand2, color: "text-pink-400 hover:bg-pink-600/20" },
      { label: "Code Gen", icon: FileCode, color: "text-amber-400 hover:bg-amber-600/20" },
    ],
  },
  "/ai-copilot": {
    title: "AI Copilot",
    actions: [
      { label: "Schema", icon: Database, color: "text-indigo-400 hover:bg-indigo-600/20", href: "/schema" },
      { label: "Modules", icon: Puzzle, color: "text-emerald-400 hover:bg-emerald-600/20", href: "/modules" },
      { label: "Theme", icon: Palette, color: "text-purple-400 hover:bg-purple-600/20", href: "/theme" },
      { label: "Sıfırla", icon: RotateCcw, color: "text-neutral-400 hover:bg-neutral-600/20" },
    ],
  },
  "/data": {
    title: "Data Manager",
    actions: [
      { label: "Yeni Kayıt", icon: Plus, color: "text-sky-400 hover:bg-sky-600/20" },
      { label: "Filtrele", icon: Filter, color: "text-indigo-400 hover:bg-indigo-600/20" },
      { label: "Import", icon: Download, color: "text-emerald-400 hover:bg-emerald-600/20" },
      { label: "Export", icon: Download, color: "text-amber-400 hover:bg-amber-600/20" },
    ],
  },
  "/workflows": {
    title: "Workflows",
    actions: [
      { label: "Yeni Workflow", icon: Plus, color: "text-violet-400 hover:bg-violet-600/20" },
      { label: "AI ile Oluştur", icon: Sparkles, color: "text-pink-400 hover:bg-pink-600/20" },
      { label: "State Ekle", icon: GitBranch, color: "text-indigo-400 hover:bg-indigo-600/20" },
    ],
  },
  "/permissions": {
    title: "Permissions",
    actions: [
      { label: "Yeni Rol", icon: Plus, color: "text-red-400 hover:bg-red-600/20" },
      { label: "AI Öner", icon: Sparkles, color: "text-pink-400 hover:bg-pink-600/20" },
      { label: "Kaydet", icon: Check, color: "text-emerald-400 hover:bg-emerald-600/20" },
      { label: "Tümünü Aç", icon: Shield, color: "text-amber-400 hover:bg-amber-600/20" },
    ],
  },
  "/reports": {
    title: "Reports",
    actions: [
      { label: "Yeni Rapor", icon: Plus, color: "text-lime-400 hover:bg-lime-600/20" },
      { label: "AI Rapor", icon: Sparkles, color: "text-pink-400 hover:bg-pink-600/20" },
      { label: "Çalıştır", icon: Play, color: "text-emerald-400 hover:bg-emerald-600/20" },
      { label: "CSV Export", icon: Download, color: "text-amber-400 hover:bg-amber-600/20" },
    ],
  },
  "/logs": {
    title: "System Logs",
    actions: [
      { label: "Yenile", icon: RotateCcw, color: "text-blue-400 hover:bg-blue-600/20" },
      { label: "Hatalar", icon: AlertTriangle, color: "text-red-400 hover:bg-red-600/20" },
      { label: "Temizle", icon: Table2, color: "text-neutral-400 hover:bg-neutral-600/20" },
    ],
  },
};

export function ContextualDock() {
  const [pathname, setPathname] = useState("/");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    setPathname(window.location.pathname);

    const handlePopState = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", handlePopState);

    // Monitor for Next.js client navigation
    const observer = new MutationObserver(() => {
      if (window.location.pathname !== pathname) {
        setPathname(window.location.pathname);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("popstate", handlePopState);
      observer.disconnect();
    };
  });

  const config = dockConfigs[pathname] || dockConfigs["/"];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 max-w-[calc(100vw-2rem)] sm:bottom-6">
      <div className="flex items-end gap-1 rounded-2xl border border-neutral-800/80 bg-neutral-950/90 px-2 py-2 shadow-2xl shadow-black/40 backdrop-blur-xl overflow-x-auto">
        {config.actions.map((action, i) => {
          const isHovered = hoveredIndex === i;
          const isNeighbor =
            hoveredIndex !== null && Math.abs(hoveredIndex - i) === 1;

          const content = (
            <>
              {/* Tooltip */}
              <div
                className={cn(
                  "absolute -top-8 rounded-md bg-neutral-800 px-2 py-1 text-[10px] font-medium text-neutral-200 whitespace-nowrap transition-all pointer-events-none",
                  isHovered
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-1"
                )}
              >
                {action.label}
              </div>
              {/* Icon */}
              <div
                className={cn(
                  "flex items-center justify-center rounded-xl transition-all duration-200",
                  action.color,
                  isHovered
                    ? "h-12 w-12 -translate-y-2"
                    : isNeighbor
                    ? "h-11 w-11 -translate-y-0.5"
                    : "h-10 w-10"
                )}
              >
                <action.icon
                  className={cn(
                    "transition-all duration-200",
                    isHovered ? "h-5 w-5" : "h-4 w-4"
                  )}
                />
              </div>
            </>
          );

          const cls = "relative flex flex-col items-center group";

          if (action.href) {
            return (
              <Link
                key={action.label}
                href={action.href}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={cls}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={action.label}
              onClick={action.onClick}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={cls}
            >
              {content}
            </button>
          );
        })}
      </div>

      {/* Page indicator */}
      <div className="mt-1.5 flex justify-center">
        <span className="rounded-full bg-neutral-900 px-2 py-0.5 text-[9px] font-medium text-neutral-600">
          {config.title}
        </span>
      </div>
    </div>
  );
}
