import { create } from "zustand";
import type { ImageMetadata } from "@/shared/tauri/commands";

export type SingleRunStatus = "idle" | "running" | "success" | "error";

export type SingleRunState = {
  status: SingleRunStatus;
  message: string;
};


export type SingleStoreState = {
  selectedFile: string | null;
  selectedFunction: string;
  functionParams: Record<string, unknown>;
  isManualPreview: boolean;
  previewRequestId: number;
  previewZoom: number;
  runState: SingleRunState;
  fileMetadata: ImageMetadata | null;
  setFileMetadata: (fileMetadata: ImageMetadata | null) => void;
  setSelectedFile: (selectedFile: string | null) => void;
  setSelectedFunction: (selectedFunction: string) => void;
  setFunctionParams: (functionParams: Record<string, unknown>) => void;
  updateFunctionParam: (key: string, value: unknown) => void;
  setIsManualPreview: (isManualPreview: boolean) => void;
  requestPreview: () => void;
  setPreviewZoom: (previewZoom: number) => void;
  setRunState: (runState: SingleRunState) => void;
  setRunStatus: (status: SingleRunStatus, message?: string) => void;
  resetRunState: () => void;
};

const DEFAULT_SELECTED_FUNCTION = "Convert";

const initialRunState: SingleRunState = {
  status: "idle",
  message: "",
};

export const useSingleStore = create<SingleStoreState>((set) => ({
  selectedFile: null,
  selectedFunction: DEFAULT_SELECTED_FUNCTION,
  functionParams: {},
  isManualPreview: true,
  previewRequestId: 0,
  previewZoom: 100,
  runState: initialRunState,
  fileMetadata: null,
  setFileMetadata: (fileMetadata: ImageMetadata | null) => set({ fileMetadata }),
  setSelectedFile: (selectedFile) => set({ selectedFile }),
  setSelectedFunction: (selectedFunction) => set({ selectedFunction }),
  setFunctionParams: (functionParams) => set({ functionParams }),
  updateFunctionParam: (key, value) =>
    set((state) => ({
      functionParams: {
        ...state.functionParams,
        [key]: value,
      },
    })),
  setIsManualPreview: (isManualPreview) => set({ isManualPreview }),
  requestPreview: () =>
    set((state) => ({
      previewRequestId: state.previewRequestId + 1,
    })),
  setPreviewZoom: (previewZoom) => set({ previewZoom }),
  setRunState: (runState) => set({ runState }),
  setRunStatus: (status, message = "") =>
    set({
      runState: {
        status,
        message,
      },
    }),
  resetRunState: () => set({ runState: initialRunState }),
}));
