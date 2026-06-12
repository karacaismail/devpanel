"use client";

import { Eye, X } from "lucide-react";
import { useContextStore } from "@/stores/context-store";

/** K5 — Impersonation banner: aktifken tam genişlik uyarı + audit notu. */
export function ImpersonationBanner() {
  const { impersonating, setImpersonating } = useContextStore();
  if (!impersonating) return null;

  return (
    <div
      role="status"
      className="fixed left-0 right-0 top-0 z-[60] flex items-center justify-center gap-3 border-b border-amber-500/40 bg-amber-600/15 px-4 py-1.5 text-xs text-amber-300 backdrop-blur lg:left-64"
    >
      <Eye className="h-3.5 w-3.5" />
      <span>
        <strong>{impersonating}</strong> olarak görüntülüyorsun — bu oturumdaki her eylem audit&apos;e impersonation etiketiyle yazılır.
      </span>
      <button
        type="button"
        onClick={() => setImpersonating(null)}
        className="flex items-center gap-1 rounded-md border border-amber-500/40 px-2 py-0.5 hover:bg-amber-600/20"
      >
        <X className="h-3 w-3" /> Sonlandır
      </button>
    </div>
  );
}
