import { useEffect, useState } from "react";
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
import {
  checkDolphinIntegrationStatus,
  registerDolphinServiceMenu,
  unregisterDolphinServiceMenu,
  type DolphinIntegrationStatus,
} from "@/shared/tauri/commands";

const AVAILABLE_FORMATS = ["webp", "png", "jpeg", "avif", "gif", "tiff", "bmp"];

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

  const handleToggleFormat = (fmt: string) => {
    const current = draft.contextMenuFormats || [];
    const next = current.includes(fmt)
      ? current.filter((f) => f !== fmt)
      : [...current, fmt];
    onUpdateSetting("contextMenuFormats", next);
  };

  const handleRegisterDolphin = async () => {
    setIsOperating(true);
    setActionFeedback(null);
    try {
      const path = await registerDolphinServiceMenu(draft.contextMenuFormats || []);
      setActionFeedback(`Đã cài đặt ServiceMenu thành công (${path})`);
      await loadStatus();
    } catch (err: any) {
      setActionFeedback(`Lỗi cài đặt: ${err?.message || err}`);
    } finally {
      setIsOperating(false);
    }
  };

  const handleUnregisterDolphin = async () => {
    setIsOperating(true);
    setActionFeedback(null);
    try {
      await unregisterDolphinServiceMenu();
      setActionFeedback(`Đã gỡ bỏ ServiceMenu.`);
      await loadStatus();
    } catch (err: any) {
      setActionFeedback(`Lỗi gỡ bỏ: ${err?.message || err}`);
    } finally {
      setIsOperating(false);
    }
  };
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

      <SettingSection label="File Explorer & Context Menu">
        <SettingGroup>
          <SettingRow
            name={
              dolphinStatus?.platform === "windows"
                ? "Windows File Explorer Menu"
                : dolphinStatus?.platform === "linux"
                ? "Dolphin / File Manager Menu"
                : "File Manager Menu"
            }
            description={
              dolphinStatus?.platform === "windows"
                ? "Tích hợp menu chuột phải khi click vào file ảnh trong Windows File Explorer (Registry HKCU)"
                : "Tích hợp menu chuột phải khi click vào file ảnh trong Dolphin (KDE Linux ServiceMenu)"
            }
          >
            <Switch
              checked={draft.contextMenuEnabled}
              onCheckedChange={(v) => onUpdateSetting("contextMenuEnabled", v)}
            />
          </SettingRow>

          {draft.contextMenuEnabled ? (
            <>
              <div className="p-4 border-t border-border/60">
                <div className="font-semibold mb-1 text-sm">Định dạng chuyển đổi nhanh (Quick Convert Formats)</div>
                <div className="text-muted-foreground text-xs leading-relaxed mb-3">
                  {dolphinStatus?.platform === "windows"
                    ? "Chọn các định dạng bạn muốn hiển thị trong menu ngữ cảnh chuột phải của Windows File Explorer."
                    : "Chọn các định dạng bạn muốn hiển thị trong menu ngữ cảnh chuột phải của Dolphin."}
                </div>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_FORMATS.map((fmt) => {
                    const isSelected = (draft.contextMenuFormats || []).includes(fmt);
                    return (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => handleToggleFormat(fmt)}
                        className={`px-3 py-1 rounded text-xs font-mono font-medium uppercase transition-colors border ${
                          isSelected
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/40 text-muted-foreground hover:bg-muted border-border"
                        }`}
                      >
                        {fmt}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 border-t border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="text-xs">
                  <div className="font-medium text-foreground">
                    Trạng thái hệ thống:{" "}
                    {dolphinStatus?.isRegistered ? (
                      <span className="text-emerald-500 font-semibold">
                        {dolphinStatus?.platform === "windows"
                          ? "Đã đăng ký Registry"
                          : "Đã cài đặt ServiceMenu"}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Chưa đăng ký</span>
                    )}
                  </div>
                  {dolphinStatus?.installedPath ? (
                    <div className="text-muted-foreground text-[11px] font-mono mt-0.5 truncate max-w-[360px]">
                      {dolphinStatus.installedPath}
                    </div>
                  ) : null}
                  {actionFeedback ? (
                    <div className="text-primary text-xs mt-1 font-medium">{actionFeedback}</div>
                  ) : null}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isOperating}
                    onClick={handleRegisterDolphin}
                  >
                    {isOperating ? "Đang xử lý..." : "Cài đặt / Cập nhật"}
                  </Button>
                  {dolphinStatus?.isRegistered ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:bg-destructive/10"
                      disabled={isOperating}
                      onClick={handleUnregisterDolphin}
                    >
                      Gỡ bỏ
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
