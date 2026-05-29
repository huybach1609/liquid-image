import {
  SettingGroup,
  SettingRow,
  SettingSection,
} from "@/features/settings/components/SettingUI";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  return (
    <>
      <SettingSection label="Binary">
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

      <SettingSection label="Default flags">
        <SettingGroup>
          <SettingRow
            name="Strip metadata by default"
            description="Thêm -strip vào mọi lệnh"
          >
            <Switch
              checked={draft.stripMetadata}
              onCheckedChange={(v) => onUpdateSetting("stripMetadata", v)}
            />
          </SettingRow>
          <SettingRow
            name="Color profile"
            description="Profile màu mặc định cho output"
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
