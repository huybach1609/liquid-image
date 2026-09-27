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
          description="notifications.notifyBatchComplete.description"
        >
          <Switch
            checked={draft.notifyBatchComplete}
            onCheckedChange={(v) => onUpdateSetting("notifyBatchComplete", v)}
          />
        </SettingRow>
        <SettingRow
          name="Error occurred"
          description="notifications.notifyError.description"
        >
          <Switch
            checked={draft.notifyError}
            onCheckedChange={(v) => onUpdateSetting("notifyError", v)}
          />
        </SettingRow>
        <SettingRow
          name="Play sound"
          description="notifications.playSound.description"
        >
          <Switch
            checked={draft.playSound}
            onCheckedChange={(v) => onUpdateSetting("playSound", v)}
          />
        </SettingRow>
      </SettingGroup>
    </SettingSection>
  );
}
