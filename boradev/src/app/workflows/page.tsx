"use client";

import { CliEquivalent } from "@/components/cli-equivalent";

import { useState } from "react";
import {
  GitBranch,
  Plus,
  Play,
  Circle,
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Wand2,
  Settings,
  Trash2,
  Copy,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface WorkflowState {
  id: string;
  name: string;
  color: string;
  type: "start" | "state" | "end" | "decision";
}

interface WorkflowTransition {
  from: string;
  to: string;
  label: string;
  condition?: string;
  roles?: string[];
}

interface Workflow {
  id: string;
  name: string;
  model: string;
  active: boolean;
  states: WorkflowState[];
  transitions: WorkflowTransition[];
}

const workflows: Workflow[] = [
  {
    id: "order",
    name: "Sipariş Onay Süreci",
    model: "Order",
    active: true,
    states: [
      { id: "draft", name: "Taslak", color: "bg-neutral-500", type: "start" },
      { id: "pending", name: "Onay Bekliyor", color: "bg-amber-500", type: "state" },
      { id: "approved", name: "Onaylandı", color: "bg-blue-500", type: "state" },
      { id: "processing", name: "İşleniyor", color: "bg-indigo-500", type: "state" },
      { id: "shipped", name: "Kargoda", color: "bg-cyan-500", type: "state" },
      { id: "completed", name: "Tamamlandı", color: "bg-emerald-500", type: "end" },
      { id: "cancelled", name: "İptal", color: "bg-red-500", type: "end" },
    ],
    transitions: [
      { from: "draft", to: "pending", label: "Onaya Gönder", roles: ["Editor", "Admin"] },
      { from: "pending", to: "approved", label: "Onayla", roles: ["Admin"], condition: "amount < 10000" },
      { from: "pending", to: "cancelled", label: "Reddet", roles: ["Admin"] },
      { from: "approved", to: "processing", label: "İşleme Al", roles: ["Admin"] },
      { from: "processing", to: "shipped", label: "Kargoya Ver", roles: ["Admin"] },
      { from: "shipped", to: "completed", label: "Teslim Edildi", roles: ["Admin", "System"] },
      { from: "approved", to: "cancelled", label: "İptal Et", roles: ["Admin"] },
    ],
  },
  {
    id: "content",
    name: "İçerik Yayınlama",
    model: "BlogPost",
    active: true,
    states: [
      { id: "draft", name: "Taslak", color: "bg-neutral-500", type: "start" },
      { id: "review", name: "İnceleme", color: "bg-amber-500", type: "state" },
      { id: "published", name: "Yayında", color: "bg-emerald-500", type: "end" },
      { id: "archived", name: "Arşiv", color: "bg-neutral-600", type: "end" },
    ],
    transitions: [
      { from: "draft", to: "review", label: "İncelemeye Gönder", roles: ["Editor"] },
      { from: "review", to: "published", label: "Yayınla", roles: ["Admin"] },
      { from: "review", to: "draft", label: "Revize Et", roles: ["Admin"] },
      { from: "published", to: "archived", label: "Arşivle", roles: ["Admin"] },
    ],
  },
  {
    id: "leave",
    name: "İzin Talebi",
    model: "LeaveRequest",
    active: false,
    states: [
      { id: "draft", name: "Taslak", color: "bg-neutral-500", type: "start" },
      { id: "submitted", name: "Gönderildi", color: "bg-blue-500", type: "state" },
      { id: "approved", name: "Onaylandı", color: "bg-emerald-500", type: "end" },
      { id: "rejected", name: "Reddedildi", color: "bg-red-500", type: "end" },
    ],
    transitions: [
      { from: "draft", to: "submitted", label: "Gönder", roles: ["Employee"] },
      { from: "submitted", to: "approved", label: "Onayla", roles: ["Manager"] },
      { from: "submitted", to: "rejected", label: "Reddet", roles: ["Manager"] },
    ],
  },
];

const stateIcon: Record<string, React.ElementType> = {
  start: Circle,
  state: Clock,
  end: CheckCircle,
  decision: AlertCircle,
};

export default function WorkflowsPage() {
  const [activeWorkflow, setActiveWorkflow] = useState(workflows[0]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workflow Builder</h1>
          <p className="text-sm text-neutral-400">İş akışı ve onay süreçlerini tanımlayın</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
            <Wand2 className="mr-2 h-3 w-3" />
            AI ile Oluştur
          </Button>
          <Button size="sm" className="flex-1 sm:flex-none">
            <Plus className="mr-2 h-3 w-3" />
            Yeni Workflow
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Workflow List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Workflows</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {workflows.map((wf) => (
              <button
                key={wf.id}
                onClick={() => setActiveWorkflow(wf)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                  activeWorkflow.id === wf.id ? "bg-indigo-600/10 text-indigo-400" : "text-neutral-300 hover:bg-neutral-800"
                )}
              >
                <div>
                  <p className="font-medium">{wf.name}</p>
                  <p className="text-[10px] text-neutral-500">Model: {wf.model} · {wf.states.length} state</p>
                </div>
                <Badge variant={wf.active ? "success" : "secondary"} className="text-[9px]">
                  {wf.active ? "Aktif" : "Pasif"}
                </Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Workflow Visual */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{activeWorkflow.name}</CardTitle>
                <CardDescription>Model: {activeWorkflow.model} · {activeWorkflow.transitions.length} transition</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Copy className="mr-2 h-3 w-3" />
                  Kopyala
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="mr-2 h-3 w-3" />
                  Düzenle
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Visual Flow */}
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
              <div className="flex flex-wrap items-center justify-center gap-3">
                {activeWorkflow.states.map((state, i) => {
                  const Icon = stateIcon[state.type] || Circle;
                  const transition = activeWorkflow.transitions.find((t) => t.from === activeWorkflow.states[i - 1]?.id && t.to === state.id);
                  return (
                    <div key={state.id} className="flex items-center gap-3">
                      {i > 0 && (
                        <div className="flex flex-col items-center">
                          <ArrowRight className="h-4 w-4 text-neutral-600" />
                          {transition && (
                            <span className="mt-0.5 text-[8px] text-neutral-600 max-w-[60px] text-center leading-tight">
                              {transition.label}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex flex-col items-center gap-1.5">
                        <div className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-xl border-2 transition-all hover:scale-110 cursor-pointer",
                          state.type === "end" ? "border-dashed" : "border-solid",
                          state.type === "start" ? "border-neutral-600" : "border-neutral-700"
                        )}>
                          <div className={cn("h-3 w-3 rounded-full", state.color)} />
                        </div>
                        <span className="text-[10px] font-medium text-neutral-400 text-center max-w-[70px]">
                          {state.name}
                        </span>
                        {state.type === "start" && <Badge variant="secondary" className="text-[8px]">Start</Badge>}
                        {state.type === "end" && <Badge variant="outline" className="text-[8px]">End</Badge>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Transitions Table */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-neutral-300">Transitions</h3>
              <div className="space-y-2">
                {activeWorkflow.transitions.map((t, i) => (
                  <div key={i} className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-800 p-3 hover:border-neutral-700 transition-colors sm:gap-3">
                    <Badge variant="outline" className="text-[10px] font-mono min-w-[60px] justify-center sm:min-w-[80px]">{t.from}</Badge>
                    <ArrowRight className="h-3 w-3 text-neutral-600 shrink-0" />
                    <Badge variant="outline" className="text-[10px] font-mono min-w-[60px] justify-center sm:min-w-[80px]">{t.to}</Badge>
                    <span className="flex-1 text-xs text-neutral-300 basis-full sm:basis-auto">{t.label}</span>
                    {t.condition && (
                      <code className="rounded bg-neutral-800 px-1.5 py-0.5 text-[10px] text-amber-400 font-mono">
                        {t.condition}
                      </code>
                    )}
                    <div className="flex gap-1">
                      {t.roles?.map((r) => (
                        <Badge key={r} variant="secondary" className="text-[9px]">{r}</Badge>
                      ))}
                    </div>
                    <button className="rounded p-1 opacity-0 group-hover:opacity-100 hover:bg-neutral-800">
                      <Trash2 className="h-3 w-3 text-neutral-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Atonota S4 — olay & telafi katmanı */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <label className="flex items-center gap-1.5 text-neutral-500">
            tetikleyici olay
            <select defaultValue="on_submit" className="rounded-md border border-neutral-800 bg-neutral-950 px-2 py-1 font-mono text-neutral-200">
              <option>before_insert</option><option>after_save</option><option>on_update</option><option>on_submit</option><option>on_cancel</option>
            </select>
          </label>
          <span className="rounded-full border border-red-500/40 px-2 py-0.5 text-red-400">telafi (compensation) ZORUNLU alan — boş geçiş çizilemez</span>
        </div>
        <p className="mt-2 text-xs text-neutral-500">Durum geçişleri yetki bağlayıcıdır: rolü olmayan kullanıcı geçişi tetikleyemez; tüm geçişler audit&apos;e yazılır.</p>
      </div>

      <CliEquivalent tool="workflow.read" args={{ app: "marketplace" }} />

    </div>
  );
}
