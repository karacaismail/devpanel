"use client";

import { useEffect, useState } from "react";
import { Zap, X } from "lucide-react";

/**
 * K9 — Proaktif AI bağlam modalı: yavaş sorgu algılandığında sağ alttan öneri.
 * Kabul → diff → onaya gönder; sessiz mutation yok. Oturum başına bir kez.
 */
export function AiContextModal() {
  const [stage, setStage] = useState<"hidden" | "offer" | "diff" | "sent">("hidden");

  useEffect(() => {
    const t = window.setTimeout(() => {
      setStage((s) => (s === "hidden" ? "offer" : s));
    }, 6000);
    return () => window.clearTimeout(t);
  }, []);

  if (stage === "hidden") return null;

  return (
    <div className="fixed bottom-14 right-4 z-50 w-80 rounded-xl border border-indigo-500/30 bg-neutral-950/95 p-4 shadow-2xl backdrop-blur">
      <div className="flex items-start gap-2.5">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600/15 text-indigo-400">
          <Zap className="h-3.5 w-3.5" />
        </span>
        <div className="min-w-0 text-xs">
          {stage === "offer" && (
            <>
              <p className="font-medium text-neutral-100">Yavaş sorgu algılandı (2340ms)</p>
              <p className="mt-1 text-neutral-400">
                orders.placed_at filtresi index&apos;siz. Bu sorguyu optimize etmek için bir indeks oluşturmamı ister misin?
              </p>
              <div className="mt-2.5 flex gap-2">
                <button type="button" onClick={() => setStage("diff")} className="rounded-md bg-indigo-600 px-2.5 py-1 text-white hover:bg-indigo-700">
                  Diff göster
                </button>
                <button type="button" onClick={() => setStage("hidden")} className="rounded-md border border-neutral-700 px-2.5 py-1 text-neutral-400 hover:text-neutral-200">
                  Şimdi değil
                </button>
              </div>
            </>
          )}
          {stage === "diff" && (
            <>
              <p className="font-medium text-neutral-100">Önerilen migration (q-8)</p>
              <pre className="mt-1.5 rounded-lg bg-neutral-900 p-2 font-mono text-[10.5px] text-emerald-400">
+ CREATE INDEX CONCURRENTLY idx_orders_placed_at{"\n"}+   ON ten_orders (placed_at);
              </pre>
              <p className="mt-1 text-neutral-500">risk: düşük · kilitleme yok · geri alınabilir</p>
              <div className="mt-2 flex gap-2">
                <button type="button" onClick={() => setStage("sent")} className="rounded-md bg-indigo-600 px-2.5 py-1 text-white hover:bg-indigo-700">
                  Onaya gönder
                </button>
                <button type="button" onClick={() => setStage("hidden")} className="rounded-md border border-neutral-700 px-2.5 py-1 text-neutral-400 hover:text-neutral-200">
                  Reddet
                </button>
              </div>
            </>
          )}
          {stage === "sent" && (
            <p className="text-emerald-400">
              Migration kuyruğuna taslak olarak eklendi — release yöneticisi onaylamadan uygulanmaz. Audit&apos;e yazıldı.
            </p>
          )}
        </div>
        <button type="button" aria-label="kapat" onClick={() => setStage("hidden")} className="ml-auto shrink-0 text-neutral-600 hover:text-neutral-300">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
