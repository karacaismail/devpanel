import { useMemo, useState } from "react";
import { Robot, ShieldWarning } from "@phosphor-icons/react";
import { MCP_TOOLS } from "../data/ops";
import { SCOPE_CATALOG, blastRadius } from "../lib/blast";
import { ConfirmDanger } from "../components/ConfirmDanger";
import { EquivalencePanel } from "../components/EquivalencePanel";
import { logAction } from "../lib/audit";
import { propose, type Proposal } from "../lib/aiPropose";

const LEVEL_TONE = { dar: "text-ok", orta: "text-warn", geniş: "text-danger" } as const;

/** P12 — AI Konsolu: MCP tool kataloğu + capability scope + blast-radius (d11). */
export function AiConsole() {
  const [agent, setAgent] = useState("vibebot");
  const [selected, setSelected] = useState<string[]>(["party.read", "scaffold"]);
  const [confirming, setConfirming] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);
  /* AI öneri (diff) — Ahmet'in AiDock/DiffCard ilkesinin portu */
  const [aiPrompt, setAiPrompt] = useState("");
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [proposalState, setProposalState] = useState<"yok" | "bekliyor" | "uygulandı" | "reddedildi">("yok");
  /* Dry-run playground */
  const [dryTool, setDryTool] = useState(MCP_TOOLS[0].name);
  const [dryArgs, setDryArgs] = useState('{"id": "party"}');
  const [dryResult, setDryResult] = useState<string | null>(null);

  const runDry = () => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(dryArgs || "{}");
    } catch {
      setDryResult(JSON.stringify({ error: "geçersiz JSON argüman" }, null, 2));
      return;
    }
    setDryResult(
      JSON.stringify(
        {
          tool: dryTool,
          dryRun: true,
          arguments: parsed,
          result: { status: "ok", piiMasked: true, wrote: false },
        },
        null,
        2,
      ),
    );
    logAction(
      { tool: "agent.dryrun", args: { tool: dryTool } },
      `${dryTool} dry-run çağrıldı (yazma yok)`,
      { toast: false },
    );
  };

  const scopes = useMemo(
    () => SCOPE_CATALOG.filter((s) => selected.includes(s.id)),
    [selected],
  );
  const blast = useMemo(() => blastRadius(scopes), [scopes]);

  const toggle = (id: string) => {
    setSavedMsg(null);
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const save = () => {
    if (blast.needsApproval) {
      setConfirming(true);
    } else {
      logAction(
        { tool: "agent.scope.set", args: { agent, scopes: selected.join(",") } },
        `${agent} scope güncellendi (${blast.level} yarıçap)`,
      );
      setSavedMsg("Scope kaydedildi — audit'e yazıldı (layer1-audit).");
    }
  };

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-lg text-ink">AI Konsolu</h1>
        <p className="text-sm text-mute">
          Panelin yaptığı her şeyin MCP eşdeğeri vardır — bu ekran agent'ın
          yapabildiklerinin insan-görünümüdür.
        </p>
      </header>

      <h2 className="mb-2 text-xs uppercase tracking-wide text-mute">
        MCP tool kataloğu (ArcheType başına otomatik)
      </h2>
      <div className="mb-5 overflow-auto rounded-md border border-line">
        <table className="w-full text-sm">
          <thead className="bg-panel text-left text-xs uppercase tracking-wide text-mute">
            <tr>
              <th className="px-3 py-2 font-normal">tool</th>
              <th className="px-3 py-2 font-normal">kaynak</th>
              <th className="px-3 py-2 font-normal">operasyonlar</th>
            </tr>
          </thead>
          <tbody>
            {MCP_TOOLS.map((t) => (
              <tr key={t.name} className="border-t border-line/60">
                <td className="px-3 py-1.5 font-mono text-ink">{t.name}</td>
                <td className="px-3 py-1.5 text-mute">{t.source}</td>
                <td className="px-3 py-1.5 text-mute">{t.ops}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-md border border-line bg-panel p-3">
          <h2 className="mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wide text-mute">
            <Robot size={14} className="text-accent" /> Capability scope —
            <select
              aria-label="agent"
              value={agent}
              onChange={(e) => setAgent(e.target.value)}
              className="rounded border border-line bg-elev px-1.5 py-0.5 text-ink"
            >
              <option>vibebot</option>
              <option>migration-reviewer</option>
            </select>
          </h2>
          <ul className="flex flex-col gap-1.5">
            {SCOPE_CATALOG.map((s) => (
              <li key={s.id}>
                <label className="flex cursor-pointer items-center gap-2 rounded border border-line bg-elev px-2 py-1.5 text-sm">
                  <input
                    type="checkbox"
                    checked={selected.includes(s.id)}
                    onChange={() => toggle(s.id)}
                    className="accent-(--color-accent)"
                  />
                  <code className="font-mono text-ink">{s.id}</code>
                  <span className="text-xs text-mute">{s.label}</span>
                  {s.writes && (
                    <span className="ml-auto rounded border border-warn/50 px-1.5 py-0.5 text-xs text-warn">
                      yazma
                    </span>
                  )}
                </label>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-md border border-line bg-panel p-3">
          <h2 className="mb-2 text-xs uppercase tracking-wide text-mute">
            Blast-radius önizleme
          </h2>
          <p className="text-sm">
            <span className="text-mute">yarıçap: </span>
            <strong className={LEVEL_TONE[blast.level]}>{blast.level}</strong>
            <span className="text-mute"> · etkilenen tablolar: </span>
            <span className="font-mono text-ink">
              {blast.tables.length > 0 ? blast.tables.join(", ") : "—"}
            </span>
          </p>
          {blast.needsApproval && (
            <p role="alert" className="mt-2 flex items-start gap-2 rounded border border-danger/40 bg-danger/10 p-2 text-xs text-danger">
              <ShieldWarning size={15} className="mt-0.5 shrink-0" />
              Geniş yarıçap: kaydetmek ek onay ister (isim-yazarak).
            </p>
          )}
          <button
            type="button"
            onClick={save}
            className="mt-3 rounded bg-accent px-3 py-1.5 text-sm text-accent-ink"
          >
            Scope'u kaydet
          </button>
          {savedMsg && <p className="mt-2 text-xs text-ok">{savedMsg}</p>}
        </section>
      </div>

      <section className="mt-4 rounded-md border border-line bg-panel p-3">
        <h2 className="mb-2 text-xs uppercase tracking-wide text-mute">
          AI öneri — diff olarak gelir, sen onaylarsın (sessiz mutasyon yok)
        </h2>
        <div className="flex flex-wrap items-end gap-2">
          <input
            aria-label="ai öneri istemi"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder='örn. "party için dogum_tarihi alanı ekle"'
            className="grow rounded border border-line bg-elev px-2 py-1.5 text-sm text-ink placeholder:text-mute/50"
          />
          <button
            type="button"
            onClick={() => {
              setProposal(propose(aiPrompt));
              setProposalState("bekliyor");
            }}
            className="rounded bg-accent px-3 py-1.5 text-sm text-accent-ink"
          >
            Öner
          </button>
        </div>

        {proposalState !== "yok" && (
          proposal ? (
            <div className="mt-3 rounded-md border border-accent/40 bg-bg p-3">
              <p className="text-xs text-mute">{proposal.summary}</p>
              <pre className="mt-2 font-mono text-sm">
                <span className="text-ok">
                  + {proposal.field.name}: {proposal.field.type}
                  {proposal.field.pii ? "  [pii — zorunlu maskeleme]" : ""}
                </span>
              </pre>
              {proposalState === "bekliyor" ? (
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setProposalState("uygulandı");
                      logAction(
                        { tool: "archetype.field.add", args: { archetype: proposal.archetype, name: proposal.field.name, source: "ai" } },
                        `AI önerisi uygulandı: ${proposal.archetype}.${proposal.field.name}`,
                      );
                    }}
                    className="rounded bg-accent px-3 py-1 text-xs text-accent-ink"
                  >
                    Uygula
                  </button>
                  <button
                    type="button"
                    onClick={() => setProposalState("reddedildi")}
                    className="rounded border border-line px-3 py-1 text-xs text-mute hover:text-ink"
                  >
                    Reddet
                  </button>
                </div>
              ) : (
                <p className={`mt-2 text-xs ${proposalState === "uygulandı" ? "text-ok" : "text-mute"}`}>
                  {proposalState === "uygulandı" ? "Uygulandı — audit'e yazıldı." : "Reddedildi — hiçbir şey değişmedi."}
                </p>
              )}
            </div>
          ) : (
            <p className="mt-3 text-xs text-warn">
              Bu isteği anlayamadım — örn. "party için dogum_tarihi alanı ekle". Öneri ≠ karar; emin olmadığımda önermem.
            </p>
          )
        )}
      </section>

      <section className="mt-4 rounded-md border border-line bg-panel p-3">
        <h2 className="mb-2 text-xs uppercase tracking-wide text-mute">
          Dry-run playground — tool'u yazmadan dene
        </h2>
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs text-mute">
            tool
            <select
              aria-label="dry-run tool"
              value={dryTool}
              onChange={(e) => setDryTool(e.target.value)}
              className="rounded border border-line bg-elev px-2 py-1.5 font-mono text-sm text-ink"
            >
              {MCP_TOOLS.map((t) => (
                <option key={t.name}>{t.name}</option>
              ))}
            </select>
          </label>
          <label className="flex grow flex-col gap-1 text-xs text-mute">
            arguments (JSON)
            <input
              aria-label="dry-run argümanları"
              value={dryArgs}
              onChange={(e) => setDryArgs(e.target.value)}
              className="rounded border border-line bg-elev px-2 py-1.5 font-mono text-sm text-ink"
            />
          </label>
          <button
            type="button"
            onClick={runDry}
            className="rounded bg-accent px-3 py-1.5 text-sm text-accent-ink"
          >
            Dry-run çağır
          </button>
        </div>
        {dryResult && (
          <pre className="mt-3 overflow-auto rounded border border-line bg-bg p-3 font-mono text-xs text-mute">
            {dryResult}
          </pre>
        )}
        <p className="mt-2 text-xs text-mute/70">
          Dry-run hiçbir şey yazmaz; PII her zaman maskeli döner. Gerçek çağrı scope + audit ister.
        </p>
      </section>

      <ConfirmDanger
        open={confirming}
        onOpenChange={setConfirming}
        name={agent}
        title="Geniş blast-radius onayı"
        description={`${agent} agent'ına ${blast.tables.length} tabloda yazma yetkisi veriyorsun.`}
        onConfirm={() => {
          logAction(
            { tool: "agent.scope.set", args: { agent, scopes: selected.join(","), approved: true } },
            `${agent} GENİŞ scope ek onayla kaydedildi`,
            { tone: "danger" },
          );
          setSavedMsg("Geniş scope ek onayla kaydedildi — audit'e yazıldı.");
        }}
      />

      <EquivalencePanel
        action={{ tool: "agent.scope.set", args: { agent, scopes: selected.join(",") } }}
      />
    </div>
  );
}
