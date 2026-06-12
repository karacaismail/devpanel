/** Deterministik örnek Party verisi — harici bağımlılık yok. */

export interface PartyRow {
  id: number;
  display_name: string;
  email: string;
  phone: string;
  city: string;
  status: "active" | "passive" | "blocked";
  created_at: string;
}

const FIRST = ["Ayşe", "Mehmet", "Zeynep", "Emre", "Elif", "Can", "Deniz", "Merve", "Burak", "Selin"];
const LAST = ["Yılmaz", "Demir", "Kaya", "Şahin", "Çelik", "Arslan", "Doğan", "Koç", "Aydın", "Öztürk"];
const CITIES = ["İstanbul", "Ankara", "İzmir", "Bursa", "Antalya", "Eskişehir", "Trabzon", "Mersin"];
const STATUS: PartyRow["status"][] = ["active", "active", "active", "passive", "blocked"];

function seeded(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

export function generateRows(count = 1000): PartyRow[] {
  const rnd = seeded(42);
  const rows: PartyRow[] = [];
  for (let i = 1; i <= count; i++) {
    const f = FIRST[Math.floor(rnd() * FIRST.length)];
    const l = LAST[Math.floor(rnd() * LAST.length)];
    const slug = `${f}.${l}`
      .toLocaleLowerCase("tr")
      .replaceAll("ş", "s").replaceAll("ı", "i").replaceAll("ğ", "g")
      .replaceAll("ç", "c").replaceAll("ö", "o").replaceAll("ü", "u");
    const day = 1 + Math.floor(rnd() * 28);
    const month = 1 + Math.floor(rnd() * 12);
    rows.push({
      id: i,
      display_name: `${f} ${l}`,
      email: `${slug}${i}@example.com`,
      phone: `+90 5${Math.floor(rnd() * 90 + 10)} ${Math.floor(rnd() * 900 + 100)} ${Math.floor(rnd() * 9000 + 1000)}`,
      city: CITIES[Math.floor(rnd() * CITIES.length)],
      status: STATUS[Math.floor(rnd() * STATUS.length)],
      created_at: `2025-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    });
  }
  return rows;
}

/** PII maskesi: `ayse.yilmaz1@example.com` → `ay***@***.com` */
export function maskPii(value: string): string {
  if (value.includes("@")) {
    const [user] = value.split("@");
    const tld = value.slice(value.lastIndexOf("."));
    return `${user.slice(0, 2)}***@***${tld}`;
  }
  return `${value.slice(0, 6)}*** ** **`;
}
