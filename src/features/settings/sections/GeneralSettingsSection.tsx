import { useTranslation } from "react-i18next";
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
import type {
  DateFormat,
  FileSizeUnit,
  Language,
  OnErrorPolicy,
  SettingsState,
} from "@/features/settings/types";

interface GeneralSettingsSectionProps {
  draft: SettingsState;
  onUpdateSetting: <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K],
  ) => void;
}

export function GeneralSettingsSection({
  draft,
  onUpdateSetting,
}: GeneralSettingsSectionProps) {
  const { t, i18n } = useTranslation("settings");

  return (
    <>
      <SettingSection label={t("general.sections.languageRegion")}>
        <SettingGroup>
          <SettingRow
            name={t("general.language.name")}
            description="general.language.description"
            descriptionVariant="tooltip"
          >
            <Select
              value={draft.language}
              onValueChange={(v) => {
                const lng = v as Language;
                onUpdateSetting("language", lng);
                void i18n.changeLanguage(lng);
              }}
            >
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">English</span>
                    <span className="text-xs text-muted-foreground font-mono">US</span>
                  </div>
                </SelectItem>
                <SelectItem value="vi">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Tiếng Việt</span>
                    <span className="text-xs text-muted-foreground font-mono">VN</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>

          <SettingRow
            name={t("general.dateFormat.name")}
            description="general.dateFormat.description"
            descriptionVariant="tooltip"
          >
            <Select
              value={draft.dateFormat}
              onValueChange={(v) =>
                onUpdateSetting("dateFormat", v as DateFormat)
              }
            >
              <SelectTrigger className="w-[200px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="YYYY-MM-DD">
                  <span className="font-mono text-xs">YYYY-MM-DD</span>
                  <span className="text-xs text-muted-foreground ml-2">(2026-09-26)</span>
                </SelectItem>
                <SelectItem value="DD-MM-YYYY">
                  <span className="font-mono text-xs">DD-MM-YYYY</span>
                  <span className="text-xs text-muted-foreground ml-2">(26-09-2026)</span>
                </SelectItem>
                <SelectItem value="MM-DD-YYYY">
                  <span className="font-mono text-xs">MM-DD-YYYY</span>
                  <span className="text-xs text-muted-foreground ml-2">(09-26-2026)</span>
                </SelectItem>
                <SelectItem value="YYYYMMDD">
                  <span className="font-mono text-xs">YYYYMMDD</span>
                  <span className="text-xs text-muted-foreground ml-2">(20260926)</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>

          <SettingRow
            name={t("general.fileSizeUnit.name")}
            description="general.fileSizeUnit.description"
            descriptionVariant="tooltip"
          >
            <Select
              value={draft.fileSizeUnit}
              onValueChange={(v) =>
                onUpdateSetting("fileSizeUnit", v as FileSizeUnit)
              }
            >
              <SelectTrigger className="w-[190px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MB_GB">
                  <span>MB / GB</span>
                  <span className="text-xs text-muted-foreground ml-1.5">(1024)</span>
                </SelectItem>
                <SelectItem value="MiB_GiB">
                  <span>MiB / GiB</span>
                  <span className="text-xs text-muted-foreground ml-1.5">(IEC)</span>
                </SelectItem>
                <SelectItem value="KB">
                  <span>KB</span>
                  <span className="text-xs text-muted-foreground ml-1.5">(Kilobytes)</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </SettingGroup>
      </SettingSection>

      <SettingSection label={t("general.sections.batchOptions")}>
        <SettingGroup>
          <SettingRow
            name={t("general.diskCacheLimit.name")}
            description="general.diskCacheLimit.description"
            descriptionVariant="tooltip"
          >
            <Select
              value={draft.diskCacheLimit}
              onValueChange={(v) => onUpdateSetting("diskCacheLimit", v)}
            >
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="512 MB">512 MB</SelectItem>
                <SelectItem value="1 GB">1 GB</SelectItem>
                <SelectItem value="2 GB">2 GB</SelectItem>
                <SelectItem value="Unlimited">Unlimited</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>

          <SettingRow
            name={t("general.dryRunBeforeBatch.name")}
            description="general.dryRunBeforeBatch.description"
            descriptionVariant="tooltip"
          >
            <Switch
              checked={draft.dryRunBeforeBatch}
              onCheckedChange={(v) => onUpdateSetting("dryRunBeforeBatch", v)}
            />
          </SettingRow>

          <SettingRow
            name={t("general.onErrorPolicy.name")}
            description="general.onErrorPolicy.description"
            descriptionVariant="tooltip"
          >
            <Select
              value={draft.onErrorPolicy}
              onValueChange={(v) =>
                onUpdateSetting("onErrorPolicy", v as OnErrorPolicy)
              }
            >
              <SelectTrigger className="w-[220px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="skip-and-continue">
                  {t("general.onErrorPolicies.skip-and-continue")}
                </SelectItem>
                <SelectItem value="stop-all">
                  {t("general.onErrorPolicies.stop-all")}
                </SelectItem>
                <SelectItem value="retry-once">
                  {t("general.onErrorPolicies.retry-once")}
                </SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>

          <SettingRow
            name={t("general.saveErrorLog.name")}
            description="general.saveErrorLog.description"
            descriptionVariant="tooltip"
          >
            <Switch
              checked={draft.saveErrorLog}
              onCheckedChange={(v) => onUpdateSetting("saveErrorLog", v)}
            />
          </SettingRow>
        </SettingGroup>
      </SettingSection>
    </>
  );
}
