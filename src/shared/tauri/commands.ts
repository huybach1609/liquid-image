import { invoke } from "@tauri-apps/api/core";

import type { MagickVersionInfo } from "@/shared/types/common";

export async function greet(name: string): Promise<string> {
  return invoke<string>("greet", { name });
}

export async function menubarUsesNative(): Promise<boolean> {
  return invoke<boolean>("menubar_uses_native");
}

export async function checkVersion(): Promise<MagickVersionInfo> {
  return invoke<MagickVersionInfo>("check_version");
}

export type ImageMetadata = {
  path: string;
  format: string;
  width: number;
  height: number;
  fileSizeBytes: number;
};
export async function getImageMetadata(path: string): Promise<ImageMetadata> {
  return invoke<ImageMetadata>("get_image_metadata", { path });
}

export async function createImageProxy(inputPath: string, maxResolution?: string): Promise<string> {
  return invoke<string>("create_image_proxy", { inputPath, maxResolution });
}

export async function removeProxyFile(path: string): Promise<void> {
  return invoke<void>("remove_proxy_file", { path });
}

export type GeneratePreviewRequest = {
  inputPath: string;
  operation: string;
  optionsJson?: string;
  args?: string[];
  /** When true, `inputPath` is the temp WebP proxy (skip decode/resize on the Rust side). */
  fromProxy?: boolean;
  /**
   * Full-resolution dimensions of the opened image. When `fromProxy` is true, the backend
   * rescales `-shave` from these (UI) pixels into proxy pixels for preview only.
   */
  originalWidth?: number;
  originalHeight?: number;
  /** Preview max resolution setting (e.g., "800px", "1200px", "full") */
  maxResolution?: string;
};

export type GeneratePreviewResponse = {
  previewDataUri: string;
  totalMs: number;
  renderMs: number;
};

export async function generatePreview(
  request: GeneratePreviewRequest,
): Promise<GeneratePreviewResponse> {
  return invoke<GeneratePreviewResponse>("generate_preview", { request });
}

export type RunSingleRequest = {
  inputPath: string;
  outputPath: string;
  args: string[];
};

export type RunSingleResponse = {
  outputPath: string;
  width: number;
  height: number;
};

export async function runSingle(
  request: RunSingleRequest,
): Promise<RunSingleResponse> {
  return invoke<RunSingleResponse>("run_single", { request });
}

export type BatchItem = {
  inputPath: string;
  outputPath: string;
};

export type RunBatchRequest = {
  items: BatchItem[];
  args: string[];
  workers: number;
  stopOnError: boolean;
};

export type BatchProgressEvent = {
  index: number;
  status: "success" | "error";
  message?: string;
  outputPath?: string;
};

export async function runBatch(request: RunBatchRequest): Promise<void> {
  return invoke<void>("run_batch", { request });
}

export async function runBatchDryRun(request: RunBatchRequest): Promise<void> {
  return invoke<void>("run_batch_dry_run", { request });
}

export async function cancelBatch(): Promise<void> {
  return invoke<void>("cancel_batch");
}