import * as React from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

import {
  initialSettings,
  useSettingsStore,
} from "@/features/settings/state/settings.store";
import { i18n } from "@/i18n";
import type {
  SettingsState,
  Theme,
} from "@/features/settings/types";
import type { SettingsStoreState } from "@/features/settings/state/settings.store";

export type SettingsTab =
  | "general"
  | "appearance"
  | "files"
  | "processing"
  | "shortcuts"
  | "imagick"
  | "notifications"
  | "about";

export interface MagickStatus {
  type: string;
  path?: string;
  version?: string;
}

const SETTINGS_KEYS = Object.keys(initialSettings) as (keyof SettingsState)[];

const SECTION_RESET_KEYS: Record<
  Exclude<SettingsTab, "shortcuts" | "about">,
  (keyof SettingsState)[]
> = {
  general: [
    "language",
    "dateFormat",
    "fileSizeUnit",
    "restoreSession",
    "checkUpdates",
    "launchAtLogin",
  ],
  appearance: [
    "theme",
    "fontSize",
    "sidebarWidth",
    "showCliPreview",
    "showMetadata",
  ],
  files: [
    "outputFolder",
    "presetFolder",
    "namingPattern",
    "conflictPolicy",
    "autoOpenOutput",
    "contextMenuEnabled",
    "contextMenuFormats",
    "defaultViewerEnabled",
  ],
  processing: [
    "workers",
    "memoryLimit",
    "diskCacheLimit",
    "livePreview",
    "previewMaxResolution",
    "dryRunBeforeBatch",
    "onErrorPolicy",
    "saveErrorLog",
  ],
  imagick: [
    "magickBinaryPath",
    "stripMetadata",
    "defaultColorProfile",
  ],
  notifications: ["notifyBatchComplete", "notifyError", "playSound"],
};

function snapshotSettings(source: SettingsStoreState): SettingsState {
  return {
    ...initialSettings,
    ...Object.fromEntries(SETTINGS_KEYS.map((key) => [key, source[key]])),
  } as SettingsState;
}

export function useSettingsDraft(activeTab: SettingsTab) {
  const setSettings = useSettingsStore((s) => s.setSettings);
  const [draft, setDraft] = React.useState<SettingsState>(() =>
    snapshotSettings(useSettingsStore.getState()),
  );
  const [saved, setSaved] = React.useState(false);
  const [magickStatus, setMagickStatus] =
    React.useState<MagickStatus | null>(null);
  const [isTesting, setIsTesting] = React.useState(false);
  const saveTimeoutRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (useSettingsStore.persist.hasHydrated()) {
      setDraft(snapshotSettings(useSettingsStore.getState()));
      return;
    }

    return useSettingsStore.persist.onFinishHydration((state) => {
      setDraft(snapshotSettings(state));
    });
  }, []);

  React.useEffect(() => {
    const fetchMagickSource = async () => {
      try {
        const source = await invoke<any>("get_current_magick_source");
        const version = await invoke<any>("check_version");
        setMagickStatus({
          type: source.type,
          path: source.path,
          version: version.versionName,
        });
      } catch (e) {
        console.error("Failed to fetch magick source", e);
      }
    };

    fetchMagickSource();
  }, []);

  React.useEffect(
    () => () => {
      if (saveTimeoutRef.current !== null) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    },
    [],
  );

  const updateDraftSetting = React.useCallback(
    <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
      setDraft((current) => ({ ...current, [key]: value }));
      setSaved(false);
    },
    [],
  );

  const handleThemeChange = React.useCallback((theme: Theme) => {
    setDraft((current) => ({ ...current, theme }));
    setSaved(false);
  }, []);

  const handleResetSection = React.useCallback(() => {
    const keysToReset =
      activeTab in SECTION_RESET_KEYS
        ? SECTION_RESET_KEYS[activeTab as Exclude<SettingsTab, "shortcuts" | "about">]
        : [];

    if (!keysToReset.length) {
      return;
    }

    setDraft((current) =>
      ({
        ...current,
        ...Object.fromEntries(
          keysToReset.map((key) => [key, initialSettings[key]]),
        ),
      }) as SettingsState,
    );
    setSaved(false);
  }, [activeTab]);

  const handleResetAllSettings = React.useCallback(() => {
    setDraft({ ...initialSettings });
    setSaved(false);
  }, []);

  const handleTestBinary = React.useCallback(async (path: string) => {
    if (!path) return;
    setIsTesting(true);
    try {
      const info = await invoke<any>("check_magick_path", { path });
      setMagickStatus({
        type: "custom",
        path,
        version: info.versionName,
      });
    } catch (e) {
      console.error("Test failed", e);
      alert(`Failed to verify ImageMagick at: ${path}\n\nError: ${e}`);
    } finally {
      setIsTesting(false);
    }
  }, []);

  const handleBrowseBinary = React.useCallback(async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [
          {
            name: "Executable",
            extensions: ["exe", "bat", "sh", ""],
          },
        ],
      });

      if (selected && typeof selected === "string") {
        updateDraftSetting("magickBinaryPath", selected);
        await handleTestBinary(selected);
      }
    } catch (e) {
      console.error("Browse error", e);
    }
  }, [handleTestBinary, updateDraftSetting]);

  const handleDetectBinary = React.useCallback(() => {
    updateDraftSetting("magickBinaryPath", "");
    setMagickStatus({
      type: "sidecar",
    });
  }, [updateDraftSetting]);

  const handleSave = React.useCallback(async () => {
    try {
      setSettings(draft);

      if (draft.language && i18n.language !== draft.language) {
        void i18n.changeLanguage(draft.language);
      }

      if (draft.magickBinaryPath.trim()) {
        await invoke("update_magick_source", {
          source: { type: "custom", path: draft.magickBinaryPath },
        });
      } else {
        await invoke("update_magick_source", {
          source: { type: "sidecar" },
        });
      }

      const version = await invoke<any>("check_version");
      setMagickStatus(
        draft.magickBinaryPath.trim()
          ? {
              type: "custom",
              path: draft.magickBinaryPath,
              version: version.versionName,
            }
          : {
              type: "sidecar",
              version: version.versionName,
            },
      );

      setSaved(true);
      if (saveTimeoutRef.current !== null) {
        window.clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = window.setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error("Save failed", e);
    }
  }, [draft, setSettings]);

  return {
    draft,
    saved,
    magickStatus,
    isTesting,
    updateDraftSetting,
    handleThemeChange,
    handleResetSection,
    handleResetAllSettings,
    handleBrowseBinary,
    handleDetectBinary,
    handleTestBinary,
    handleSave,
  };
}
