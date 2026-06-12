import { create } from "zustand";

export type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "email"
  | "url"
  | "json"
  | "text"
  | "relation"
  | "enum"
  | "computed";

export interface SchemaField {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  unique: boolean;
  indexed: boolean;
  defaultValue?: string;
  description?: string;
  validation?: string;
  enumValues?: string[];
  relationModel?: string;
}

export interface SchemaModel {
  id: string;
  name: string;
  tableName: string;
  fields: SchemaField[];
  timestamps: boolean;
  softDelete: boolean;
  description?: string;
}

interface SchemaStore {
  models: SchemaModel[];
  activeModelId: string | null;
  addModel: (model: SchemaModel) => void;
  updateModel: (id: string, updates: Partial<SchemaModel>) => void;
  deleteModel: (id: string) => void;
  setActiveModel: (id: string | null) => void;
  addField: (modelId: string, field: SchemaField) => void;
  updateField: (modelId: string, fieldId: string, updates: Partial<SchemaField>) => void;
  deleteField: (modelId: string, fieldId: string) => void;
}

export const useSchemaStore = create<SchemaStore>((set) => ({
  models: [],
  activeModelId: null,

  addModel: (model) =>
    set((state) => ({ models: [...state.models, model] })),

  updateModel: (id, updates) =>
    set((state) => ({
      models: state.models.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),

  deleteModel: (id) =>
    set((state) => ({
      models: state.models.filter((m) => m.id !== id),
      activeModelId: state.activeModelId === id ? null : state.activeModelId,
    })),

  setActiveModel: (id) => set({ activeModelId: id }),

  addField: (modelId, field) =>
    set((state) => ({
      models: state.models.map((m) =>
        m.id === modelId ? { ...m, fields: [...m.fields, field] } : m
      ),
    })),

  updateField: (modelId, fieldId, updates) =>
    set((state) => ({
      models: state.models.map((m) =>
        m.id === modelId
          ? {
              ...m,
              fields: m.fields.map((f) =>
                f.id === fieldId ? { ...f, ...updates } : f
              ),
            }
          : m
      ),
    })),

  deleteField: (modelId, fieldId) =>
    set((state) => ({
      models: state.models.map((m) =>
        m.id === modelId
          ? { ...m, fields: m.fields.filter((f) => f.id !== fieldId) }
          : m
      ),
    })),
}));
