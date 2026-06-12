import { create } from "zustand";
import type { PanelAction } from "./types";
import { toCli } from "./cli";

/** layer1-audit — her panel aksiyonu kim/ne/CLI-eşdeğeri ile kayda düşer. */

export interface AuditEntry {
  id: number;
  ts: string;
  actor: string;
  tool: string;
  cli: string;
  summary: string;
}

interface AuditState {
  entries: AuditEntry[];
  unread: number;
  append: (e: Omit<AuditEntry, "id" | "ts">) => void;
  markRead: () => void;
}

let seq = 100;
const MAX = 200;

function now(): string {
  return new Date().toLocaleTimeString("tr-TR", { hour12: false });
}

export const useAuditStore = create<AuditState>((set) => ({
  entries: [
    { id: 4, ts: "14:08:11", actor: "vibebot (MCP)", tool: "sdk.scaffold", cli: "sdk scaffold --name order --level buyuk-tas --test-first", summary: "order ArcheType scaffold önizlemesi" },
    { id: 3, ts: "13:54:02", actor: "ismail", tool: "theme.apply", cli: "sdk theme apply --tenant acme --file themes/tokens.acme.json", summary: "acme brand token güncellendi (AA ✓)" },
    { id: 2, ts: "13:31:47", actor: "ismail", tool: "module.enable", cli: "sdk module enable --id loyalty-points", summary: "Loyalty Points etkinleştirildi" },
    { id: 1, ts: "12:18:05", actor: "migration-reviewer (MCP)", tool: "migration.review", cli: "sdk migration review --id q-7", summary: "q-7 için LLM önerisi hazırlandı (öneri ≠ karar)" },
  ],
  unread: 0,
  append: (e) =>
    set((s) => ({
      entries: [{ ...e, id: ++seq, ts: now() }, ...s.entries].slice(0, MAX),
      unread: s.unread + 1,
    })),
  markRead: () => set({ unread: 0 }),
}));

export interface Toast {
  id: number;
  message: string;
  tone: "ok" | "danger";
}

interface ToastState {
  toasts: Toast[];
  push: (message: string, tone?: Toast["tone"]) => void;
  dismiss: (id: number) => void;
}

let toastSeq = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (message, tone = "ok") =>
    set((s) => ({ toasts: [...s.toasts, { id: ++toastSeq, message, tone }].slice(-4) })),
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/**
 * Tek kapı: panel aksiyonu → audit kaydı + toast.
 * AI-first ilke #1'in işletim hali — kayıt her zaman CLI eşdeğerini taşır.
 */
export function logAction(
  action: PanelAction,
  summary: string,
  opts: { actor?: string; tone?: Toast["tone"]; toast?: boolean } = {},
) {
  useAuditStore.getState().append({
    actor: opts.actor ?? "ismail",
    tool: action.tool,
    cli: toCli(action),
    summary,
  });
  if (opts.toast !== false) {
    useToastStore.getState().push(summary, opts.tone ?? "ok");
  }
}
