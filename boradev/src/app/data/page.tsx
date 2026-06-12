"use client";

import { CliEquivalent } from "@/components/cli-equivalent";

import { useState } from "react";
import {
  List,
  LayoutGrid,
  Columns3,
  Calendar,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  Pencil,
  Eye,
  Download,
  Upload,
  Plus,
  Check,
  X,
  Wand2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ViewMode = "list" | "kanban" | "calendar";

interface DataRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive" | "pending";
  createdAt: string;
  lastLogin: string;
}

const sampleData: DataRow[] = [
  { id: "1", name: "Ahmet Yılmaz", email: "ahmet@example.com", role: "Admin", status: "active", createdAt: "2026-01-15", lastLogin: "2 saat önce" },
  { id: "2", name: "Ayşe Demir", email: "ayse@example.com", role: "Editor", status: "active", createdAt: "2026-02-20", lastLogin: "5 dk önce" },
  { id: "3", name: "Mehmet Kaya", email: "mehmet@example.com", role: "Viewer", status: "pending", createdAt: "2026-03-10", lastLogin: "Hiç" },
  { id: "4", name: "Fatma Çelik", email: "fatma@example.com", role: "Editor", status: "active", createdAt: "2026-03-15", lastLogin: "1 gün önce" },
  { id: "5", name: "Ali Öztürk", email: "ali@example.com", role: "Admin", status: "active", createdAt: "2026-04-01", lastLogin: "3 saat önce" },
  { id: "6", name: "Zeynep Arslan", email: "zeynep@example.com", role: "Viewer", status: "inactive", createdAt: "2026-04-12", lastLogin: "30 gün önce" },
  { id: "7", name: "Emre Yıldız", email: "emre@example.com", role: "Editor", status: "active", createdAt: "2026-05-01", lastLogin: "12 saat önce" },
  { id: "8", name: "Selin Koç", email: "selin@example.com", role: "Viewer", status: "pending", createdAt: "2026-05-20", lastLogin: "Hiç" },
];

const statusColors: Record<string, "success" | "destructive" | "warning"> = {
  active: "success",
  inactive: "destructive",
  pending: "warning",
};

const kanbanColumns = [
  { key: "active", label: "Aktif", color: "border-emerald-600/30" },
  { key: "pending", label: "Beklemede", color: "border-amber-600/30" },
  { key: "inactive", label: "Pasif", color: "border-red-600/30" },
];

const models = ["User", "Product", "Order", "BlogPost", "Category"];

export default function DataPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [activeModel, setActiveModel] = useState("User");
  const [sortField, setSortField] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  const filtered = sampleData.filter((row) => {
    if (search && !row.name.toLowerCase().includes(search.toLowerCase()) && !row.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus && row.status !== filterStatus) return false;
    return true;
  });

  const toggleRow = (id: string) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedRows.size === filtered.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(filtered.map((r) => r.id)));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Data Manager</h1>
          <p className="text-sm text-neutral-400">Kayıtları görüntüle, filtrele ve yönet</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-3 w-3" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-3 w-3" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-3 w-3" />
            Yeni Kayıt
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Model Selector */}
        <div className="flex overflow-x-auto rounded-lg border border-neutral-800 p-0.5">
          {models.map((m) => (
            <button
              key={m}
              onClick={() => setActiveModel(m)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
                activeModel === m ? "bg-neutral-800 text-neutral-100" : "text-neutral-500 hover:text-neutral-300"
              )}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="sm:ml-auto flex items-center gap-1 rounded-lg border border-neutral-800 p-0.5 self-end">
          {([
            { mode: "list" as ViewMode, icon: List, label: "List" },
            { mode: "kanban" as ViewMode, icon: Columns3, label: "Kanban" },
            { mode: "calendar" as ViewMode, icon: Calendar, label: "Calendar" },
          ]).map((v) => (
            <button
              key={v.mode}
              onClick={() => setViewMode(v.mode)}
              className={cn(
                "flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
                viewMode === v.mode ? "bg-neutral-800 text-neutral-100" : "text-neutral-500 hover:text-neutral-300"
              )}
            >
              <v.icon className="h-3 w-3" />
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <Input placeholder="Kayıt ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex items-center gap-1">
          <Filter className="h-3 w-3 text-neutral-500" />
          {["active", "pending", "inactive"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? null : s)}
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-medium border transition-colors",
                filterStatus === s
                  ? "border-indigo-600 bg-indigo-600/20 text-indigo-400"
                  : "border-neutral-800 text-neutral-500 hover:text-neutral-300"
              )}
            >
              {s}
            </button>
          ))}
          {filterStatus && (
            <button onClick={() => setFilterStatus(null)} className="ml-1 text-neutral-600 hover:text-neutral-400">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <Badge variant="secondary" className="ml-auto text-[10px]">{filtered.length} kayıt</Badge>
      </div>

      {/* Bulk Actions */}
      {selectedRows.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-indigo-800/30 bg-indigo-950/20 px-4 py-2 animate-in">
          <span className="text-xs text-indigo-400">{selectedRows.size} kayıt seçildi</span>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" className="text-xs h-7">
              <Pencil className="mr-1 h-3 w-3" />
              Düzenle
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-7">
              <Download className="mr-1 h-3 w-3" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="text-xs h-7 text-red-400 hover:text-red-300">
              <Trash2 className="mr-1 h-3 w-3" />
              Sil
            </Button>
            <button onClick={() => setSelectedRows(new Set())} className="text-neutral-500 hover:text-neutral-300 ml-1">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === "list" && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-800 text-left text-xs text-neutral-500">
                    <th className="w-10 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.size === filtered.length && filtered.length > 0}
                        onChange={toggleAll}
                        className="rounded border-neutral-700"
                      />
                    </th>
                    <th className="px-4 py-3 font-medium cursor-pointer hover:text-neutral-300" onClick={() => setSortField("name")}>
                      <span className="flex items-center gap-1">Ad <ArrowUpDown className="h-3 w-3" /></span>
                    </th>
                    <th className="px-4 py-3 font-medium">E-posta</th>
                    <th className="px-4 py-3 font-medium">Rol</th>
                    <th className="px-4 py-3 font-medium">Durum</th>
                    <th className="px-4 py-3 font-medium">Oluşturulma</th>
                    <th className="px-4 py-3 font-medium">Son Giriş</th>
                    <th className="w-10 px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50">
                  {filtered.map((row) => (
                    <tr key={row.id} className={cn("group transition-colors hover:bg-neutral-800/30", selectedRows.has(row.id) && "bg-indigo-950/20")}>
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(row.id)}
                          onChange={() => toggleRow(row.id)}
                          className="rounded border-neutral-700"
                        />
                      </td>
                      <td className="px-4 py-3 font-medium text-neutral-200">{row.name}</td>
                      <td className="px-4 py-3 text-neutral-400 font-mono text-xs">{row.email}</td>
                      <td className="px-4 py-3"><Badge variant="outline" className="text-[10px]">{row.role}</Badge></td>
                      <td className="px-4 py-3"><Badge variant={statusColors[row.status]} className="text-[10px]">{row.status}</Badge></td>
                      <td className="px-4 py-3 text-xs text-neutral-500">{row.createdAt}</td>
                      <td className="px-4 py-3 text-xs text-neutral-500">{row.lastLogin}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="rounded p-1 hover:bg-neutral-700"><Eye className="h-3 w-3 text-neutral-400" /></button>
                          <button className="rounded p-1 hover:bg-neutral-700"><Pencil className="h-3 w-3 text-neutral-400" /></button>
                          <button className="rounded p-1 hover:bg-neutral-700"><Trash2 className="h-3 w-3 text-red-400" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-neutral-800 px-4 py-3">
              <span className="text-xs text-neutral-500">1-{filtered.length} / {sampleData.length} toplam</span>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-7 w-7"><ChevronLeft className="h-3 w-3" /></Button>
                <span className="px-3 text-xs text-neutral-400">Sayfa 1 / 1</span>
                <Button variant="outline" size="icon" className="h-7 w-7"><ChevronRight className="h-3 w-3" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* KANBAN VIEW */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {kanbanColumns.map((col) => {
            const rows = filtered.filter((r) => r.status === col.key);
            return (
              <div key={col.key} className={cn("rounded-xl border-t-2 bg-neutral-900/50 p-3", col.color)}>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-neutral-200">{col.label}</h3>
                  <Badge variant="secondary" className="text-[10px]">{rows.length}</Badge>
                </div>
                <div className="space-y-2">
                  {rows.map((row) => (
                    <div key={row.id} className="rounded-lg border border-neutral-800 bg-neutral-900 p-3 hover:border-neutral-700 transition-colors cursor-pointer">
                      <p className="text-sm font-medium text-neutral-200">{row.name}</p>
                      <p className="mt-0.5 text-xs text-neutral-500 font-mono">{row.email}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <Badge variant="outline" className="text-[10px]">{row.role}</Badge>
                        <span className="text-[10px] text-neutral-600">{row.lastLogin}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CALENDAR VIEW */}
      {viewMode === "calendar" && (
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-7 gap-px rounded-lg border border-neutral-800 bg-neutral-800 overflow-hidden">
              {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((d) => (
                <div key={d} className="bg-neutral-900 px-2 py-2 text-center text-[10px] font-medium text-neutral-500">{d}</div>
              ))}
              {Array.from({ length: 35 }, (_, i) => {
                const day = i - 2;
                const dateStr = day >= 1 && day <= 30 ? `2026-06-${String(day).padStart(2, "0")}` : null;
                const events = dateStr ? sampleData.filter((r) => r.createdAt === dateStr) : [];
                return (
                  <div key={i} className={cn("min-h-[80px] bg-neutral-950 p-1.5", day === 11 && "ring-1 ring-indigo-600 ring-inset")}>
                    {day >= 1 && day <= 30 && (
                      <>
                        <span className={cn("text-[10px]", day === 11 ? "font-bold text-indigo-400" : "text-neutral-600")}>{day}</span>
                        {events.map((e) => (
                          <div key={e.id} className="mt-0.5 rounded bg-indigo-600/20 px-1 py-0.5 text-[9px] text-indigo-400 truncate">
                            {e.name}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
      <CliEquivalent tool="data.query" args={{ app: "marketplace" }} />

    </div>
  );
}
