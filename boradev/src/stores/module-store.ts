import { create } from "zustand";

export interface Module {
  id: string;
  name: string;
  slug: string;
  version: string;
  description: string;
  enabled: boolean;
  dependencies: string[];
  author?: string;
  icon?: string;
}

interface ModuleStore {
  modules: Module[];
  addModule: (mod: Module) => void;
  toggleModule: (id: string) => void;
  removeModule: (id: string) => void;
  updateModule: (id: string, updates: Partial<Module>) => void;
}

export const useModuleStore = create<ModuleStore>((set) => ({
  modules: [
    {
      id: "core",
      name: "Core",
      slug: "core",
      version: "1.0.0",
      description: "Temel sistem modülü",
      enabled: true,
      dependencies: [],
      icon: "Box",
    },
    {
      id: "auth",
      name: "Authentication",
      slug: "auth",
      version: "1.0.0",
      description: "Kimlik doğrulama ve yetkilendirme",
      enabled: true,
      dependencies: ["core"],
      icon: "Shield",
    },
    {
      id: "media",
      name: "Media Manager",
      slug: "media",
      version: "1.0.0",
      description: "Dosya ve medya yönetimi",
      enabled: true,
      dependencies: ["core"],
      icon: "Image",
    },
    {
      id: "api",
      name: "API Gateway",
      slug: "api",
      version: "1.0.0",
      description: "REST & GraphQL API yönetimi",
      enabled: false,
      dependencies: ["core", "auth"],
      icon: "Globe",
    },
  ],

  addModule: (mod) =>
    set((state) => ({ modules: [...state.modules, mod] })),

  toggleModule: (id) =>
    set((state) => ({
      modules: state.modules.map((m) =>
        m.id === id ? { ...m, enabled: !m.enabled } : m
      ),
    })),

  removeModule: (id) =>
    set((state) => ({
      modules: state.modules.filter((m) => m.id !== id),
    })),

  updateModule: (id, updates) =>
    set((state) => ({
      modules: state.modules.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),
}));
