import { create } from "zustand";
import type { SimResult } from "@/ai/simulate";

/**
 * AI omurga store'u — Atonota'nın "öneri → diff → onay → audit" zincirini tutar.
 * Üç sorumluluk: (1) AI komut GEÇMİŞİ, (2) apply DIALOG'unun durumu,
 * (3) TOAST kuyruğu. Bellekte tutulur — gizli veri localStorage'a yazılmaz.
 */

export type AiStatus = "pending" | "applied" | "rejected";
export type ToastKind = "ok" | "info" | "warn" | "danger";

/** Geçmişe düşen tek bir AI komutu — denetlenebilir kayıt. */
export interface AiEntry {
  id: number;
  ts: string; // HH:MM:SS
  page: string;
  query: string;
  intent: SimResult["intent"];
  title: string;
  apply?: string; // CLI eşdeğeri (varsa)
  status: AiStatus;
}

export interface Toast {
  id: number;
  kind: ToastKind;
  text: string;
}

/** Apply dialog'una verilen istek: hangi öneri, hangi bağlamdan geldi. */
export interface ApplyRequest {
  entryId: number;
  result: SimResult;
  query: string;
  page: string;
  /** Yıkıcı/geri-alınamaz mı? true ise isim-yazarak onay istenir. */
  destructive: boolean;
}

let seq = 0;
const now = () => new Date().toLocaleTimeString("tr-TR", { hour12: false });

interface AiState {
  history: AiEntry[];
  toasts: Toast[];
  pending: ApplyRequest | null;

  /** Bir AI önerisini geçmişe yazar (status: pending). Yeni entry id'sini döner. */
  record: (page: string, query: string, result: SimResult) => number;
  /** Apply dialog'unu açar — öneriyi onaya sunar. */
  requestApply: (req: Omit<ApplyRequest, "destructive"> & { destructive?: boolean }) => void;
  /** Onaylandı: status=applied, audit toast'ı, dialog kapanır. */
  confirmApply: () => void;
  /** Reddedildi/iptal: status=rejected, dialog kapanır. */
  cancelApply: (reject?: boolean) => void;
  /** Saf audit + toast — yazma aksiyonları buradan geçer (logAction sarmalar). */
  toast: (kind: ToastKind, text: string) => void;
  dismiss: (id: number) => void;
}

export const useAiStore = create<AiState>((set, get) => ({
  history: [],
  toasts: [],
  pending: null,

  record: (page, query, result) => {
    const id = ++seq;
    const entry: AiEntry = {
      id,
      ts: now(),
      page,
      query,
      intent: result.intent,
      title: result.title,
      apply: result.apply,
      status: "pending",
    };
    set((s) => ({ history: [entry, ...s.history].slice(0, 50) }));
    return id;
  },

  requestApply: (req) =>
    set({ pending: { ...req, destructive: req.destructive ?? false } }),

  confirmApply: () => {
    const p = get().pending;
    if (!p) return;
    set((s) => ({
      pending: null,
      history: s.history.map((e) => (e.id === p.entryId ? { ...e, status: "applied" } : e)),
    }));
    get().toast("ok", `Uygulandı (diff): ${p.result.title}${p.result.apply ? ` · ${p.result.apply}` : ""}`);
  },

  cancelApply: (reject = false) => {
    const p = get().pending;
    set((s) => ({
      pending: null,
      history: reject && p ? s.history.map((e) => (e.id === p.entryId ? { ...e, status: "rejected" } : e)) : s.history,
    }));
    if (reject && p) get().toast("info", `Reddedildi: ${p.result.title}`);
  },

  toast: (kind, text) => {
    const id = ++seq;
    set((s) => ({ toasts: [...s.toasts, { id, kind, text }] }));
    setTimeout(() => get().dismiss(id), 4200);
  },

  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

/**
 * logAction — Atonota sözleşmesi: her yazma aksiyonu audit + toast'a düşer.
 * Bileşenlerden tek satırla çağrılır; store'a doğrudan dokunmaya gerek kalmaz.
 */
export function logAction(text: string, kind: ToastKind = "ok") {
  useAiStore.getState().toast(kind, text);
}
