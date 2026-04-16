import { useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";

import { ModeSwitch } from "@/app/ModeSwitch";
import { BatchModePage } from "@/pages/BatchModePage";
import { SingleModePage } from "@/pages/SingleModePage";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import { AppMode } from "@/shared/types/common";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";
import { Cog } from "lucide-react";

export function AppShell() {
  const [mode, setMode] = useState<AppMode>("single");
  const isFullFrameMode = mode === "single" || mode === "batch";
  const appWindow = getCurrentWindow();

  return (
    <main
      className={
        isFullFrameMode
          ? "app-window-frame bg-background text-foreground"
          : "min-h-screen bg-background p-6 text-foreground"
      }
    >
      <TooltipProvider>
        <header className="grid h-[38px] select-none grid-cols-[minmax(0,1fr)_auto] items-center border-b-[0.5px] border-b-border/70 bg-background/95">
          <div
            className="flex h-full min-w-0 items-center px-3"
            data-tauri-drag-region
            onMouseDown={(event) => {
              if (event.button === 0) {
                void appWindow.startDragging();
              }
            }}
          >
            <span className="text-foreground/80 truncate text-[11px] font-medium uppercase tracking-[0.04em]">
              liquid-image
            </span>
          </div>
          <div className="flex h-full items-stretch">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Settings"
                  variant="outline"
                  size="icon-sm"
                  className="my-auto mx-3"
                  type="button"
                >
                  <Cog />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-fit">
                <DropdownMenuItem className="cursor-default p-2 focus:bg-transparent">
                  <ModeSwitch mode={mode} onModeChange={setMode} />
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ThemeToggle />
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void appWindow.close()}>
                  Close
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              className="text-foreground/75 inline-flex h-full w-[42px] cursor-pointer items-center justify-center border-0 border-l-[0.5px] border-l-border/70 bg-transparent text-xs leading-none transition-colors duration-120 ease-in hover:bg-primary/10 hover:text-primary"
              type="button"
              aria-label="Minimize window"
              onClick={() => void appWindow.minimize()}
            >
              -
            </button>
            <button
              className="text-foreground/75 inline-flex h-full w-[42px] cursor-pointer items-center justify-center border-0 border-l-[0.5px] border-l-border/70 bg-transparent text-xs leading-none transition-colors duration-120 ease-in hover:bg-primary/10 hover:text-primary"
              type="button"
              aria-label="Toggle maximize window"
              onClick={() => void appWindow.toggleMaximize()}
            >
              □
            </button>
            <button
              className="text-foreground/75 inline-flex h-full w-[42px] cursor-pointer items-center justify-center border-0 border-l-[0.5px] border-l-border/70 bg-transparent text-xs leading-none transition-colors duration-120 ease-in hover:bg-destructive/15 hover:text-destructive"
              type="button"
              aria-label="Close window"
              onClick={() => void appWindow.close()}
            >
              ×
            </button>
          </div>
        </header>
        <div
          className={
            isFullFrameMode
              ? "app-window-content"
              : "app-shell-grid mx-auto w-full max-w-[1200px]"
          }
        >
          {mode === "single" ? (
            <SingleModePage />
          ) : mode === "batch" ? (
            <BatchModePage />
          ) : (
            <section className="app-shell-content" />
          )}
        </div>
      </TooltipProvider>
    </main>
  );
}
