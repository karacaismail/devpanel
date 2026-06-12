import { create } from "zustand";

/** K2 — Sayfalar seçili nesneyi inspector'a buradan besler. */

export interface Selection {
  kind: string; // "tenant" | "issue" | "model" | ...
  id: string;
  title: string;
  meta: Record<string, string | number | boolean | null>;
  related?: Array<{ label: string; href: string }>;
}

interface SelectionState {
  selection: Selection | null;
  select: (s: Selection) => void;
  clear: () => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
  selection: null,
  select: (selection) => set({ selection }),
  clear: () => set({ selection: null }),
}));
