import { Building2, GitBranch, Bell } from "lucide-react";
import { useContextStore, BRANCH, type Env } from "@/store/context-store";
import { cn } from "@/lib/utils";

const ENV_CLS: Record<Env, string> = {
  development: "bg-ok/15 text-ok border-ok/30",
  staging: "bg-warn/15 text-warn border-warn/30",
  production: "bg-danger/15 text-danger border-danger/40",
};
const ENV_LABEL: Record<Env, string> = { development: "dev", staging: "staging", production: "prod" };

export function TopBar() {
  const { org, env, setOrg, setEnv } = useContextStore();
  return (
    <div className="fixed right-3 top-3 z-40 flex items-center gap-1 sm:right-4 sm:gap-2">
      <label className="flex items-center gap-1 rounded-full border border-border bg-panel/90 px-2 py-1.5 backdrop-blur sm:gap-1.5 sm:px-2.5">
        <Building2 className="h-3.5 w-3.5 text-primary" />
        <select aria-label="organizasyon" value={org} onChange={(e) => setOrg(e.target.value)} className="max-w-[4.5rem] bg-transparent text-[11px] focus:outline-none sm:max-w-none sm:text-xs">
          <option value="acme">acme</option>
          <option value="globex">globex</option>
          <option value="initech">initech</option>
        </select>
      </label>
      <div className="flex items-center gap-0.5 rounded-full border border-border bg-panel/90 p-0.5 backdrop-blur">
        {(["development", "staging", "production"] as Env[]).map((e) => (
          <button key={e} type="button" onClick={() => setEnv(e)} className={cn("rounded-full border border-transparent px-1.5 py-1 text-[10px] font-medium transition-colors sm:px-2.5 sm:text-[11px]", env === e ? ENV_CLS[e] : "text-muted hover:text-foreground")}>
            {ENV_LABEL[e]}
          </button>
        ))}
      </div>
      <span className="hidden items-center gap-1.5 rounded-full border border-border bg-panel/90 px-2.5 py-1.5 font-mono text-[11px] text-muted backdrop-blur xl:flex">
        <GitBranch className="h-3 w-3 text-primary" /> {BRANCH[env]}
      </span>
      <button type="button" aria-label="bildirimler" className="relative rounded-full border border-border bg-panel/90 p-1.5 text-muted backdrop-blur hover:text-foreground">
        <Bell className="h-3.5 w-3.5" />
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-fg">3</span>
      </button>
    </div>
  );
}
