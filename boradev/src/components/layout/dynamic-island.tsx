"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  Puzzle,
  Palette,
  Terminal,
  FileCode,
  Webhook,
  Settings,
  Layers,
  Activity,
  Search,
  X,
  Command,
  Sparkles,
  ChevronRight,
  GitBranch,
  Shield,
  BarChart3,
  AlertTriangle,
  Table2,
  Image,
  Clock,
  Mail,
  BookOpen,
  Heart,
  MonitorSmartphone,
  GitGraph,
  TerminalSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, color: "text-blue-400" },
  { label: "Schema", href: "/schema", icon: Database, color: "text-indigo-400" },
  { label: "ERD", href: "/erd", icon: GitGraph, color: "text-fuchsia-400" },
  { label: "Data", href: "/data", icon: Table2, color: "text-sky-400" },
  { label: "Modules", href: "/modules", icon: Puzzle, color: "text-emerald-400" },
  { label: "Forms", href: "/forms", icon: Layers, color: "text-cyan-400" },
  { label: "Workflows", href: "/workflows", icon: GitBranch, color: "text-violet-400" },
  { label: "Permissions", href: "/permissions", icon: Shield, color: "text-red-400" },
  { label: "Theme", href: "/theme", icon: Palette, color: "text-purple-400" },
  { label: "API", href: "/api-explorer", icon: FileCode, color: "text-amber-400" },
  { label: "AI Copilot", href: "/ai-copilot", icon: Terminal, color: "text-pink-400" },
  { label: "Code", href: "/code-editor", icon: FileCode, color: "text-lime-400" },
  { label: "Terminal", href: "/terminal", icon: TerminalSquare, color: "text-green-400" },
  { label: "Media", href: "/media", icon: Image, color: "text-sky-400" },
  { label: "Email", href: "/email-templates", icon: Mail, color: "text-orange-400" },
  { label: "Reports", href: "/reports", icon: BarChart3, color: "text-yellow-400" },
  { label: "Scheduler", href: "/scheduler", icon: Clock, color: "text-indigo-400" },
  { label: "Webhooks", href: "/webhooks", icon: Webhook, color: "text-orange-400" },
  { label: "Logs", href: "/logs", icon: AlertTriangle, color: "text-rose-400" },
  { label: "Health", href: "/health", icon: Heart, color: "text-emerald-400" },
  { label: "Docs", href: "/docs", icon: BookOpen, color: "text-blue-400" },
  { label: "Activity", href: "/activity", icon: Activity, color: "text-teal-400" },
  { label: "Settings", href: "/settings", icon: Settings, color: "text-neutral-400" },
];

const quickCommands = [
  { label: "Yeni Model Oluştur", icon: Database, action: "/schema", hint: "Schema Builder" },
  { label: "AI ile Oluştur", icon: Sparkles, action: "/ai-copilot", hint: "AI Copilot" },
  { label: "Modül Ekle", icon: Puzzle, action: "/modules", hint: "Module Manager" },
  { label: "Tema Düzenle", icon: Palette, action: "/theme", hint: "Theme Engine" },
];

export function DynamicIsland() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [hovered, setHovered] = useState(false);
  const islandRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentPage = navItems.find((item) => item.href === pathname) || navItems[0];

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (islandRef.current && !islandRef.current.contains(e.target as Node)) {
        setExpanded(false);
        setSearchMode(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setExpanded(true);
        setSearchMode(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === "Escape") {
        setExpanded(false);
        setSearchMode(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredNav = searchQuery
    ? navItems.filter((item) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : navItems;

  const filteredCommands = searchQuery
    ? quickCommands.filter((cmd) =>
        cmd.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : quickCommands;

  return (
    <>
      {/* Backdrop */}
      {expanded && (
        <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity" />
      )}

      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50" ref={islandRef}>
        {/* Collapsed State */}
        {!expanded && (
          <div
            className={cn(
              "flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950/90 px-2 py-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl transition-all duration-500 cursor-pointer",
              hovered ? "px-4 gap-3" : ""
            )}
            onClick={() => setExpanded(true)}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {/* Logo pill */}
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shrink-0">
              M
            </div>

            {/* Current page indicator */}
            <div className="flex items-center gap-2">
              <currentPage.icon className={cn("h-3.5 w-3.5 transition-all", currentPage.color)} />
              <span className="text-xs font-medium text-neutral-300 whitespace-nowrap">
                {currentPage.label}
              </span>
            </div>

            {/* Mini nav dots - visible on hover, hidden on mobile */}
            {hovered && (
              <div className="hidden sm:flex items-center gap-1 ml-1">
                <div className="h-px w-3 bg-neutral-700" />
                {navItems.slice(0, 7).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={(e) => e.stopPropagation()}
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full transition-all hover:scale-110",
                      pathname === item.href
                        ? "bg-neutral-800 scale-110"
                        : "hover:bg-neutral-800/50"
                    )}
                    title={item.label}
                  >
                    <item.icon className={cn("h-3 w-3", item.color)} />
                  </Link>
                ))}
                <div className="flex h-6 w-6 items-center justify-center rounded-full text-neutral-600">
                  <span className="text-[9px]">+{navItems.length - 7}</span>
                </div>
              </div>
            )}

            {/* Search hint */}
            <div className="flex items-center gap-1 ml-1">
              <kbd className="rounded bg-neutral-800 px-1.5 py-0.5 text-[9px] text-neutral-500 font-mono">
                ⌘K
              </kbd>
            </div>
          </div>
        )}

        {/* Expanded State */}
        {expanded && (
          <div className="w-[calc(100vw-2rem)] sm:w-[720px] max-h-[80vh] overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-950/95 shadow-2xl shadow-black/60 backdrop-blur-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-neutral-800/50 px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                M
              </div>

              {searchMode ? (
                <div className="flex flex-1 items-center gap-2">
                  <Search className="h-4 w-4 text-neutral-500" />
                  <input
                    ref={inputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Sayfa, komut veya işlem ara..."
                    className="flex-1 bg-transparent text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none"
                    autoFocus
                  />
                </div>
              ) : (
                <div className="flex flex-1 items-center gap-2">
                  <span className="text-sm font-semibold text-neutral-100">MetaPanel</span>
                  <span className="rounded-md bg-indigo-600/20 px-1.5 py-0.5 text-[10px] text-indigo-400">
                    dev
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1">
                {!searchMode && (
                  <button
                    onClick={() => {
                      setSearchMode(true);
                      setTimeout(() => inputRef.current?.focus(), 50);
                    }}
                    className="flex h-7 items-center gap-1 rounded-lg bg-neutral-800/50 px-2 text-neutral-500 hover:text-neutral-300 transition-colors"
                  >
                    <Search className="h-3 w-3" />
                    <span className="text-[10px]">Ara</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setExpanded(false);
                    setSearchMode(false);
                    setSearchQuery("");
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Navigation Grid */}
            <div className="p-3">
              <p className="mb-2 px-1 text-[10px] font-medium uppercase tracking-wider text-neutral-600">
                Navigasyon
              </p>
              <div className="grid grid-cols-3 gap-1 sm:grid-cols-4 md:grid-cols-6">
                {filteredNav.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        setExpanded(false);
                        setSearchMode(false);
                        setSearchQuery("");
                      }}
                      className={cn(
                        "flex flex-col items-center gap-1.5 rounded-xl p-3 transition-all",
                        isActive
                          ? "bg-neutral-800 ring-1 ring-neutral-700"
                          : "hover:bg-neutral-800/50"
                      )}
                    >
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-lg transition-all",
                          isActive ? "bg-neutral-700" : "bg-neutral-800/80"
                        )}
                      >
                        <item.icon className={cn("h-4 w-4", item.color)} />
                      </div>
                      <span
                        className={cn(
                          "text-[10px] font-medium",
                          isActive ? "text-neutral-200" : "text-neutral-500"
                        )}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Quick Commands */}
            {filteredCommands.length > 0 && (
              <div className="border-t border-neutral-800/50 p-3">
                <p className="mb-2 px-1 text-[10px] font-medium uppercase tracking-wider text-neutral-600">
                  Hızlı Komutlar
                </p>
                <div className="space-y-0.5">
                  {filteredCommands.map((cmd) => (
                    <Link
                      key={cmd.label}
                      href={cmd.action}
                      onClick={() => {
                        setExpanded(false);
                        setSearchMode(false);
                        setSearchQuery("");
                      }}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-neutral-800/50 group"
                    >
                      <div className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-800">
                        <cmd.icon className="h-3.5 w-3.5 text-neutral-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-neutral-300">{cmd.label}</p>
                        <p className="text-[10px] text-neutral-600">{cmd.hint}</p>
                      </div>
                      <ChevronRight className="h-3 w-3 text-neutral-700 group-hover:text-neutral-500 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-neutral-800/50 px-4 py-2">
              <div className="flex items-center gap-3 text-[10px] text-neutral-600">
                <span className="flex items-center gap-1">
                  <kbd className="rounded bg-neutral-800 px-1 py-0.5 text-[9px] font-mono">↑↓</kbd>
                  gezin
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded bg-neutral-800 px-1 py-0.5 text-[9px] font-mono">↵</kbd>
                  seç
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded bg-neutral-800 px-1 py-0.5 text-[9px] font-mono">esc</kbd>
                  kapat
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] text-neutral-600">AI Ready</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
