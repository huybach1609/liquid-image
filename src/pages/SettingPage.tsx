import * as React from "react";
import {
  Settings,
  Palette,
  Files,
  Cpu,
  Keyboard,
  Terminal,
  Bell,
  Info,
  ChevronLeft,
  RotateCcw,
  Check,
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { useSettingsStore } from "@/features/settings/state/settings.store";
import { useAppStore } from "@/app/store/app.store";
import {
  SettingSection,
  SettingGroup,
  SettingRow,
} from "@/features/settings/components/SettingUI";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { useAppInfo } from "@/shared/hooks/useAppInfo";
import { cn } from "@/lib/utils";
import type {
  Language,
  DateFormat,
  FileSizeUnit,
  Theme,
  FontSize,
  SidebarWidth,
  ConflictPolicy,
  PreviewResolution,
  ColorProfile,
  SettingsState,
} from "@/features/settings/types";

const NAV_ITEMS = {
  general: [
    { id: "general", label: "General", icon: Settings },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "files", label: "Files & output", icon: Files },
    { id: "processing", label: "Processing", icon: Cpu },
    { id: "shortcuts", label: "Shortcuts", icon: Keyboard },
  ],
  advanced: [
    { id: "imagick", label: "ImageMagick", icon: Terminal },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "about", label: "About", icon: Info },
  ],
};

const NavButton = React.memo(
  ({
    id,
    label,
    icon: Icon,
    isActive,
    isCompact,
    onClick,
  }: {
    id: string;
    label: string;
    icon: any;
    isActive: boolean;
    isCompact: boolean;
    onClick: (id: string) => void;
  }) => (
    <Tooltip delayDuration={400}>
      <TooltipTrigger asChild>
        <button
          type="button"
          aria-pressed={isActive}
          className={cn(
            "flex h-11 w-full items-center border-r-2 py-2 transition-all outline-none gap-3",
            isCompact ? "justify-center px-2" : "px-5",
            isActive
              ? "border-primary bg-primary/5 font-semibold text-primary"
              : "border-transparent text-muted-foreground/80 hover:bg-muted/50 hover:text-foreground",
          )}
          onClick={() => onClick(id)}
        >
          <Icon
            className={cn(
              "size-4 shrink-0",
              isActive ? "opacity-100" : "opacity-70",
            )}
          />
          {!isCompact && <span className="text-[14px]">{label}</span>}
        </button>
      </TooltipTrigger>
      {isCompact && <TooltipContent side="right">{label}</TooltipContent>}
    </Tooltip>
  ),
);

export function SettingPage() {
  useTranslation("common");
  const settings = useSettingsStore();
  const setMode = useAppStore((s) => s.setMode);
  const [activeTab, setActiveTab] = React.useState("general");
  const [saved, setSaved] = React.useState(false);
  const appInfo = useAppInfo();
  const sidebarRef = React.useRef<HTMLElement>(null);
  const [isCompact, setIsCompact] = React.useState(false);

  React.useEffect(() => {
    if (!sidebarRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width < 120) {
          setIsCompact(true);
        } else {
          setIsCompact(false);
        }
      }
    });

    observer.observe(sidebarRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleResetSection = () => {
    // Determine which keys belong to the active section
    let keysToReset: (keyof SettingsState)[] = [];
    if (activeTab === "general") {
      keysToReset = [
        "language",
        "dateFormat",
        "fileSizeUnit",
        "restoreSession",
        "checkUpdates",
        "launchAtLogin",
      ];
    } else if (activeTab === "appearance") {
      keysToReset = [
        "theme",
        "accentColor",
        "fontSize",
        "sidebarWidth",
        "showCliPreview",
        "showMetadata",
      ];
    } else if (activeTab === "files") {
      keysToReset = [
        "outputFolder",
        "presetFolder",
        "namingPattern",
        "conflictPolicy",
        "autoOpenOutput",
      ];
    } else if (activeTab === "processing") {
      keysToReset = [
        "workers",
        "memoryLimit",
        "livePreview",
        "previewMaxResolution",
      ];
    } else if (activeTab === "imagick") {
      keysToReset = [
        "magickBinaryPath",
        "stripMetadata",
        "defaultColorProfile",
      ];
    } else if (activeTab === "notifications") {
      keysToReset = ["notifyBatchComplete", "notifyError", "playSound"];
    }

    if (keysToReset.length > 0) {
      settings.resetSection(keysToReset);
    }
  };

  return (
    <div className="flex h-full w-full bg-background overflow-hidden border-t border-border/40">
      <ResizablePanelGroup className="h-full w-full">
        <ResizablePanel
          defaultSize={200}
          minSize={50}
          maxSize={300}
          className="bg-muted/10"
        >
          <aside ref={sidebarRef} className="h-full flex flex-col">
            <div
              className={cn(
                "p-6 border-b border-border/40 bg-muted/20 transition-all",
                isCompact && "px-2 py-4 flex flex-col items-center",
              )}
            >
              <div
                className={cn(
                  "font-bold leading-none mb-1.5 tracking-tight",
                  isCompact ? "text-[11px]" : "text-[15px]",
                )}
              >
                {isCompact ? "Set" : "Settings"}
              </div>
              {!isCompact && (
                <div className="text-[12px] text-muted-foreground/80 font-medium">
                  {appInfo.name} v{appInfo.version}
                </div>
              )}
            </div>

            <ScrollArea className="flex-1">
              <div className="py-3 flex flex-col">
                {!isCompact && (
                  <div className="px-5 py-3 text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                    General
                  </div>
                )}
                <nav className="flex flex-col gap-0.5">
                  {NAV_ITEMS.general.map((item) => (
                    <NavButton
                      key={item.id}
                      {...item}
                      isActive={activeTab === item.id}
                      isCompact={isCompact}
                      onClick={setActiveTab}
                    />
                  ))}
                </nav>

                <div className={cn("mt-6", !isCompact && "px-5 py-3")}>
                  {!isCompact ? (
                    <div className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                      Advanced
                    </div>
                  ) : (
                    <div className="h-px bg-border/40 mx-2" />
                  )}
                </div>
                <nav className="flex flex-col gap-0.5 mt-2">
                  {NAV_ITEMS.advanced.map((item) => (
                    <NavButton
                      key={item.id}
                      {...item}
                      isActive={activeTab === item.id}
                      isCompact={isCompact}
                      onClick={setActiveTab}
                    />
                  ))}
                </nav>
              </div>
            </ScrollArea>

            <div className="p-3 border-t border-border/40 bg-muted/5">
              <Tooltip delayDuration={400}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "w-full justify-start h-10 font-medium transition-all",
                      isCompact ? "justify-center px-0" : "px-4",
                    )}
                    onClick={() => setMode("single")}
                  >
                    <ChevronLeft
                      className={cn("size-4", !isCompact && "mr-3")}
                    />
                    {!isCompact && "Back"}
                  </Button>
                </TooltipTrigger>
                {isCompact && (
                  <TooltipContent side="right">Back</TooltipContent>
                )}
              </Tooltip>
            </div>
          </aside>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={80}>
          <main className="flex-1 flex flex-col min-w-0 h-full">
            <header className="h-[56px] px-8 border-b border-border/40 flex items-center justify-between flex-shrink-0 bg-background/50 backdrop-blur-sm">
              <div className="text-[15px] font-bold capitalize tracking-tight">
                {activeTab.replace("-", " ")}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 font-medium"
                  onClick={handleResetSection}
                >
                  <RotateCcw className="size-3.5 mr-2" />
                  Reset section
                </Button>
                <Button
                  size="sm"
                  className={cn(
                    "h-8 px-4 font-semibold transition-all shadow-sm",
                    saved && "bg-green-600 hover:bg-green-600",
                  )}
                  onClick={handleSave}
                >
                  {saved ? (
                    <>
                      <Check className="size-3.5 mr-2" />
                      Saved
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </div>
            </header>

            <ScrollArea className="flex-1">
              <div className="max-w-[800px] p-10 mx-auto">
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {activeTab === "general" && (
                    <>
                      <SettingSection label="Language & region">
                        <SettingGroup>
                          <SettingRow
                            name="Language"
                            description="Ngôn ngữ hiển thị giao diện"
                          >
                            <Select
                              value={settings.language}
                              onValueChange={(v) =>
                                settings.setSetting("language", v as Language)
                              }
                            >
                              <SelectTrigger className="w-[160px] h-9 ">
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
                              value={settings.dateFormat}
                              onValueChange={(v) =>
                                settings.setSetting(
                                  "dateFormat",
                                  v as DateFormat,
                                )
                              }
                            >
                              <SelectTrigger className="w-[160px] h-9 ">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="YYYY-MM-DD">
                                  YYYY-MM-DD
                                </SelectItem>
                                <SelectItem value="DD-MM-YYYY">
                                  DD-MM-YYYY
                                </SelectItem>
                                <SelectItem value="MM-DD-YYYY">
                                  MM-DD-YYYY
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </SettingRow>
                          <SettingRow
                            name="File size unit"
                            description="Cách hiển thị kích thước file trong queue"
                          >
                            <Select
                              value={settings.fileSizeUnit}
                              onValueChange={(v) =>
                                settings.setSetting(
                                  "fileSizeUnit",
                                  v as FileSizeUnit,
                                )
                              }
                            >
                              <SelectTrigger className="w-[120px] h-9 ">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="MB_GB">MB / GB</SelectItem>
                                <SelectItem value="MiB_GiB">
                                  MiB / GiB
                                </SelectItem>
                                <SelectItem value="KB">KB</SelectItem>
                              </SelectContent>
                            </Select>
                          </SettingRow>
                        </SettingGroup>
                      </SettingSection>

                      <SettingSection label="Startup">
                        <SettingGroup>
                          <SettingRow
                            name="Restore last session"
                            description="Mở lại pipeline và file queue của lần dùng trước"
                          >
                            <Switch
                              checked={settings.restoreSession}
                              onCheckedChange={(v) =>
                                settings.setSetting("restoreSession", v)
                              }
                            />
                          </SettingRow>
                          <SettingRow
                            name="Check for updates on launch"
                            description="Tự kiểm tra phiên bản mới khi khởi động"
                          >
                            <Switch
                              checked={settings.checkUpdates}
                              onCheckedChange={(v) =>
                                settings.setSetting("checkUpdates", v)
                              }
                            />
                          </SettingRow>
                          <SettingRow
                            name="Launch at login"
                            description="Khởi động cùng hệ thống (chạy nền ở tray)"
                          >
                            <Switch
                              checked={settings.launchAtLogin}
                              onCheckedChange={(v) =>
                                settings.setSetting("launchAtLogin", v)
                              }
                            />
                          </SettingRow>
                        </SettingGroup>
                      </SettingSection>
                    </>
                  )}

                  {activeTab === "appearance" && (
                    <>
                      <SettingSection label="Theme">
                        <SettingGroup>
                          <SettingRow
                            name="Color theme"
                            description="Giao diện sáng hoặc tối"
                          >
                            <Select
                              value={settings.theme}
                              onValueChange={(v) =>
                                settings.setSetting("theme", v as Theme)
                              }
                            >
                              <SelectTrigger className="w-[150px] h-9 ">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="system">
                                  System default
                                </SelectItem>
                                <SelectItem value="light">Light</SelectItem>
                                <SelectItem value="dark">Dark</SelectItem>
                              </SelectContent>
                            </Select>
                          </SettingRow>
                          <SettingRow
                            name="Accent color"
                            description="Màu nhấn cho nút và trạng thái active"
                          >
                            <div className="flex gap-2">
                              {[
                                "#7F77DD",
                                "#1D9E75",
                                "#378ADD",
                                "#D85A30",
                                "#888780",
                              ].map((color) => (
                                <button
                                  key={color}
                                  className={cn(
                                    "size-6 rounded-full border border-border/50 transition-transform hover:scale-110",
                                    settings.accentColor === color &&
                                      "ring-2 ring-offset-2 ring-primary",
                                  )}
                                  style={{ backgroundColor: color }}
                                  onClick={() =>
                                    settings.setSetting("accentColor", color)
                                  }
                                />
                              ))}
                            </div>
                          </SettingRow>
                          <SettingRow
                            name="Font size"
                            description="Kích thước chữ trong giao diện"
                          >
                            <Select
                              value={settings.fontSize}
                              onValueChange={(v) =>
                                settings.setSetting("fontSize", v as FontSize)
                              }
                            >
                              <SelectTrigger className="w-[140px] h-9 ">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="small">
                                  Small (12px)
                                </SelectItem>
                                <SelectItem value="default">
                                  Default (13px)
                                </SelectItem>
                                <SelectItem value="large">
                                  Large (15px)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </SettingRow>
                        </SettingGroup>
                      </SettingSection>

                      <SettingSection label="Layout">
                        <SettingGroup>
                          <SettingRow
                            name="Sidebar width"
                            description="Độ rộng sidebar danh sách operation"
                          >
                            <Select
                              value={settings.sidebarWidth}
                              onValueChange={(v) =>
                                settings.setSetting(
                                  "sidebarWidth",
                                  v as SidebarWidth,
                                )
                              }
                            >
                              <SelectTrigger className="w-[150px] h-9 ">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="compact">
                                  Compact (160px)
                                </SelectItem>
                                <SelectItem value="default">
                                  Default (180px)
                                </SelectItem>
                                <SelectItem value="wide">
                                  Wide (220px)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </SettingRow>
                          <SettingRow
                            name="Show CLI preview"
                            description="Hiện thanh lệnh magick phía dưới options panel"
                          >
                            <Switch
                              checked={settings.showCliPreview}
                              onCheckedChange={(v) =>
                                settings.setSetting("showCliPreview", v)
                              }
                            />
                          </SettingRow>
                          <SettingRow
                            name="Show image metadata"
                            description="Hiện kích thước, dung lượng ở thanh dưới canvas"
                          >
                            <Switch
                              checked={settings.showMetadata}
                              onCheckedChange={(v) =>
                                settings.setSetting("showMetadata", v)
                              }
                            />
                          </SettingRow>
                        </SettingGroup>
                      </SettingSection>
                    </>
                  )}

                  {activeTab === "files" && (
                    <>
                      <SettingSection label="Default locations">
                        <SettingGroup>
                          <div className="p-4 border-b border-border/60">
                            <div className=" font-semibold mb-1.5">
                              Default output folder
                            </div>
                            <div className=" text-muted-foreground leading-relaxed mb-3">
                              Thư mục mặc định khi lưu file output
                            </div>
                            <div className="flex gap-3">
                              <Input
                                value={settings.outputFolder}
                                onChange={(e) =>
                                  settings.setSetting(
                                    "outputFolder",
                                    e.target.value,
                                  )
                                }
                                className="flex-1 h-9  font-mono bg-muted/20"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9  px-3 font-medium"
                              >
                                Browse…
                              </Button>
                            </div>
                          </div>
                          <div className="p-4">
                            <div className=" font-semibold mb-1.5">
                              Default preset folder
                            </div>
                            <div className=" text-muted-foreground leading-relaxed mb-3">
                              Nơi lưu và load pipeline preset
                            </div>
                            <div className="flex gap-3">
                              <Input
                                value={settings.presetFolder}
                                onChange={(e) =>
                                  settings.setSetting(
                                    "presetFolder",
                                    e.target.value,
                                  )
                                }
                                className="flex-1 h-9  font-mono bg-muted/20"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9  px-3 font-medium"
                              >
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
                              value={settings.namingPattern}
                              onChange={(e) =>
                                settings.setSetting(
                                  "namingPattern",
                                  e.target.value,
                                )
                              }
                              className="w-[180px] h-9 "
                            />
                          </SettingRow>
                          <SettingRow
                            name="On filename conflict"
                            description="Khi file đầu ra đã tồn tại"
                          >
                            <Select
                              value={settings.conflictPolicy}
                              onValueChange={(v) =>
                                settings.setSetting(
                                  "conflictPolicy",
                                  v as ConflictPolicy,
                                )
                              }
                            >
                              <SelectTrigger className="w-[150px] h-9 ">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ask">Ask me</SelectItem>
                                <SelectItem value="overwrite">
                                  Overwrite
                                </SelectItem>
                                <SelectItem value="rename">
                                  Rename (+1)
                                </SelectItem>
                                <SelectItem value="skip">Skip</SelectItem>
                              </SelectContent>
                            </Select>
                          </SettingRow>
                          <SettingRow
                            name="Auto-open output folder"
                            description="Tự mở Finder/Explorer sau khi xử lý xong"
                          >
                            <Switch
                              checked={settings.autoOpenOutput}
                              onCheckedChange={(v) =>
                                settings.setSetting("autoOpenOutput", v)
                              }
                            />
                          </SettingRow>
                        </SettingGroup>
                      </SettingSection>
                    </>
                  )}

                  {activeTab === "processing" && (
                    <>
                      <SettingSection label="Performance">
                        <SettingGroup>
                          <SettingRow
                            name="Batch workers"
                            description="Số luồng xử lý song song. Khuyến nghị ≤ số CPU cores"
                          >
                            <Select
                              value={settings.workers.toString()}
                              onValueChange={(v) =>
                                settings.setSetting("workers", parseInt(v))
                              }
                            >
                              <SelectTrigger className="w-[120px] h-9 ">
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
                              value={settings.memoryLimit}
                              onValueChange={(v) =>
                                settings.setSetting("memoryLimit", v)
                              }
                            >
                              <SelectTrigger className="w-[140px] h-9 ">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="256 MB">256 MB</SelectItem>
                                <SelectItem value="512 MB">512 MB</SelectItem>
                                <SelectItem value="1 GB">1 GB</SelectItem>
                                <SelectItem value="Unlimited">
                                  Unlimited
                                </SelectItem>
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
                              checked={settings.livePreview}
                              onCheckedChange={(v) =>
                                settings.setSetting("livePreview", v)
                              }
                            />
                          </SettingRow>
                          <SettingRow
                            name="Preview max resolution"
                            description="Giảm độ phân giải preview để nhanh hơn"
                          >
                            <Select
                              value={settings.previewMaxResolution}
                              onValueChange={(v) =>
                                settings.setSetting(
                                  "previewMaxResolution",
                                  v as PreviewResolution,
                                )
                              }
                            >
                              <SelectTrigger className="w-[140px] h-9 ">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="800px">
                                  800px (fast)
                                </SelectItem>
                                <SelectItem value="1200px">1200px</SelectItem>
                                <SelectItem value="full">Full size</SelectItem>
                              </SelectContent>
                            </Select>
                          </SettingRow>
                        </SettingGroup>
                      </SettingSection>
                    </>
                  )}

                  {activeTab === "shortcuts" && (
                    <>
                      <SettingSection label="Global shortcuts">
                        <SettingGroup>
                          <SettingRow name="Run batch">
                            <kbd className="px-2.5 py-1 rounded-md border border-border bg-muted/50  font-mono shadow-sm">
                              ⌘ R
                            </kbd>
                          </SettingRow>
                          <SettingRow name="Open file(s)">
                            <kbd className="px-2.5 py-1 rounded-md border border-border bg-muted/50  font-mono shadow-sm">
                              ⌘ O
                            </kbd>
                          </SettingRow>
                          <SettingRow name="Save preset">
                            <kbd className="px-2.5 py-1 rounded-md border border-border bg-muted/50  font-mono shadow-sm">
                              ⌘ S
                            </kbd>
                          </SettingRow>
                        </SettingGroup>
                      </SettingSection>
                    </>
                  )}

                  {activeTab === "imagick" && (
                    <>
                      <SettingSection label="Binary">
                        <SettingGroup>
                          <div className="p-4">
                            <div className="font-semibold mb-1.5">
                              ImageMagick binary path
                            </div>
                            <div className="text-muted-foreground leading-relaxed mb-3">
                              Đường dẫn tới lệnh magick
                            </div>
                            <div className="flex gap-3">
                              <Input
                                value={settings.magickBinaryPath}
                                onChange={(e) =>
                                  settings.setSetting(
                                    "magickBinaryPath",
                                    e.target.value,
                                  )
                                }
                                className="flex-1 h-9 font-mono bg-muted/20"
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 px-3 font-medium"
                              >
                                Detect
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 px-3 font-medium"
                              >
                                Browse…
                              </Button>
                            </div>
                          </div>
                        </SettingGroup>
                      </SettingSection>

                      <SettingSection label="Default flags">
                        <SettingGroup>
                          <SettingRow
                            name="Strip metadata by default"
                            description="Thêm -strip vào mọi lệnh"
                          >
                            <Switch
                              checked={settings.stripMetadata}
                              onCheckedChange={(v) =>
                                settings.setSetting("stripMetadata", v)
                              }
                            />
                          </SettingRow>
                          <SettingRow
                            name="Color profile"
                            description="Profile màu mặc định cho output"
                          >
                            <Select
                              value={settings.defaultColorProfile}
                              onValueChange={(v) =>
                                settings.setSetting(
                                  "defaultColorProfile",
                                  v as ColorProfile,
                                )
                              }
                            >
                              <SelectTrigger className="w-[140px] h-9 ">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="sRGB">sRGB</SelectItem>
                                <SelectItem value="Adobe RGB">
                                  Adobe RGB
                                </SelectItem>
                                <SelectItem value="CMYK">CMYK</SelectItem>
                                <SelectItem value="None">None</SelectItem>
                              </SelectContent>
                            </Select>
                          </SettingRow>
                        </SettingGroup>
                      </SettingSection>
                    </>
                  )}

                  {activeTab === "notifications" && (
                    <>
                      <SettingSection label="System notifications">
                        <SettingGroup>
                          <SettingRow
                            name="Batch completed"
                            description="Thông báo khi toàn bộ batch xử lý xong"
                          >
                            <Switch
                              checked={settings.notifyBatchComplete}
                              onCheckedChange={(v) =>
                                settings.setSetting("notifyBatchComplete", v)
                              }
                            />
                          </SettingRow>
                          <SettingRow
                            name="Error occurred"
                            description="Thông báo khi có file bị lỗi trong batch"
                          >
                            <Switch
                              checked={settings.notifyError}
                              onCheckedChange={(v) =>
                                settings.setSetting("notifyError", v)
                              }
                            />
                          </SettingRow>
                          <SettingRow
                            name="Play sound"
                            description="Phát âm thanh kèm thông báo"
                          >
                            <Switch
                              checked={settings.playSound}
                              onCheckedChange={(v) =>
                                settings.setSetting("playSound", v)
                              }
                            />
                          </SettingRow>
                        </SettingGroup>
                      </SettingSection>
                    </>
                  )}

                  {activeTab === "about" && (
                    <>
                      <div className="mb-10 p-8 rounded-2xl border border-border bg-muted/20 flex items-center gap-6 shadow-sm">
                        <div className="size-16 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                          <Settings className="size-9" />
                        </div>
                        <div>
                          <div className="text-lg font-bold tracking-tight">
                            {appInfo.name}
                          </div>
                          <div className=" text-muted-foreground font-medium">
                            Version {appInfo.version} · Built with Tauri{" "}
                            {appInfo.tauriVersion} + React
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-auto h-9  px-4 font-semibold"
                        >
                          Check for updates
                        </Button>
                      </div>

                      <SettingGroup>
                        <div className="flex items-center justify-between p-4 border-b border-border/60">
                          <div className=" font-medium">
                            ImageMagick version
                          </div>
                          <div className=" font-mono text-muted-foreground bg-muted/40 px-2 py-0.5 rounded">
                            7.1.1-15
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4 border-b border-border/60">
                          <div className=" font-medium">Tauri version</div>
                          <div className=" font-mono text-muted-foreground bg-muted/40 px-2 py-0.5 rounded">
                            2.0.4
                          </div>
                        </div>
                        <div className="flex items-center justify-between p-4">
                          <div className=" font-medium">Config location</div>
                          <div className=" font-mono text-muted-foreground bg-muted/40 px-2 py-0.5 rounded">
                            ~/.config/imgui/
                          </div>
                        </div>
                      </SettingGroup>

                      <div className="mt-8 flex gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9  px-4 font-medium"
                        >
                          Open config folder
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="ml-auto h-9  px-4 font-medium"
                          onClick={() => settings.resetSettings()}
                        >
                          Reset all settings
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </ScrollArea>
          </main>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
