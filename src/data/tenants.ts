/** Tenant Yönetimi + Fragment Kitaplığı mock verisi. */

export interface TenantInfo {
  id: string;
  name: string;
  edition: "lite" | "standard" | "enterprise";
  customFields: number;
  themeOverride: boolean;
  workflowPins: string[];
  modules: string[];
  since: string;
}

export const TENANTS: TenantInfo[] = [
  {
    id: "acme",
    name: "Acme A.Ş.",
    edition: "enterprise",
    customFields: 1,
    themeOverride: true,
    workflowPins: ["listing-flow v2"],
    modules: ["loyalty-points", "fraud-guard"],
    since: "2025-11",
  },
  {
    id: "globex",
    name: "Globex Ltd.",
    edition: "lite",
    customFields: 0,
    themeOverride: false,
    workflowPins: [],
    modules: ["loyalty-points"],
    since: "2026-02",
  },
  {
    id: "initech",
    name: "Initech",
    edition: "standard",
    customFields: 0,
    themeOverride: false,
    workflowPins: [],
    modules: [],
    since: "2026-05",
  },
];

export interface FragmentDef {
  id: string;
  name: string;
  fields: string[];
  usedBy: string[];
  yaml: string;
}

export const FRAGMENTS: FragmentDef[] = [
  {
    id: "address",
    name: "address",
    fields: ["line1", "line2?", "city", "postal_code", "country"],
    usedBy: ["party", "order"],
    yaml: `# fragments/address.fragment.yaml
fragment: address
fields:
  line1:       { type: string, required: true }
  line2:       { type: string }
  city:        { type: string, required: true }
  postal_code: { type: string, required: true }
  country:     { type: iso-3166, required: true }`,
  },
  {
    id: "money",
    name: "money",
    fields: ["amount", "currency"],
    usedBy: ["listing", "invoice"],
    yaml: `# fragments/money.fragment.yaml
fragment: money
fields:
  amount:   { type: decimal(18,4), required: true }
  currency: { type: iso-4217, required: true }
# bitemporal ArcheType'ta geçmiş kur sorgusu destekler`,
  },
  {
    id: "contact",
    name: "contact",
    fields: ["email", "phone?"],
    usedBy: ["party"],
    yaml: `# fragments/contact.fragment.yaml
fragment: contact
fields:
  email: { type: email, required: true, pii: true }
  phone: { type: phone, pii: true }
# pii bayrağı fragment'tan ArcheType'a MİRAS kalır — kaldırılamaz`,
  },
];
