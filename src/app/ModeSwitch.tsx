import type { AppMode } from "@/shared/types/common";

type ModeSwitchProps = {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
};

export function ModeSwitch({ mode, onModeChange }: ModeSwitchProps) {
  const items: Array<{ id: AppMode; label: string }> = [
    { id: "single", label: "Single" },
    { id: "batch", label: "Batch" },
  ];

  return (
    <div className="inline-flex rounded-md border border-border/70 bg-muted/50">
      {items.map((item) => {
        const isActive = mode === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onModeChange(item.id)}
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
