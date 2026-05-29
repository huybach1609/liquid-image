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
  return (
    <>
      <SettingSection label="Language & region">
        <SettingGroup>
          <SettingRow
            name="Language"
            description="Ngôn ngữ hiển thị giao diện"
          >
            <Select
              value={draft.language}
              onValueChange={(v) =>
                onUpdateSetting("language", v as Language)
              }
            >
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="vi">Tiếng Việt</SelectItem>
                <SelectItem value="zh">中文 (简体)</SelectItem>
                <SelectItem value="ja">日本語</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
          <SettingRow
            name="Date format"
            description="Dùng trong tên file output khi có {date}"
          >
            <Select
              value={draft.dateFormat}
              onValueChange={(v) =>
                onUpdateSetting("dateFormat", v as DateFormat)
              }
            >
              <SelectTrigger className="w-[160px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                <SelectItem value="MM-DD-YYYY">MM-DD-YYYY</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
          <SettingRow
            name="File size unit"
            description="Cách hiển thị kích thước file trong queue"
          >
            <Select
              value={draft.fileSizeUnit}
              onValueChange={(v) =>
                onUpdateSetting("fileSizeUnit", v as FileSizeUnit)
              }
            >
              <SelectTrigger className="w-[120px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MB_GB">MB / GB</SelectItem>
                <SelectItem value="MiB_GiB">MiB / GiB</SelectItem>
                <SelectItem value="KB">KB</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </SettingGroup>
      </SettingSection>

      <SettingSection label="Batch options">
        <SettingGroup>
          <SettingRow
            name="Disk cache limit"
            description="Giới hạn bộ nhớ đệm trên đĩa cho ImageMagick"
          >
            <Select
              value={draft.diskCacheLimit}
              onValueChange={(v) => onUpdateSetting("diskCacheLimit", v)}
            >
              <SelectTrigger className="w-[140px] h-9">
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
