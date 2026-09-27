import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { MagickStatus } from "../hooks/useSettingsDraft";
import { Cpu, CheckCircle2, FolderOpen, Loader2, Sparkles, Terminal } from "lucide-react";

interface MagickBinaryFieldProps {
  value: string;
  status: MagickStatus | null;
  isTesting: boolean;
  onChange: (value: string) => void;
  onDetect: () => void;
  onBrowse: () => void;
  onTest: (path: string) => void;
}

export function MagickBinaryField({
  value,
  status,
  isTesting,
  onChange,
  onDetect,
  onBrowse,
  onTest,
}: MagickBinaryFieldProps) {
  const { t } = useTranslation("settings");
  const isSidecar = status?.type === "sidecar";

  return (
    <div className="p-5 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Cpu className="size-5" />
          </div>
          <div>
            <div className="font-semibold text-sm leading-tight">
              {t("imagick.binary.title")}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {t("imagick.binary.subtitle")}
            </div>
          </div>
        </div>

        {status && (
          <div
            className={cn(
              "inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border shrink-0 w-fit",
              isSidecar
                ? "bg-primary/10 text-primary border-primary/20"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
            )}
          >
            {isSidecar ? (
              <Sparkles className="size-3.5" />
            ) : (
              <Terminal className="size-3.5" />
            )}
            <span>
              {isSidecar
                ? t("imagick.binary.sidecarBadge")
                : t("imagick.binary.customBadge")}
            </span>
          </div>
        )}
      </div>

      <div className="rounded-lg bg-muted/30 border border-border/50 p-3.5 space-y-2 text-xs">
        <p className="text-muted-foreground leading-relaxed">
          {isSidecar
            ? t("imagick.binary.sidecarDesc")
            : t("imagick.binary.customDesc")}
        </p>
        {status?.version && (
          <div className="flex items-center gap-2 pt-1 border-t border-border/40">
            <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
            <span className="text-muted-foreground">
              {t("imagick.binary.detected", { version: status.version })}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="relative flex-1">
          <Input
            value={value}
            placeholder={t("imagick.binary.placeholder")}
            onChange={(e) => onChange(e.target.value)}
            className="w-full h-9 font-mono text-xs bg-muted/20 pr-8"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {value && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3 text-xs font-medium"
              onClick={onDetect}
            >
              {t("imagick.binary.useBundled")}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className="h-9 px-3 text-xs font-medium gap-1.5"
            onClick={onBrowse}
          >
            <FolderOpen className="size-3.5" />
            <span>{t("imagick.binary.browse")}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            className={cn(
              "h-9 px-3.5 text-xs font-medium gap-1.5",
              isTesting && "opacity-60 cursor-not-allowed",
            )}
            disabled={!value || isTesting}
            onClick={() => onTest(value)}
          >
            {isTesting && <Loader2 className="size-3.5 animate-spin" />}
            <span>
              {isTesting
                ? t("imagick.binary.testing")
                : t("imagick.binary.test")}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
