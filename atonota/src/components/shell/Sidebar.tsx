import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Lock } from "lucide-react";
import { NAV } from "@/engine/loader";
import { Icon } from "@/engine/registry";
import { useContextStore, type Role } from "@/store/context-store";
import { cn } from "@/lib/utils";

const ROLE_RANK: Record<Role, number> = { viewer: 0, developer: 1, "release-manager": 2, "platform-ops": 3 };

export function Sidebar() {
  const { pathname } = useLocation();
  const { role, setRole } = useContextStore();
  const activeGroup = NAV.groups.find((g) => g.items.some((i) => `/${i.page}` === pathname || (pathname === "/" && i.page === "dashboard")))?.label;
  const [open, setOpen] = useState<string | null>(activeGroup ?? NAV.groups[0]?.label ?? null);

  useEffect(() => {
    if (activeGroup) setOpen(activeGroup);
  }, [activeGroup]);

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-border bg-panel/95 backdrop-blur lg:flex">
      <div className="flex h-14 items-center gap-2 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-fg">A</div>
        <span className="text-lg font-semibold">Atonota</span>
        <span className="ml-auto rounded-md bg-primary/20 px-2 py-0.5 text-xs text-primary">dev</span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {NAV.groups.map((g) => {
          const isOpen = open === g.label;
          const hasActive = g.items.some((i) => `/${i.page}` === pathname);
          const locked = g.minRole !== undefined && ROLE_RANK[role] < ROLE_RANK[g.minRole as Role];
          return (
            <div key={g.label}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : g.label)}
                aria-expanded={isOpen}
                className={cn("flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors", hasActive ? "text-primary" : "text-foreground/80 hover:bg-elevated")}
              >
                <Icon name={g.icon} className="h-4 w-4" />
                {g.label}
                <span className="ml-auto flex items-center gap-1.5">
                  {locked && <Lock className="h-3 w-3 text-warn/80" />}
                  <span className="text-[10px] text-muted">{g.items.length}</span>
                  <ChevronDown className={cn("h-3.5 w-3.5 text-muted transition-transform", !isOpen && "-rotate-90")} />
                </span>
              </button>
              {isOpen && (
                <div className="ml-3 space-y-0.5 border-l border-border pl-2 pt-0.5">
                  {g.items.map((it) => {
                    const to = it.page === "dashboard" ? "/" : `/${it.page}`;
                    const active = pathname === to;
                    return (
                      <Link
                        key={it.page}
                        to={to}
                        aria-current={active ? "page" : undefined}
                        className={cn("relative flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] transition-colors", active ? "bg-primary/15 font-medium text-primary before:absolute before:-left-[9px] before:top-1/2 before:h-4 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-primary" : "text-muted hover:bg-elevated hover:text-foreground", locked && "opacity-70")}
                      >
                        <Icon name={it.icon} className="h-3.5 w-3.5" />
                        {it.label}
                        {locked && <span className="ml-auto text-[9px] text-warn/80">salt-okunur</span>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <label className="flex items-center justify-between gap-2 text-[11px] text-muted">
          rol
          <select aria-label="rol" value={role} onChange={(e) => setRole(e.target.value as Role)} className="rounded-md border border-border bg-elevated px-1.5 py-1 text-foreground">
            <option value="viewer">viewer</option>
            <option value="developer">developer</option>
            <option value="release-manager">release-manager</option>
            <option value="platform-ops">platform-ops</option>
          </select>
        </label>
      </div>
    </aside>
  );
}
