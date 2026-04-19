import { create } from "zustand";
import type { ImageMetadata } from "@/shared/tauri/commands";

export type SingleRunStatus = "idle" | "running" | "success" | "error";

export type SingleRunState = {
  status: SingleRunStatus;
  message: string;
};


export type SingleStoreState = {
  selectedFile: string | null;
  /** Temp WebP proxy (≈1600px) used for preview I/O; full-res path stays in `selectedFile`. */
  proxyPath: string | null;
  selectedFunction: string;
  functionParams: Record<string, unknown>;
  functionParamsByFunction: Record<string, Record<string, unknown>>;
  isManualPreview: boolean;
  previewRequestId: number;
  previewZoom: number;
  /**
   * Free crop: after "Apply crop", hide canvas overlay + free-form options until "Crop again".
   */
  cropFreeApplyReview: boolean;
  runState: SingleRunState;
  fileMetadata: ImageMetadata | null;
  setFileMetadata: (fileMetadata: ImageMetadata | null) => void;
  setSelectedFile: (selectedFile: string | null) => void;
  setProxyPath: (proxyPath: string | null) => void;
  setSelectedFunction: (selectedFunction: string) => void;
  setFunctionParams: (functionParams: Record<string, unknown>) => void;
  updateFunctionParam: (key: string, value: unknown) => void;
  setIsManualPreview: (isManualPreview: boolean) => void;
  requestPreview: () => void;
  setCropFreeApplyReview: (value: boolean) => void;
  setPreviewZoom: (previewZoom: number) => void;
  setRunState: (runState: SingleRunState) => void;
  setRunStatus: (status: SingleRunStatus, message?: string) => void;
  resetCurrentFunctionParams: () => void;
  resetAllFunctionParams: () => void;
  resetRunState: () => void;
};

const DEFAULT_SELECTED_FUNCTION = "Convert";

const initialRunState: SingleRunState = {
  status: "idle",
  message: "",
};

export const useSingleStore = create<SingleStoreState>((set) => ({
  selectedFile: null,
  proxyPath: null,
  selectedFunction: DEFAULT_SELECTED_FUNCTION,
  functionParams: {},
  functionParamsByFunction: {},
  isManualPreview: true,
  previewRequestId: 0,
  previewZoom: 100,
  cropFreeApplyReview: false,
  runState: initialRunState,
  fileMetadata: null,
  setFileMetadata: (fileMetadata: ImageMetadata | null) => set({ fileMetadata }),
  setSelectedFile: (selectedFile) =>
    set({ selectedFile, cropFreeApplyReview: false }),
  setProxyPath: (proxyPath) => set({ proxyPath }),
  setSelectedFunction: (selectedFunction) =>
    set((state) => {
      if (state.selectedFunction === selectedFunction) {
        return state;
      }

      const nextParamsByFunction = {
        ...state.functionParamsByFunction,
        [state.selectedFunction]: state.functionParams,
      };

      return {
        selectedFunction,
        functionParamsByFunction: nextParamsByFunction,
        functionParams: nextParamsByFunction[selectedFunction] ?? {},
        cropFreeApplyReview:
          selectedFunction === "Crop" ? state.cropFreeApplyReview : false,
      };
    }),
  setFunctionParams: (functionParams) =>
    set((state) => ({
      functionParams,
      functionParamsByFunction: {
        ...state.functionParamsByFunction,
        [state.selectedFunction]: functionParams,
      },
    })),
  updateFunctionParam: (key, value) =>
    set((state) => ({
      functionParams: {
        ...state.functionParams,
        [key]: value,
      },
      functionParamsByFunction: {
        ...state.functionParamsByFunction,
        [state.selectedFunction]: {
          ...state.functionParams,
          [key]: value,
        },
      },
    })),
  setIsManualPreview: (isManualPreview) => set({ isManualPreview }),
  requestPreview: () =>
    set((state) => ({
      previewRequestId: state.previewRequestId + 1,
    })),
  setCropFreeApplyReview: (cropFreeApplyReview) => set({ cropFreeApplyReview }),
  setPreviewZoom: (previewZoom) => set({ previewZoom }),
  setRunState: (runState) => set({ runState }),
  setRunStatus: (status, message = "") =>
    set({
      runState: {
        status,
        message,
      },
    }),
  resetCurrentFunctionParams: () =>
    set((state) => ({
      functionParams: {},
      functionParamsByFunction: {
        ...state.functionParamsByFunction,
        [state.selectedFunction]: {},
      },
      cropFreeApplyReview: false,
    })),
  resetAllFunctionParams: () =>
    set({
      functionParams: {},
      functionParamsByFunction: {},
      cropFreeApplyReview: false,
    }),
  resetRunState: () => set({ runState: initialRunState }),
}));
