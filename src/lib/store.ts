import { create } from "zustand";

export type ScreenId =
  | "overview"
  | "archetype"
  | "surface"
  | "workflow"
  | "modules"
  | "domains"
  | "api"
  | "data"
  | "migration"
  | "tests"
  | "wbs"
  | "observability"
  | "audit"
  | "ai"
  | "theme"
  | "tenants"
  | "settings"
  | "fragments"
  | "releases"
  | "events"
  | "learn"
  | "erd"
  | "scheduler"
  | "webhooks"
  | "emails"
  | "health"
  | "media"
  | "reports"
  | "terminal"
  | "roles"
  | "code";

interface UiState {
  screen: ScreenId;
  paletteOpen: boolean;
  setScreen: (s: ScreenId) => void;
  setPaletteOpen: (open: boolean) => void;
}

/** Yerel UI durumu — zustand (Redux yasak, devpanel.md §6). */
export const useUiStore = create<UiState>((set) => ({
  screen: "overview",
  paletteOpen: false,
  setScreen: (screen) => set({ screen }),
  setPaletteOpen: (paletteOpen) => set({ paletteOpen }),
}));
