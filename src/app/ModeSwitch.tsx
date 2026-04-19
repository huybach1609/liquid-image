import { useTranslation } from "react-i18next";

import { useAppStore } from "@/app/store/app.store";
import type { AppMode } from "@/shared/types/common";

export type ModeSwitchProps = {
  mode?: AppMode;
  onModeChange?: (mode: AppMode) => void;
};

export function ModeSwitch(props: ModeSwitchProps = {}) {
  const { t } = useTranslation("common");
  const { mode: modeProp, onModeChange: onModeChangeProp } = props;
  const modeFromStore = useAppStore((s) => s.mode);
  const setModeStore = useAppStore((s) => s.setMode);
  const mode = modeProp ?? modeFromStore;
  const setMode = onModeChangeProp ?? setModeStore;

  const items: Array<{ id: AppMode; label: string }> = [
    { id: "single", label: t("mode.single") },
    { id: "batch", label: t("mode.batch") },
  ];

  return (
    <div className="inline-flex rounded-md border border-border/70 bg-muted/50">
      {items.map((item) => {
        const isActive = mode === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setMode(item.id)}
            className={`rounded-[6px] px-3 py-1 text-xs font-medium transition-colors ${
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
