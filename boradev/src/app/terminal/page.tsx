"use client";

import { CliEquivalent } from "@/components/cli-equivalent";

import { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon, Plus, X, Maximize2, Minimize2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TerminalLine {
  type: "input" | "output" | "error" | "info";
  content: string;
}

const initialHistory: TerminalLine[] = [
  { type: "info", content: "MetaPanel Terminal v1.0.0 — Type 'help' for available commands" },
  { type: "info", content: "Connected to: localhost:3000 (development)" },
  { type: "input", content: "meta status" },
  { type: "output", content: "✓ Database: Connected (PostgreSQL 15.4)" },
  { type: "output", content: "✓ Redis: Connected (7.2.0)" },
  { type: "output", content: "✓ Modules: 4/8 active" },
  { type: "output", content: "✓ Migrations: Up to date (23 applied)" },
  { type: "input", content: "meta models --list" },
  { type: "output", content: "  User          6 fields   users          timestamps, soft-delete" },
  { type: "output", content: "  Product       6 fields   products       timestamps" },
  { type: "output", content: "  Order         5 fields   orders         timestamps" },
  { type: "output", content: "  OrderItem     5 fields   order_items    —" },
  { type: "output", content: "  Category      4 fields   categories     —" },
  { type: "output", content: "  BlogPost      6 fields   blog_posts     timestamps, soft-delete" },
  { type: "input", content: "meta migrate --status" },
  { type: "output", content: "  23 migrations applied, 0 pending" },
  { type: "output", content: "  Last: 004_create_blog_posts.sql (2 saat önce)" },
];

const commandResponses: Record<string, TerminalLine[]> = {
  help: [
    { type: "output", content: "Available commands:" },
    { type: "output", content: "  meta status          — System status overview" },
    { type: "output", content: "  meta models --list   — List all models" },
    { type: "output", content: "  meta models create   — Create a new model (AI-assisted)" },
    { type: "output", content: "  meta migrate --run   — Run pending migrations" },
    { type: "output", content: "  meta migrate --status— Migration status" },
    { type: "output", content: "  meta modules --list  — List all modules" },
    { type: "output", content: "  meta cache --clear   — Clear all caches" },
    { type: "output", content: "  meta db --stats      — Database statistics" },
    { type: "output", content: "  meta ai <prompt>     — AI-powered command" },
    { type: "output", content: "  clear                — Clear terminal" },
  ],
  "meta cache --clear": [
    { type: "output", content: "Clearing cache..." },
    { type: "output", content: "  ✓ Redis cache cleared (145 keys)" },
    { type: "output", content: "  ✓ Query cache cleared" },
    { type: "output", content: "  ✓ Static cache cleared" },
    { type: "info", content: "Cache cleared successfully in 120ms" },
  ],
  "meta db --stats": [
    { type: "output", content: "Database Statistics:" },
    { type: "output", content: "  Size:        256 MB" },
    { type: "output", content: "  Tables:      24" },
    { type: "output", content: "  Connections: 8 / 100" },
    { type: "output", content: "  QPS:         142" },
    { type: "output", content: "  Avg Time:    2.3ms" },
    { type: "output", content: "  Hit Ratio:   98.5%" },
  ],
  "meta modules --list": [
    { type: "output", content: "  ◉ Core           v1.0.0   [active]" },
    { type: "output", content: "  ◉ Authentication  v2.1.0   [active]" },
    { type: "output", content: "  ◉ Media Manager   v1.3.0   [active]" },
    { type: "output", content: "  ◉ API Gateway     v1.0.0   [active]" },
    { type: "output", content: "  ○ E-Commerce      v0.9.0   [disabled]" },
    { type: "output", content: "  ○ Notifications   v1.0.0   [disabled]" },
    { type: "output", content: "  ○ Analytics       v0.5.0   [disabled]" },
    { type: "output", content: "  ○ CMS             v1.2.0   [disabled]" },
  ],
};

const tabs = [
  { id: "1", name: "Terminal 1", active: true },
  { id: "2", name: "Terminal 2", active: false },
];

export default function TerminalPage() {
  const [history, setHistory] = useState<TerminalLine[]>(initialHistory);
  const [input, setInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history]);

  const handleCommand = (cmd: string) => {
    if (!cmd.trim()) return;

    setCmdHistory((prev) => [cmd, ...prev]);
    setHistoryIndex(-1);

    if (cmd === "clear") {
      setHistory([{ type: "info", content: "Terminal cleared." }]);
      setInput("");
      return;
    }

    const newLines: TerminalLine[] = [{ type: "input", content: cmd }];

    const response = commandResponses[cmd];
    if (response) {
      newLines.push(...response);
    } else if (cmd.startsWith("meta ai ")) {
      const prompt = cmd.replace("meta ai ", "");
      newLines.push(
        { type: "info", content: "AI processing..." },
        { type: "output", content: `AI Response for "${prompt}":` },
        { type: "output", content: "Bu komut gerçek AI entegrasyonuyla çalışacak." },
        { type: "output", content: "Şimdilik demo modunda." },
      );
    } else {
      newLines.push({ type: "error", content: `Command not found: ${cmd}. Type 'help' for available commands.` });
    }

    setHistory((prev) => [...prev, ...newLines]);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCommand(input);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (historyIndex < cmdHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(cmdHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(cmdHistory[newIndex]);
      } else {
        setHistoryIndex(-1);
        setInput("");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Terminal</h1>
          <p className="text-sm text-neutral-400">Sistem komutları ve MetaPanel CLI</p>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-2xl">
        {/* Tab Bar */}
        <div className="flex items-center gap-0.5 border-b border-neutral-800 bg-neutral-900 px-2 py-1.5 overflow-x-auto">
          {tabs.map((tab) => (
            <div key={tab.id} className={cn("flex items-center gap-1.5 rounded-md px-3 py-1", tab.active ? "bg-neutral-800 text-neutral-200" : "text-neutral-500 hover:text-neutral-400")}>
              <TerminalIcon className="h-3 w-3" />
              <span className="text-[10px] font-medium">{tab.name}</span>
              <button className="ml-1 rounded hover:bg-neutral-700 p-0.5"><X className="h-2.5 w-2.5" /></button>
            </div>
          ))}
          <button className="rounded-md p-1 text-neutral-600 hover:text-neutral-400 hover:bg-neutral-800">
            <Plus className="h-3.5 w-3.5" />
          </button>
          <div className="ml-auto flex items-center gap-1">
            <Badge variant="secondary" className="text-[8px]">zsh</Badge>
            <Badge variant="success" className="text-[8px]">connected</Badge>
          </div>
        </div>

        {/* Terminal Content */}
        <div
          ref={scrollRef}
          onClick={() => inputRef.current?.focus()}
          className="h-[400px] sm:h-[500px] overflow-y-auto overflow-x-auto p-3 sm:p-4 font-mono text-xs sm:text-sm cursor-text"
        >
          {history.map((line, i) => (
            <div key={i} className="leading-6">
              {line.type === "input" && (
                <span>
                  <span className="text-emerald-400">~/metapanel</span>
                  <span className="text-neutral-600"> $ </span>
                  <span className="text-neutral-200">{line.content}</span>
                </span>
              )}
              {line.type === "output" && (
                <span className="text-neutral-400">{line.content}</span>
              )}
              {line.type === "error" && (
                <span className="text-red-400">{line.content}</span>
              )}
              {line.type === "info" && (
                <span className="text-blue-400">{line.content}</span>
              )}
            </div>
          ))}

          {/* Input Line */}
          <div className="flex items-center leading-6">
            <span className="text-emerald-400">~/metapanel</span>
            <span className="text-neutral-600"> $ </span>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-neutral-200 focus:outline-none caret-indigo-400"
              autoFocus
              spellCheck={false}
            />
          </div>
        </div>
      </div>
      <CliEquivalent tool="repl" args={{ app: "marketplace" }} />

    </div>
  );
}
