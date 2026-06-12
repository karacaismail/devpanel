"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X, Sparkles, Loader2, Copy, Check, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrbMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const contextualHints: Record<string, string> = {
  "/": "Dashboard'unuzu analiz edebilir, metrikler hakkında insight verebilirim.",
  "/schema": "Model oluşturabilir, field önerebilir, migration generate edebilirim.",
  "/modules": "Modül scaffold'u oluşturabilir, dependency analizi yapabilirim.",
  "/forms": "Form field'ları önerebilir, validation logic yazabilirim.",
  "/theme": "Renk paleti oluşturabilir, accessibility kontrolü yapabilirim.",
  "/api-explorer": "Endpoint test edebilir, request/response örneği yazabilirim.",
  "/ai-copilot": "Tam özellikli AI asistan moduna geçmek için tıklayın.",
  "/webhooks": "Webhook payload'u oluşturabilir, event mapping yapabilirim.",
  "/activity": "Aktivite loglarını analiz edebilir, pattern tespit edebilirim.",
  "/settings": "Konfigürasyon optimizasyonu önerebilirim.",
};

const quickReplies: Record<string, string[]> = {
  "/schema": ["Yeni model oluştur", "Field öner", "Migration yaz"],
  "/modules": ["Modül scaffold'la", "Dependency kontrol et"],
  "/theme": ["Accessible palette oluştur", "Dark mode optimize et"],
  "/forms": ["Validation ekle", "Form optimize et"],
  "/": ["Proje özeti ver", "Sorun var mı kontrol et"],
};

export function FloatingOrb() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<OrbMessage[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [orbPulse, setOrbPulse] = useState(false);
  const [pathname, setPathname] = useState("/");
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPathname(window.location.pathname);
    const observer = new MutationObserver(() => {
      setPathname(window.location.pathname);
    });
    observer.observe(document.querySelector("body")!, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  // Proactive pulse every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      if (!open) {
        setOrbPulse(true);
        setTimeout(() => setOrbPulse(false), 3000);
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [open]);

  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const simulateResponse = (userText: string) => {
    setIsThinking(true);
    setTimeout(() => {
      const responses: Record<string, string> = {
        "Yeni model oluştur": "Hangi model oluşturmak istiyorsun? Örneğin:\n\n`BlogPost: title, content, author → User, tags, slug (unique)`\n\nYukarıdaki gibi yaz, ben schema'yı oluşturayım.",
        "Field öner": "Mevcut modelinize göre şu field'ları öneriyorum:\n\n• `slug` (string, unique) — SEO-friendly URL\n• `status` (enum: draft/published/archived)\n• `metadata` (json) — esnek veri depolama\n• `sort_order` (number) — sıralama",
        "Migration yaz": "```sql\nCREATE TABLE blog_posts (\n  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),\n  title VARCHAR(255) NOT NULL,\n  content TEXT,\n  author_id UUID REFERENCES users(id),\n  published_at TIMESTAMPTZ,\n  created_at TIMESTAMPTZ DEFAULT NOW(),\n  updated_at TIMESTAMPTZ DEFAULT NOW()\n);\n\nCREATE INDEX idx_blog_posts_author ON blog_posts(author_id);\nCREATE INDEX idx_blog_posts_published ON blog_posts(published_at);\n```",
        "Accessible palette oluştur": "Primary #6366F1 üzerinden WCAG AA uyumlu palette:\n\n• `50` #EEF2FF — bg-light ✅ 12.8:1\n• `500` #6366F1 — interactive ✅ 4.5:1\n• `600` #4F46E5 — hover ✅ 5.8:1\n• `900` #312E81 — text ✅ 11.2:1\n\nTüm renk çiftleri minimum 4.5:1 kontrast oranını karşılıyor.",
        "Proje özeti ver": "📊 **Proje Durumu:**\n\n• 12 model tanımlı, 2'si bu hafta eklendi\n• 8 modül yüklü, 4'ü aktif\n• 47 API endpoint auto-generated\n• 23 migration çalıştırıldı\n• Son hata: yok ✅\n\nÖneri: API Gateway modülünü etkinleştirmenizi öneriyorum — rate limiting ve versioning kazanırsınız.",
      };

      const response = responses[userText] ||
        `"${userText}" komutunu anlıyorum. Bu sayfada şunları yapabilirim:\n\n${contextualHints[pathname] || "Size nasıl yardımcı olabilirim?"}\n\nDaha spesifik bir komut deneyin.`;

      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), role: "assistant", content: response },
      ]);
      setIsThinking(false);
    }, 800 + Math.random() * 700);
  };

  const handleSend = (text?: string) => {
    const msg = text || input;
    if (!msg.trim()) return;

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: msg },
    ]);
    setInput("");
    simulateResponse(msg);
  };

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const currentQuickReplies = quickReplies[pathname] || quickReplies["/"];

  return (
    <>
      {/* Floating Orb Button */}
      {!open && (
        <button
          onClick={() => { setOpen(true); setMinimized(false); }}
          className="fixed bottom-6 right-6 z-50 group"
        >
          <div className="relative">
            {/* Ambient glow */}
            <div
              className={cn(
                "absolute inset-0 rounded-full bg-indigo-500 blur-xl transition-opacity duration-1000",
                orbPulse ? "opacity-40" : "opacity-0 group-hover:opacity-20"
              )}
            />
            {/* Outer ring */}
            <div
              className={cn(
                "absolute -inset-1 rounded-full transition-all duration-1000",
                orbPulse
                  ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-60 animate-spin"
                  : "opacity-0"
              )}
              style={{ animationDuration: "3s" }}
            />
            {/* Main orb */}
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/20 transition-transform group-hover:scale-110">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            {/* Status dot */}
            <div className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-neutral-950 bg-emerald-400" />
          </div>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 rounded-lg bg-neutral-900 border border-neutral-800 px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            <p className="text-xs text-neutral-300">AI Assistant</p>
            <p className="text-[10px] text-neutral-500">{contextualHints[pathname]?.slice(0, 40)}...</p>
          </div>
        </button>
      )}

      {/* Chat Panel */}
      {open && !minimized && (
        <div className="fixed bottom-0 right-0 z-50 w-full sm:bottom-6 sm:right-6 sm:w-[380px] animate-in sm:rounded-2xl border border-neutral-800 bg-neutral-950/95 shadow-2xl shadow-black/50 backdrop-blur-xl overflow-hidden flex flex-col" style={{ maxHeight: "min(560px, calc(100vh - 60px))" }}>
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-neutral-800/50 px-4 py-3">
            <div className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-neutral-950 bg-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-neutral-100">AI Assistant</p>
              <p className="text-[10px] text-emerald-400">Online — context-aware</p>
            </div>
            <button
              onClick={() => setMinimized(true)}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300 transition-colors"
            >
              <Minimize2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => { setOpen(false); setMessages([]); }}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Context Banner */}
          <div className="flex items-center gap-2 border-b border-neutral-800/30 bg-indigo-950/20 px-4 py-2">
            <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
            <p className="text-[10px] text-indigo-300/80">
              {contextualHints[pathname] || "Size nasıl yardımcı olabilirim?"}
            </p>
          </div>

          {/* Messages */}
          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center py-6">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800/50">
                  <Sparkles className="h-5 w-5 text-indigo-400" />
                </div>
                <p className="text-sm text-neutral-400">Bir soru sorun veya komut verin</p>
                <p className="mt-1 text-[10px] text-neutral-600">Sayfa bağlamını otomatik algılarım</p>
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex",
                  msg.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                    msg.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-neutral-800/80 text-neutral-200"
                  )}
                >
                  {msg.content.split("\n").map((line, i) => {
                    if (line.startsWith("```")) return null;
                    if (line.startsWith("• ")) {
                      return (
                        <p key={i} className="ml-1 text-xs leading-relaxed">
                          <span className="text-indigo-400">•</span> {line.slice(2)}
                        </p>
                      );
                    }
                    if (line.startsWith("`") && line.endsWith("`")) {
                      return (
                        <code key={i} className="block rounded bg-neutral-900 px-2 py-0.5 text-xs font-mono text-indigo-300">
                          {line.slice(1, -1)}
                        </code>
                      );
                    }
                    return (
                      <p key={i} className="text-xs leading-relaxed">
                        {line.split(/(\*\*.*?\*\*)/g).map((part, j) =>
                          part.startsWith("**") && part.endsWith("**") ? (
                            <strong key={j} className="font-semibold">{part.slice(2, -2)}</strong>
                          ) : (
                            <span key={j}>{part}</span>
                          )
                        )}
                      </p>
                    );
                  })}

                  {/* Code block detection */}
                  {msg.content.includes("```") && (
                    <div className="mt-2 rounded-lg bg-neutral-900 border border-neutral-800 overflow-hidden">
                      <div className="flex items-center justify-between px-2 py-1 bg-neutral-800/50">
                        <span className="text-[9px] text-neutral-500 font-mono">code</span>
                        <button
                          onClick={() => handleCopy(
                            msg.content.split("```")[1]?.replace(/^sql\n|^typescript\n|^js\n/, "") || "",
                            msg.id
                          )}
                          className="text-neutral-500 hover:text-neutral-300"
                        >
                          {copied === msg.id ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                      <pre className="p-2 text-[10px] font-mono text-emerald-300 overflow-x-auto">
                        {msg.content.split("```")[1]?.replace(/^sql\n|^typescript\n|^js\n/, "")}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-xl bg-neutral-800/80 px-3 py-2">
                  <div className="flex gap-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Replies */}
          {messages.length === 0 && currentQuickReplies && (
            <div className="flex flex-wrap gap-1.5 border-t border-neutral-800/30 px-4 py-2">
              {currentQuickReplies.map((reply) => (
                <button
                  key={reply}
                  onClick={() => handleSend(reply)}
                  className="rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-[10px] font-medium text-neutral-400 transition-colors hover:border-indigo-800 hover:text-indigo-400"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="border-t border-neutral-800/50 px-4 py-3">
            <div className="flex items-center gap-2 rounded-xl bg-neutral-800/50 px-3 py-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="AI'a sor..."
                className="flex-1 bg-transparent text-xs text-neutral-200 placeholder:text-neutral-600 focus:outline-none"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isThinking}
                className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-600 text-white disabled:opacity-30 hover:bg-indigo-500 transition-colors"
              >
                <Send className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Minimized State */}
      {open && minimized && (
        <button
          onClick={() => setMinimized(false)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-950/95 pl-2 pr-4 py-2 shadow-xl backdrop-blur-xl transition-all hover:border-indigo-800 group"
        >
          <div className="relative flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600">
            <Sparkles className="h-3.5 w-3.5 text-white" />
            <div className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full border border-neutral-950 bg-emerald-400" />
          </div>
          <span className="text-xs font-medium text-neutral-400 group-hover:text-neutral-200 transition-colors">
            AI Assistant
          </span>
          {messages.length > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] text-white">
              {messages.filter((m) => m.role === "assistant").length}
            </span>
          )}
        </button>
      )}
    </>
  );
}
