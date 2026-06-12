"use client";

import { CliEquivalent } from "@/components/cli-equivalent";

import { useState, useRef, useEffect } from "react";
import {
  Terminal,
  Send,
  Wand2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Database,
  Puzzle,
  Palette,
  FileCode,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  actions?: { label: string; type: "primary" | "secondary" }[];
  codeBlock?: { language: string; code: string };
}

const suggestions = [
  { label: "Blog modülü oluştur", icon: Puzzle, prompt: "BlogPost modeli oluştur: title (string, required), content (text), author (relation → User), published_at (date), tags (json), slug (string, unique)" },
  { label: "E-ticaret şeması", icon: Database, prompt: "E-ticaret için Product, Order, OrderItem, Category modelleri oluştur. Uygun relation'lar ve index'ler ekle." },
  { label: "Renk paleti oluştur", icon: Palette, prompt: "#6366F1 primary renginden WCAG AA uyumlu tam bir renk paleti oluştur (50-950 arası)" },
  { label: "API endpoint'leri", icon: FileCode, prompt: "User modeli için CRUD REST endpoint'leri oluştur: list, get, create, update, delete. Pagination ve filtering ekle." },
];

const demoConversation: Message[] = [
  {
    id: "1",
    role: "system",
    content: "MetaPanel AI Copilot'a hoş geldiniz. Schema, modül, tema ve API işlemlerinde size yardımcı olabilirim.",
    timestamp: new Date(),
  },
];

const simulatedResponse: Message = {
  id: "3",
  role: "assistant",
  content: `BlogPost modeli oluşturuldu. İşte detaylar:

**Model:** BlogPost
**Tablo:** blog_posts
**Özellikler:** timestamps, soft-delete

**Fields:**
- \`title\` — String, required, indexed
- \`content\` — Text
- \`author\` — Relation → User, indexed
- \`published_at\` — Date, indexed
- \`tags\` — JSON
- \`slug\` — String, unique, indexed

**Otomatik oluşturulanlar:**
- Migration dosyası: \`004_create_blog_posts.sql\`
- REST endpoints: \`/api/blog-posts\` (CRUD)
- TypeScript interface
- Zod validation schema`,
  timestamp: new Date(),
  actions: [
    { label: "Schema'ya Git", type: "primary" },
    { label: "Migration Çalıştır", type: "secondary" },
    { label: "API Test Et", type: "secondary" },
  ],
  codeBlock: {
    language: "typescript",
    code: `interface BlogPost {
  id: string;
  title: string;
  content?: string;
  author: User;
  published_at?: Date;
  tags?: string[];
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

const blogPostSchema = z.object({
  title: z.string().min(1).max(255),
  content: z.string().optional(),
  author_id: z.string().uuid(),
  published_at: z.date().optional(),
  tags: z.array(z.string()).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/),
});`,
  },
};

export default function AICopilotPage() {
  const [messages, setMessages] = useState<Message[]>(demoConversation);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = (text?: string) => {
    const prompt = text || input;
    if (!prompt.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: prompt,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { ...simulatedResponse, id: (Date.now() + 1).toString(), timestamp: new Date() },
      ]);
      setIsLoading(false);
    }, 1500);
  };

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-400" />
            AI Copilot
          </h1>
          <p className="text-sm text-neutral-400">
            Doğal dil ile schema, modül ve API oluşturun
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMessages(demoConversation)}
        >
          <RotateCcw className="mr-2 h-3 w-3" />
          Sıfırla
        </Button>
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {suggestions.map((s) => (
            <button
              key={s.label}
              onClick={() => handleSend(s.prompt)}
              className="flex items-center gap-3 rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-left transition-colors hover:border-indigo-800 hover:bg-indigo-950/20"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600/10">
                <s.icon className="h-4 w-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-200">{s.label}</p>
                <p className="mt-0.5 text-xs text-neutral-500 line-clamp-1">{s.prompt}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white"
                    : msg.role === "system"
                    ? "bg-neutral-800/50 text-neutral-300 border border-neutral-800"
                    : "bg-neutral-800 text-neutral-200"
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="mb-2 flex items-center gap-2">
                    <Wand2 className="h-3 w-3 text-indigo-400" />
                    <span className="text-xs font-medium text-indigo-400">AI Copilot</span>
                  </div>
                )}

                <div className="text-sm whitespace-pre-wrap leading-relaxed">
                  {msg.content.split("\n").map((line, i) => {
                    if (line.startsWith("**") && line.endsWith("**")) {
                      return <p key={i} className="font-semibold mt-2">{line.replace(/\*\*/g, "")}</p>;
                    }
                    if (line.startsWith("- `")) {
                      const parts = line.replace("- `", "").split("` — ");
                      return (
                        <p key={i} className="ml-2">
                          <code className="rounded bg-neutral-900 px-1 py-0.5 text-xs text-indigo-300">
                            {parts[0]?.replace("`", "")}
                          </code>
                          {parts[1] && <span className="text-neutral-400"> — {parts[1]}</span>}
                        </p>
                      );
                    }
                    return <p key={i}>{line}</p>;
                  })}
                </div>

                {msg.codeBlock && (
                  <div className="mt-3 rounded-lg bg-neutral-950 border border-neutral-800 overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-900 border-b border-neutral-800">
                      <Badge variant="secondary" className="text-[10px]">
                        {msg.codeBlock.language}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[10px]"
                        onClick={() => handleCopy(msg.codeBlock!.code, msg.id)}
                      >
                        {copied === msg.id ? (
                          <Check className="mr-1 h-3 w-3" />
                        ) : (
                          <Copy className="mr-1 h-3 w-3" />
                        )}
                        {copied === msg.id ? "Copied" : "Copy"}
                      </Button>
                    </div>
                    <pre className="p-3 text-xs font-mono text-neutral-300 overflow-x-auto">
                      <code>{msg.codeBlock.code}</code>
                    </pre>
                  </div>
                )}

                {msg.actions && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {msg.actions.map((action) => (
                      <Button
                        key={action.label}
                        variant={action.type === "primary" ? "default" : "outline"}
                        size="sm"
                        className="text-xs"
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 rounded-lg bg-neutral-800 px-4 py-3">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                <span className="text-sm text-neutral-400">Düşünüyorum...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-neutral-800 p-4">
          <div className="flex items-center gap-3">
            <Terminal className="h-5 w-5 text-neutral-500" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Bir model oluştur, modül ekle, tema düzenle..."
              className="flex-1 bg-transparent text-sm text-neutral-200 placeholder:text-neutral-600 focus:outline-none"
            />
            <Button
              size="sm"
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
      <CliEquivalent tool="copilot.chat" args={{ app: "marketplace" }} />

    </div>
  );
}
