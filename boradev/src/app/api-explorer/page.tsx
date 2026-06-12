"use client";

import { CliEquivalent } from "@/components/cli-equivalent";

import { useState } from "react";
import {
  FileCode,
  Play,
  Copy,
  ChevronRight,
  Lock,
  Globe,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const endpoints = [
  {
    method: "GET",
    path: "/api/users",
    description: "Tüm kullanıcıları listele",
    auth: true,
    params: ["page", "limit", "sort", "filter"],
    response: `{
  "data": [
    { "id": "1", "name": "Ahmet", "email": "ahmet@test.com", "role": "admin" },
    { "id": "2", "name": "Ayşe", "email": "ayse@test.com", "role": "editor" }
  ],
  "meta": { "total": 42, "page": 1, "limit": 20 }
}`,
  },
  {
    method: "POST",
    path: "/api/users",
    description: "Yeni kullanıcı oluştur",
    auth: true,
    params: [],
    response: `{ "id": "3", "name": "Mehmet", "email": "mehmet@test.com", "role": "viewer", "createdAt": "2026-06-11T10:00:00Z" }`,
  },
  {
    method: "GET",
    path: "/api/users/:id",
    description: "Tekil kullanıcı getir",
    auth: true,
    params: ["id"],
    response: `{ "id": "1", "name": "Ahmet", "email": "ahmet@test.com", "role": "admin", "metadata": {} }`,
  },
  {
    method: "PUT",
    path: "/api/users/:id",
    description: "Kullanıcı güncelle",
    auth: true,
    params: ["id"],
    response: `{ "id": "1", "name": "Ahmet Güncel", "email": "ahmet@test.com", "role": "admin", "updatedAt": "2026-06-11T12:00:00Z" }`,
  },
  {
    method: "DELETE",
    path: "/api/users/:id",
    description: "Kullanıcı sil",
    auth: true,
    params: ["id"],
    response: `{ "success": true, "message": "User deleted" }`,
  },
  {
    method: "GET",
    path: "/api/products",
    description: "Ürünleri listele",
    auth: false,
    params: ["category", "min_price", "max_price"],
    response: `{
  "data": [
    { "id": "p1", "title": "Widget Pro", "price": 299.99, "category": "tools" }
  ],
  "meta": { "total": 156, "page": 1, "limit": 20 }
}`,
  },
];

const methodColors: Record<string, string> = {
  GET: "bg-emerald-600/20 text-emerald-400",
  POST: "bg-blue-600/20 text-blue-400",
  PUT: "bg-amber-600/20 text-amber-400",
  DELETE: "bg-red-600/20 text-red-400",
  PATCH: "bg-purple-600/20 text-purple-400",
};

export default function ApiExplorerPage() {
  const [selected, setSelected] = useState(endpoints[0]);
  const [responseVisible, setResponseVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTest = () => setResponseVisible(true);

  const handleCopy = () => {
    navigator.clipboard.writeText(`curl -X ${selected.method} http://localhost:3000${selected.path}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Explorer</h1>
          <p className="text-sm text-neutral-400">Auto-generated REST endpoint&apos;lerini test edin</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{endpoints.length} endpoints</Badge>
          <Button variant="outline" size="sm">
            <FileCode className="mr-2 h-3 w-3" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Endpoint List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Endpoints</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {endpoints.map((ep, i) => (
              <button
                key={i}
                onClick={() => { setSelected(ep); setResponseVisible(false); }}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  selected === ep ? "bg-neutral-800" : "hover:bg-neutral-800/50"
                }`}
              >
                <Badge className={`text-[10px] font-mono ${methodColors[ep.method]}`}>
                  {ep.method}
                </Badge>
                <code className="flex-1 text-xs font-mono text-neutral-300 truncate">{ep.path}</code>
                {ep.auth && <Lock className="h-3 w-3 text-neutral-600" />}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Request/Response */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 overflow-x-auto">
                <Badge className={`font-mono shrink-0 ${methodColors[selected.method]}`}>
                  {selected.method}
                </Badge>
                <code className="text-sm font-mono text-neutral-200 truncate">{selected.path}</code>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="mr-1 h-3 w-3" /> : <Copy className="mr-1 h-3 w-3" />}
                  cURL
                </Button>
                <Button size="sm" onClick={handleTest}>
                  <Play className="mr-2 h-3 w-3" />
                  Test Et
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-neutral-400">{selected.description}</p>

            {selected.auth && (
              <div className="flex items-center gap-2 rounded-lg border border-amber-800/30 bg-amber-950/20 p-3 text-xs text-amber-400">
                <Lock className="h-3 w-3" />
                Bu endpoint authentication gerektirir
              </div>
            )}

            {selected.params.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-medium text-neutral-500">Parameters</p>
                <div className="space-y-2">
                  {selected.params.map((p) => (
                    <div key={p} className="flex items-center gap-2">
                      <code className="w-24 text-xs font-mono text-neutral-400">{p}</code>
                      <Input placeholder={`${p} değeri`} className="text-xs" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {responseVisible && (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <p className="text-xs font-medium text-neutral-500">Response</p>
                  <Badge variant="success" className="text-[10px]">200 OK</Badge>
                </div>
                <pre className="rounded-lg bg-neutral-950 p-4 text-xs font-mono text-emerald-300 overflow-auto">
                  {selected.response}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <CliEquivalent tool="api.query" args={{ app: "marketplace" }} />

    </div>
  );
}
