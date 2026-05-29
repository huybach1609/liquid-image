import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  SettingGroup,
  SettingRow,
  SettingSection,
} from "@/features/settings/components/SettingUI";
import type { OnErrorPolicy, PreviewResolution, SettingsState } from "@/features/settings/types";

interface ProcessingSettingsSectionProps {
  draft: SettingsState;
  onUpdateSetting: <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K],
  ) => void;
}

export function ProcessingSettingsSection({
  draft,
  onUpdateSetting,
}: ProcessingSettingsSectionProps) {
  return (
    <>
      <SettingSection label="Performance">
        <SettingGroup>
          <SettingRow
            name="Batch workers"
            description="Số luồng xử lý song song. Khuyến nghị ≤ số CPU cores"
          >
            <Select
              value={draft.workers.toString()}
              onValueChange={(v) => onUpdateSetting("workers", parseInt(v, 10))}
            >
              <SelectTrigger className="w-[120px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 (safe)</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="4">4 (auto)</SelectItem>
                <SelectItem value="8">8</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
          <SettingRow
            name="Memory limit per job"
            description="Giới hạn RAM cho mỗi tiến trình ImageMagick"
          >
            <Select
              value={draft.memoryLimit}
              onValueChange={(v) => onUpdateSetting("memoryLimit", v)}
            >
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="256 MB">256 MB</SelectItem>
                <SelectItem value="512 MB">512 MB</SelectItem>
                <SelectItem value="1 GB">1 GB</SelectItem>
                <SelectItem value="Unlimited">Unlimited</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </SettingGroup>
      </SettingSection>

      <SettingSection label="Preview">
        <SettingGroup>
          <SettingRow
            name="Live preview"
            description="Cập nhật preview real-time khi chỉnh tham số"
          >
            <Switch
              checked={draft.livePreview}
              onCheckedChange={(v) => onUpdateSetting("livePreview", v)}
            />
          </SettingRow>
          <SettingRow
            name="Preview max resolution"
            description="Giảm độ phân giải preview để nhanh hơn"
          >
            <Select
              value={draft.previewMaxResolution}
              onValueChange={(v) =>
                onUpdateSetting("previewMaxResolution", v as PreviewResolution)
              }
            >
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="800px">800px (fast)</SelectItem>
                <SelectItem value="1200px">1200px</SelectItem>
                <SelectItem value="full">Full size</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
          <SettingRow
            name="Dry run before batch"
            description="Kiểm tra trước khi chạy batch thật"
          >
            <Switch
              checked={draft.dryRunBeforeBatch}
              onCheckedChange={(v) => onUpdateSetting("dryRunBeforeBatch", v)}
            />
          </SettingRow>
          <SettingRow
            name="On error policy"
            description="Cách xử lý khi có lỗi trong batch"
          >
            <Select
              value={draft.onErrorPolicy}
              onValueChange={(v) =>
                onUpdateSetting("onErrorPolicy", v as OnErrorPolicy)
              }
            >
              <SelectTrigger className="w-[200px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="skip-and-continue">Skip & continue</SelectItem>
                <SelectItem value="stop-all">Stop all</SelectItem>
                <SelectItem value="retry-once">Retry once</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
          <SettingRow
            name="Save error log"
            description="Ghi log lỗi vào file khi batch thất bại"
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
