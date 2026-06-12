"use client";

import { CliEquivalent } from "@/components/cli-equivalent";

import { useState } from "react";
import {
  Image,
  Upload,
  FolderOpen,
  Grid3X3,
  List,
  Search,
  Trash2,
  Download,
  Eye,
  File,
  FileText,
  FileVideo,
  FileAudio,
  FileArchive,
  Copy,
  MoreHorizontal,
  HardDrive,
  Plus,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MediaFile {
  id: string;
  name: string;
  type: "image" | "document" | "video" | "audio" | "archive";
  size: string;
  dimensions?: string;
  uploadedAt: string;
  url: string;
  color: string;
}

const folders = [
  { name: "Tüm Dosyalar", count: 24, icon: FolderOpen },
  { name: "Görseller", count: 12, icon: Image },
  { name: "Dökümanlar", count: 8, icon: FileText },
  { name: "Videolar", count: 3, icon: FileVideo },
  { name: "Diğer", count: 1, icon: FileArchive },
];

const files: MediaFile[] = [
  { id: "1", name: "hero-banner.jpg", type: "image", size: "2.4 MB", dimensions: "1920x1080", uploadedAt: "2 saat önce", url: "/uploads/hero-banner.jpg", color: "bg-blue-600" },
  { id: "2", name: "logo-dark.svg", type: "image", size: "12 KB", dimensions: "200x60", uploadedAt: "1 gün önce", url: "/uploads/logo-dark.svg", color: "bg-indigo-600" },
  { id: "3", name: "product-01.png", type: "image", size: "890 KB", dimensions: "800x800", uploadedAt: "2 gün önce", url: "/uploads/product-01.png", color: "bg-emerald-600" },
  { id: "4", name: "product-02.png", type: "image", size: "1.1 MB", dimensions: "800x800", uploadedAt: "2 gün önce", url: "/uploads/product-02.png", color: "bg-cyan-600" },
  { id: "5", name: "api-docs.pdf", type: "document", size: "3.2 MB", uploadedAt: "3 gün önce", url: "/uploads/api-docs.pdf", color: "bg-red-600" },
  { id: "6", name: "user-guide.pdf", type: "document", size: "1.8 MB", uploadedAt: "5 gün önce", url: "/uploads/user-guide.pdf", color: "bg-red-600" },
  { id: "7", name: "demo-video.mp4", type: "video", size: "45 MB", uploadedAt: "1 hafta önce", url: "/uploads/demo-video.mp4", color: "bg-purple-600" },
  { id: "8", name: "presentation.pptx", type: "document", size: "5.6 MB", uploadedAt: "1 hafta önce", url: "/uploads/presentation.pptx", color: "bg-orange-600" },
  { id: "9", name: "avatar-placeholder.png", type: "image", size: "45 KB", dimensions: "256x256", uploadedAt: "2 hafta önce", url: "/uploads/avatar.png", color: "bg-pink-600" },
  { id: "10", name: "backup-2026.zip", type: "archive", size: "128 MB", uploadedAt: "2 hafta önce", url: "/uploads/backup.zip", color: "bg-neutral-600" },
  { id: "11", name: "favicon.ico", type: "image", size: "4 KB", dimensions: "32x32", uploadedAt: "1 ay önce", url: "/uploads/favicon.ico", color: "bg-amber-600" },
  { id: "12", name: "bg-pattern.svg", type: "image", size: "8 KB", uploadedAt: "1 ay önce", url: "/uploads/bg-pattern.svg", color: "bg-teal-600" },
];

const typeIcons: Record<string, React.ElementType> = {
  image: Image,
  document: FileText,
  video: FileVideo,
  audio: FileAudio,
  archive: FileArchive,
};

export default function MediaPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeFolder, setActiveFolder] = useState("Tüm Dosyalar");
  const [search, setSearch] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [dragOver, setDragOver] = useState(false);

  const filtered = files.filter((f) => {
    if (search && !f.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeFolder === "Görseller" && f.type !== "image") return false;
    if (activeFolder === "Dökümanlar" && f.type !== "document") return false;
    if (activeFolder === "Videolar" && f.type !== "video") return false;
    return true;
  });

  const toggleFile = (id: string) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const totalSize = "186.4 MB";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Media Manager</h1>
          <p className="text-sm text-neutral-400">Dosya ve medya yönetimi</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-3 w-3" />
            Klasör
          </Button>
          <Button size="sm">
            <Upload className="mr-2 h-3 w-3" />
            Yükle
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Sidebar */}
        <Card className="lg:col-span-1">
          <CardContent className="p-3 space-y-1">
            {folders.map((folder) => (
              <button
                key={folder.name}
                onClick={() => setActiveFolder(folder.name)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                  activeFolder === folder.name ? "bg-indigo-600/10 text-indigo-400" : "text-neutral-400 hover:bg-neutral-800"
                )}
              >
                <folder.icon className="h-4 w-4" />
                <span className="flex-1 text-left">{folder.name}</span>
                <span className="text-[10px] text-neutral-600">{folder.count}</span>
              </button>
            ))}
            <div className="mt-4 border-t border-neutral-800 pt-3">
              <div className="flex items-center gap-2 px-3 text-xs text-neutral-500">
                <HardDrive className="h-3 w-3" />
                <span>{totalSize} kullanılıyor</span>
              </div>
              <div className="mx-3 mt-2 h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                <div className="h-full w-[35%] rounded-full bg-indigo-600" />
              </div>
              <p className="mt-1 px-3 text-[10px] text-neutral-600">500 MB&apos;den 186.4 MB</p>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-4 space-y-4">
          {/* Toolbar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <Input placeholder="Dosya ara..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            {selectedFiles.size > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-[10px]">{selectedFiles.size} seçili</Badge>
                <Button variant="outline" size="sm" className="text-xs h-7"><Download className="mr-1 h-3 w-3" />İndir</Button>
                <Button variant="outline" size="sm" className="text-xs h-7 text-red-400"><Trash2 className="mr-1 h-3 w-3" />Sil</Button>
              </div>
            )}
            <div className="ml-auto flex rounded-lg border border-neutral-800 p-0.5">
              <button onClick={() => setViewMode("grid")} className={cn("rounded-md p-1.5", viewMode === "grid" ? "bg-neutral-800 text-white" : "text-neutral-500")}>
                <Grid3X3 className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setViewMode("list")} className={cn("rounded-md p-1.5", viewMode === "list" ? "bg-neutral-800 text-white" : "text-neutral-500")}>
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); }}
            className={cn(
              "rounded-xl border-2 border-dashed p-8 text-center transition-all",
              dragOver ? "border-indigo-500 bg-indigo-950/20" : "border-neutral-800 hover:border-neutral-700"
            )}
          >
            <Upload className="mx-auto h-8 w-8 text-neutral-600" />
            <p className="mt-2 text-sm text-neutral-400">Dosyaları sürükleyip bırakın</p>
            <p className="text-[10px] text-neutral-600">veya yükle butonunu kullanın</p>
          </div>

          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.map((file) => {
                const Icon = typeIcons[file.type] || File;
                const isSelected = selectedFiles.has(file.id);
                return (
                  <button
                    key={file.id}
                    onClick={() => toggleFile(file.id)}
                    className={cn(
                      "group rounded-xl border p-3 text-left transition-all",
                      isSelected ? "border-indigo-600 bg-indigo-950/20 ring-1 ring-indigo-600/30" : "border-neutral-800 bg-neutral-900 hover:border-neutral-700"
                    )}
                  >
                    <div className={cn("flex h-24 items-center justify-center rounded-lg", file.color + "/10")}>
                      <Icon className={cn("h-8 w-8", file.color.replace("bg-", "text-").replace("-600", "-400"))} />
                    </div>
                    <div className="mt-2">
                      <p className="text-xs font-medium text-neutral-200 truncate">{file.name}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-[10px] text-neutral-500">{file.size}</span>
                        {file.dimensions && <span className="text-[10px] text-neutral-600">{file.dimensions}</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-neutral-800/50">
                  {filtered.map((file) => {
                    const Icon = typeIcons[file.type] || File;
                    return (
                      <div key={file.id} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-800/20 transition-colors">
                        <input type="checkbox" checked={selectedFiles.has(file.id)} onChange={() => toggleFile(file.id)} className="rounded border-neutral-700" />
                        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg", file.color + "/10")}>
                          <Icon className={cn("h-4 w-4", file.color.replace("bg-", "text-").replace("-600", "-400"))} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-neutral-200 truncate">{file.name}</p>
                        </div>
                        <span className="text-xs text-neutral-500">{file.size}</span>
                        {file.dimensions && <span className="text-xs text-neutral-600">{file.dimensions}</span>}
                        <span className="text-xs text-neutral-600">{file.uploadedAt}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                          <button className="rounded p-1 hover:bg-neutral-700"><Eye className="h-3 w-3 text-neutral-400" /></button>
                          <button className="rounded p-1 hover:bg-neutral-700"><Copy className="h-3 w-3 text-neutral-400" /></button>
                          <button className="rounded p-1 hover:bg-neutral-700"><Trash2 className="h-3 w-3 text-red-400" /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <CliEquivalent tool="media.list" args={{ app: "marketplace" }} />

    </div>
  );
}
