/**
 * Salt-okunur YAML görünümü (P0). Üretim hedefi: CodeMirror 6 + şema doğrulama
 * (devpanel.md §6) — P0'da bağımlılık yüzeyini küçük tutmak için hafif vurgulayıcı.
 */
export function YamlView({ value }: { value: string }) {
  const lines = value.split("\n");
  return (
    <pre className="overflow-auto rounded-md border border-line bg-bg p-3 font-mono text-[0.8rem] leading-relaxed">
      {lines.map((line, i) => {
        const comment = line.indexOf("#");
        const code = comment >= 0 ? line.slice(0, comment) : line;
        const cm = comment >= 0 ? line.slice(comment) : "";
        const m = /^(\s*-?\s*)([\w.@/_-]+)(\s*:)(.*)$/.exec(code);
        return (
          <div key={i}>
            <span className="mr-3 inline-block w-6 select-none text-right text-line">
              {i + 1}
            </span>
            {m ? (
              <>
                <span>{m[1]}</span>
                <span className="text-accent">{m[2]}</span>
                <span className="text-mute">{m[3]}</span>
                <span className="text-ink">{m[4]}</span>
              </>
            ) : (
              <span className="text-ink">{code}</span>
            )}
            {cm && <span className="text-mute/70 italic">{cm}</span>}
          </div>
        );
      })}
    </pre>
  );
}
