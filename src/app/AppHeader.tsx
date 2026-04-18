import type { AppMode } from "@/shared/types/common";
import { ModeSwitch } from "./ModeSwitch";

type AppHeaderProps = {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
};

export function AppHeader({
  mode,
  onModeChange,
}: AppHeaderProps) {
 
  return (
    <header className="flex items-center justify-between rounded-xl border border-border/80 bg-card px-4 py-3">
      <div className="flex flex-col gap-1">
        <p className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
          Liquid Image
        </p>
      </div>
      <div className="flex items-center justify-end">
        <ModeSwitch mode={mode} onModeChange={onModeChange} />
      </div>
    </header>
  );
}
