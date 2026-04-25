import { useTranslation } from "react-i18next";
import { Cpu, Zap, Settings2 } from "lucide-react";
import { useSettingsStore } from "@/features/settings/state/settings.store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function BatchSettingsPanel() {
  const { t } = useTranslation("batch");
  const { workers, setSetting, onErrorPolicy, namingPattern } = useSettingsStore();

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
              <span className="font-medium">{workers}</span>
            </div>
            <input 
              type="range" 
              min="1" 
              max="16" 
              value={workers} 
              onChange={(e) => setSetting("workers", parseInt(e.target.value))}
              className="w-full accent-primary h-1.5 bg-muted rounded-lg appearance-none cursor-pointer" 
            />
          </div>
          
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <p className="text-xs font-medium">{t("settings.onError", "On Error")}</p>
              <p className="text-[10px] text-muted-foreground">{t("settings.onErrorDesc", "Handling policy for failed items.")}</p>
            </div>
            <Select 
              value={onErrorPolicy}
              onValueChange={(value) => setSetting("onErrorPolicy", value as any)}
            >
              <SelectTrigger className="h-7 text-[11px] min-w-[120px]">
                <SelectValue placeholder={t("settings.onError", "On Error")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="skip-and-continue">{t("settings.skipAndContinue", "Skip and continue")}</SelectItem>
                <SelectItem value="stop-immediately">{t("settings.stopImmediately", "Stop immediately")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-2 border-t border-border/50">
        <label className="flex items-center gap-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          <Settings2 className="size-3" />
          {t("output.naming", "File Naming")}
        </label>
        <div className="space-y-2">
          <Select 
            value={namingPattern.startsWith("{name}") && namingPattern !== "{name}" ? "suffix" : namingPattern.endsWith("{name}") && namingPattern !== "{name}" ? "prefix" : namingPattern === "{counter}" ? "counter" : namingPattern === "{name}" ? "original" : "custom"}
            onValueChange={(value) => {
              const mapping: Record<string, string> = {
                original: "{name}",
                prefix: "out_{name}",
                suffix: "{name}_out",
                counter: "{counter}",
                custom: "{name}"
              };
              setSetting("namingPattern", mapping[value] || "{name}");
            }}
          >
            <SelectTrigger className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
              <SelectValue placeholder={t("output.nameOriginal", "Keep original names")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="original">{t("output.nameOriginal", "Keep original names")}</SelectItem>
              <SelectItem value="prefix">{t("output.namePrefix", "Add prefix")}</SelectItem>
              <SelectItem value="suffix">{t("output.nameSuffix", "Add suffix")}</SelectItem>
              <SelectItem value="counter">{t("output.nameCounter", "Sequential (001...)")}</SelectItem>
              <SelectItem value="custom">{t("output.nameCustom", "Custom Pattern")}</SelectItem>
            </SelectContent>
          </Select>

          {(namingPattern.includes("{name}") && namingPattern !== "{name}") || !namingPattern.includes("{name}") && namingPattern !== "{counter}" ? (
            <input
              type="text"
              value={namingPattern}
              onChange={(e) => setSetting("namingPattern", e.target.value)}
              placeholder="e.g. {name}_processed"
              className="h-8 w-full rounded border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          ) : null}
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
            <Select defaultValue="1">
              <SelectTrigger className="h-7 text-[11px] min-w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 {t("common.file", "file")}</SelectItem>
                <SelectItem value="3">3 {t("common.files", "files")}</SelectItem>
                <SelectItem value="5">5 {t("common.files", "files")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
