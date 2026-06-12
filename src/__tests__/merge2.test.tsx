/** Ahmet birleştirmesi 2. parti — kalan özelliklerin kontrat testleri. */
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { groupCount } from "../lib/report";
import { execute } from "../lib/repl";
import { propose } from "../lib/aiPropose";
import { generateRows } from "../data/rows";
import { Media } from "../screens/Media";
import { Reports } from "../screens/Reports";
import { Terminal } from "../screens/Terminal";
import { Roles } from "../screens/Roles";
import { CodeEditor } from "../screens/CodeEditor";
import { AiConsole } from "../screens/AiConsole";

describe("report lib", () => {
  it("groupCount: anahtara göre sayar, çoktan aza sıralar", () => {
    const rows = generateRows(100);
    const g = groupCount(rows, "status");
    expect(g.reduce((s, x) => s + x.count, 0)).toBe(100);
    expect(g[0].count).toBeGreaterThanOrEqual(g.at(-1)!.count);
  });
});

describe("repl lib (Terminal çekirdeği)", () => {
  it("sdk archetype list → tanımları döker", () => {
    const r = execute("sdk archetype list");
    expect(r.tone).toBe("ok");
    expect(r.out).toMatch(/party/);
  });

  it("help komut kataloğunu verir; bilinmeyen komut öneriyle düşer (demo kırılmaz)", () => {
    expect(execute("help").out).toMatch(/sdk/);
    const bad = execute("sdk yokboyle");
    expect(bad.tone).toBe("err");
    expect(bad.out).toMatch(/help/);
  });
});

describe("aiPropose (AI önerir, geliştirici onaylar)", () => {
  it("alan ekleme niyeti: tip sezgisi çalışır", () => {
    const p = propose("party için dogum_tarihi alanı ekle");
    expect(p).toMatchObject({ kind: "field", archetype: "party" });
    if (p?.kind === "field") {
      expect(p.field.name).toBe("dogum_tarihi");
      expect(p.field.type).toBe("date");
    }
    const e = propose("listing için iletisim_email alanı ekle");
    if (e?.kind === "field") expect(e.field.type).toBe("email");
  });

  it("anlaşılmayan istek null döner", () => {
    expect(propose("hava bugün nasıl")).toBeNull();
  });
});

describe("Media ekranı", () => {
  it("varlıklar listelenir; seçim detayı açar", async () => {
    const user = userEvent.setup();
    render(<Media />);
    expect(screen.getAllByText(/logo-acme/).length).toBeGreaterThan(0);
    await user.click(screen.getAllByText(/logo-acme/)[0]);
    expect(screen.getAllByText(/kullanım/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/tema: acme/)).toBeInTheDocument();
    expect(screen.getByText(/sdk media list/)).toBeInTheDocument();
  });
});

describe("Reports ekranı", () => {
  it("grupla seçimi dağılımı değiştirir; özet kartları var", async () => {
    const user = userEvent.setup();
    render(<Reports />);
    expect(screen.getByText(/toplam kayıt/i)).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText(/grupla/i), "city");
    expect(screen.getAllByText(/İstanbul/).length).toBeGreaterThan(0);
    expect(screen.getByText(/sdk report run/)).toBeInTheDocument();
  });
});

describe("Terminal ekranı", () => {
  it("komut çalıştırır, çıktı loga düşer", async () => {
    const user = userEvent.setup();
    render(<Terminal />);
    const input = screen.getByLabelText(/komut satırı/i);
    await user.type(input, "sdk check{Enter}");
    expect(await screen.findByText(/23 yeşil/)).toBeInTheDocument();
    expect(screen.getByText(/sdk repl/)).toBeInTheDocument();
  });
});

describe("Roles ekranı", () => {
  it("izin matrisi + entitlement kilidi görünür", () => {
    render(<Roles />);
    expect(screen.getAllByLabelText(/entitlement — kilitli/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/sdk role list/)).toBeInTheDocument();
  });
});

describe("CodeEditor ekranı", () => {
  it("geçersiz JSON reddedilir; geçerli JSON biçimlenir", async () => {
    const user = userEvent.setup();
    render(<CodeEditor />);
    const editor = screen.getByLabelText(/json editörü/i);
    fireEvent.change(editor, { target: { value: "{bozuk" } });
    await user.click(screen.getByRole("button", { name: /doğrula/i }));
    expect(screen.getByRole("alert")).toHaveTextContent(/JSON/);

    fireEvent.change(editor, { target: { value: '{"a":1}' } });
    await user.click(screen.getByRole("button", { name: /doğrula/i }));
    expect((editor as HTMLTextAreaElement).value).toContain('"a": 1');
    expect(screen.getByText(/sdk def edit/)).toBeInTheDocument();
  });
});

describe("AI Konsolu — diff kartı (uygula/reddet)", () => {
  it("öneri diff olarak gelir; uygula onay mesajı üretir", async () => {
    const user = userEvent.setup();
    render(<AiConsole />);
    const input = screen.getByLabelText(/ai öneri istemi/i);
    await user.type(input, "party için dogum_tarihi alanı ekle");
    await user.click(screen.getByRole("button", { name: /öner/i }));
    expect(await screen.findByText(/\+ dogum_tarihi/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /uygula/i }));
    expect(screen.getByText(/uygulandı/i)).toBeInTheDocument();
  });
});
