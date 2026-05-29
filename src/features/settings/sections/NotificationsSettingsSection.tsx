import { Switch } from "@/components/ui/switch";
import {
  SettingGroup,
  SettingRow,
  SettingSection,
} from "@/features/settings/components/SettingUI";
import type { SettingsState } from "@/features/settings/types";

interface NotificationsSettingsSectionProps {
  draft: SettingsState;
  onUpdateSetting: <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K],
  ) => void;
}

export function NotificationsSettingsSection({
  draft,
  onUpdateSetting,
}: NotificationsSettingsSectionProps) {
  return (
    <SettingSection label="System notifications">
      <SettingGroup>
        <SettingRow
          name="Batch completed"
          description="Thông báo khi toàn bộ batch xử lý xong"
        >
          <Switch
            checked={draft.notifyBatchComplete}
            onCheckedChange={(v) => onUpdateSetting("notifyBatchComplete", v)}
          />
        </SettingRow>
        <SettingRow
          name="Error occurred"
          description="Thông báo khi có file bị lỗi trong batch"
        >
          <Switch
            checked={draft.notifyError}
            onCheckedChange={(v) => onUpdateSetting("notifyError", v)}
          />
        </SettingRow>
        <SettingRow name="Play sound" description="Phát âm thanh kèm thông báo">
          <Switch
            checked={draft.playSound}
            onCheckedChange={(v) => onUpdateSetting("playSound", v)}
          />
        </SettingRow>
      </SettingGroup>
    </SettingSection>
  );
}
