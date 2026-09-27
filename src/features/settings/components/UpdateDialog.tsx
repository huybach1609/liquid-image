import { useTranslation } from "react-i18next";
import { openPath } from "@tauri-apps/plugin-opener";
import { ExternalLink, Sparkles, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { UpdateCheckResult } from "@/shared/services/updateChecker";

interface UpdateDialogProps {
  isOpen: boolean;
  updateData: UpdateCheckResult | null;
  onClose: () => void;
}

export function UpdateDialog({ isOpen, updateData, onClose }: UpdateDialogProps) {
  const { t } = useTranslation("settings");

  if (!isOpen || !updateData || updateData.status !== "update_available") {
    return null;
  }

  const handleDownload = async () => {
    if (updateData.releaseUrl) {
      try {
        await openPath(updateData.releaseUrl);
      } catch (e) {
        console.error("Failed to open release URL", e);
        window.open(updateData.releaseUrl, "_blank");
      }
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Sparkles className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                {t("about.update.dialogTitle")}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground font-mono">
                <span>v{updateData.currentVersion}</span>
                <ArrowRight className="size-3 text-muted-foreground/60" />
                <span className="font-semibold text-primary px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20">
                  v{updateData.latestVersion}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="size-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Content: Release notes */}
        <div className="p-6 py-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{t("about.update.changelog")}</span>
            {updateData.publishedAt && (
              <span className="font-mono text-[11px]">
                {new Date(updateData.publishedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <ScrollArea className="h-48 rounded-xl border border-border/60 bg-muted/20 p-3.5 text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap font-mono">
            {updateData.releaseNotes || t("about.update.available", { version: updateData.latestVersion })}
          </ScrollArea>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2.5 p-4 sm:p-6 pt-2 bg-muted/10 border-t border-border/60">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-9"
            onClick={onClose}
          >
            {t("about.update.laterAction")}
          </Button>
          <Button
            variant="default"
            size="sm"
            className="text-xs h-9 gap-1.5 shadow-sm"
            onClick={handleDownload}
          >
            <ExternalLink className="size-3.5" />
            <span>{t("about.update.downloadAction")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
