/** P12 — agent capability scope → blast-radius (d11, layer1-audit). */

export interface CapabilityScope {
  id: string;
  label: string;
  writes: boolean;
  tables: string[];
}

export interface BlastResult {
  tables: string[];
  level: "dar" | "orta" | "geniş";
  needsApproval: boolean;
}

export function blastRadius(scopes: CapabilityScope[]): BlastResult {
  const tables = [...new Set(scopes.flatMap((s) => s.tables))];
  const writes = scopes.some((s) => s.writes);
  const writeTables = new Set(
    scopes.filter((s) => s.writes).flatMap((s) => s.tables),
  );
  const level: BlastResult["level"] = !writes
    ? "dar"
    : writeTables.size >= 3
      ? "geniş"
      : "orta";
  return { tables, level, needsApproval: level === "geniş" };
}

export const SCOPE_CATALOG: CapabilityScope[] = [
  { id: "party.read", label: "Party okuma (maskeli)", writes: false, tables: ["ten_party"] },
  { id: "party.write", label: "Party yazma", writes: true, tables: ["ten_party"] },
  { id: "listing.read", label: "Listing okuma", writes: false, tables: ["ten_listing"] },
  { id: "listing.write", label: "Listing yazma", writes: true, tables: ["ten_listing"] },
  { id: "ledger.write", label: "Loyalty ledger yazma", writes: true, tables: ["ten_loyalty_ledger"] },
  { id: "scaffold", label: "Scaffold önerme (yazma yok)", writes: false, tables: [] },
];
