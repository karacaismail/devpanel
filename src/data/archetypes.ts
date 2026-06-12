import type { ArcheTypeDef, SurfaceDef } from "../lib/types";

export const ARCHETYPES: ArcheTypeDef[] = [
  {
    id: "party",
    name: "Party",
    scope: "kernel",
    flags: { pii: true, bitemporal: false, retention: "P5Y", audit: true },
    fields: [
      { name: "display_name", type: "string", required: true },
      { name: "email", type: "email", required: true, pii: true },
      { name: "phone", type: "phone", pii: true },
      { name: "city", type: "string" },
      { name: "status", type: "enum(active|passive|blocked)", required: true },
      { name: "loyalty_tier", type: "string", custom: true },
    ],
    yaml: `# kernel/archetypes/party.yaml
name: party
scope: kernel          # paylaşılan ArcheType — "kernel" rozeti
flags:
  pii: true            # maskeleme + erişim günlüğü zorunlu
  bitemporal: false
  retention: P5Y
  audit: true
fields:
  display_name: { type: string, required: true }
  email:        { type: email,  required: true, pii: true }
  phone:        { type: phone,  pii: true }
  city:         { type: string }
  status:       { type: enum, values: [active, passive, blocked], required: true }
# tenant-scoped custom field (E8) — core şemaya dokunmaz:
customizations:
  acme:
    loyalty_tier: { type: string }`,
    derived: {
      table: "ten_party (RLS: tenant_id)",
      graphql: ["party(id)", "parties(filter, page)", "partyCreate", "partyUpdate"],
      rest: ["GET /api/party", "GET /api/party/:id", "POST /api/party", "PATCH /api/party/:id"],
      surface: "party-default.surface.yaml",
      mcpTool: "archetype.party.crud",
      tests: ["party.contract.test.ts", "party.rls.test.ts (komşu tenant okuyamaz)", "party.pii-mask.test.ts"],
    },
  },
  {
    id: "listing",
    name: "Listing",
    scope: "app",
    flags: { pii: false, bitemporal: true, retention: null, audit: true },
    fields: [
      { name: "title", type: "string", required: true },
      { name: "price", type: "money", required: true },
      { name: "seller", type: "ref(party)", required: true },
      { name: "state", type: "workflow(listing-flow)", required: true },
    ],
    yaml: `# apps/marketplace/archetypes/listing.yaml
name: listing
scope: app
flags:
  pii: false
  bitemporal: true     # fiyat geçmişi sorgulanabilir
  retention: null
  audit: true
fields:
  title:  { type: string, required: true }
  price:  { type: money,  required: true }
  seller: { type: ref, target: party, required: true }
  state:  { type: workflow, ref: listing-flow, required: true }`,
    derived: {
      table: "ten_listing (RLS + bitemporal çift zaman)",
      graphql: ["listing(id, asOf)", "listings(filter, page)", "listingCreate"],
      rest: ["GET /api/listing", "POST /api/listing"],
      surface: "listing-default.surface.yaml",
      mcpTool: "archetype.listing.crud",
      tests: ["listing.contract.test.ts", "listing.rls.test.ts", "listing.bitemporal.test.ts"],
    },
  },
];

export const SURFACES: SurfaceDef[] = [
  {
    id: "party-default",
    archetype: "party",
    headless: false,
    fields: [
      { field: "display_name", label: "Ad", visible: true, widget: "text" },
      { field: "email", label: "E-posta", visible: true, widget: "email" },
      { field: "phone", label: "Telefon", visible: false, widget: "phone" },
      { field: "city", label: "Şehir", visible: true, widget: "text" },
      { field: "status", label: "Durum", visible: true, widget: "select" },
    ],
    editionOverrides: {
      lite: { hidden: ["phone", "city"] },
      enterprise: { readonly: ["status"] },
    },
    yaml: `# surfaces/party-default.surface.yaml
surface: party-default
projects: [party]      # 1+ ArcheType projeksiyonu
headless: false        # true → surface:none, yalnız API
fields:
  - { field: display_name, label: Ad,      widget: text }
  - { field: email,        label: E-posta, widget: email }
  - { field: phone,        label: Telefon, widget: phone, visible: false }
  - { field: city,         label: Şehir,   widget: text }
  - { field: status,       label: Durum,   widget: select }
edition_overrides:
  lite:       { hidden: [phone, city] }
  enterprise: { readonly: [status] }`,
  },
];
