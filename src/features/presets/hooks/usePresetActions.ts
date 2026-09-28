import { useCallback } from "react";
import { useSettingsStore } from "@/features/settings/state/settings.store";
import { useBatchStore } from "@/features/batch/state/batch.store";
import type { BatchPipelineStep } from "@/features/batch/types";

export interface PresetData {
  id: string;
  name: string;
  createdAt: string;
  pipeline: BatchPipelineStep[];
}

export async function savePreset(
  name: string,
  pipelineOverride?: BatchPipelineStep[]
): Promise<string | null> {
  const presetFolder =
    useSettingsStore.getState().presetFolder?.trim() || "~/.config/imgui/presets/";
  const pipeline = pipelineOverride || useBatchStore.getState().pipeline;

  if (!name.trim() || pipeline.length === 0) {
    return null;
  }

  const id = name.toLowerCase().replace(/[^a-z0-9_-]/g, "-");
  const data: PresetData = {
    id,
    name,
    createdAt: new Date().toISOString(),
    pipeline,
  };

  try {
    const { writeTextFile, mkdir } = await import("@tauri-apps/plugin-fs");
    const normalizedDir = presetFolder.replace(/\/$/, "");
    await mkdir(normalizedDir, { recursive: true });
    const filePath = `${normalizedDir}/${id}.json`;
    await writeTextFile(filePath, JSON.stringify(data, null, 2));
    return filePath;
  } catch (e) {
    console.warn("Failed to write preset to disk:", e);
    localStorage.setItem(`liquid-preset:${id}`, JSON.stringify(data));
    return `local:${id}`;
  }
}

export async function loadPreset(filePathOrId: string): Promise<PresetData | null> {
  try {
    let content = "";
    if (filePathOrId.startsWith("local:")) {
      content =
        localStorage.getItem(`liquid-preset:${filePathOrId.replace("local:", "")}`) ||
        "";
    } else {
      const { readTextFile } = await import("@tauri-apps/plugin-fs");
      content = await readTextFile(filePathOrId);
    }

    if (content) {
      const data = JSON.parse(content) as PresetData;
      if (Array.isArray(data.pipeline)) {
        useBatchStore.setState({ pipeline: data.pipeline });
        return data;
      }
    }
  } catch (e) {
    console.error("Failed to load preset:", e);
  }
  return null;
}

export function usePresetActions() {

  const listPresets = useCallback(async (): Promise<PresetData[]> => {
    const presetFolder = useSettingsStore.getState().presetFolder?.trim() || "~/.config/imgui/presets/";
    const results: PresetData[] = [];

    try {
      const { readDir, readTextFile } = await import("@tauri-apps/plugin-fs");
      const normalizedDir = presetFolder.replace(/\/$/, "");
      const entries = await readDir(normalizedDir);
      for (const entry of entries) {
        if (entry.isFile && entry.name.endsWith(".json")) {
          try {
            const content = await readTextFile(`${normalizedDir}/${entry.name}`);
            const parsed = JSON.parse(content) as PresetData;
            results.push(parsed);
          } catch {
            // ignore corrupt files
          }
        }
      }
    } catch {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith("liquid-preset:")) {
          try {
            const parsed = JSON.parse(localStorage.getItem(key) || "");
            results.push(parsed);
          } catch {
            // ignore
          }
        }
      }
    }

    return results;
  }, []);

  const deletePreset = useCallback(async (filePathOrId: string): Promise<void> => {
    try {
      if (filePathOrId.startsWith("local:")) {
        localStorage.removeItem(`liquid-preset:${filePathOrId.replace("local:", "")}`);
      } else {
        const { remove } = await import("@tauri-apps/plugin-fs");
        await remove(filePathOrId);
      }
    } catch (e) {
      console.warn("Failed to delete preset:", e);
    }
  }, []);

  return {
    savePreset,
    loadPreset,
    listPresets,
    deletePreset,
  };
}
