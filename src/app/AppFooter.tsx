import { cn } from "@/lib/utils";
import type { MagickVersionInfo } from "@/shared/types/common";

type AppFooterProps = {
  versionInfo: MagickVersionInfo | null;
  versionError: string | null;
  isLoadingVersion: boolean;
  className?: string;
};

export function AppFooter({ className, isLoadingVersion, versionError, versionInfo }: AppFooterProps) {
   const versionText = isLoadingVersion
    ? "Checking ImageMagick..."
    : versionError
      ? `Version error: ${versionError}`
      : `${versionInfo?.versionName ?? "Unknown"}`;

  return (
    <footer className={cn("rounded-xl border border-border/80 bg-card px-4 py-3 flex justify-between items-center", className)}>
     <div className="flex items-center gap-2">info</div>
      <p className="text-xs text-muted-foreground">{versionText}</p>
    </footer>
  );
}
