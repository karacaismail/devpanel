import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Tenants } from "../screens/Tenants";
import { AppSettings } from "../screens/AppSettings";
import { Fragments } from "../screens/Fragments";

describe("Tenant Yönetimi sözleşmesi", () => {
  it("tenant'ları edition ve pin bilgisiyle listeler", () => {
    render(<Tenants />);
    expect(screen.getAllByText(/acme/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/globex/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/enterprise/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/listing-flow v2/)).toBeInTheDocument();
  });

  it("CLI/MCP eşdeğeri görünür", () => {
    render(<Tenants />);
    expect(screen.getByText(/sdk tenant list/)).toBeInTheDocument();
  });
});

describe("App Ayarları sözleşmesi", () => {
  it("telemetri anahtarı KİLİTLİ ve kapalı (ADR-0006)", () => {
    render(<AppSettings />);
    const telemetry = screen.getByRole("switch", { name: /telemetri/i });
    expect(telemetry).toBeDisabled();
    expect(telemetry).toHaveAttribute("data-state", "unchecked");
  });

  it("REST API anahtarı (d07) değiştirilebilir", async () => {
    render(<AppSettings />);
    const rest = screen.getByRole("switch", { name: /REST/i });
    expect(rest).toBeEnabled();
  });

  it("CLI/MCP eşdeğeri görünür", () => {
    render(<AppSettings />);
    expect(screen.getByText(/sdk app config/)).toBeInTheDocument();
  });
});

describe("Fragment Kitaplığı sözleşmesi", () => {
  it("fragment'ları kullanan ArcheType'larla listeler", () => {
    render(<Fragments />);
    expect(screen.getAllByText(/address/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Küçük Taş/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/party/).length).toBeGreaterThan(0);
  });

  it("CLI/MCP eşdeğeri görünür", () => {
    render(<Fragments />);
    expect(screen.getByText(/sdk fragment list/)).toBeInTheDocument();
  });
});
