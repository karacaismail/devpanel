/** P5 — Domain & Contract Haritası mock verisi (k-surface, sus-boundaries). */

export interface DomainBox {
  id: string;
  name: string;
  scope: "kernel" | "app";
  archetypes: string[];
}

export interface Contract {
  id: string;
  producer: string;
  consumer: string;
  kind: "event" | "endpoint";
  payload: string;
  status: "ok" | "violation";
  note?: string;
}

export const DOMAINS: DomainBox[] = [
  { id: "identity", name: "identity", scope: "kernel", archetypes: ["party"] },
  { id: "sales", name: "sales", scope: "app", archetypes: ["listing", "order"] },
  { id: "catalog", name: "catalog", scope: "app", archetypes: ["category", "attribute-set"] },
  { id: "billing", name: "billing", scope: "app", archetypes: ["invoice"] },
];

export const CONTRACTS: Contract[] = [
  { id: "c1", producer: "sales", consumer: "billing", kind: "event", payload: "order.completed v2", status: "ok" },
  { id: "c2", producer: "identity", consumer: "sales", kind: "endpoint", payload: "GET /api/party/:id (maskeli)", status: "ok" },
  { id: "c3", producer: "catalog", consumer: "sales", kind: "event", payload: "category.updated v1", status: "ok" },
  {
    id: "c4",
    producer: "sales",
    consumer: "catalog",
    kind: "endpoint",
    payload: "ten_category doğrudan tablo okuması",
    status: "violation",
    note: "Kaya sınırı ihlali: kontrat dışı erişim — Contract tanımı gerekli (sus-boundaries).",
  },
];
