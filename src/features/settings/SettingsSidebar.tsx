import * as React from "react";
import {
  Settings,
  Palette,
  Files,
  Cpu,
  Keyboard,
  Terminal,
  Bell,
  Info,
  ChevronLeft,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
    { id: "general", label: "General", icon: Settings },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "files", label: "Files & output", icon: Files },
    { id: "processing", label: "Processing", icon: Cpu },
    { id: "shortcuts", label: "Shortcuts", icon: Keyboard },
  ],
  advanced: [
    { id: "imagick", label: "ImageMagick", icon: Terminal },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "about", label: "About", icon: Info },
  ],
} as const;

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
    <Tooltip delayDuration={400}>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-pressed={isActive}
          className={cn(
            "flex h-11 w-full items-center border-r-2 py-2 transition-all outline-none gap-3",
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
          {!isCompact && <span className="text-sm">{label}</span>}
        </button>
      </TooltipTrigger>
      {isCompact && <TooltipContent side="right">{label}</TooltipContent>}
    </Tooltip>
  ),
);

interface SettingsSidebarProps {
  activeTab: SettingsTab;
  isCompact: boolean;
  appName: string;
  appVersion: string;
  onTabChange: (tab: SettingsTab) => void;
  onBack: () => void;
}

export function SettingsSidebar({
  activeTab,
  isCompact,
  appName,
  appVersion,
  onTabChange,
  onBack,
}: SettingsSidebarProps) {
  return (
    <aside className="h-full flex flex-col">
      <div
        className={cn(
          "p-6 border-b border-border/40 bg-muted/20 transition-all",
          isCompact && "px-2 py-4 flex flex-col items-center",
        )}
      >
        <div
          className={cn(
            "font-bold leading-none mb-1.5 tracking-tight",
            isCompact ? "text-xs" : "text-base",
          )}
        >
          {isCompact ? "Set" : "Settings"}
        </div>
        {!isCompact && (
          <div className="text-sm text-muted-foreground/80 font-medium">
            {appName} v{appVersion}
          </div>
        )}
      </div>

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

      <div className="p-3 border-t border-border/40 bg-muted/5">
        <Tooltip delayDuration={400}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "w-full justify-start h-10 font-medium transition-all",
                isCompact ? "justify-center px-0" : "px-4",
              )}
              onClick={onBack}
            >
              <ChevronLeft className={cn("size-4", !isCompact && "mr-3")} />
              {!isCompact && "Back"}
            </Button>
          </TooltipTrigger>
          {isCompact && <TooltipContent side="right">Back</TooltipContent>}
        </Tooltip>
      </div>
    </aside>
  );
}
