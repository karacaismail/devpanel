import { useRef, useState } from "react";
import { execute } from "../lib/repl";
import { EquivalencePanel } from "../components/EquivalencePanel";

interface Line {
  kind: "cmd" | "out" | "err";
  text: string;
}

/** Terminal — panel-içi sdk REPL (Ahmet birleştirmesi 2. parti). */
export function Terminal() {
  const [lines, setLines] = useState<Line[]>([
    { kind: "out", text: 'devpanel REPL — `help` ile başla. Panelin yaptığı her şeyin CLI eşdeğeri burada.' },
  ]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const histIdx = useRef(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  const run = () => {
    const cmd = input.trim();
    if (!cmd) return;
    if (cmd === "clear") {
      setLines([]);
      setInput("");
      return;
    }
    const r = execute(cmd);
    setLines((prev) => [
      ...prev,
      { kind: "cmd", text: `$ ${cmd}` },
      { kind: r.tone === "ok" ? "out" : "err", text: r.out },
    ]);
    setHistory((prev) => [cmd, ...prev].slice(0, 50));
    histIdx.current = -1;
    setInput("");
    queueMicrotask(() => boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight }));
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") run();
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(histIdx.current + 1, history.length - 1);
      if (history[next]) {
        histIdx.current = next;
        setInput(history[next]);
      }
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = histIdx.current - 1;
      histIdx.current = Math.max(next, -1);
      setInput(next >= 0 ? history[next] : "");
    }
  };

  return (
    <div>
      <header className="mb-3">
        <h1 className="text-lg text-ink">Terminal</h1>
        <p className="text-sm text-mute">
          `sdk` köprüsünün panel-içi simülasyonu — ⌘K'nin metin hâli. ↑/↓ geçmiş.
        </p>
      </header>

      <div
        ref={boxRef}
        className="h-80 overflow-auto rounded-t-md border border-line bg-bg p-3 font-mono text-[0.8rem] leading-relaxed"
      >
        {lines.map((l, i) => (
          <pre
            key={i}
            className={`whitespace-pre-wrap ${
              l.kind === "cmd" ? "text-accent" : l.kind === "err" ? "text-danger" : "text-mute"
            }`}
          >
            {l.text}
          </pre>
        ))}
      </div>
      <div className="flex items-center gap-2 rounded-b-md border border-t-0 border-line bg-panel px-3 py-2">
        <span className="font-mono text-accent">$</span>
        <input
          aria-label="komut satırı"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="sdk archetype list"
          spellCheck={false}
          className="grow bg-transparent font-mono text-sm text-ink placeholder:text-mute/40 focus:outline-none"
        />
        <button
          type="button"
          onClick={run}
          className="rounded border border-line px-2 py-1 text-xs text-mute hover:text-ink"
        >
          çalıştır
        </button>
      </div>

      <EquivalencePanel action={{ tool: "repl", args: { app: "marketplace" } }} />
    </div>
  );
}
