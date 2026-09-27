import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Check,
  Minus,
  Moon,
  Plus,
  Sliders,
  Sun,
  Terminal,
  Type,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  SettingGroup,
  SettingRow,
  SettingSection,
} from "@/features/settings/components/SettingUI";
import { cn } from "@/lib/utils";
import type { SettingsState, Theme } from "@/features/settings/types";

type ActiveThemeId =
  | "light"
  | "dark"
  | "claude"
  | "claude-dark"
  | "notion"
  | "notion-dark"
  | "starbucks"
  | "starbucks-dark";

interface ThemeConfig {
  id: ActiveThemeId;
  isDark: boolean;
  bgClass: string;
  previewBg: string;
  accentClass: string;
  dotColor: string;
}

const THEMES: ThemeConfig[] = [
  {
    id: "light",
    isDark: false,
    bgClass: "bg-[#f5f5f3] text-[#18181b]",
    previewBg: "bg-white border-[#e4e4e7]",
    accentClass: "bg-[#18181b] text-white",
    dotColor: "bg-[#d4d4d8]",
  },
  {
    id: "dark",
    isDark: true,
    bgClass: "bg-[#16162a] text-[#f4f4f5]",
    previewBg: "bg-[#1a1a2e] border-[#27273a]",
    accentClass: "bg-[#6366f1] text-white",
    dotColor: "bg-[#3f3f56]",
  },
  {
    id: "claude",
    isDark: false,
    bgClass: "bg-[#faf9f5] text-[#181715]",
    previewBg: "bg-[#ffffff] border-[#e8e6df]",
    accentClass: "bg-[#cc785c] text-white",
    dotColor: "bg-[#d9d6ce]",
  },
  {
    id: "claude-dark",
    isDark: true,
    bgClass: "bg-[#181715] text-[#faf9f5]",
    previewBg: "bg-[#22201d] border-[#34322e]",
    accentClass: "bg-[#cc785c] text-white",
    dotColor: "bg-[#45423d]",
  },
  {
    id: "notion",
    isDark: false,
    bgClass: "bg-[#ffffff] text-[#191919]",
    previewBg: "bg-[#f7f6f3] border-[#e9e8e5]",
    accentClass: "bg-[#0075de] text-white",
    dotColor: "bg-[#d3d2cf]",
  },
  {
    id: "notion-dark",
    isDark: true,
    bgClass: "bg-[#191919] text-[#ffffff]",
    previewBg: "bg-[#222222] border-[#333333]",
    accentClass: "bg-[#0075de] text-white",
    dotColor: "bg-[#444444]",
  },
  {
    id: "starbucks",
    isDark: false,
    bgClass: "bg-[#f2f0eb] text-[#1E3932]",
    previewBg: "bg-[#ffffff] border-[#dedad2]",
    accentClass: "bg-[#006241] text-white",
    dotColor: "bg-[#c5c1b8]",
  },
  {
    id: "starbucks-dark",
    isDark: true,
    bgClass: "bg-[#1E3932] text-[#f2f0eb]",
    previewBg: "bg-[#162a25] border-[#29483f]",
    accentClass: "bg-[#00754A] text-white",
    dotColor: "bg-[#2c5247]",
  },
];

const FONT_PRESETS = [
  { labelKey: "appearance.fontSize.presets.compact", size: 12 },
  { labelKey: "appearance.fontSize.presets.default", size: 13.5 },
  { labelKey: "appearance.fontSize.presets.comfortable", size: 15 },
  { labelKey: "appearance.fontSize.presets.large", size: 16.5 },
] as const;

interface AppearanceSettingsSectionProps {
  draft: SettingsState;
  onThemeChange: (theme: Theme) => void;
  onUpdateSetting: <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K],
  ) => void;
}

export function AppearanceSettingsSection({
  draft,
  onThemeChange,
  onUpdateSetting,
}: AppearanceSettingsSectionProps) {
  const { t } = useTranslation("settings");
  const [filterMode, setFilterMode] = useState<"all" | "light" | "dark">("all");

  const filteredThemes = useMemo(() => {
    if (filterMode === "light") return THEMES.filter((t) => !t.isDark);
    if (filterMode === "dark") return THEMES.filter((t) => t.isDark);
    return THEMES;
  }, [filterMode]);

  const handleStepFontSize = (delta: number) => {
    const current = draft.fontSize || 13.5;
    const next = Math.min(18, Math.max(11, Math.round((current + delta) * 10) / 10));
    onUpdateSetting("fontSize", next);
  };

  return (
    <div className="space-y-8">
      {/* Theme Section */}
      <SettingSection label={t("appearance.sections.theme")}>
        <SettingGroup>
          <div className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-sm leading-tight text-foreground">
                  {t("appearance.theme.title")}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {t("appearance.theme.subtitle")}
                </div>
              </div>

              {/* Theme Filter Tabs */}
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-muted/50 border border-border/50 shrink-0 w-fit">
                <button
                  type="button"
                  onClick={() => setFilterMode("all")}
                  className={cn(
                    "px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer",
                    filterMode === "all"
                      ? "bg-background text-foreground shadow-2xs font-semibold"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t("appearance.theme.modes.all")}
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode("light")}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer",
                    filterMode === "light"
                      ? "bg-background text-foreground shadow-2xs font-semibold"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Sun className="size-3 text-amber-500" />
                  <span>{t("appearance.theme.modes.light")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFilterMode("dark")}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all cursor-pointer",
                    filterMode === "dark"
                      ? "bg-background text-foreground shadow-2xs font-semibold"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Moon className="size-3 text-indigo-400" />
                  <span>{t("appearance.theme.modes.dark")}</span>
                </button>
              </div>
            </div>

            {/* Themes Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-1">
              {filteredThemes.map((theme) => {
                const isSelected = draft.theme === theme.id;
                const themeName = t(`appearance.theme.items.${theme.id}.name` as any) as string;
                const themeDesc = t(`appearance.theme.items.${theme.id}.desc` as any) as string;

                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => onThemeChange(theme.id)}
                    className={cn(
                      "group relative overflow-hidden rounded-xl border p-3 text-left transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      isSelected
                        ? "border-primary bg-primary/[0.04] ring-2 ring-primary/20 shadow-xs"
                        : "border-border/60 hover:border-primary/40 hover:bg-muted/20 hover:shadow-2xs",
                    )}
                  >
                    {/* Simulated Mini App Window */}
                    <div
                      className={cn(
                        "h-14 rounded-lg p-2 flex flex-col justify-between border border-border/40 overflow-hidden relative mb-2.5 shadow-2xs transition-transform duration-150 group-hover:scale-[1.02]",
                        theme.bgClass,
                      )}
                    >
                      <div className="flex items-center gap-1">
                        <div className={cn("size-1.5 rounded-full", theme.dotColor)} />
                        <div className={cn("size-1.5 rounded-full", theme.dotColor)} />
                        <div className={cn("size-1.5 rounded-full", theme.dotColor)} />
                      </div>

                      <div className="flex items-end justify-between gap-1.5">
                        <div
                          className={cn(
                            "h-2.5 w-12 rounded-xs border shadow-2xs",
                            theme.previewBg,
                          )}
                        />
                        <div
                          className={cn(
                            "h-3.5 px-1.5 rounded-xs flex items-center text-[9px] font-bold font-mono tracking-tight shadow-2xs",
                            theme.accentClass,
                          )}
                        >
                          Aa
                        </div>
                      </div>
                    </div>

                    {/* Theme Label & Description */}
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                        <span>{themeName}</span>
                        {theme.isDark ? (
                          <Moon className="size-3 text-muted-foreground/60 shrink-0" />
                        ) : (
                          <Sun className="size-3 text-muted-foreground/60 shrink-0" />
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1 leading-snug">
                        {themeDesc}
                      </div>
                    </div>

                    {/* Active Check Badge */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 size-5 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-xs animate-in zoom-in-75 duration-150">
                        <Check className="size-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </SettingGroup>
      </SettingSection>

      {/* Typography & Scaling */}
      <SettingSection label={t("appearance.sections.typography")}>
        <SettingGroup>
          <div className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Type className="size-4 text-primary shrink-0" />
                  <span className="font-semibold text-sm text-foreground">
                    {t("appearance.fontSize.name")}
                  </span>
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                    {draft.fontSize || 13.5}px
                  </span>
                </div>
              </div>

              {/* Stepper Controls */}
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-muted/40 border border-border/50 shrink-0 w-fit">
                <Button
                  variant="outline"
                  size="sm"
                  className="size-8 p-0 cursor-pointer"
                  disabled={(draft.fontSize || 13.5) <= 11}
                  onClick={() => handleStepFontSize(-0.5)}
                  title="Decrease font size"
                >
                  <Minus className="size-3.5" />
                </Button>

                <div className="w-14 text-center font-mono text-xs font-semibold text-foreground">
                  {draft.fontSize || 13.5}px
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="size-8 p-0 cursor-pointer"
                  disabled={(draft.fontSize || 13.5) >= 18}
                  onClick={() => handleStepFontSize(0.5)}
                  title="Increase font size"
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>
            </div>

            {/* Presets and Live Type Specimen */}
            <div className="pt-2 border-t border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                {FONT_PRESETS.map((preset) => {
                  const isCurrent = Math.abs((draft.fontSize || 13.5) - preset.size) < 0.1;
                  return (
                    <button
                      key={preset.size}
                      type="button"
                      onClick={() => onUpdateSetting("fontSize", preset.size)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-medium transition-all border cursor-pointer",
                        isCurrent
                          ? "bg-primary text-primary-foreground border-primary font-semibold shadow-2xs"
                          : "bg-muted/30 text-muted-foreground hover:bg-muted border-border/60 hover:text-foreground",
                      )}
                    >
                      <span>{t(preset.labelKey)}</span>
                      <span className="ml-1 opacity-70 font-mono text-[10px]">
                        ({preset.size}px)
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Live Specimen Preview */}
              <div className="px-3 py-1.5 rounded-lg bg-muted/20 border border-border/40 text-muted-foreground max-w-xs truncate text-right">
                <span
                  style={{ fontSize: `${Math.min(16, Math.max(12, draft.fontSize || 13.5))}px` }}
                  className="font-medium text-foreground transition-all duration-150 inline-block truncate"
                >
                  {t("appearance.fontSize.preview")}
                </span>
              </div>
            </div>
          </div>
        </SettingGroup>
      </SettingSection>

      {/* Interface Layout */}
      <SettingSection label={t("appearance.sections.layout")}>
        <SettingGroup>
          <SettingRow
            name={
              <div className="flex items-center gap-2">
                <Terminal className="size-4 text-primary shrink-0" />
                <span>{t("appearance.showCliPreview.name")}</span>
              </div>
            }
            description="appearance.showCliPreview.description"
          >
            <Switch
              checked={draft.showCliPreview}
              onCheckedChange={(v) => onUpdateSetting("showCliPreview", v)}
            />
          </SettingRow>

          <SettingRow
            name={
              <div className="flex items-center gap-2">
                <Sliders className="size-4 text-primary shrink-0" />
                <span>{t("appearance.showMetadata.name")}</span>
              </div>
            }
            description="appearance.showMetadata.description"
          >
            <Switch
              checked={draft.showMetadata}
              onCheckedChange={(v) => onUpdateSetting("showMetadata", v)}
            />
          </SettingRow>
        </SettingGroup>
      </SettingSection>
    </div>
  );
}
