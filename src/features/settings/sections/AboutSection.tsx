import { Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AboutSectionProps {
  appName: string;
  appVersion: string;
  tauriVersion: string;
  onResetAllSettings: () => void;
}

export function AboutSection({
  appName,
  appVersion,
  tauriVersion,
  onResetAllSettings,
}: AboutSectionProps) {
  return (
    <>
      <div className="mb-10 p-8 rounded-2xl border border-border bg-muted/20 flex items-center gap-6 shadow-sm">
        <div className="size-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
          <Settings className="size-9" />
        </div>
        <div>
          <div className="text-lg font-bold tracking-tight">{appName}</div>
          <div className="text-muted-foreground font-medium">
            Version {appVersion} · Built with Tauri {tauriVersion} + React
          </div>
        </div>
        <Button variant="outline" size="sm" className="ml-auto h-9 px-4 font-semibold">
          Check for updates
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-border/60">
          <div className="font-medium">ImageMagick version</div>
          <div className="font-mono text-muted-foreground bg-muted/40 px-2 py-0.5 rounded">
            7.1.1-15
          </div>
        </div>
        <div className="flex items-center justify-between p-4 border-b border-border/60">
          <div className="font-medium">Tauri version</div>
          <div className="font-mono text-muted-foreground bg-muted/40 px-2 py-0.5 rounded">
            2.0.4
          </div>
        </div>
        <div className="flex items-center justify-between p-4">
          <div className="font-medium">Config location</div>
          <div className="font-mono text-muted-foreground bg-muted/40 px-2 py-0.5 rounded">
            ~/.config/imgui/
          </div>
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <Button variant="outline" size="sm" className="h-9 px-4 font-medium">
          Open config folder
        </Button>
        <Button
          variant="destructive"
          size="sm"
          className={cn("ml-auto h-9 px-4 font-medium")}
          onClick={onResetAllSettings}
        >
          Reset all settings
        </Button>
      </div>
    </>
  );
}
