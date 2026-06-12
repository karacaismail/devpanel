"use client";

import { useState, useEffect } from "react";
import { X, Keyboard } from "lucide-react";
import { cn } from "@/lib/utils";

const shortcuts = [
  { section: "Navigasyon", items: [
    { keys: ["⌘", "K"], description: "Command Palette / Arama" },
    { keys: ["Esc"], description: "Kapat / Geri" },
    { keys: ["⌘", "1-9"], description: "Hızlı sayfa geçişi" },
  ]},
  { section: "Genel", items: [
    { keys: ["⌘", "S"], description: "Kaydet" },
    { keys: ["⌘", "Z"], description: "Geri al" },
    { keys: ["⌘", "⇧", "Z"], description: "Yeniden yap" },
    { keys: ["?"], description: "Bu kısayol panelini aç" },
  ]},
  { section: "Schema Builder", items: [
    { keys: ["⌘", "N"], description: "Yeni model" },
    { keys: ["⌘", "⇧", "F"], description: "Yeni field" },
    { keys: ["⌘", "⇧", "M"], description: "Migration oluştur" },
  ]},
  { section: "AI", items: [
    { keys: ["⌘", "J"], description: "AI Copilot aç" },
    { keys: ["⌘", "⇧", "A"], description: "AI ile oluştur" },
    { keys: ["⌘", "I"], description: "AI Orb aç/kapat" },
  ]},
  { section: "Editör", items: [
    { keys: ["⌘", "P"], description: "Dosya aç" },
    { keys: ["⌘", "/"], description: "Yorum satırı" },
    { keys: ["⌘", "D"], description: "Satır sil" },
  ]},
];

export function KeyboardShortcuts() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "?" && !e.metaKey && !e.ctrlKey && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setVisible((v) => !v);
      }
      if (e.key === "Escape" && visible) {
        setVisible(false);
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" onClick={() => setVisible(false)} />
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4" onClick={() => setVisible(false)}>
        <div
          className="w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-950/95 shadow-2xl backdrop-blur-xl overflow-hidden animate-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-neutral-800 px-6 py-4">
            <div className="flex items-center gap-2">
              <Keyboard className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-neutral-100">Keyboard Shortcuts</h2>
            </div>
            <button onClick={() => setVisible(false)} className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 p-4 sm:grid-cols-2 sm:p-6 max-h-[60vh] overflow-y-auto">
            {shortcuts.map((section) => (
              <div key={section.section}>
                <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">{section.section}</h3>
                <div className="space-y-1.5">
                  {section.items.map((item) => (
                    <div key={item.description} className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-neutral-800/30">
                      <span className="text-xs text-neutral-400">{item.description}</span>
                      <div className="flex items-center gap-1">
                        {item.keys.map((key, i) => (
                          <span key={i}>
                            <kbd className="inline-flex h-6 min-w-[24px] items-center justify-center rounded bg-neutral-800 px-1.5 text-[10px] font-mono text-neutral-300 border border-neutral-700">
                              {key}
                            </kbd>
                            {i < item.keys.length - 1 && <span className="mx-0.5 text-[10px] text-neutral-700">+</span>}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-neutral-800 px-6 py-3 text-center">
            <p className="text-[10px] text-neutral-600">
              Press <kbd className="rounded bg-neutral-800 px-1.5 py-0.5 text-[9px] font-mono">?</kbd> to toggle this panel
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
