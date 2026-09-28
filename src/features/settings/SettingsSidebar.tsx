import * as React from "react";
import {
  Settings,
  Palette,
  Files,
  Cpu,
  Terminal,
  Info,
} from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { SettingsTab } from "./hooks/useSettingsDraft";

const NAV_ITEMS = {
  general: [
    { id: "general" as const, label: "General", icon: Settings },
    { id: "appearance" as const, label: "Appearance", icon: Palette },
    { id: "files" as const, label: "Files & output", icon: Files },
    { id: "processing" as const, label: "Processing", icon: Cpu },
  ],
  advanced: [
    { id: "imagick" as const, label: "ImageMagick", icon: Terminal },
    { id: "about" as const, label: "About", icon: Info },
  ],
};

const NavButton = React.memo(
  ({
    id,
    label,
    icon: Icon,
    isActive,
    isCompact,
    onClick,
  }: {
    id: SettingsTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    isActive: boolean;
    isCompact: boolean;
    onClick: (id: SettingsTab) => void;
  }) => (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-pressed={isActive}
          className={cn(
            "flex h-11 w-full items-center border-r-2 py-2 transition-all outline-none gap-3 select-none",
            isCompact ? "justify-center px-2" : "px-5",
            isActive
              ? "border-primary bg-primary/5 font-semibold text-primary"
              : "border-transparent text-muted-foreground/80 hover:bg-muted/50 hover:text-foreground",
          )}
          onClick={() => onClick(id)}
        >
          <Icon
            className={cn(
              "size-4 shrink-0",
              isActive ? "opacity-100" : "opacity-70",
            )}
          />
          {!isCompact && (
            <div className="flex flex-1 items-center justify-between min-w-0">
              <span className="text-sm truncate">{label}</span>
            </div>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  ),
);

interface SettingsSidebarProps {
  activeTab: SettingsTab;
  isCompact?: boolean;
  appName?: string;
  appVersion?: string;
  onTabChange: (tab: SettingsTab) => void;
  onBack?: () => void;
  backLabel?: string;
}

export function SettingsSidebar({
  activeTab,
  isCompact = false,
  onTabChange,
}: SettingsSidebarProps) {
  return (
    <aside className="h-full flex flex-col">
      <ScrollArea className="flex-1">
        <div className="py-3 flex flex-col">
          {!isCompact && (
            <div className="px-5 py-3 text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
              General
            </div>
          )}
          <nav className="flex flex-col gap-0.5">
            {NAV_ITEMS.general.map((item) => (
              <NavButton
                key={item.id}
                id={item.id}
                label={item.label}
                icon={item.icon}
                isActive={activeTab === item.id}
                isCompact={isCompact}
                onClick={onTabChange}
              />
            ))}
          </nav>

          <div className={cn("mt-6", !isCompact && "px-5 py-3")}>
            {!isCompact ? (
              <div className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
                Advanced
              </div>
            ) : (
              <div className="h-px bg-border/40 mx-2" />
            )}
          </div>
          <nav className="flex flex-col gap-0.5 mt-2">
            {NAV_ITEMS.advanced.map((item) => (
              <NavButton
                key={item.id}
                id={item.id}
                label={item.label}
                icon={item.icon}
                isActive={activeTab === item.id}
                isCompact={isCompact}
                onClick={onTabChange}
              />
            ))}
          </nav>
        </div>
      </ScrollArea>
    </aside>
  );
}
