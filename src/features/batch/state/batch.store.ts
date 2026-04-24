import { create } from "zustand";
import { devtools, persist, createJSONStorage } from "zustand/middleware";
import { createTauriStorage } from "@/shared/lib/zustand-tauri-store";
import type {
  BatchLogLine,
  BatchPipelineStep,
  BatchQueueItem,
  BatchRunStats,
} from "../types";

export interface BatchState {
  queue: BatchQueueItem[];
  pipeline: BatchPipelineStep[];
  logs: BatchLogLine[];
  isRunning: boolean;
  stats: BatchRunStats;
  outputDirectory: string;

  // Actions
  addFiles: (files: { path: string; name: string }[]) => void;
  removeFile: (id: string) => void;
  clearQueue: () => void;

  addStep: (functionId: string) => void;
  removeStep: (id: string) => void;
  updateStepParams: (id: string, params: Record<string, any>) => void;
  reorderSteps: (startIndex: number, endIndex: number) => void;
  toggleStepExpanded: (id: string) => void;
  toggleStepEnabled: (id: string) => void;

  setRunning: (running: boolean) => void;
  setOutputDirectory: (path: string) => void;
  addLog: (level: BatchLogLine["level"], message: string) => void;
}

export const useBatchStore = create<BatchState>()(
  devtools(
    persist(
      (set) => ({
        queue: [],
        pipeline: [],
        logs: [],
        isRunning: false,
        outputDirectory: "./out/",
        stats: { total: 0, queued: 0, running: 0, done: 0, error: 0 },

        addFiles: (files) =>
          set((state) => {
            const newItems: BatchQueueItem[] = files.map((f) => ({
              id: crypto.randomUUID(),
              path: f.path,
              fileName: f.name,
              status: "queued",
            }));
            const combined = [...state.queue, ...newItems];
            return {
              queue: combined,
              stats: {
                ...state.stats,
                total: combined.length,
                queued: combined.filter((i) => i.status === "queued").length,
              },
            };
          }),

        removeFile: (id) =>
          set((state) => {
            const filtered = state.queue.filter((i) => i.id !== id);
            return {
              queue: filtered,
              stats: {
                ...state.stats,
                total: filtered.length,
                queued: filtered.filter((i) => i.status === "queued").length,
              },
            };
          }),

        clearQueue: () =>
          set({
            queue: [],
            stats: { total: 0, queued: 0, running: 0, done: 0, error: 0 },
          }),

        addStep: (functionId) =>
          set((state) => ({
            pipeline: [
              ...state.pipeline,
              {
                id: crypto.randomUUID(),
                functionId,
                enabled: true,
                params: {},
                isExpanded: true,
              },
            ],
          })),

        removeStep: (id) =>
          set((state) => ({
            pipeline: state.pipeline.filter((s) => s.id !== id),
          })),

        updateStepParams: (id, params) =>
          set((state) => ({
            pipeline: state.pipeline.map((s) =>
              s.id === id ? { ...s, params: { ...s.params, ...params } } : s
            ),
          })),

        reorderSteps: (startIndex, endIndex) =>
          set((state) => {
            const result = Array.from(state.pipeline);
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);
            return { pipeline: result };
          }),

        toggleStepExpanded: (id) =>
          set((state) => ({
            pipeline: state.pipeline.map((s) =>
              s.id === id ? { ...s, isExpanded: !s.isExpanded } : s
            ),
          })),

        toggleStepEnabled: (id) =>
          set((state) => ({
            pipeline: state.pipeline.map((s) =>
              s.id === id ? { ...s, enabled: !s.enabled } : s
            ),
          })),

        setRunning: (running) => set({ isRunning: running }),
        setOutputDirectory: (path) => set({ outputDirectory: path }),

        addLog: (level, message) =>
          set((state) => ({
            logs: [
              ...state.logs,
              {
                id: crypto.randomUUID(),
                level,
                message,
                createdAt: Date.now(),
              },
            ],
          })),
      }),
      {
        name: "batch-storage",
        storage: createJSONStorage(() => createTauriStorage("batch.json")),
        partialize: (state) => ({
          outputDirectory: state.outputDirectory,
          pipeline: state.pipeline,
        }),
      }
    ),
    { name: "BatchStore" }
  )
);
