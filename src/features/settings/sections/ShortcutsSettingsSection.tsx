import {
  SettingGroup,
  SettingRow,
  SettingSection,
} from "@/features/settings/components/SettingUI";

export function ShortcutsSettingsSection() {
  return (
    <SettingSection label="Global shortcuts">
      <SettingGroup>
        <SettingRow name="Run batch">
          <kbd className="px-2.5 py-1 rounded-md border border-border bg-muted/50 font-mono shadow-sm">
            ⌘ R
          </kbd>
        </SettingRow>
        <SettingRow name="Open file(s)">
          <kbd className="px-2.5 py-1 rounded-md border border-border bg-muted/50 font-mono shadow-sm">
            ⌘ O
          </kbd>
        </SettingRow>
        <SettingRow name="Save preset">
          <kbd className="px-2.5 py-1 rounded-md border border-border bg-muted/50 font-mono shadow-sm">
            ⌘ S
          </kbd>
        </SettingRow>
      </SettingGroup>
    </SettingSection>
  );
}
