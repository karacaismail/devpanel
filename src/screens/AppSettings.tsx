import { useState } from "react";
import * as Switch from "@radix-ui/react-switch";
import { Lock } from "@phosphor-icons/react";
import { EquivalencePanel } from "../components/EquivalencePanel";
import { logAction } from "../lib/audit";

function Toggle({
  label,
  desc,
  checked,
  disabled,
  lockNote,
  onChange,
}: {
  label: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  lockNote?: string;
  onChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-line bg-panel p-3">
      <Switch.Root
        checked={checked}
        disabled={disabled}
        onCheckedChange={onChange}
        aria-label={label}
        className="mt-0.5 h-5 w-9 shrink-0 rounded-full border border-line bg-elev data-[state=checked]:bg-accent data-[disabled]:opacity-50"
      >
        <Switch.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-ink transition-transform data-[state=checked]:translate-x-4 data-[state=checked]:bg-accent-ink" />
      </Switch.Root>
      <div>
        <p className="flex items-center gap-1.5 text-sm text-ink">
          {label}
          {disabled && <Lock size={13} className="text-mute" />}
        </p>
        <p className="text-xs text-mute">{desc}</p>
        {lockNote && <p className="mt-1 text-xs text-warn">{lockNote}</p>}
      </div>
    </div>
  );
}

/** App Ayarları — kurulum anahtarları; kilitli kararlar görünür ve gerekçeli. */
export function AppSettings() {
  const [rest, setRest] = useState(true);
  const [bitemporalDefault, setBitemporalDefault] = useState(false);
  const [retention, setRetention] = useState("P5Y");
  const [locale, setLocale] = useState("tr");

  const set = (key: string, value: string | boolean, summary: string) => {
    logAction({ tool: "app.config.set", args: { key, value: String(value) } }, summary);
  };

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-lg text-ink">App Ayarları — marketplace</h1>
        <p className="text-sm text-mute">
          Kurulum anahtarları tanım dosyasına yazılır (`app.yaml`); panel
          projeksiyondur. Kilitli kararlar ADR gerekçesiyle görünür.
        </p>
      </header>

      <div className="flex max-w-2xl flex-col gap-2">
        <Toggle
          label="REST / OpenAPI yüzeyi"
          desc="GraphQL varsayılandır; REST kurulumda açılabilir (d07). Kapatınca API Explorer'da sekme gizlenir."
          checked={rest}
          onChange={(v) => {
            setRest(v);
            set("rest_api", v, `REST yüzeyi ${v ? "açıldı" : "kapatıldı"}`);
          }}
        />
        <Toggle
          label="Yeni ArcheType'larda bitemporal varsayılanı"
          desc="Açıksa scaffold, bitemporal: true önerir; karar yine tanımda verilir."
          checked={bitemporalDefault}
          onChange={(v) => {
            setBitemporalDefault(v);
            set("bitemporal_default", v, `bitemporal varsayılanı ${v ? "açık" : "kapalı"}`);
          }}
        />
        <Toggle
          label="Telemetri / kullanım analitiği"
          desc="Panel kullanım verisi toplanmaz."
          checked={false}
          disabled
          lockNote="Kilitli karar: ADR-0006 — telemetri yok. Bu anahtar koddan açılamaz."
        />

        <div className="flex items-center gap-3 rounded-md border border-line bg-panel p-3 text-sm">
          <span className="text-ink">Varsayılan retention</span>
          <select
            aria-label="varsayılan retention"
            value={retention}
            onChange={(e) => {
              setRetention(e.target.value);
              set("retention_default", e.target.value, `varsayılan retention → ${e.target.value}`);
            }}
            className="rounded border border-line bg-elev px-1.5 py-1 text-ink"
          >
            <option value="P1Y">P1Y (1 yıl)</option>
            <option value="P5Y">P5Y (5 yıl)</option>
            <option value="P10Y">P10Y (10 yıl)</option>
          </select>
          <span className="text-xs text-mute">ArcheType bayrağı bunu override eder</span>
        </div>

        <div className="flex items-center gap-3 rounded-md border border-line bg-panel p-3 text-sm">
          <span className="text-ink">Panel dili</span>
          <select
            aria-label="panel dili"
            value={locale}
            onChange={(e) => {
              setLocale(e.target.value);
              set("locale", e.target.value, `panel dili → ${e.target.value}`);
            }}
            className="rounded border border-line bg-elev px-1.5 py-1 text-ink"
          >
            <option value="tr">Türkçe</option>
            <option value="en">English</option>
          </select>
          <span className="text-xs text-mute">i18n gün-1 sözü (E7) — katalog altyapısı hazır</span>
        </div>
      </div>

      <EquivalencePanel action={{ tool: "app.config", args: { app: "marketplace" } }} />
    </div>
  );
}
