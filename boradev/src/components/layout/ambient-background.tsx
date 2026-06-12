"use client";

import { useEffect, useState } from "react";

const pageGradients: Record<string, { from: string; to: string; via?: string }> = {
  "/": { from: "#6366f1", via: "#8b5cf6", to: "#06b6d4" },
  "/schema": { from: "#6366f1", to: "#3b82f6" },
  "/modules": { from: "#10b981", to: "#06b6d4" },
  "/forms": { from: "#06b6d4", to: "#6366f1" },
  "/theme": { from: "#a855f7", via: "#ec4899", to: "#6366f1" },
  "/api-explorer": { from: "#f59e0b", to: "#ef4444" },
  "/ai-copilot": { from: "#ec4899", via: "#8b5cf6", to: "#6366f1" },
  "/webhooks": { from: "#f97316", to: "#f59e0b" },
  "/activity": { from: "#14b8a6", to: "#06b6d4" },
  "/settings": { from: "#6b7280", to: "#374151" },
};

export function AmbientBackground() {
  const [pathname, setPathname] = useState("/");

  useEffect(() => {
    setPathname(window.location.pathname);
    const observer = new MutationObserver(() => {
      if (window.location.pathname !== pathname) {
        setPathname(window.location.pathname);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  });

  const gradient = pageGradients[pathname] || pageGradients["/"];

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* Top-left blob */}
      <div
        className="absolute -top-32 -left-32 h-96 w-96 rounded-full opacity-[0.03] blur-3xl transition-all duration-[2000ms]"
        style={{ backgroundColor: gradient.from }}
      />
      {/* Top-right blob */}
      <div
        className="absolute -top-24 -right-24 h-80 w-80 rounded-full opacity-[0.04] blur-3xl transition-all duration-[2000ms]"
        style={{ backgroundColor: gradient.via || gradient.to }}
      />
      {/* Bottom gradient line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px opacity-20 transition-all duration-[2000ms]"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${gradient.from} 30%, ${gradient.to} 70%, transparent 100%)`,
        }}
      />
      {/* Subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
      }} />
    </div>
  );
}
