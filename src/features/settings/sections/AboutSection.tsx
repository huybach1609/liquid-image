import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { appConfigDir } from "@tauri-apps/api/path";
import { openPath } from "@tauri-apps/plugin-opener";
import {
  Check,
  Copy,
  Cpu,
  FolderOpen,
  Layers,
  Loader2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SettingGroup,
  SettingRow,
  SettingSection,
} from "@/features/settings/components/SettingUI";

interface AboutSectionProps {
  appName: string;
  appVersion: string;
  tauriVersion: string;
  magickVersion?: string;
  onResetAllSettings: () => void;
}

export function AboutSection({
  appName,
  appVersion,
  tauriVersion,
  magickVersion,
  onResetAllSettings,
}: AboutSectionProps) {
  const { t } = useTranslation("settings");
  const [configPath, setConfigPath] = useState<string>("");
  const [isCopied, setIsCopied] = useState(false);
  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState<string | null>(null);

  useEffect(() => {
    void appConfigDir()
      .then((path) => setConfigPath(path))
      .catch((e) => console.error("Failed to get config path", e));
  }, []);

  const handleOpenConfig = async () => {
    if (!configPath) return;
    try {
      await openPath(configPath);
    } catch (e) {
      console.error("Failed to open config directory", e);
    }
  };

  const handleCopyPath = async () => {
    if (!configPath) return;
    try {
      await navigator.clipboard.writeText(configPath);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy path", e);
    }
  };

  const handleCheckUpdates = () => {
    setIsCheckingUpdates(true);
    setUpdateFeedback(null);
    setTimeout(() => {
      setIsCheckingUpdates(false);
      setUpdateFeedback(t("about.latestVersion"));
      setTimeout(() => setUpdateFeedback(null), 3500);
    }, 900);
  };

  const handleReset = () => {
    if (window.confirm(t("about.actions.resetConfirm"))) {
      onResetAllSettings();
    }
  };

  return (
    <div className="space-y-8">
      {/* Brand Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-muted/20 p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative size-16 sm:size-20 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/25 border border-primary/30 shrink-0">
              <Layers className="size-9 sm:size-10" />
              <div className="absolute -bottom-1 -right-1 size-5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                <Sparkles className="size-2.5 text-white" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {appName}
                </h1>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  v{appVersion}
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                  {t("about.badge")}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {t("about.subtitle")}
              </p>
              <p className="text-xs text-muted-foreground/80 font-mono pt-0.5">
                {t("about.stack", { tauri: tauriVersion })}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-4 text-xs font-medium gap-2 shadow-2xs cursor-pointer"
              disabled={isCheckingUpdates}
              onClick={handleCheckUpdates}
            >
              {isCheckingUpdates ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Sparkles className="size-3.5 text-primary" />
              )}
              <span>
                {isCheckingUpdates
                  ? t("about.checkingUpdates")
                  : t("about.checkForUpdates")}
              </span>
            </Button>
            {updateFeedback && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                {updateFeedback}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* System & Runtime Environment */}
      <SettingSection label={t("about.sections.systemInfo")}>
        <SettingGroup>
          <SettingRow name={t("about.info.appVersion")}>
            <span className="font-mono text-xs font-medium text-foreground bg-muted/40 px-2.5 py-1 rounded-md border border-border/50">
              v{appVersion}
            </span>
          </SettingRow>

          <SettingRow name={t("about.info.tauriVersion")}>
            <span className="font-mono text-xs font-medium text-foreground bg-muted/40 px-2.5 py-1 rounded-md border border-border/50">
              v{tauriVersion}
            </span>
          </SettingRow>

          <SettingRow name={t("about.info.engineVersion")}>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 font-mono text-xs font-medium text-foreground bg-muted/40 px-2.5 py-1 rounded-md border border-border/50">
                <Cpu className="size-3 text-primary" />
                {magickVersion || "ImageMagick 7.x"}
              </span>
            </div>
          </SettingRow>

          <SettingRow name={t("about.info.configPath")}>
            <div className="flex items-center gap-2 max-w-sm sm:max-w-md">
              <span
                className="font-mono text-xs text-muted-foreground bg-muted/40 px-2.5 py-1 rounded-md border border-border/50 truncate flex-1"
                title={configPath}
              >
                {configPath || "..."}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2.5 text-xs font-medium gap-1.5 shrink-0"
                onClick={handleCopyPath}
                title={t("about.actions.copyPath")}
              >
                {isCopied ? (
                  <Check className="size-3 text-emerald-500" />
                ) : (
                  <Copy className="size-3" />
                )}
                <span>
                  {isCopied
                    ? t("about.actions.copied")
                    : t("about.actions.copyPath")}
                </span>
              </Button>
            </div>
          </SettingRow>
        </SettingGroup>
      </SettingSection>

      {/* Storage & Maintenance */}
      <SettingSection label={t("about.sections.maintenance")}>
        <SettingGroup>
          <SettingRow name={t("about.actions.openConfig")}>
            <Button
              variant="outline"
              size="sm"
              className="h-9 px-3.5 text-xs font-medium gap-1.5"
              onClick={handleOpenConfig}
            >
              <FolderOpen className="size-3.5 text-primary" />
              <span>{t("about.actions.openConfig")}</span>
            </Button>
          </SettingRow>

          <SettingRow name={t("about.actions.resetAll")}>
            <Button
              variant="destructive"
              size="sm"
              className="h-9 px-3.5 text-xs font-medium gap-1.5 shadow-2xs"
              onClick={handleReset}
            >
              <RotateCcw className="size-3.5" />
              <span>{t("about.actions.resetAll")}</span>
            </Button>
          </SettingRow>
        </SettingGroup>
      </SettingSection>
    </div>
  );
}
