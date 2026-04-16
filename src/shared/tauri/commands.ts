import { invoke } from "@tauri-apps/api/core";

import type { MagickVersionInfo } from "@/shared/types/common";

export async function greet(name: string): Promise<string> {
  return invoke<string>("greet", { name });
}

export async function checkVersion(): Promise<MagickVersionInfo> {
  return invoke<MagickVersionInfo>("check_version");
}
