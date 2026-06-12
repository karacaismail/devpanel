import { useMemo, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { CaretDown, CaretUp, Columns, DownloadSimple, ShieldStar, X } from "@phosphor-icons/react";
import type { PartyRow } from "../data/rows";
import { maskPii } from "../data/rows";
import { toCsv } from "../lib/csv";
import { EquivalencePanel } from "./EquivalencePanel";
import { logAction } from "../lib/audit";

function PiiCell({ value }: { value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <ShieldStar size={14} aria-label="PII — maskeli" className="shrink-0 text-pii" />
      <span className="font-mono text-mute">{maskPii(value)}</span>
    </span>
  );
}

const col = createColumnHelper<PartyRow>();

const COLUMN_LABELS: Record<string, string> = {
  id: "#",
  display_name: "Ad",
  email: "E-posta",
  phone: "Telefon",
  city: "Şehir",
  status: "Durum",
  created_at: "Kayıt",
};

const columns = [
  col.accessor("id", { header: "#" }),
  col.accessor("display_name", { header: "Ad" }),
  col.accessor("email", { header: "E-posta", cell: (c) => <PiiCell value={c.getValue()} /> }),
  col.accessor("phone", { header: "Telefon", cell: (c) => <PiiCell value={c.getValue()} /> }),
  col.accessor("city", { header: "Şehir" }),
  col.accessor("status", {
    header: "Durum",
    cell: (c) => {
      const v = c.getValue();
      const tone = v === "active" ? "text-ok" : v === "blocked" ? "text-danger" : "text-mute";
      return <span className={tone}>{v}</span>;
    },
  }),
  col.accessor("created_at", { header: "Kayıt" }),
];

/** Satır audit geçmişi — d03/E9: satır-düzey değişiklik izi (mock). */
function rowAudit(row: PartyRow) {
  return [
    { ts: row.created_at, actor: "system", what: "kayıt oluşturuldu" },
    { ts: "2026-03-14", actor: "ismail", what: "status güncellendi (diff audit'te)" },
    { ts: "2026-05-02", actor: "vibebot (MCP)", what: "okuma — maskeli görünüm" },
  ];
}

/**
 * EntityTable (P7) — TanStack Table: sıralama, filtre, kolon gizleme,
 * maskeli CSV export, satır detay paneli (audit geçmişli), PII rozetli.
 */
export function EntityTable({ rows }: { rows: PartyRow[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [colMenuOpen, setColMenuOpen] = useState(false);
  const [detail, setDetail] = useState<PartyRow | null>(null);
  const data = useMemo(() => rows, [rows]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, columnVisibility },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 50 } },
  });

  const total = table.getFilteredRowModel().rows.length;

  const exportCsv = () => {
    const visibleCols = table
      .getVisibleLeafColumns()
      .map((c) => c.id) as Array<keyof PartyRow>;
    const csv = toCsv(table.getFilteredRowModel().rows.map((r) => r.original), visibleCols);
    logAction(
      { tool: "data.export", args: { archetype: "party", format: "csv", masked: true } },
      `${total} satır CSV export (PII maskeli)`,
    );
    if (typeof URL.createObjectURL === "function") {
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "party.masked.csv";
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div>
      <div className="relative mb-3 flex flex-wrap items-center gap-2">
        <input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Filtrele…"
          aria-label="Tablo filtresi"
          className="w-full max-w-xs rounded border border-line bg-panel px-2 py-1.5 text-sm text-ink placeholder:text-mute"
        />
        <span className="text-sm text-mute">{total} kayıt</span>

        <button
          type="button"
          aria-label="kolonlar"
          onClick={() => setColMenuOpen((o) => !o)}
          className="ml-auto flex items-center gap-1 rounded border border-line bg-panel px-2 py-1 text-xs text-mute hover:text-ink"
        >
          <Columns size={13} /> kolonlar
        </button>
        <button
          type="button"
          onClick={exportCsv}
          className="flex items-center gap-1 rounded border border-line bg-panel px-2 py-1 text-xs text-mute hover:text-ink"
        >
          <DownloadSimple size={13} /> CSV (maskeli)
        </button>
        <span className="rounded border border-line px-2 py-0.5 text-xs text-mute">
          tenant: acme · RLS aktif
        </span>

        {colMenuOpen && (
          <div className="absolute right-0 top-full z-30 mt-1 w-44 rounded-md border border-line bg-panel p-2 shadow-2xl">
            {table.getAllLeafColumns().map((c) => (
              <label key={c.id} className="flex items-center gap-2 rounded px-1.5 py-1 text-sm text-ink hover:bg-elev">
                <input
                  type="checkbox"
                  aria-label={COLUMN_LABELS[c.id] ?? c.id}
                  checked={c.getIsVisible()}
                  onChange={c.getToggleVisibilityHandler()}
                />
                {COLUMN_LABELS[c.id] ?? c.id}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-auto rounded-md border border-line">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 bg-panel">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    onClick={h.column.getToggleSortingHandler()}
                    className="cursor-pointer select-none border-b border-line px-3 py-2 text-left font-normal text-mute hover:text-ink"
                  >
                    <span className="inline-flex items-center gap-1">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {h.column.getIsSorted() === "asc" && <CaretUp size={12} />}
                      {h.column.getIsSorted() === "desc" && <CaretDown size={12} />}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => setDetail(row.original)}
                className="cursor-pointer border-b border-line/50 hover:bg-panel"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-1.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-mute">
        {table.getPageCount() > 1 && (
          <>
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded border border-line px-2 py-0.5 disabled:opacity-40"
            >
              ‹
            </button>
            Sayfa {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded border border-line px-2 py-0.5 disabled:opacity-40"
            >
              ›
            </button>
          </>
        )}
        <label className="ml-auto flex items-center gap-1.5 text-xs">
          sayfa boyutu
          <select
            aria-label="sayfa boyutu"
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="rounded border border-line bg-elev px-1.5 py-1 text-ink"
          >
            {[25, 50, 100].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Satır detayı — PII maskeli + satır-düzey audit geçmişi (E9) */}
      <Dialog.Root open={detail !== null} onOpenChange={(o) => !o && setDetail(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50" />
          <Dialog.Content
            aria-describedby={undefined}
            className="fixed right-0 top-0 h-full w-[min(22rem,90vw)] overflow-auto border-l border-line bg-panel p-4 shadow-2xl"
          >
            {detail && (
              <>
                <div className="mb-3 flex items-center gap-2">
                  <Dialog.Title className="text-ink">{detail.display_name}</Dialog.Title>
                  <Dialog.Close aria-label="kapat" className="ml-auto text-mute hover:text-ink">
                    <X size={16} />
                  </Dialog.Close>
                </div>
                <dl className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1.5 text-sm">
                  <dt className="text-mute">id</dt>
                  <dd className="font-mono text-ink">{detail.id}</dd>
                  <dt className="text-mute">e-posta</dt>
                  <dd><PiiCell value={detail.email} /></dd>
                  <dt className="text-mute">telefon</dt>
                  <dd><PiiCell value={detail.phone} /></dd>
                  <dt className="text-mute">şehir</dt>
                  <dd className="text-ink">{detail.city}</dd>
                  <dt className="text-mute">durum</dt>
                  <dd className="text-ink">{detail.status}</dd>
                </dl>
                <p className="mt-3 rounded border border-line bg-elev p-2 text-xs text-mute">
                  Ham PII bu panelde gösterilmez — yetkili erişim yalnız API üzerinden,
                  erişim günlüğüne yazılarak yapılır (d03).
                </p>
                <h3 className="mb-1.5 mt-4 text-xs uppercase tracking-wide text-mute">
                  Audit geçmişi (satır-düzey)
                </h3>
                <ul className="flex flex-col gap-1">
                  {rowAudit(detail).map((a, i) => (
                    <li key={i} className="rounded border border-line bg-elev px-2 py-1.5 text-xs">
                      <span className="text-mute">{a.ts} · </span>
                      <span className={a.actor.includes("MCP") ? "text-accent" : "text-mute"}>{a.actor}</span>
                      <p className="text-ink">{a.what}</p>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <EquivalencePanel
        action={{ tool: "data.query", args: { archetype: "party", tenant: "acme", limit: 50 } }}
      />
    </div>
  );
}
