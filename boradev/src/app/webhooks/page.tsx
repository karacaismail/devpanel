"use client";

import { CliEquivalent } from "@/components/cli-equivalent";

import { Webhook, Plus, Play, Pause, Trash2, Clock, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const webhooks = [
  { id: "1", name: "Order Created", url: "https://api.example.com/webhooks/order", event: "order.created", active: true, lastTriggered: "2 dk önce", successRate: 98 },
  { id: "2", name: "User Registered", url: "https://hooks.slack.com/services/xxx", event: "user.registered", active: true, lastTriggered: "15 dk önce", successRate: 100 },
  { id: "3", name: "Payment Failed", url: "https://api.example.com/webhooks/payment", event: "payment.failed", active: false, lastTriggered: "3 gün önce", successRate: 85 },
  { id: "4", name: "Product Updated", url: "https://api.example.com/webhooks/product", event: "product.updated", active: true, lastTriggered: "1 saat önce", successRate: 100 },
];

const recentDeliveries = [
  { event: "order.created", status: "success", statusCode: 200, time: "2 dk önce", duration: "120ms" },
  { event: "user.registered", status: "success", statusCode: 200, time: "15 dk önce", duration: "89ms" },
  { event: "order.created", status: "failed", statusCode: 500, time: "1 saat önce", duration: "2100ms" },
  { event: "product.updated", status: "success", statusCode: 200, time: "1 saat önce", duration: "156ms" },
  { event: "order.created", status: "success", statusCode: 200, time: "2 saat önce", duration: "134ms" },
];

export default function WebhooksPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Webhooks</h1>
          <p className="text-sm text-neutral-400">Event hook&apos;ları ve webhook endpoint&apos;lerini yönetin</p>
        </div>
        <Button size="sm" className="w-full sm:w-auto">
          <Plus className="mr-2 h-3 w-3" />
          Yeni Webhook
        </Button>
      </div>

      {/* Webhook List */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {webhooks.map((wh) => (
          <Card key={wh.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${wh.active ? "bg-emerald-600/10 text-emerald-400" : "bg-neutral-800 text-neutral-500"}`}>
                    <Webhook className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-100">{wh.name}</h3>
                    <Badge variant="outline" className="text-[10px] font-mono mt-1">{wh.event}</Badge>
                  </div>
                </div>
                <Badge variant={wh.active ? "success" : "secondary"} className="text-[10px]">
                  {wh.active ? "Active" : "Paused"}
                </Badge>
              </div>
              <code className="mt-3 block text-xs text-neutral-500 font-mono truncate">{wh.url}</code>
              <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {wh.lastTriggered}
                </span>
                <span className={wh.successRate >= 95 ? "text-emerald-400" : "text-amber-400"}>
                  {wh.successRate}% success
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button variant="ghost" size="sm" className="flex-1 text-xs">
                  {wh.active ? <Pause className="mr-1 h-3 w-3" /> : <Play className="mr-1 h-3 w-3" />}
                  {wh.active ? "Duraklat" : "Etkinleştir"}
                </Button>
                <Button variant="ghost" size="sm" className="text-xs">
                  <Play className="mr-1 h-3 w-3" />
                  Test
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Trash2 className="h-3 w-3 text-red-400" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Deliveries */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Son Deliveries</CardTitle>
          <CardDescription>Webhook gönderim logları</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentDeliveries.map((d, i) => (
              <div key={i} className="flex flex-col gap-2 rounded-lg border border-neutral-800 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  {d.status === "success" ? (
                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400 shrink-0" />
                  )}
                  <Badge variant="outline" className="text-[10px] font-mono">{d.event}</Badge>
                  <Badge variant={d.status === "success" ? "success" : "destructive"} className="text-[10px]">
                    {d.statusCode}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-neutral-500">
                  <span>{d.duration}</span>
                  <span>{d.time}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <CliEquivalent tool="webhook.list" args={{ app: "marketplace" }} />

    </div>
  );
}
