"use client";

import { CliEquivalent } from "@/components/cli-equivalent";

import { Settings, Globe, Database, Shield, Key, Server, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const envVars = [
  { key: "DATABASE_URL", value: "postgresql://localhost:5432/metapanel", sensitive: false },
  { key: "API_SECRET", value: "••••••••••••••••", sensitive: true },
  { key: "AI_API_KEY", value: "••••••••••••••••", sensitive: true },
  { key: "REDIS_URL", value: "redis://localhost:6379", sensitive: false },
  { key: "SMTP_HOST", value: "smtp.gmail.com", sensitive: false },
  { key: "NODE_ENV", value: "development", sensitive: false },
];

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-neutral-400">Proje ve ortam yapılandırması</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* General */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="h-4 w-4" />
              Genel
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm text-neutral-400">Proje Adı</label>
              <Input defaultValue="MetaPanel Demo" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-neutral-400">Base URL</label>
              <Input defaultValue="http://localhost:3000" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-neutral-400">Default Language</label>
              <Input defaultValue="tr" />
            </div>
            <Button size="sm">Kaydet</Button>
          </CardContent>
        </Card>

        {/* Database */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Database className="h-4 w-4" />
              Database
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-neutral-800 p-3">
              <div>
                <p className="text-sm font-medium">PostgreSQL</p>
                <p className="text-xs text-neutral-500">localhost:5432/metapanel</p>
              </div>
              <Badge variant="success">Connected</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-neutral-800 p-3">
              <div>
                <p className="text-sm font-medium">Redis</p>
                <p className="text-xs text-neutral-500">localhost:6379</p>
              </div>
              <Badge variant="success">Connected</Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Migration Çalıştır</Button>
              <Button variant="outline" size="sm">Seed Data</Button>
            </div>
          </CardContent>
        </Card>

        {/* Environment Variables */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Key className="h-4 w-4" />
                Environment Variables
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline">development</Badge>
                <Button variant="outline" size="sm">+ Ekle</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {envVars.map((env) => (
                <div key={env.key} className="flex flex-col gap-2 rounded-lg border border-neutral-800 p-3 sm:flex-row sm:items-center sm:gap-3">
                  <code className="text-sm font-mono font-medium text-neutral-200 sm:w-40 shrink-0">{env.key}</code>
                  <Input
                    defaultValue={env.value}
                    type={env.sensitive ? "password" : "text"}
                    className="flex-1 font-mono text-xs"
                  />
                  {env.sensitive && (
                    <Badge variant="warning" className="text-[10px] shrink-0">sensitive</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Atonota S13 — güvenlik politikaları & proje */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 text-xs">
        <p className="text-sm font-medium text-neutral-100">Güvenlik politikaları</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg border border-neutral-800 p-2.5"><p className="text-neutral-500">login deneme limiti</p><p className="font-mono text-neutral-200">5 / 15dk · sonra kilit</p></div>
          <div className="rounded-lg border border-neutral-800 p-2.5"><p className="text-neutral-500">parola politikası</p><p className="font-mono text-neutral-200">min 12 · sözlük dışı · MFA zorunlu</p></div>
          <div className="rounded-lg border border-neutral-800 p-2.5"><p className="text-neutral-500">telemetri</p><p className="font-mono text-amber-400">kapalı — kilitli karar (koddan açılamaz)</p></div>
        </div>
        <p className="mt-3 text-[11px] uppercase tracking-wider text-neutral-500">Proje bilgileri</p>
        <p className="mt-1 text-neutral-400">ad: MetaPanel · logo: M · marka rengi: indigo — değişiklik theme token dosyasına yazılır.</p>
      </div>

      <CliEquivalent tool="app.config" args={{ app: "marketplace" }} />

    </div>
  );
}
