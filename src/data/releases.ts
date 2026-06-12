/** Sürümler (sus-versioning) + Event Kataloğu mock verisi. */

export interface SchemaRelease {
  id: string;
  date: string;
  current: boolean;
  changelog: string[];
}

export const RELEASES: SchemaRelease[] = [
  {
    id: "2026-06",
    date: "2026-06-01",
    current: true,
    changelog: [
      "party: +loyalty_tier custom field desteği (tenant katmanı)",
      "listing-flow v3: review → draft geri-gönderim geçişi",
      "GraphQL: parties(filter) sayfalama imzası netleşti",
    ],
  },
  {
    id: "2026-03",
    date: "2026-03-01",
    current: false,
    changelog: [
      "listing: bitemporal çift zaman ekseni",
      "order.completed v2: payload'a settlement bloğu",
      "REST: PATCH diff'leri audit'e zorunlu yazım",
    ],
  },
  {
    id: "2025-12",
    date: "2025-12-01",
    current: false,
    changelog: ["İlk kararlı şema — party, listing, order çekirdeği"],
  },
];

export interface EventDef {
  name: string;
  version: number;
  producer: string;
  subscribers: string[];
  ratePerHour: number;
  payload: string;
}

export const EVENTS: EventDef[] = [
  {
    name: "order.completed",
    version: 2,
    producer: "sales",
    subscribers: ["billing", "loyalty-points"],
    ratePerHour: 340,
    payload: `# payload şeması — order.completed v2
event: order.completed
version: 2
payload:
  order_id:   { type: uuid, required: true }
  buyer:      { type: ref(party), required: true }
  total:      { type: money, required: true }
  settlement: { type: object }   # v2'de eklendi
# v1 tüketicileri için uyum köprüsü: 2026-09'a dek`,
  },
  {
    name: "party.merged",
    version: 1,
    producer: "identity (kernel)",
    subscribers: ["search-index", "sales"],
    ratePerHour: 4,
    payload: `event: party.merged
version: 1
payload:
  winner_id: { type: uuid, required: true }
  loser_id:  { type: uuid, required: true }
# pii taşımaz — yalnız kimlik referansları`,
  },
  {
    name: "listing.published",
    version: 1,
    producer: "sales",
    subscribers: ["search-index", "seo-meta"],
    ratePerHour: 95,
    payload: `event: listing.published
version: 1
payload:
  listing_id: { type: uuid, required: true }
  published_at: { type: timestamp, required: true }`,
  },
];
