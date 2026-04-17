import { invoke } from "@tauri-apps/api/core";

import type { MagickVersionInfo } from "@/shared/types/common";

export async function greet(name: string): Promise<string> {
  return invoke<string>("greet", { name });
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

export type GeneratePreviewRequest = {
  inputPath: string;
  operation: string;
  optionsJson?: string;
  args?: string[];
};

export type GeneratePreviewResponse = {
  previewPath: string;
  width: number;
  height: number;
  totalMs: number;
  renderMs: number;
  identifyMs: number;
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