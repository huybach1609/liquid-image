import type { AppMode } from "@/shared/types/common";
import { Button } from "@/shared/components/ui/button";

type ModeSwitchProps = {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
};

export function ModeSwitch({ mode, onModeChange }: ModeSwitchProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/80 bg-card p-1">
      <Button
        type="button"
        size="sm"
        variant={mode === "single" ? "default" : "ghost"}
        onClick={() => onModeChange("single")}
      >
        Single
      </Button>
      <Button
        type="button"
        size="sm"
        variant={mode === "batch" ? "default" : "ghost"}
        onClick={() => onModeChange("batch")}
      >
        Batch
      </Button>
    </div>
  );
}
