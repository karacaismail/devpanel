import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EntityTable } from "../components/EntityTable";
import { generateRows, maskPii } from "../data/rows";

describe("EntityTable sözleşmesi (P7/D03 — PII maskeli)", () => {
  const rows = generateRows(20);

  it("PII kolonları maskelidir; ham değer DOM'da yoktur", () => {
    render(<EntityTable rows={rows} />);
    expect(screen.queryByText(rows[0].email)).toBeNull();
    expect(screen.queryByText(rows[0].phone)).toBeNull();
    expect(screen.getAllByText(maskPii(rows[0].email)).length).toBeGreaterThan(0);
  });

  it("PII rozetleri ve kayıt sayısı görünür", () => {
    render(<EntityTable rows={rows} />);
    expect(screen.getAllByLabelText(/PII — maskeli/).length).toBeGreaterThan(0);
    expect(screen.getByText(/20 kayıt/)).toBeInTheDocument();
  });

  it("ekranın CLI/MCP eşdeğeri görünür (kabul kriteri)", () => {
    render(<EntityTable rows={rows} />);
    expect(screen.getByText(/sdk data query/)).toBeInTheDocument();
  });
});
