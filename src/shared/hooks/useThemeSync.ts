import { useEffect } from "react";
import { useSettingsStore } from "@/features/settings/state/settings.store";

const THEME_CLASSES = [
  "light",
  "dark",
  "claude",
  "claude-dark",
  "notion",
  "notion-dark",
  "starbucks",
  "starbucks-dark",
];

export function useThemeSync() {
  const settingsTheme = useSettingsStore((s) => s.theme);
  const accentColor = useSettingsStore((s) => s.accentColor);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove(...THEME_CLASSES);

    if (settingsTheme === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      root.classList.add(prefersDark ? "dark" : "light");
    } else {
      root.classList.add(settingsTheme);
    }
  }, [settingsTheme]);

  useEffect(() => {
    if (accentColor) {
      document.documentElement.style.setProperty("--accent", accentColor);
    }
  }, [accentColor]);
}
