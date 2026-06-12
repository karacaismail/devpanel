"use client";

import { CliEquivalent } from "@/components/cli-equivalent";

import { useState } from "react";
import { BarChart3, Play, Download, Plus, Wand2, Code, Eye, Table, PieChart, TrendingUp, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const savedReports = [
  { id: "1", name: "Aylık Kullanıcı Raporu", model: "User", type: "table", lastRun: "1 saat önce" },
  { id: "2", name: "Sipariş Özeti", model: "Order", type: "chart", lastRun: "3 saat önce" },
  { id: "3", name: "Ürün Kategorileri", model: "Product", type: "table", lastRun: "1 gün önce" },
  { id: "4", name: "Gelir Analizi", model: "Order", type: "chart", lastRun: "2 gün önce" },
];

const sampleColumns = ["ID", "Ad", "E-posta", "Rol", "Kayıt Tarihi", "Son Giriş", "Sipariş Sayısı"];
const sampleRows = [
  ["1", "Ahmet Yılmaz", "ahmet@test.com", "Admin", "2026-01-15", "2 saat önce", "45"],
  ["2", "Ayşe Demir", "ayse@test.com", "Editor", "2026-02-20", "5 dk önce", "23"],
  ["3", "Mehmet Kaya", "mehmet@test.com", "Viewer", "2026-03-10", "Hiç", "0"],
  ["4", "Fatma Çelik", "fatma@test.com", "Editor", "2026-03-15", "1 gün önce", "67"],
  ["5", "Ali Öztürk", "ali@test.com", "Admin", "2026-04-01", "3 saat önce", "89"],
];

const chartData = [
  { month: "Oca", value: 120 },
  { month: "Şub", value: 180 },
  { month: "Mar", value: 150 },
  { month: "Nis", value: 220 },
  { month: "May", value: 280 },
  { month: "Haz", value: 340 },
];

const maxValue = Math.max(...chartData.map((d) => d.value));

export default function ReportsPage() {
  const [viewMode, setViewMode] = useState<"table" | "chart">("table");
  const [sqlQuery, setSqlQuery] = useState("SELECT u.name, u.email, u.role, u.created_at, COUNT(o.id) as order_count\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id\nGROUP BY u.id\nORDER BY order_count DESC\nLIMIT 20;");
  const [showSql, setShowSql] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Report Builder</h1>
          <p className="text-sm text-neutral-400">Özel sorgular ve raporlar oluşturun</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Wand2 className="mr-2 h-3 w-3" />
            AI Rapor
          </Button>
          <Button size="sm" className="flex-1 sm:flex-none">
            <Plus className="mr-2 h-3 w-3" />
            Yeni Rapor
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Saved Reports */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Kaydedilmiş Raporlar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {savedReports.map((r) => (
              <button key={r.id} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-neutral-800 transition-colors">
                {r.type === "chart" ? <PieChart className="h-3.5 w-3.5 text-indigo-400" /> : <Table className="h-3.5 w-3.5 text-emerald-400" />}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-neutral-200 truncate">{r.name}</p>
                  <p className="text-[10px] text-neutral-500">{r.model} · {r.lastRun}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Report Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Query Builder */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Sorgu</CardTitle>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-xs" onClick={() => setShowSql(!showSql)}>
                    <Code className="mr-1 h-3 w-3" />
                    {showSql ? "Gizle" : "SQL"}
                  </Button>
                  <Button size="sm" className="text-xs">
                    <Play className="mr-1 h-3 w-3" />
                    Çalıştır
                  </Button>
                </div>
              </div>
            </CardHeader>
            {showSql && (
              <CardContent>
                <pre className="rounded-lg bg-neutral-950 border border-neutral-800 p-4 text-xs font-mono text-emerald-300 overflow-auto whitespace-pre-wrap">
                  {sqlQuery}
                </pre>
              </CardContent>
            )}
          </Card>

          {/* View Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-[10px]">{sampleRows.length} sonuç</Badge>
              <span className="text-[10px] text-neutral-600">0.023s</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex rounded-lg border border-neutral-800 p-0.5">
                <button
                  onClick={() => setViewMode("table")}
                  className={cn("flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-medium", viewMode === "table" ? "bg-neutral-800 text-white" : "text-neutral-500")}
                >
                  <Table className="h-3 w-3" /> Tablo
                </button>
                <button
                  onClick={() => setViewMode("chart")}
                  className={cn("flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-medium", viewMode === "chart" ? "bg-neutral-800 text-white" : "text-neutral-500")}
                >
                  <BarChart3 className="h-3 w-3" /> Grafik
                </button>
              </div>
              <Button variant="outline" size="sm" className="text-xs">
                <Download className="mr-1 h-3 w-3" />
                CSV
              </Button>
            </div>
          </div>

          {/* Results */}
          {viewMode === "table" ? (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-800 text-left">
                        {sampleColumns.map((col) => (
                          <th key={col} className="px-4 py-3 text-xs font-medium text-neutral-500">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-800/50">
                      {sampleRows.map((row, i) => (
                        <tr key={i} className="hover:bg-neutral-800/30 transition-colors">
                          {row.map((cell, j) => (
                            <td key={j} className={cn("px-4 py-3 text-xs", j === 0 ? "text-neutral-500 font-mono" : "text-neutral-300")}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Bar Chart */}
                  <div className="flex items-end gap-3 h-48">
                    {chartData.map((d) => (
                      <div key={d.month} className="flex flex-1 flex-col items-center gap-1">
                        <span className="text-[10px] text-neutral-400">{d.value}</span>
                        <div
                          className="w-full rounded-t-md bg-gradient-to-t from-indigo-600 to-indigo-400 transition-all hover:from-indigo-500 hover:to-indigo-300"
                          style={{ height: `${(d.value / maxValue) * 100}%` }}
                        />
                        <span className="text-[10px] text-neutral-500">{d.month}</span>
                      </div>
                    ))}
                  </div>
                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-3 border-t border-neutral-800 pt-4">
                    <div className="text-center">
                      <p className="text-lg font-bold text-neutral-100">1,290</p>
                      <p className="text-[10px] text-neutral-500">Toplam</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-emerald-400">+28%</p>
                      <p className="text-[10px] text-neutral-500">Büyüme</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-neutral-100">215</p>
                      <p className="text-[10px] text-neutral-500">Ortalama</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      {/* Atonota S17 — özel pano oluşturucu */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 text-xs">
        <p className="text-sm font-medium text-neutral-100">Özel pano oluşturucu</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {[["dataset",["orders","parties","builds","ai-usage"]],["metrik",["count","sum(amount)","p95(latency)"]],["boyut",["tenant","gün","durum"]],["filtre",["son 30 gün","env=prod","tümü"]]].map(([l,opts]) => (
            <label key={l as string} className="flex items-center gap-1 text-neutral-500">{l}
              <select className="rounded-md border border-neutral-800 bg-neutral-950 px-1.5 py-1 font-mono text-neutral-200">
                {(opts as string[]).map((o) => <option key={o}>{o}</option>)}
              </select>
            </label>
          ))}
          <span className="rounded-md bg-indigo-600 px-2.5 py-1 text-white">pano ekle</span>
        </div>
        <input readOnly value='doğal dil: "tenant başına son 30 gün sipariş toplamı" → sorguya çevrilir (AI, diff ile)' className="mt-2 w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-1.5 font-mono text-[11px] text-neutral-400" />
      </div>

      <CliEquivalent tool="report.run" args={{ app: "marketplace" }} />

    </div>
  );
}
