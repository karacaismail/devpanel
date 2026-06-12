"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Database, Puzzle, Palette, Terminal, FileCode, Webhook,
  Settings, Layers, Activity, GraduationCap, Component, Network, GitMerge,
  Radio, FlaskConical, ListTree, Building2, Tags, Inbox, Boxes, Bot, Share2,
  Sparkles, ChevronDown, Compass, Bell, Table2, BarChart3, Image,
  Bug, Map, Rocket, Flag, KeyRound, Users, ShieldCheck, HeartPulse, Clock,
  ScrollText, Braces, Mail, Wand2, Landmark, Cpu, Cog, BookOpen, Server,
  HardDrive, Waypoints, BellRing, Fingerprint, Lock, Eye, PencilRuler,
  Store, Megaphone, CircleDollarSign,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useContextStore, type Role } from "@/stores/context-store";

export interface NavLeaf {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  label: string;
  icon: LucideIcon;
  items: NavLeaf[];
  /** K8 — bu grup için gereken asgari rol; yetersizse read-only rozetiyle görünür (gizlenmez). */
  minRole?: Role;
}

/** Atonota taksonomisi: görev-tabanlı üst kümeler (Tasarla / Yürüt / Gözlemle / Kontrol Et / AI / Platform). */
export const GROUPS: NavGroup[] = [
  {
    label: "Genel Bakış",
    icon: Compass,
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "Eğitim Yolu", href: "/learn", icon: GraduationCap },
      { label: "AI İçgörüler", href: "/insights", icon: Sparkles },
      { label: "Bildirimler", href: "/notifications", icon: Bell },
    ],
  },
  {
    label: "Tasarla",
    icon: PencilRuler,
    items: [
      { label: "Schema Builder", href: "/schema", icon: Database },
      { label: "ArcheType Studio", href: "/archetype", icon: Boxes },
      { label: "Forms", href: "/forms", icon: Layers },
      { label: "Surface & Edition", href: "/surface", icon: Layers },
      { label: "Fragment Kitaplığı", href: "/fragments", icon: Component },
      { label: "ERD", href: "/erd", icon: Share2 },
      { label: "Workflows", href: "/workflows", icon: GitMerge },
      { label: "Domain & Contract", href: "/domains", icon: Network },
      { label: "Modules", href: "/modules", icon: Puzzle },
      { label: "Portföy & Bağımlılıklar", href: "/dependencies", icon: Waypoints },
      { label: "Email Templates", href: "/email-templates", icon: Mail },
      { label: "Theme Engine", href: "/theme", icon: Palette },
      { label: "Code Editor", href: "/code-editor", icon: Braces },
    ],
  },
  {
    label: "Yürüt",
    icon: Rocket,
    items: [
      { label: "Tenant & Siteler", href: "/tenants", icon: Building2 },
      { label: "Ortam & Release", href: "/deployments", icon: Rocket },
      { label: "Sürümler", href: "/releases", icon: Tags },
      { label: "Feature Flags", href: "/flags", icon: Flag },
      { label: "Sunucu Filosu", href: "/infrastructure", icon: Server },
      { label: "Veritabanları", href: "/databases", icon: Database },
      { label: "Depolama, CDN & Ağ", href: "/network", icon: HardDrive },
      { label: "Data", href: "/data", icon: Table2 },
      { label: "Migration Paneli", href: "/migration", icon: GitMerge },
      { label: "API Explorer", href: "/api-explorer", icon: FileCode },
      { label: "Event Kataloğu", href: "/events", icon: Radio },
      { label: "Webhooks", href: "/webhooks", icon: Webhook },
      { label: "Media", href: "/media", icon: Image },
      { label: "Scheduler", href: "/scheduler", icon: Clock },
    ],
  },
  {
    label: "Gözlemle",
    icon: Activity,
    items: [
      { label: "Logs", href: "/logs", icon: ScrollText },
      { label: "Trace'ler", href: "/traces", icon: Waypoints },
      { label: "Uyarılar", href: "/alerts", icon: BellRing },
      { label: "Outbox / DLQ", href: "/dlq", icon: Inbox },
      { label: "Health", href: "/health", icon: HeartPulse },
      { label: "Metrikler & Raporlar", href: "/reports", icon: BarChart3 },
      { label: "Terminal", href: "/terminal", icon: Terminal },
    ],
  },
  {
    label: "Kontrol Et",
    icon: ShieldCheck,
    items: [
      { label: "Test Runner", href: "/test-runner", icon: FlaskConical },
      { label: "Issues", href: "/issues", icon: Bug },
      { label: "Roadmap", href: "/roadmap", icon: Map },
      { label: "WBS / Backlog", href: "/wbs", icon: ListTree },
      { label: "Activity (Audit)", href: "/activity", icon: Activity },
      { label: "Permissions", href: "/permissions", icon: ShieldCheck },
      { label: "Kimlik & Oturumlar", href: "/identity", icon: Fingerprint },
      { label: "Sırlar", href: "/secrets", icon: Lock },
      { label: "API Keys", href: "/api-keys", icon: KeyRound },
      { label: "Yönetişim & Kalite", href: "/governance", icon: Landmark },
      { label: "Docs", href: "/docs", icon: BookOpen },
    ],
  },
  {
    label: "AI",
    icon: Wand2,
    items: [
      { label: "AI Copilot", href: "/ai-copilot", icon: Terminal },
      { label: "AI Simülasyonları", href: "/ai-simulations", icon: Sparkles },
      { label: "AI Katmanı (Gateway)", href: "/ai-platform", icon: Cpu },
      { label: "Vektör Depoları", href: "/vectors", icon: Boxes },
      { label: "Agent Yetkileri", href: "/capabilities", icon: Bot },
      { label: "Agent Runs", href: "/agent-runs", icon: Bot },
    ],
  },
  {
    label: "Gelir",
    icon: CircleDollarSign,
    items: [
      { label: "Pazar Yeri", href: "/marketplace", icon: Store },
      { label: "Yayıncı Paneli", href: "/publisher", icon: Megaphone },
      { label: "Faturalama & Ölçümleme", href: "/billing", icon: CircleDollarSign },
    ],
  },
  {
    label: "Platform",
    icon: Cog,
    minRole: "platform-ops",
    items: [
      { label: "Engines & Adapters", href: "/platform", icon: Cog },
      { label: "Team", href: "/team", icon: Users },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

const ROLE_RANK: Record<Role, number> = {
  viewer: 0,
  developer: 1,
  "release-manager": 2,
  "platform-ops": 3,
};

export function Sidebar() {
  const pathname = usePathname();
  const { role, setRole, setImpersonating } = useContextStore();
  const activeGroup = GROUPS.find((g) => g.items.some((i) => i.href === pathname))?.label;
  /* Tek-açık akordeon */
  const [open, setOpen] = useState<string | null>(activeGroup ?? "Genel Bakış");

  useEffect(() => {
    if (activeGroup) setOpen(activeGroup);
  }, [activeGroup, pathname]);

  const toggle = (label: string) => setOpen((prev) => (prev === label ? null : label));

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-neutral-800 bg-neutral-950/95 backdrop-blur lg:flex">
      <div className="flex h-14 items-center gap-2 border-b border-neutral-800 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
          M
        </div>
        <span className="text-lg font-semibold text-neutral-100">MetaPanel</span>
        <span className="ml-auto rounded-md bg-indigo-600/20 px-2 py-0.5 text-xs text-indigo-400">
          dev
        </span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {GROUPS.map((g) => {
          const isOpen = open === g.label;
          const hasActive = g.items.some((i) => i.href === pathname);
          const locked = g.minRole !== undefined && ROLE_RANK[role] < ROLE_RANK[g.minRole];
          return (
            <div key={g.label}>
              <button
                type="button"
                onClick={() => toggle(g.label)}
                aria-expanded={isOpen}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  hasActive ? "text-indigo-400" : "text-neutral-300 hover:bg-neutral-800 hover:text-neutral-100"
                )}
              >
                <g.icon className="h-4 w-4" />
                {g.label}
                <span className="ml-auto flex items-center gap-1.5">
                  {locked && <Lock className="h-3 w-3 text-amber-500/80" aria-label="salt-okunur — rol yetersiz" />}
                  <span className="text-[10px] text-neutral-600">{g.items.length}</span>
                  <ChevronDown className={cn("h-3.5 w-3.5 text-neutral-500 transition-transform", !isOpen && "-rotate-90")} />
                </span>
              </button>

              {isOpen && (
                <div className="ml-3 space-y-0.5 border-l border-neutral-800 pl-2 pt-0.5">
                  {g.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "relative flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors",
                          isActive
                            ? "bg-indigo-600/15 font-medium text-indigo-300 before:absolute before:-left-[9px] before:top-1/2 before:h-4 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-indigo-400"
                            : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200",
                          locked && "opacity-70"
                        )}
                      >
                        <item.icon className="h-3.5 w-3.5" />
                        {item.label}
                        {locked && <span className="ml-auto text-[9px] text-amber-500/80">salt-okunur</span>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-neutral-800 p-4">
        {/* K8 — rol simülasyonu: menü görünürlüğü role tepki verir */}
        <label className="flex items-center justify-between gap-2 text-[11px] text-neutral-500">
          rol
          <select
            aria-label="rol"
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="rounded-md border border-neutral-800 bg-neutral-900 px-1.5 py-1 text-neutral-300"
          >
            <option value="viewer">viewer</option>
            <option value="developer">developer</option>
            <option value="release-manager">release-manager</option>
            <option value="platform-ops">platform-ops</option>
          </select>
        </label>
        <button
          type="button"
          onClick={() => setImpersonating("portal-user@acme")}
          className="flex w-full items-center gap-1.5 rounded-lg border border-neutral-800 px-2.5 py-1.5 text-[11px] text-neutral-500 hover:text-neutral-300"
        >
          <Eye className="h-3 w-3" /> müşteri gözünden bak (impersonate)
        </button>
        <p className="text-[10px] text-neutral-600">
          <kbd className="rounded bg-neutral-800 px-1.5 py-0.5">⌘K</kbd> komut merkezi
        </p>
      </div>
    </aside>
  );
}
