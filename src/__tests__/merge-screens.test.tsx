/** Ahmet birleştirmesi — 5 yeni ekranın kontrat testleri. */
import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { Erd } from "../screens/Erd";
import { Scheduler } from "../screens/Scheduler";
import { Webhooks } from "../screens/Webhooks";
import { EmailTemplates } from "../screens/EmailTemplates";
import { Health } from "../screens/Health";

describe("ERD ekranı", () => {
  it("ArcheType düğümleri ve ilişki kenarı çizilir", () => {
    render(<Erd />);
    expect(screen.getByRole("button", { name: /düğüm: party/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /düğüm: listing/i })).toBeInTheDocument();
    expect(screen.getByText("seller")).toBeInTheDocument();
  });

  it("CLI/MCP eşdeğeri görünür", () => {
    render(<Erd />);
    expect(screen.getByText(/sdk erd/)).toBeInTheDocument();
  });
});

describe("Scheduler ekranı", () => {
  it("işler cron açıklaması ve sonraki çalışmayla listelenir", () => {
    render(<Scheduler />);
    expect(screen.getAllByText(/5 dakikada bir/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/sonraki/i).length).toBeGreaterThan(0);
    expect(screen.getAllByRole("switch").length).toBeGreaterThanOrEqual(3);
  });

  it("CLI/MCP eşdeğeri görünür", () => {
    render(<Scheduler />);
    expect(screen.getByText(/sdk job list/)).toBeInTheDocument();
  });
});

describe("Webhooks ekranı", () => {
  it("abonelikler event rozetleri ve teslimat durumuyla listelenir", () => {
    render(<Webhooks />);
    expect(screen.getAllByText(/order\.completed/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/teslimat/i).length).toBeGreaterThan(0);
    // secret maskeli — ham secret DOM'da yok
    expect(screen.queryByText(/whsec_canli_anahtar/)).toBeNull();
  });

  it("CLI/MCP eşdeğeri görünür", () => {
    render(<Webhooks />);
    expect(screen.getByText(/sdk webhook list/)).toBeInTheDocument();
  });
});

describe("E-posta Şablonları ekranı", () => {
  it("şablon önizlemesi örnek değerlerle dolar; eksik değişken aynen kalır", () => {
    render(<EmailTemplates />);
    const preview = screen.getByRole("region", { name: /önizleme/i });
    expect(preview).toHaveTextContent("İsmail"); // örnek değer dolu
    const editor = screen.getByLabelText(/şablon gövdesi/i);
    fireEvent.change(editor, { target: { value: "Selam {{ad}}, kod: {{kod}}" } });
    expect(preview).toHaveTextContent("{{kod}}"); // eksik değişken görünür kalır
  });

  it("CLI/MCP eşdeğeri görünür", () => {
    render(<EmailTemplates />);
    expect(screen.getByText(/sdk template list/)).toBeInTheDocument();
  });
});

describe("Health ekranı", () => {
  it("servis kartları durum rozetleriyle listelenir", () => {
    render(<Health />);
    expect(screen.getAllByText(/postgres/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/degraded/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/ok/i).length).toBeGreaterThan(0);
  });

  it("CLI/MCP eşdeğeri görünür", () => {
    render(<Health />);
    expect(screen.getByText(/sdk health/)).toBeInTheDocument();
  });
});
