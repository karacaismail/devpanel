import { useState } from "react";
import { FileImage, FilePdf, FileVideo, UploadSimple } from "@phosphor-icons/react";
import { EquivalencePanel } from "../components/EquivalencePanel";
import { logAction } from "../lib/audit";

interface Asset {
  id: string;
  name: string;
  type: "image" | "pdf" | "video";
  size: string;
  usedBy: string[];
  uploadedAt: string;
}

const ASSETS: Asset[] = [
  { id: "a1", name: "logo-acme.svg", type: "image", size: "8 KB", usedBy: ["tema: acme", "e-posta: welcome"], uploadedAt: "2026-05-02" },
  { id: "a2", name: "hero-marketplace.png", type: "image", size: "240 KB", usedBy: ["surface: listing-default"], uploadedAt: "2026-05-14" },
  { id: "a3", name: "kvkk-aydinlatma.pdf", type: "pdf", size: "1.1 MB", usedBy: ["e-posta: welcome"], uploadedAt: "2026-04-20" },
  { id: "a4", name: "onboarding-tour.mp4", type: "video", size: "12 MB", usedBy: ["eğitim yolu"], uploadedAt: "2026-06-01" },
];

const ICON = { image: FileImage, pdf: FilePdf, video: FileVideo };

/** Media — varlık kütüphanesi (Ahmet birleştirmesi 2. parti). Tenant-scoped depo. */
export function Media() {
  const [selected, setSelected] = useState<Asset | null>(null);

  return (
    <div>
      <header className="mb-4 flex flex-wrap items-center gap-2">
        <h1 className="text-lg text-ink">Media</h1>
        <span className="text-xs text-mute">tenant: acme · {ASSETS.length} varlık</span>
        <button
          type="button"
          onClick={() => logAction({ tool: "media.upload", args: { tenant: "acme" } }, "Yükleme başlatıldı (mock)")}
          className="ml-auto flex items-center gap-1.5 rounded bg-accent px-3 py-1.5 text-sm text-accent-ink"
        >
          <UploadSimple size={14} /> Yükle
        </button>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_17rem]">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {ASSETS.map((a) => {
            const Icon = ICON[a.type];
            const isSel = selected?.id === a.id;
            return (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => setSelected(a)}
                  className={`flex w-full flex-col items-center gap-2 rounded-md border p-4 ${
                    isSel ? "border-accent bg-elev" : "border-line bg-panel hover:border-accent/40"
                  }`}
                >
                  <Icon size={30} className="text-accent" />
                  <span className="w-full truncate text-center font-mono text-xs text-ink">{a.name}</span>
                  <span className="text-xs text-mute">{a.size}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <aside className="rounded-md border border-line bg-panel p-3 text-sm">
          <h2 className="mb-2 text-xs uppercase tracking-wide text-mute">Detay</h2>
          {selected ? (
            <>
              <p className="mb-2 break-all font-mono text-ink">{selected.name}</p>
              <dl className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 text-xs">
                <dt className="text-mute">tür</dt>
                <dd className="text-ink">{selected.type}</dd>
                <dt className="text-mute">boyut</dt>
                <dd className="text-ink">{selected.size}</dd>
                <dt className="text-mute">yüklenme</dt>
                <dd className="text-ink">{selected.uploadedAt}</dd>
              </dl>
              <h3 className="mb-1 mt-3 text-xs uppercase tracking-wide text-mute">Kullanım</h3>
              <ul className="flex flex-col gap-1">
                {selected.usedBy.map((u) => (
                  <li key={u} className="rounded bg-elev px-2 py-1 text-xs text-ink">{u}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-mute">Kullanımda olan varlık silinemez — önce referanslar kaldırılır.</p>
            </>
          ) : (
            <p className="text-xs text-mute">Bir varlık seç.</p>
          )}
        </aside>
      </div>

      <EquivalencePanel action={{ tool: "media.list", args: { tenant: "acme" } }} />
    </div>
  );
}
