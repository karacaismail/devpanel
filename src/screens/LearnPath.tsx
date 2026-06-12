import { useState } from "react";
import { GraduationCap } from "@phosphor-icons/react";
import { useUiStore, type ScreenId } from "../lib/store";
import { EquivalencePanel } from "../components/EquivalencePanel";

interface Step {
  id: string;
  title: string;
  desc: string;
  screen: ScreenId;
  done: boolean;
}

const INITIAL: Step[] = [
  { id: "s1", title: "Granülerlik dilini öğren", desc: "Dağ → Çakıl cetveli; rozet biçimi: Ad (Metafor · SP).", screen: "wbs", done: true },
  { id: "s2", title: "İlk scaffold önizlemen", desc: '⌘K aç, "crm dağ yap" yaz — test dosyasının İLK üretildiğine dikkat et.', screen: "overview", done: true },
  { id: "s3", title: "ArcheType bayraklarını incele", desc: "party'de pii/retention/audit bayraklarının ne doğurduğuna bak.", screen: "archetype", done: false },
  { id: "s4", title: "Surface projeksiyonunu değiştir", desc: "Bir alanın görünürlüğünü kapat; YAML patch'in oluştuğunu gör.", screen: "surface", done: false },
  { id: "s5", title: "Kırmızı testi oku", desc: "Test Runner'daki telafi eksiğini bul — panel neden kapatılamaz?", screen: "tests", done: false },
  { id: "s6", title: "Agent scope'unu daralt", desc: "AI Konsolu'nda blast-radius'u 'dar'a çek; farkı audit'te gör.", screen: "ai", done: false },
];

/** Eğitim Yolu — jr-öncesi vibecoder personası için panel turu (AI'ın ürettiğini ANLA ve onayla). */
export function LearnPath() {
  const setScreen = useUiStore((s) => s.setScreen);
  const [steps, setSteps] = useState(INITIAL);
  const doneCount = steps.filter((s) => s.done).length;
  const pct = Math.round((doneCount / steps.length) * 100);

  const toggle = (id: string) =>
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));

  return (
    <div className="max-w-2xl">
      <header className="mb-4">
        <h1 className="flex items-center gap-2 text-lg text-ink">
          <GraduationCap size={20} className="text-accent" /> Eğitim Yolu
        </h1>
        <p className="text-sm text-mute">
          Amaç AI'ın ürettiğini <strong>anlayıp onaylayabilmek</strong> — her ekran
          k-granulerlik/k-surface diliyle konuşur.
        </p>
      </header>

      <div className="mb-4 flex items-center gap-3">
        <div className="h-2 grow overflow-hidden rounded bg-elev">
          <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
        </div>
        <span className="font-mono text-sm text-ink">%{pct}</span>
      </div>

      <ol className="flex flex-col gap-2">
        {steps.map((s, i) => (
          <li key={s.id} className="flex items-start gap-3 rounded-md border border-line bg-panel p-3">
            <input
              type="checkbox"
              checked={s.done}
              onChange={() => toggle(s.id)}
              aria-label={`tamamlandı: ${s.title}`}
              className="mt-1"
            />
            <div className="min-w-0 grow">
              <p className={`text-sm ${s.done ? "text-mute line-through" : "text-ink"}`}>
                <span className="mr-1.5 font-mono text-accent">{i + 1}</span>
                {s.title}
              </p>
              <p className="text-xs text-mute">{s.desc}</p>
            </div>
            <button
              type="button"
              onClick={() => setScreen(s.screen)}
              className="shrink-0 rounded border border-line px-2 py-1 text-xs text-mute hover:text-ink"
            >
              ekranı aç →
            </button>
          </li>
        ))}
      </ol>

      <EquivalencePanel action={{ tool: "learn.status", args: { user: "ismail" } }} />
    </div>
  );
}
