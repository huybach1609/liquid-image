import { useTranslation } from "react-i18next";
import { Cpu, Zap } from "lucide-react";

export function BatchSettingsPanel() {
  const { t } = useTranslation("batch");

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          <Cpu className="size-3" />
          {t("settings.performance", "Performance")}
        </label>
        <div className="space-y-4 rounded-lg border border-border/50 p-3 bg-muted/5">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{t("settings.concurrency", "Parallel Workers")}</span>
              <span className="font-medium">4</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="16" 
              defaultValue="4" 
              className="w-full accent-primary h-1.5 bg-muted rounded-lg appearance-none cursor-pointer" 
            />
          </div>
          
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-xs font-medium">{t("settings.gpuTitle", "GPU Acceleration")}</p>
              <p className="text-[10px] text-muted-foreground">{t("settings.gpuDesc", "Use OpenCL when available.")}</p>
            </div>
            <div className="size-5 rounded border-2 border-primary bg-primary/20 flex items-center justify-center">
              <div className="size-2 bg-primary rounded-sm" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-2 border-t border-border/50">
        <label className="flex items-center gap-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          <Zap className="size-3" />
          {t("settings.advanced", "Advanced")}
        </label>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{t("settings.dryRunLimit", "Dry Run Limit")}</span>
            <select className="h-7 rounded border border-input bg-background px-1 text-[11px] focus:outline-none">
              <option>1 {t("common.file", "file")}</option>
              <option>3 {t("common.files", "files")}</option>
              <option>5 {t("common.files", "files")}</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{t("settings.overwrite", "Overwrite Existing")}</span>
            <div className="size-5 rounded border-2 border-border flex items-center justify-center">
              {/* Checkbox mock */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
