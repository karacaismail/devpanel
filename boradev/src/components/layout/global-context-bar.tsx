"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, GitBranch, Bell, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useContextStore, branchFor, type Env as StoreEnv } from "@/stores/context-store";

/**
 * Atonota — Global Context Bar (üst bölge): geliştiricinin koordinat sistemi.
 * Hangi organizasyon, hangi ortam, hangi branch — her sayfada değişmez bağlam.
 */

type Env = "development" | "staging" | "production";

const ENV_META: Record<Env, { label: string; cls: string }> = {
  development: { label: "dev", cls: "bg-emerald-600/15 text-emerald-400 border-emerald-500/30" },
  staging: { label: "staging", cls: "bg-amber-600/15 text-amber-400 border-amber-500/30" },
  production: { label: "prod", cls: "bg-red-600/15 text-red-400 border-red-500/40" },
};

export function GlobalContextBar() {
  /* K1 — bağlam global store'dan okunur/yazılır; tüm sayfalar tepki verir. */
  const { org, env, setOrg, setEnv } = useContextStore();
  const [confirmProd, setConfirmProd] = useState(false);

  const pickEnv = (e: Env) => {
    if (e === "production" && env !== "production") {
      setConfirmProd(true); // üretim: görsel uyarı + açık onay (Odoo.sh emsali)
      return;
    }
    setEnv(e);
  };

  return (
    <div className="fixed right-4 top-3 z-50 flex items-center gap-2">
      {/* Org / tenant işleyici */}
      <label className="flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-950/90 px-2.5 py-1.5 backdrop-blur">
        <Building2 className="h-3.5 w-3.5 text-indigo-400" />
        <select
          aria-label="organizasyon"
          value={org}
          onChange={(e) => setOrg(e.target.value)}
          className="bg-transparent text-xs text-neutral-200 focus:outline-none"
        >
          <option value="acme">acme</option>
          <option value="globex">globex</option>
          <option value="initech">initech</option>
        </select>
      </label>

      {/* Ortam işleyici — prod kırmızı ve onaylı */}
      <div className="flex items-center gap-0.5 rounded-full border border-neutral-800 bg-neutral-950/90 p-0.5 backdrop-blur">
        {(Object.keys(ENV_META) as Env[]).map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => pickEnv(e)}
            className={cn(
              "rounded-full border border-transparent px-2.5 py-1 text-[11px] font-medium transition-colors",
              env === e ? ENV_META[e].cls : "text-neutral-500 hover:text-neutral-300"
            )}
          >
            {ENV_META[e].label}
          </button>
        ))}
      </div>

      {/* Aktif branch */}
      <span className="hidden items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-950/90 px-2.5 py-1.5 font-mono text-[11px] text-neutral-400 backdrop-blur xl:flex">
        <GitBranch className="h-3 w-3 text-indigo-400" />
        {branchFor(env as StoreEnv)}
      </span>

      {/* Sistem sağlığı + bildirim */}
      <Link
        href="/notifications"
        aria-label="bildirimler ve sistem sağlığı"
        className="relative flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-950/90 px-2.5 py-1.5 backdrop-blur hover:border-neutral-700"
      >
        <span className="h-2 w-2 rounded-full bg-amber-400" title="2 servis dikkat istiyor" />
        <Bell className="h-3.5 w-3.5 text-neutral-400" />
        <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] text-white">
          3
        </span>
      </Link>

      {/* Prod geçiş onayı */}
      {confirmProd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" role="dialog" aria-label="prod onayı">
          <div className="w-[22rem] rounded-xl border border-red-500/40 bg-neutral-950 p-5 shadow-2xl">
            <p className="flex items-center gap-2 text-sm font-medium text-red-400">
              <ShieldAlert className="h-4 w-4" /> Production bağlamına geçiyorsun
            </p>
            <p className="mt-2 text-xs text-neutral-400">
              Bu ortamda e-postalar GERÇEKTEN gönderilir, geri-alınamaz eylemler ek
              onay ister ve her değişiklik audit'e yazılır.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmProd(false)}
                className="rounded-md border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => {
                  setEnv("production");
                  setConfirmProd(false);
                }}
                className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
              >
                Anladım, prod'a geç
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
