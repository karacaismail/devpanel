"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { PanelRight, X, Info, Sparkles, Stamp, Lock, Link2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useSelectionStore } from "@/stores/selection-store";
import { useContextStore } from "@/stores/context-store";

/**
 * Atonota — Context Inspector (sağ bölge): seçili bağlama duyarlı panel.
 * Sekmeler: Özellikler · AI Asistanı · Onay (şelale yönetişimi).
 * AI önerir, diff gösterir; mutation yalnız açık onayla (kayıt sistemi AI değildir).
 */

type Tab = "props" | "ai" | "gov";

export function InspectorRail() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("props");
  const [requested, setRequested] = useState(false);

  const page = pathname === "/" ? "dashboard" : pathname.replace(/^\//, "");
  /* K2 — sayfalardan beslenen gerçek seçim; yoksa rota bağlamına düşer */
  const selection = useSelectionStore((s) => s.selection);
  const { org, env } = useContextStore();

  return (
    <>
      <button
        type="button"
        aria-label="context inspector aç/kapat"
        onClick={() => setOpen((o) => !o)}
        className="fixed right-0 top-1/2 z-40 -translate-y-1/2 rounded-l-lg border border-r-0 border-neutral-800 bg-neutral-950/90 p-2 text-neutral-400 backdrop-blur hover:text-indigo-400"
      >
        <PanelRight className="h-4 w-4" />
      </button>

      {open && (
        <aside
          role="complementary"
          aria-label="context inspector"
          className="fixed right-0 top-0 z-40 flex h-screen w-80 flex-col border-l border-neutral-800 bg-neutral-950/95 backdrop-blur"
        >
          <div className="flex items-center gap-1 border-b border-neutral-800 p-2">
            {(
              [
                ["props", "Özellikler", Info],
                ["ai", "AI", Sparkles],
                ["gov", "Onay", Stamp],
              ] as const
            ).map(([id, label, Icon]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-1.5 text-xs transition-colors",
                  tab === id ? "bg-indigo-600/15 text-indigo-300" : "text-neutral-400 hover:bg-neutral-800"
                )}
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </button>
            ))}
            <button type="button" aria-label="kapat" onClick={() => setOpen(false)} className="ml-1 p-1.5 text-neutral-500 hover:text-neutral-200">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4 text-sm">
            {tab === "props" && (
              <div className="space-y-3">
                <p className="text-[11px] uppercase tracking-wider text-neutral-500">
                  {selection ? `Seçili nesne — ${selection.kind}` : "Seçili bağlam (rota)"}
                </p>
                <div className="space-y-1.5 rounded-lg border border-neutral-800 p-3 text-xs">
                  {selection ? (
                    <>
                      <p><span className="text-neutral-500">id: </span><code className="font-mono text-indigo-300">{selection.id}</code></p>
                      <p><span className="text-neutral-500">başlık: </span><span className="text-neutral-200">{selection.title}</span></p>
                    </>
                  ) : (
                    <>
                      <p><span className="text-neutral-500">sayfa: </span><code className="font-mono text-neutral-200">/{page}</code></p>
                      <p><span className="text-neutral-500">sahip: </span><span className="text-neutral-200">ismail · platform</span></p>
                      <p><span className="text-neutral-500">yaşam döngüsü: </span><span className="rounded bg-neutral-800 px-1.5 py-0.5 text-neutral-300">Draft</span></p>
                    </>
                  )}
                </div>
                <p className="text-[11px] uppercase tracking-wider text-neutral-500">Metadata (JSON)</p>
                <pre className="overflow-auto rounded-lg bg-neutral-900 p-3 font-mono text-[11px] text-neutral-400">
{JSON.stringify(
  selection
    ? { kind: selection.kind, id: selection.id, ...selection.meta, scope: `tenant:${org}`, env }
    : { scope: `tenant:${org}`, env, validation: { required: true, aa: "pass" }, promotable: true },
  null,
  2,
)}
                </pre>
                {selection?.related && selection.related.length > 0 && (
                  <>
                    <p className="text-[11px] uppercase tracking-wider text-neutral-500">İlişkili kayıtlar</p>
                    <div className="space-y-1">
                      {selection.related.map((r) => (
                        <Link key={r.href} href={r.href} className="flex items-center gap-1.5 rounded-lg border border-neutral-800 px-2.5 py-1.5 text-xs text-neutral-300 hover:border-indigo-500/40">
                          <Link2 className="h-3 w-3 text-indigo-400" /> {r.label}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
                <p className="text-xs text-neutral-500">
                  Doğrulama kuralları tanımdan okunur — bu panel projeksiyondur. Sayfada bir kayda tıkla; burada açılır.
                </p>
              </div>
            )}

            {tab === "ai" && (
              <div className="space-y-2">
                <p className="text-[11px] uppercase tracking-wider text-neutral-500">Bağlama duyarlı öneriler</p>
                {[
                  "Bu sayfadaki listede order.placed_at filtresi index'siz — index migration'ı taslağı hazırlayabilirim.",
                  "3 alan AA kontrast sınırına yakın — güvenli alternatif paleti diff olarak gösterebilirim.",
                  "Şema değişikliğin requirement REQ-114 ile ilişkili görünüyor — traceability bağı ekleyeyim mi?",
                ].map((s, i) => (
                  <div key={i} className="rounded-lg border border-indigo-500/20 bg-indigo-600/5 p-3 text-xs text-neutral-300">
                    {s}
                    <div className="mt-2 flex gap-2">
                      <button type="button" className="rounded bg-indigo-600 px-2 py-1 text-[11px] text-white hover:bg-indigo-700">Diff göster</button>
                      <button type="button" className="rounded border border-neutral-700 px-2 py-1 text-[11px] text-neutral-400 hover:text-neutral-200">Reddet</button>
                    </div>
                  </div>
                ))}
                <p className="pt-1 text-[11px] text-neutral-500">
                  AI kayıt sistemi değildir: öneri → diff → açık onay → audit. Otopilot, guardrails olmadan prod'a kapalı.
                </p>
              </div>
            )}

            {tab === "gov" && (
              <div className="space-y-3">
                <p className="text-[11px] uppercase tracking-wider text-neutral-500">Şelale yönetişimi</p>
                <div className="space-y-1.5 text-xs">
                  {[
                    ["Requirements baseline", "onaylı", true],
                    ["Architecture review", "onaylı", true],
                    ["Metadata/UI freeze", "bekliyor", false],
                    ["Test readiness", "—", false],
                  ].map(([gate, st, ok]) => (
                    <div key={gate as string} className="flex items-center gap-2 rounded-lg border border-neutral-800 px-3 py-2">
                      <span className={cn("h-1.5 w-1.5 rounded-full", ok ? "bg-emerald-400" : "bg-neutral-600")} />
                      <span className="text-neutral-200">{gate}</span>
                      <span className="ml-auto text-neutral-500">{st}</span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  disabled
                  title="Rolünüz developer — Staging'e itme yetkisi release yöneticisinde (RBAC)"
                  className="flex w-full cursor-not-allowed items-center justify-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-600"
                >
                  <Lock className="h-3 w-3" /> Staging'e it (kilitli — RBAC)
                </button>
                <button
                  type="button"
                  onClick={() => setRequested(true)}
                  className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-700"
                >
                  Onay talep et (Request Approval)
                </button>
                {requested && (
                  <p className="text-xs text-emerald-400">
                    Talep oluşturuldu — release yöneticisinin onay kutusuna düştü; kapı geçilmeden build başlamaz.
                  </p>
                )}
              </div>
            )}
          </div>
        </aside>
      )}
    </>
  );
}
