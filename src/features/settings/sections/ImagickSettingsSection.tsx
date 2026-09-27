import { useTranslation } from "react-i18next";
import {
  SettingGroup,
  SettingRow,
  SettingSection,
} from "@/features/settings/components/SettingUI";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ColorProfile, SettingsState } from "@/features/settings/types";
import { MagickBinaryField } from "../components/MagickBinaryField";
import type { MagickStatus } from "../hooks/useSettingsDraft";

interface ImagickSettingsSectionProps {
  draft: SettingsState;
  magickStatus: MagickStatus | null;
  isTesting: boolean;
  onUpdateSetting: <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K],
  ) => void;
  onBrowseBinary: () => void;
  onDetectBinary: () => void;
  onTestBinary: (path: string) => void;
}

export function ImagickSettingsSection({
  draft,
  magickStatus,
  isTesting,
  onUpdateSetting,
  onBrowseBinary,
  onDetectBinary,
  onTestBinary,
}: ImagickSettingsSectionProps) {
  const { t } = useTranslation("settings");

  return (
    <>
      <SettingSection label={t("imagick.sections.binary")}>
        <SettingGroup>
          <MagickBinaryField
            value={draft.magickBinaryPath}
            status={magickStatus}
            isTesting={isTesting}
            onChange={(value) => onUpdateSetting("magickBinaryPath", value)}
            onDetect={onDetectBinary}
            onBrowse={onBrowseBinary}
            onTest={onTestBinary}
          />
        </SettingGroup>
      </SettingSection>

      <SettingSection label={t("imagick.sections.defaultFlags")}>
        <SettingGroup>
          <SettingRow
            name={t("imagick.stripMetadata.name")}
            description={t("imagick.stripMetadata.description")}
            descriptionVariant="tooltip"
          >
            <Switch
              checked={draft.stripMetadata}
              onCheckedChange={(v) => onUpdateSetting("stripMetadata", v)}
            />
          </SettingRow>
          <SettingRow
            name={t("imagick.colorProfile.name")}
            description={t("imagick.colorProfile.description")}
            descriptionVariant="tooltip"
          >
            <Select
              value={draft.defaultColorProfile}
              onValueChange={(v) =>
                onUpdateSetting("defaultColorProfile", v as ColorProfile)
              }
            >
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sRGB">sRGB</SelectItem>
                <SelectItem value="Adobe RGB">Adobe RGB</SelectItem>
                <SelectItem value="CMYK">CMYK</SelectItem>
                <SelectItem value="None">None</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </SettingGroup>
      </SettingSection>
    </>
  );
}
