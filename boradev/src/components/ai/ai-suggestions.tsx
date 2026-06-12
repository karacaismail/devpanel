"use client";

import { useState, useEffect } from "react";
import { Sparkles, X, ArrowRight, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Suggestion {
  id: string;
  title: string;
  description: string;
  action: string;
  href: string;
  type: "insight" | "optimization" | "feature";
}

const allSuggestions: Suggestion[] = [
  {
    id: "1",
    title: "API Gateway modülünü etkinleştirin",
    description: "Rate limiting ve versioning ile API'lerinizi güvence altına alın",
    action: "Modüllere Git",
    href: "/modules",
    type: "feature",
  },
  {
    id: "2",
    title: "User modeline 'avatar' field'ı ekleyin",
    description: "Media Manager modülü aktif — avatar desteği kolayca eklenebilir",
    action: "Schema'ya Git",
    href: "/schema",
    type: "optimization",
  },
  {
    id: "3",
    title: "Color contrast uyarısı",
    description: "Secondary renk paleti WCAG AA standardını karşılamayabilir",
    action: "Theme'a Git",
    href: "/theme",
    type: "insight",
  },
];

const typeConfig = {
  insight: { color: "border-amber-800/30 bg-amber-950/30", icon: "text-amber-400", dot: "bg-amber-400" },
  optimization: { color: "border-blue-800/30 bg-blue-950/30", icon: "text-blue-400", dot: "bg-blue-400" },
  feature: { color: "border-emerald-800/30 bg-emerald-950/30", icon: "text-emerald-400", dot: "bg-emerald-400" },
};

export function AISuggestions() {
  const [visible, setVisible] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState<Suggestion | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Show first suggestion after 5 seconds
    const timer = setTimeout(() => {
      const available = allSuggestions.filter((s) => !dismissed.has(s.id));
      if (available.length > 0) {
        setCurrentSuggestion(available[0]);
        setVisible(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [dismissed]);

  // Auto-hide after 8 seconds
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => setVisible(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [visible, currentSuggestion]);

  const handleDismiss = () => {
    if (currentSuggestion) {
      setDismissed((prev) => new Set(prev).add(currentSuggestion.id));
    }
    setVisible(false);

    // Show next suggestion after delay
    setTimeout(() => {
      const available = allSuggestions.filter(
        (s) => !dismissed.has(s.id) && s.id !== currentSuggestion?.id
      );
      if (available.length > 0) {
        setCurrentSuggestion(available[0]);
        setVisible(true);
      }
    }, 15000);
  };

  if (!visible || !currentSuggestion) return null;

  const config = typeConfig[currentSuggestion.type];

  return (
    <div className="fixed top-16 right-3 z-30 w-[calc(100vw-1.5rem)] sm:top-20 sm:right-6 sm:w-[320px] animate-in">
      <div className={cn("rounded-xl border p-4 shadow-xl backdrop-blur-xl", config.color)}>
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <Lightbulb className={cn("h-4 w-4", config.icon)} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-neutral-200">{currentSuggestion.title}</p>
            </div>
            <p className="mt-1 text-xs text-neutral-400 leading-relaxed">
              {currentSuggestion.description}
            </p>
            <Link
              href={currentSuggestion.href}
              onClick={handleDismiss}
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              {currentSuggestion.action}
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <button
            onClick={handleDismiss}
            className="flex h-5 w-5 items-center justify-center rounded text-neutral-600 hover:text-neutral-400 transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>

        {/* AI attribution */}
        <div className="mt-3 flex items-center gap-1.5 border-t border-neutral-800/30 pt-2">
          <Sparkles className="h-2.5 w-2.5 text-indigo-500" />
          <span className="text-[9px] text-neutral-600">AI Proactive Suggestion</span>
          <div className={cn("ml-auto h-1.5 w-1.5 rounded-full", config.dot)} />
        </div>
      </div>
    </div>
  );
}
