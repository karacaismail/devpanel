"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, TerminalSquare, MessageCircleQuestion, ArrowRight, Bot } from "lucide-react";
import { GROUPS } from "@/components/layout/sidebar";
import { useContextStore } from "@/stores/context-store";
import { cn } from "@/lib/utils";

/**
 * K6 — Evrensel Komut Merkezi (⌘K): niyet yönlendirici (komut / arama / soru),
 * bağlam çipi, ajan modu (sor/uygula/otopilot — otopilot prod'da kapalı),
 * kaynak atıf satırı. AI önerir; mutation onay kapısından geçer.
 */

type AgentMode = "sor" | "uygula" | "otopilot";

const COMMANDS = [
  { cmd: "deploy staging", desc: "release/1.8 → staging (changelog ile)", danger: false },
  { cmd: "rollback prod", desc: "bir önceki başarılı build'e dön", danger: true },
  { cmd: "tenant oluştur", desc: "provizyon sihirbazını aç", danger: false },
  { cmd: "sdk check", desc: "sözleşme conformance koş", danger: false },
];

export function CommandCenter() {
  const router = useRouter();
  const pathname = usePathname();
  const { org, env } = useContextStore();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [mode, setMode] = useState<AgentMode>("sor");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        e.stopImmediatePropagation();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true });
  }, []);

  /* Niyet yönlendirici: ">" komut · "?" soru · diğer her şey arama */
  const intent = q.startsWith(">") ? "komut" : q.startsWith("?") ? "soru" : "arama";
  const term = q.replace(/^[>?]\s*/, "").toLocaleLowerCase("tr");

  const pageHits = useMemo(() => {
    if (intent !== "arama" || !term) return [];
    return GROUPS.flatMap((g) => g.items.map((i) => ({ ...i, group: g.label })))
      .filter((i) => i.label.toLocaleLowerCase("tr").includes(term))
      .slice(0, 6);
  }, [intent, term]);

  const cmdHits = useMemo(
    () => (intent === "komut" ? COMMANDS.filter((c) => c.cmd.includes(term)) : []),
    [intent, term],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/60 pt-[12vh]" onClick={() => setOpen(false)}>
      <div
        role="dialog"
        aria-label="komut merkezi"
        onClick={(e) => e.stopPropagation()}
        className="w-[min(40rem,calc(100vw-2rem))] rounded-xl border border-neutral-800 bg-neutral-950 shadow-2xl"
      >
        <div className="flex items-center gap-2 border-b border-neutral-800 px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-neutral-500" />
          <input
            autoFocus
            aria-label="evrensel arama"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder='Ara… · ">" komut · "?" AI sorusu'
            className="w-full bg-transparent text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none"
          />
          <label className="flex shrink-0 items-center gap-1 text-[10px] text-neutral-500">
            <Bot className="h-3 w-3 text-indigo-400" />
            <select
              aria-label="ajan modu"
              value={mode}
              onChange={(e) => setMode(e.target.value as AgentMode)}
              className="rounded border border-neutral-800 bg-neutral-900 px-1 py-0.5 text-neutral-300"
            >
              <option value="sor">sor</option>
              <option value="uygula">uygula (onaylı)</option>
              <option value="otopilot" disabled={env === "production"}>
                otopilot{env === "production" ? " (prod'da kapalı)" : ""}
              </option>
            </select>
          </label>
        </div>

        {/* Bağlam çipi */}
        <div className="flex items-center gap-2 border-b border-neutral-800/60 px-4 py-1.5 text-[10px] text-neutral-500">
          bağlam:
          <span className="rounded bg-neutral-900 px-1.5 py-0.5 font-mono">{org}</span>
          <span className={cn("rounded px-1.5 py-0.5 font-mono", env === "production" ? "bg-red-600/20 text-red-400" : "bg-neutral-900")}>{env}</span>
          <span className="rounded bg-neutral-900 px-1.5 py-0.5 font-mono">{pathname}</span>
        </div>

        <div className="max-h-72 overflow-auto p-2">
          {intent === "arama" && (
            pageHits.length > 0 ? (
              pageHits.map((p) => (
                <button
                  key={p.href}
                  type="button"
                  onClick={() => {
                    router.push(p.href);
                    setOpen(false);
                    setQ("");
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-neutral-300 hover:bg-neutral-800"
                >
                  <ArrowRight className="h-3.5 w-3.5 text-indigo-400" />
                  {p.label}
                  <span className="ml-auto text-xs text-neutral-600">{p.group}</span>
                </button>
              ))
            ) : (
              <p className="px-3 py-2 text-xs text-neutral-600">
                {term ? "Eşleşme yok." : "Sayfa adı yaz; \">\" ile komut, \"?\" ile AI sorusu."}
              </p>
            )
          )}

          {intent === "komut" &&
            (cmdHits.length > 0 ? cmdHits : COMMANDS).map((c) => (
              <div key={c.cmd} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-neutral-800">
                <TerminalSquare className="h-3.5 w-3.5 text-indigo-400" />
                <code className="font-mono text-neutral-100">{c.cmd}</code>
                <span className="text-xs text-neutral-500">{c.desc}</span>
                <span className="ml-auto text-[10px] text-neutral-600">
                  {c.danger && env === "production" ? "prod: isim-yazarak onay" : mode === "sor" ? "önizleme üretir" : "onay kapısına gider"}
                </span>
              </div>
            ))}

          {intent === "soru" && (
            <div className="px-3 py-2 text-sm">
              <p className="flex items-start gap-2 text-neutral-300">
                <MessageCircleQuestion className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                {term
                  ? `"${term}" — bağlamdaki kayıtlardan derlenen yanıt burada akar (deterministik demo).`
                  : "Soru yaz — yanıt, dayandığı kayıtlarla birlikte gelir."}
              </p>
              <p className="mt-2 border-t border-neutral-800/60 pt-2 text-[10px] text-neutral-600">
                kaynak atfı: ADR-0008 · REQ-114 · audit#4521 — AI yanıtı kayıt sistemi değildir.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
