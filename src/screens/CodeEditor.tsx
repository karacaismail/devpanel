import { useState } from "react";
import { BracketsCurly, CheckCircle } from "@phosphor-icons/react";
import { EquivalencePanel } from "../components/EquivalencePanel";
import { logAction } from "../lib/audit";

const DOCUMENTS: Record<string, { label: string; json: string }> = {
  "tokens.acme": {
    label: "Tema tokenları (acme)",
    json: JSON.stringify(
      { tenant: "acme", tokens: { bg: "#0b0e14", panel: "#11151f", ink: "#e7eaf2", accent: "#7fb1ff" } },
      null,
      2,
    ),
  },
  "party.flags": {
    label: "party bayrakları",
    json: JSON.stringify({ pii: true, bitemporal: false, retention: "P5Y", audit: true }, null, 2),
  },
  "agent.scope": {
    label: "vibebot scope",
    json: JSON.stringify({ agent: "vibebot", scopes: ["party.read", "scaffold"] }, null, 2),
  },
};

/** Code Editor — ham JSON görünümü (Ahmet birleştirmesi 2. parti). Tanım her zaman bir toggle uzakta. */
export function CodeEditor() {
  const [docId, setDocId] = useState("tokens.acme");
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(Object.entries(DOCUMENTS).map(([k, v]) => [k, v.json])),
  );
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState(false);

  const validate = () => {
    try {
      const parsed = JSON.parse(values[docId]);
      setValues((prev) => ({ ...prev, [docId]: JSON.stringify(parsed, null, 2) }));
      setError(null);
      setOkMsg(true);
      logAction({ tool: "def.edit", args: { doc: docId } }, `${docId} doğrulandı ve biçimlendi`);
    } catch (e) {
      setOkMsg(false);
      setError(`Geçersiz JSON: ${e instanceof Error ? e.message : String(e)}`);
    }
  };

  return (
    <div>
      <header className="mb-4 flex flex-wrap items-center gap-2">
        <h1 className="flex items-center gap-2 text-lg text-ink">
          <BracketsCurly size={18} className="text-accent" /> Code Editor
        </h1>
        <select
          aria-label="doküman"
          value={docId}
          onChange={(e) => {
            setDocId(e.target.value);
            setError(null);
            setOkMsg(false);
          }}
          className="ml-auto rounded border border-line bg-elev px-2 py-1 text-xs text-ink"
        >
          {Object.entries(DOCUMENTS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </header>

      <textarea
        aria-label="json editörü"
        value={values[docId]}
        onChange={(e) => {
          setValues((prev) => ({ ...prev, [docId]: e.target.value }));
          setOkMsg(false);
        }}
        rows={14}
        spellCheck={false}
        className="w-full rounded-md border border-line bg-bg p-3 font-mono text-[0.8rem] leading-relaxed text-ink"
      />

      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">{error}</p>
      )}
      {okMsg && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-ok">
          <CheckCircle size={15} /> Geçerli — biçimlendirildi. Kaydet = diff onayı (tanım kazanır).
        </p>
      )}

      <button
        type="button"
        onClick={validate}
        className="mt-2 rounded bg-accent px-3 py-1.5 text-sm text-accent-ink"
      >
        Doğrula ve biçimlendir
      </button>

      <EquivalencePanel action={{ tool: "def.edit", args: { doc: docId } }} />
    </div>
  );
}
