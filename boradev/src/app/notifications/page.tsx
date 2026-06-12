"use client";

import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CliEquivalent } from "@/components/cli-equivalent";
import { cn } from "@/lib/utils";

/** Ali güncellemesi — Bildirimler: olay akışı, okundu yönetimi. */

interface Notif {
  id: string;
  kind: "deploy" | "issue" | "ai" | "security";
  text: string;
  at: string;
  read: boolean;
}

const SEED: Notif[] = [
  { id: "n1", kind: "security", text: "fraud-guard sandbox'ı beyan dışı erişim denedi — karantinada.", at: "8d önce", read: false },
  { id: "n2", kind: "ai", text: "AI triage BUG-141 için şiddet önerisi bıraktı: high.", at: "32d önce", read: false },
  { id: "n3", kind: "deploy", text: "staging v1.8.0 deploy edildi (2 change-set).", at: "1s önce", read: false },
  { id: "n4", kind: "issue", text: "FTR-58 'çalışılıyor' durumuna alındı (bora).", at: "2s önce", read: true },
  { id: "n5", kind: "deploy", text: "prod v1.7.2 sağlıklı — 3 gündür sıfır hata.", at: "dün", read: true },
];

const KIND_VARIANT = { deploy: "default", issue: "secondary", ai: "warning", security: "destructive" } as const;

export default function NotificationsPage() {
  const [items, setItems] = useState(SEED);
  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-neutral-100">
          <Bell className="h-6 w-6 text-indigo-400" /> Bildirimler
        </h1>
        {unread > 0 && <Badge>{unread} okunmamış</Badge>}
        <Button
          size="sm"
          variant="outline"
          className="ml-auto"
          onClick={() => setItems((prev) => prev.map((n) => ({ ...n, read: true })))}
        >
          <Check className="mr-1 h-3 w-3" /> tümünü okundu yap
        </Button>
      </div>

      <Card>
        <CardContent className="divide-y divide-neutral-800 p-0">
          {items.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
              className={cn(
                "flex w-full flex-wrap items-center gap-2 px-4 py-3 text-left text-sm transition-colors hover:bg-neutral-800/40",
                !n.read && "bg-indigo-600/5"
              )}
            >
              <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", n.read ? "bg-neutral-700" : "bg-indigo-500")} />
              <Badge variant={KIND_VARIANT[n.kind]}>{n.kind}</Badge>
              <span className={n.read ? "text-neutral-400" : "text-neutral-100"}>{n.text}</span>
              <span className="ml-auto text-xs text-neutral-500">{n.at}</span>
            </button>
          ))}
        </CardContent>
      </Card>

      <CliEquivalent tool="notification.list" args={{ unread: true }} />
    </div>
  );
}
