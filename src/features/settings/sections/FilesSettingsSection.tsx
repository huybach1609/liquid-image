import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { ConflictPolicy, SettingsState } from "@/features/settings/types";

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
  return (
    <>
      <SettingSection label="Default locations">
        <SettingGroup>
          <div className="p-4 border-b border-border/60">
            <div className="font-semibold mb-1.5">Default output folder</div>
            <div className="text-muted-foreground leading-relaxed mb-3">
              Thư mục mặc định khi lưu file output
            </div>
            <div className="flex gap-3">
              <Input
                value={draft.outputFolder}
                onChange={(e) => onUpdateSetting("outputFolder", e.target.value)}
                className="flex-1 h-9 font-mono bg-muted/20"
              />
              <Button variant="outline" size="sm" className="h-9 px-3 font-medium">
                Browse…
              </Button>
            </div>
          </div>
          <div className="p-4">
            <div className="font-semibold mb-1.5">Default preset folder</div>
            <div className="text-muted-foreground leading-relaxed mb-3">
              Nơi lưu và load pipeline preset
            </div>
            <div className="flex gap-3">
              <Input
                value={draft.presetFolder}
                onChange={(e) => onUpdateSetting("presetFolder", e.target.value)}
                className="flex-1 h-9 font-mono bg-muted/20"
              />
              <Button variant="outline" size="sm" className="h-9 px-3 font-medium">
                Browse…
              </Button>
            </div>
          </div>
        </SettingGroup>
      </SettingSection>

      <SettingSection label="File naming">
        <SettingGroup>
          <SettingRow
            name="Default naming pattern"
            description="Biến: {name} {date} {op} {width} {height}"
          >
            <Input
              value={draft.namingPattern}
              onChange={(e) => onUpdateSetting("namingPattern", e.target.value)}
              className="w-[180px] h-9"
            />
          </SettingRow>
          <SettingRow
            name="On filename conflict"
            description="Khi file đầu ra đã tồn tại"
          >
            <Select
              value={draft.conflictPolicy}
              onValueChange={(v) =>
                onUpdateSetting("conflictPolicy", v as ConflictPolicy)
              }
            >
              <SelectTrigger className="w-[150px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ask">Ask me</SelectItem>
                <SelectItem value="overwrite">Overwrite</SelectItem>
                <SelectItem value="rename">Rename (+1)</SelectItem>
                <SelectItem value="skip">Skip</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
          <SettingRow
            name="Auto-open output folder"
            description="Tự mở Finder/Explorer sau khi xử lý xong"
          >
            <Switch
              checked={draft.autoOpenOutput}
              onCheckedChange={(v) => onUpdateSetting("autoOpenOutput", v)}
            />
          </SettingRow>
        </SettingGroup>
      </SettingSection>
    </>
  );
}
