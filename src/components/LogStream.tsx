import { useEffect, useRef, useState } from "react";
import { Pause, Play } from "@phosphor-icons/react";
import { generateLogs, type LogLine } from "../data/ops";

const LEVEL_TONE: Record<LogLine["level"], string> = {
  info: "text-mute",
  warn: "text-warn",
  error: "text-danger",
};

/** §5 — LogStream: SSE benzeri canlı akış; trace/tenant/level filtreli. */
export function LogStream() {
  const [lines, setLines] = useState<LogLine[]>(() => generateLogs(14));
  const [playing, setPlaying] = useState(true);
  const [level, setLevel] = useState<"all" | LogLine["level"]>("all");
  const [tenant, setTenant] = useState<"all" | "acme" | "globex">("all");
  const [trace, setTrace] = useState("");
  const offset = useRef(14);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setLines((prev) => {
        const next = [...prev, ...generateLogs(1, offset.current)];
        offset.current += 1;
        return next.slice(-200);
      });
    }, 1200);
    return () => clearInterval(id);
  }, [playing]);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight });
  }, [lines]);

  const visible = lines.filter(
    (l) =>
      (level === "all" || l.level === level) &&
      (tenant === "all" || l.tenant === tenant) &&
      (!trace || l.trace.includes(trace)),
  );

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? "duraklat" : "devam et"}
          className="flex items-center gap-1 rounded border border-line bg-panel px-2 py-1 text-mute hover:text-ink"
        >
          {playing ? <Pause size={13} /> : <Play size={13} />}
          {playing ? "canlı" : "duraklatıldı"}
        </button>
        <select
          aria-label="seviye"
          value={level}
          onChange={(e) => setLevel(e.target.value as typeof level)}
          className="rounded border border-line bg-elev px-1.5 py-1 text-ink"
        >
          <option value="all">tüm seviyeler</option>
          <option value="info">info</option>
          <option value="warn">warn</option>
          <option value="error">error</option>
        </select>
        <select
          aria-label="tenant"
          value={tenant}
          onChange={(e) => setTenant(e.target.value as typeof tenant)}
          className="rounded border border-line bg-elev px-1.5 py-1 text-ink"
        >
          <option value="all">tüm tenant'lar</option>
          <option value="acme">acme</option>
          <option value="globex">globex</option>
        </select>
        <input
          aria-label="trace filtresi"
          value={trace}
          onChange={(e) => setTrace(e.target.value)}
          placeholder="trace_id…"
          className="w-28 rounded border border-line bg-elev px-1.5 py-1 font-mono text-ink placeholder:text-mute/50"
        />
        <span className="ml-auto text-mute">{visible.length} satır</span>
      </div>

      <div
        ref={boxRef}
        className="h-72 overflow-auto rounded-md border border-line bg-bg p-2 font-mono text-xs leading-relaxed"
      >
        {visible.map((l, i) => (
          <div key={i} className="flex gap-2 whitespace-nowrap">
            <span className="text-line">{l.ts}</span>
            <span className={`w-10 ${LEVEL_TONE[l.level]}`}>{l.level}</span>
            <button
              type="button"
              onClick={() => setTrace(l.trace)}
              className="text-accent/80 hover:underline"
              title="trace zincirini aç"
            >
              {l.trace}
            </button>
            <span className="text-mute">[{l.tenant}]</span>
            <span className={LEVEL_TONE[l.level]}>{l.msg}</span>
          </div>
        ))}
      </div>
      <p className="mt-1 text-xs text-mute/60">
        Satıra tıkla → trace zinciri filtrelenir. Telemetri yok: bu akış kernel'in kendi structured log'u (E2).
      </p>
    </div>
  );
}
