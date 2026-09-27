import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { open } from "@tauri-apps/plugin-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  SettingGroup,
  SettingRow,
  SettingSection,
} from "@/features/settings/components/SettingUI";
import { cn } from "@/lib/utils";
import type { ConflictPolicy, SettingsState } from "@/features/settings/types";
import {
  checkDolphinIntegrationStatus,
  registerDolphinServiceMenu,
  unregisterDolphinServiceMenu,
  getImageFormatInfo,
  getCachedImageFormatInfo,
  type DolphinIntegrationStatus,
} from "@/shared/tauri/commands";
import type { MagickFormatInfo } from "@/shared/types/magick";
import { Check, X } from "lucide-react";

const AVAILABLE_PRESET_FORMATS = ["webp", "png", "jpeg", "avif", "gif", "tiff", "bmp"];

interface FilesSettingsSectionProps {
  draft: SettingsState;
  onUpdateSetting: <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K],
  ) => void;
}

export function FilesSettingsSection({
  draft,
  onUpdateSetting,
}: FilesSettingsSectionProps) {
  const { t } = useTranslation("settings");
  const [dolphinStatus, setDolphinStatus] = useState<DolphinIntegrationStatus | null>(null);
  const [isOperating, setIsOperating] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const loadStatus = async () => {
    try {
      const res = await checkDolphinIntegrationStatus();
      setDolphinStatus(res);
    } catch (e) {
      console.error("[settings] failed to check dolphin status", e);
    }
  };

  useEffect(() => {
    void loadStatus();
  }, []);

  const [formatCatalog, setFormatCatalog] = useState<MagickFormatInfo[]>(
    () => getCachedImageFormatInfo() ?? [],
  );

  useEffect(() => {
    let cancelled = false;
    void getImageFormatInfo()
      .then((results) => {
        if (!cancelled) {
          setFormatCatalog(results);
        }
      })
      .catch((error) => {
        console.error("[settings] failed to load format catalog", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const formatOptions = useMemo(() => {
    const catalogByName = new Map<string, MagickFormatInfo>();

    for (const format of formatCatalog) {
      if (!format.mode.toLowerCase().includes("w")) continue;
      const name = format.name.trim().toUpperCase();
      if (!name || name.startsWith("*")) continue;
      if (!catalogByName.has(name)) {
        catalogByName.set(name, { ...format, name });
      }
    }

    for (const preset of AVAILABLE_PRESET_FORMATS) {
      const upper = preset.toUpperCase();
      if (!catalogByName.has(upper)) {
        catalogByName.set(upper, {
          name: upper,
          module: "IMAGE",
          mode: "rw+",
          description: `${upper} image format`,
        });
      }
    }

    const ordered = Array.from(catalogByName.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    return {
      catalogByName,
      names: ordered.map((format) => format.name),
    };
  }, [formatCatalog]);

  const selectedFormats = useMemo(() => {
    return (draft.contextMenuFormats || []).map((f) => f.toLowerCase());
  }, [draft.contextMenuFormats]);

  const handleToggleFormat = (fmt: string) => {
    const clean = fmt.trim().toLowerCase();
    if (!clean) return;
    const current = (draft.contextMenuFormats || []).map((f) => f.toLowerCase());
    const next = current.includes(clean)
      ? current.filter((f) => f !== clean)
      : [...current, clean];
    onUpdateSetting("contextMenuFormats", next);
  };

  const handleBrowseOutputFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        defaultPath: draft.outputFolder || undefined,
      });
      if (selected && typeof selected === "string") {
        onUpdateSetting("outputFolder", selected);
      }
    } catch (e) {
      console.error("Browse output folder error", e);
    }
  };

  const handleBrowsePresetFolder = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        defaultPath: draft.presetFolder || undefined,
      });
      if (selected && typeof selected === "string") {
        onUpdateSetting("presetFolder", selected);
      }
    } catch (e) {
      console.error("Browse preset folder error", e);
    }
  };

  const handleRegisterDolphin = async () => {
    setIsOperating(true);
    setActionFeedback(null);
    try {
      const path = await registerDolphinServiceMenu(draft.contextMenuFormats || []);
      setActionFeedback(t("files.contextMenu.installSuccess", { path }));
      await loadStatus();
    } catch (err: any) {
      setActionFeedback(
        t("files.contextMenu.installError", {
          error: err?.message || String(err),
        }),
      );
    } finally {
      setIsOperating(false);
    }
  };

  const handleUnregisterDolphin = async () => {
    setIsOperating(true);
    setActionFeedback(null);
    try {
      await unregisterDolphinServiceMenu();
      setActionFeedback(t("files.contextMenu.uninstallSuccess"));
      await loadStatus();
    } catch (err: any) {
      setActionFeedback(
        t("files.contextMenu.uninstallError", {
          error: err?.message || String(err),
        }),
      );
    } finally {
      setIsOperating(false);
    }
  };

  const contextMenuTitle =
    dolphinStatus?.platform === "windows"
      ? t("files.contextMenu.windowsTitle")
      : dolphinStatus?.platform === "linux"
      ? t("files.contextMenu.linuxTitle")
      : t("files.contextMenu.genericTitle");

  const contextMenuDescription =
    dolphinStatus?.platform === "windows"
      ? t("files.contextMenu.windowsDescription")
      : dolphinStatus?.platform === "linux"
      ? t("files.contextMenu.linuxDescription")
      : t("files.contextMenu.genericDescription");

  const contextMenuSubtitle =
    dolphinStatus?.platform === "windows"
      ? t("files.contextMenu.windowsSubtitle")
      : dolphinStatus?.platform === "linux"
      ? t("files.contextMenu.linuxSubtitle")
      : t("files.contextMenu.genericSubtitle");

  return (
    <>
      <SettingSection label={t("files.sections.locations")}>
        <SettingGroup>
          <SettingRow
            name={t("files.outputFolder.name")}
            description={t("files.outputFolder.description")}
          >
            <div className="flex items-center gap-2 w-full max-w-sm sm:w-[320px]">
              <Input
                value={draft.outputFolder}
                placeholder={t("files.outputFolder.placeholder")}
                onChange={(e) => onUpdateSetting("outputFolder", e.target.value)}
                className="flex-1 h-9 font-mono bg-muted/20 text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 font-medium shrink-0"
                onClick={handleBrowseOutputFolder}
              >
                {t("files.browse")}
              </Button>
            </div>
          </SettingRow>

          <SettingRow
            name={t("files.presetFolder.name")}
            description={t("files.presetFolder.description")}
          >
            <div className="flex items-center gap-2 w-full max-w-sm sm:w-[320px]">
              <Input
                value={draft.presetFolder}
                placeholder={t("files.presetFolder.placeholder")}
                onChange={(e) => onUpdateSetting("presetFolder", e.target.value)}
                className="flex-1 h-9 font-mono bg-muted/20 text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 font-medium shrink-0"
                onClick={handleBrowsePresetFolder}
              >
                {t("files.browse")}
              </Button>
            </div>
          </SettingRow>
        </SettingGroup>
      </SettingSection>

      <SettingSection label={t("files.sections.naming")}>
        <SettingGroup>
          <SettingRow
            name={t("files.namingPattern.name")}
            description={t("files.namingPattern.description")}
          >
            <div className="flex flex-col items-end gap-1.5">
              <Input
                value={draft.namingPattern}
                onChange={(e) => onUpdateSetting("namingPattern", e.target.value)}
                className="w-[220px] h-9 font-mono text-xs"
              />
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <span className="opacity-70">{t("files.variables", { defaultValue: "Insert:" })}</span>
                {["{name}", "{counter}", "{date}", "{op}"].map((variable) => (
                  <button
                    key={variable}
                    type="button"
                    onClick={() => {
                      if (!draft.namingPattern.includes(variable)) {
                        onUpdateSetting(
                          "namingPattern",
                          draft.namingPattern ? `${draft.namingPattern}_${variable}` : variable
                        );
                      }
                    }}
                    className="font-mono px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80 border border-border/50 text-foreground transition-colors cursor-pointer"
                  >
                    {variable}
                  </button>
                ))}
              </div>
            </div>
          </SettingRow>
          <SettingRow
            name={t("files.conflictPolicy.name")}
            description={t("files.conflictPolicy.description")}
          >
            <Select
              value={draft.conflictPolicy}
              onValueChange={(v) =>
                onUpdateSetting("conflictPolicy", v as ConflictPolicy)
              }
            >
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ask">{t("files.conflictOptions.ask")}</SelectItem>
                <SelectItem value="overwrite">{t("files.conflictOptions.overwrite")}</SelectItem>
                <SelectItem value="rename">{t("files.conflictOptions.rename")}</SelectItem>
                <SelectItem value="skip">{t("files.conflictOptions.skip")}</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
          <SettingRow
            name={t("files.autoOpenOutput.name")}
            description={t("files.autoOpenOutput.description")}
          >
            <Switch
              checked={draft.autoOpenOutput}
              onCheckedChange={(v) => onUpdateSetting("autoOpenOutput", v)}
            />
          </SettingRow>
        </SettingGroup>
      </SettingSection>

      <SettingSection label={t("files.sections.contextMenu")}>
        <SettingGroup>
          <SettingRow
            name={contextMenuTitle}
            description={contextMenuDescription}
          >
            <Switch
              checked={draft.contextMenuEnabled}
              onCheckedChange={(v) => onUpdateSetting("contextMenuEnabled", v)}
            />
          </SettingRow>

          {draft.contextMenuEnabled ? (
            <>
              <div className="p-4 border-t border-border/60 space-y-4">
                <div>
                  <div className="font-semibold mb-1 text-sm">
                    {t("files.contextMenu.quickFormatsTitle")}
                  </div>
                  <div className="text-muted-foreground text-xs leading-relaxed">
                    {contextMenuSubtitle}
                  </div>
                </div>

                {/* Danh sách các định dạng đã chọn */}
                <div className="space-y-1.5">
                  <div className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                    <span>
                      {t("files.contextMenu.enabledFormats", {
                        count: selectedFormats.length,
                      })}
                    </span>
                    {selectedFormats.length > 0 && (
                      <button
                        type="button"
                        onClick={() => onUpdateSetting("contextMenuFormats", [])}
                        className="text-[11px] text-muted-foreground hover:text-destructive transition-colors cursor-pointer"
                      >
                        {t("files.contextMenu.clearAll")}
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 items-center min-h-[36px] p-2 rounded-md bg-muted/20 border border-border/40">
                    {selectedFormats.length > 0 ? (
                      selectedFormats.map((fmt) => (
                        <span
                          key={fmt}
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 text-xs font-mono font-semibold uppercase tracking-wide"
                        >
                          {fmt}
                          <button
                            type="button"
                            onClick={() => handleToggleFormat(fmt)}
                            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors cursor-pointer"
                            title={t("files.contextMenu.deselect", {
                              format: fmt.toUpperCase(),
                            })}
                          >
                            <X className="size-3" />
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic px-1">
                        {t("files.contextMenu.noFormatsSelected")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Định dạng phổ biến */}
                <div className="space-y-1.5">
                  <div className="text-xs font-medium text-muted-foreground">
                    {t("files.contextMenu.quickPresets")}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {AVAILABLE_PRESET_FORMATS.map((fmt) => {
                      const isSelected = selectedFormats.includes(fmt);
                      return (
                        <button
                          key={fmt}
                          type="button"
                          onClick={() => handleToggleFormat(fmt)}
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-medium uppercase transition-colors border cursor-pointer",
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary shadow-xs"
                              : "bg-muted/40 text-muted-foreground hover:bg-muted border-border",
                          )}
                        >
                          {isSelected && <Check className="size-3" />}
                          {fmt}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Combobox query từ ImageMagick format capability */}
                <div className="space-y-1.5">
                  <div className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                    <span>
                      {t("files.contextMenu.searchFormats", {
                        count: formatOptions.names.length,
                      })}
                    </span>
                  </div>
                  <Combobox
                    items={formatOptions.names}
                    value=""
                    onValueChange={(val) => {
                      if (val) {
                        handleToggleFormat(val);
                      }
                    }}
                  >
                    <ComboboxInput
                      className="w-full"
                      placeholder={t("files.contextMenu.searchPlaceholder")}
                    />
                    <ComboboxContent className="max-h-60 overflow-y-auto">
                      <ComboboxEmpty>
                        {t("files.contextMenu.noMatchingFormats")}
                      </ComboboxEmpty>
                      <ComboboxList>
                        {(item) => {
                          const name = item as string;
                          const format = formatOptions.catalogByName.get(name);
                          const isSelected = selectedFormats.includes(
                            name.toLowerCase(),
                          );
                          return (
                            <ComboboxItem key={name} value={name}>
                              <div className="flex w-full items-center justify-between gap-3">
                                <div className="flex flex-col gap-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium font-mono">
                                      {name}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground font-mono">
                                      {format?.mode ?? "rw+"}
                                    </span>
                                  </div>
                                  <span className="line-clamp-1 text-xs text-muted-foreground/80">
                                    {format?.description ||
                                      format?.module ||
                                      "Image format"}
                                  </span>
                                </div>
                                {isSelected && (
                                  <Check className="size-4 text-primary shrink-0" />
                                )}
                              </div>
                            </ComboboxItem>
                          );
                        }}
                      </ComboboxList>
                    </ComboboxContent>
                  </Combobox>
                </div>
              </div>

              <div className="p-4 border-t border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-xs">
                  <div className="font-medium text-foreground">
                    {t("files.contextMenu.systemStatus")}{" "}
                    {dolphinStatus?.isRegistered ? (
                      <span className="text-emerald-500 font-semibold">
                        {dolphinStatus?.platform === "windows"
                          ? t("files.contextMenu.registeredRegistry")
                          : t("files.contextMenu.registeredServiceMenu")}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        {t("files.contextMenu.notRegistered")}
                      </span>
                    )}
                  </div>
                  {dolphinStatus?.installedPath ? (
                    <div className="text-muted-foreground text-[11px] font-mono mt-0.5 truncate max-w-[360px]">
                      {dolphinStatus.installedPath}
                    </div>
                  ) : null}
                  {actionFeedback ? (
                    <div className="text-primary text-xs mt-1 font-medium">
                      {actionFeedback}
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isOperating}
                    onClick={handleRegisterDolphin}
                  >
                    {isOperating
                      ? t("files.contextMenu.processing")
                      : t("files.contextMenu.installOrUpdate")}
                  </Button>
                  {dolphinStatus?.isRegistered ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10"
                      disabled={isOperating}
                      onClick={handleUnregisterDolphin}
                    >
                      {t("files.contextMenu.uninstall")}
                    </Button>
                  ) : null}
                </div>
              </div>
            </>
          ) : null}
        </SettingGroup>
      </SettingSection>
    </>
  );
}
