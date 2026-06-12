import { useState } from "react";
import { Bell, CaretRight, Command, MagnifyingGlass, UserCircle } from "@phosphor-icons/react";
import { useUiStore } from "../lib/store";
import { screenMeta } from "../lib/navigation";
import { useAuditStore } from "../lib/audit";

/** Üst çubuk: breadcrumb · arama (⌘K) · bildirim merkezi · env · kullanıcı. */
export function TopBar() {
  const { screen, setScreen, setPaletteOpen } = useUiStore();
  const { entries, unread, markRead } = useAuditStore();
  const [bellOpen, setBellOpen] = useState(false);
  const meta = screenMeta(screen);

  return (
    <header className="relative flex items-center gap-2 border-b border-line px-4 py-2">
      <nav aria-label="breadcrumb" className="flex min-w-0 items-center gap-1 text-sm">
        <button type="button" onClick={() => setScreen("overview")} className="text-mute hover:text-ink">
          devpanel
        </button>
        {meta.group && (
          <>
            <CaretRight size={12} className="text-line" />
            <span className="text-mute">{meta.group}</span>
          </>
        )}
        <CaretRight size={12} className="text-line" />
        <span className="truncate text-ink">{meta.label}</span>
      </nav>

      <div className="ml-auto flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="flex items-center gap-2 rounded border border-line bg-panel px-2 py-1 text-xs text-mute hover:text-ink"
        >
          <MagnifyingGlass size={13} />
          <span className="hidden sm:inline">Ara / Komut</span>
          <kbd className="hidden sm:inline"><Command size={10} className="inline" />K</kbd>
        </button>

        <button
          type="button"
          aria-label={`bildirimler (${unread} okunmamış)`}
          onClick={() => {
            setBellOpen((o) => !o);
            markRead();
          }}
          className="relative rounded border border-line bg-panel p-1.5 text-mute hover:text-ink"
        >
          <Bell size={14} />
          {unread > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] text-accent-ink">
              {unread}
            </span>
          )}
        </button>

        <select
          aria-label="ortam"
          defaultValue="dev"
          className="rounded border border-line bg-elev px-1.5 py-1 text-xs text-ink"
        >
          <option value="dev">dev</option>
          <option value="staging" disabled>staging (yetki yok)</option>
          <option value="prod" disabled>prod (yetki yok)</option>
        </select>

        <span className="hidden items-center gap-1.5 rounded border border-line bg-panel px-2 py-1 text-xs text-mute sm:flex">
          <UserCircle size={14} className="text-accent" /> ismail · developer
        </span>
      </div>

      {bellOpen && (
        <div className="absolute right-4 top-full z-40 mt-1 w-80 rounded-md border border-line bg-panel p-2 shadow-2xl">
          <p className="px-1 pb-1 text-xs uppercase tracking-wide text-mute">Son aksiyonlar</p>
          <ul className="flex max-h-64 flex-col gap-1 overflow-auto">
            {entries.slice(0, 6).map((e) => (
              <li key={e.id} className="rounded bg-elev px-2 py-1.5 text-xs">
                <span className="text-mute">{e.ts} · {e.actor}</span>
                <p className="text-ink">{e.summary}</p>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => {
              setBellOpen(false);
              setScreen("audit");
            }}
            className="mt-1.5 w-full rounded border border-line px-2 py-1 text-xs text-mute hover:text-ink"
          >
            Tüm audit log'u aç
          </button>
        </div>
      )}
    </header>
  );
}
