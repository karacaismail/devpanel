"use client";

import { CliEquivalent } from "@/components/cli-equivalent";

import { useState } from "react";
import { Shield, Plus, Check, X, Pencil, Wand2, Users, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Role {
  id: string;
  name: string;
  slug: string;
  color: string;
  userCount: number;
  description: string;
}

const roles: Role[] = [
  { id: "admin", name: "Admin", slug: "admin", color: "bg-red-500", userCount: 2, description: "Tam yetki" },
  { id: "editor", name: "Editor", slug: "editor", color: "bg-blue-500", userCount: 5, description: "İçerik düzenleme yetkisi" },
  { id: "viewer", name: "Viewer", slug: "viewer", color: "bg-emerald-500", userCount: 12, description: "Sadece okuma yetkisi" },
  { id: "api", name: "API User", slug: "api-user", color: "bg-amber-500", userCount: 3, description: "Sadece API erişimi" },
];

const models = ["User", "Product", "Order", "BlogPost", "Category", "Media"];
const actions = ["read", "create", "update", "delete", "export", "import"];

type PermissionMatrix = Record<string, Record<string, Record<string, boolean>>>;

const initialPermissions: PermissionMatrix = {
  admin: {
    User: { read: true, create: true, update: true, delete: true, export: true, import: true },
    Product: { read: true, create: true, update: true, delete: true, export: true, import: true },
    Order: { read: true, create: true, update: true, delete: true, export: true, import: true },
    BlogPost: { read: true, create: true, update: true, delete: true, export: true, import: true },
    Category: { read: true, create: true, update: true, delete: true, export: true, import: true },
    Media: { read: true, create: true, update: true, delete: true, export: true, import: true },
  },
  editor: {
    User: { read: true, create: false, update: false, delete: false, export: false, import: false },
    Product: { read: true, create: true, update: true, delete: false, export: true, import: false },
    Order: { read: true, create: false, update: true, delete: false, export: true, import: false },
    BlogPost: { read: true, create: true, update: true, delete: true, export: true, import: true },
    Category: { read: true, create: true, update: true, delete: false, export: false, import: false },
    Media: { read: true, create: true, update: true, delete: true, export: false, import: false },
  },
  viewer: {
    User: { read: true, create: false, update: false, delete: false, export: false, import: false },
    Product: { read: true, create: false, update: false, delete: false, export: false, import: false },
    Order: { read: true, create: false, update: false, delete: false, export: false, import: false },
    BlogPost: { read: true, create: false, update: false, delete: false, export: false, import: false },
    Category: { read: true, create: false, update: false, delete: false, export: false, import: false },
    Media: { read: true, create: false, update: false, delete: false, export: false, import: false },
  },
  "api-user": {
    User: { read: true, create: false, update: false, delete: false, export: true, import: false },
    Product: { read: true, create: true, update: true, delete: false, export: true, import: true },
    Order: { read: true, create: true, update: false, delete: false, export: true, import: false },
    BlogPost: { read: true, create: false, update: false, delete: false, export: true, import: false },
    Category: { read: true, create: false, update: false, delete: false, export: false, import: false },
    Media: { read: true, create: true, update: false, delete: false, export: false, import: false },
  },
};

export default function PermissionsPage() {
  const [activeRole, setActiveRole] = useState(roles[0]);
  const [permissions, setPermissions] = useState(initialPermissions);

  const togglePermission = (model: string, action: string) => {
    setPermissions((prev) => ({
      ...prev,
      [activeRole.slug]: {
        ...prev[activeRole.slug],
        [model]: {
          ...prev[activeRole.slug][model],
          [action]: !prev[activeRole.slug][model][action],
        },
      },
    }));
  };

  const rolePermissions = permissions[activeRole.slug] || {};
  const totalPerms = models.reduce((acc, m) => acc + actions.filter((a) => rolePermissions[m]?.[a]).length, 0);
  const maxPerms = models.length * actions.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Permissions & Roles</h1>
          <p className="text-sm text-neutral-400">Rol bazlı erişim kontrolü (RBAC)</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Wand2 className="mr-2 h-3 w-3" />
            AI ile Öner
          </Button>
          <Button size="sm" className="flex-1 sm:flex-none">
            <Plus className="mr-2 h-3 w-3" />
            Yeni Rol
          </Button>
        </div>
      </div>

      {/* Role Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {roles.map((role) => (
          <button
            key={role.id}
            onClick={() => setActiveRole(role)}
            className={cn(
              "rounded-xl border p-4 text-left transition-all",
              activeRole.id === role.id
                ? "border-indigo-600/50 bg-indigo-950/20 ring-1 ring-indigo-600/20"
                : "border-neutral-800 bg-neutral-900 hover:border-neutral-700"
            )}
          >
            <div className="flex items-center gap-3">
              <div className={cn("h-3 w-3 rounded-full", role.color)} />
              <span className="text-sm font-semibold text-neutral-200">{role.name}</span>
            </div>
            <p className="mt-1 text-[10px] text-neutral-500">{role.description}</p>
            <div className="mt-2 flex items-center gap-2">
              <Users className="h-3 w-3 text-neutral-600" />
              <span className="text-[10px] text-neutral-500">{role.userCount} kullanıcı</span>
            </div>
          </button>
        ))}
      </div>

      {/* Permission Matrix */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <div className={cn("h-2.5 w-2.5 rounded-full", activeRole.color)} />
                {activeRole.name} Yetkileri
              </CardTitle>
              <CardDescription>{totalPerms} / {maxPerms} yetki aktif</CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-20 sm:w-32 rounded-full bg-neutral-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all"
                    style={{ width: `${(totalPerms / maxPerms) * 100}%` }}
                  />
                </div>
                <span className="text-[10px] text-neutral-500">{Math.round((totalPerms / maxPerms) * 100)}%</span>
              </div>
              <Button variant="outline" size="sm" className="text-xs">
                <Lock className="mr-1 h-3 w-3" />
                Kaydet
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500">Model</th>
                  {actions.map((a) => (
                    <th key={a} className="px-3 py-3 text-center text-[10px] font-medium text-neutral-500 uppercase tracking-wider">
                      {a}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50">
                {models.map((model) => (
                  <tr key={model} className="hover:bg-neutral-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-neutral-200">{model}</span>
                    </td>
                    {actions.map((action) => {
                      const allowed = rolePermissions[model]?.[action] ?? false;
                      return (
                        <td key={action} className="px-3 py-3 text-center">
                          <button
                            onClick={() => togglePermission(model, action)}
                            className={cn(
                              "inline-flex h-7 w-7 items-center justify-center rounded-md transition-all",
                              allowed
                                ? "bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30"
                                : "bg-neutral-800/50 text-neutral-700 hover:bg-neutral-800 hover:text-neutral-500"
                            )}
                          >
                            {allowed ? <Check className="h-3.5 w-3.5" /> : <X className="h-3 w-3" />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {/* Atonota S5 — ABAC/ReBAC + İzin Değerlendirici */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 text-xs">
        <p className="text-sm font-medium text-neutral-100">Politika katmanları</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg border border-neutral-800 p-2.5"><p className="text-neutral-200">RBAC</p><p className="mt-0.5 text-neutral-500">rol → aksiyon matrisi (yukarıda)</p></div>
          <div className="rounded-lg border border-neutral-800 p-2.5"><p className="text-neutral-200">ABAC</p><p className="mt-0.5 font-mono text-neutral-500">order.amount &gt; 10000 → release-manager onayı</p></div>
          <div className="rounded-lg border border-neutral-800 p-2.5"><p className="text-neutral-200">ReBAC</p><p className="mt-0.5 font-mono text-neutral-500">owner(record) OR member(record.team)</p></div>
        </div>
        <p className="mt-3 text-[11px] uppercase tracking-wider text-neutral-500">İzin Değerlendirici (simülasyon)</p>
        <div className="mt-1.5 rounded-lg bg-neutral-950 p-3 font-mono">
          <p className="text-neutral-400">simulate(user=bora, resource=ten_party, action=write, env=production)</p>
          <p className="mt-1 text-red-400">→ DENY · neden: ABAC &quot;prod yazma = release-manager&quot; · politika: pol-114</p>
          <p className="text-neutral-400">simulate(user=bora, resource=ten_party, action=read, env=development)</p>
          <p className="text-emerald-400">→ GRANT · rol: developer · maske: pii alanları redakte</p>
        </div>
      </div>

      <CliEquivalent tool="role.list" args={{ app: "marketplace" }} />

    </div>
  );
}
