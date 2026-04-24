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
  Check
} from "lucide-react";
import { useTranslation } from "react-i18next";

import { useSettingsStore } from "@/features/settings/state/settings.store";
import { useAppStore } from "@/app/store/app.store";
import { 
  SettingSection, 
  SettingGroup, 
  SettingRow 
} from "@/features/settings/components/SettingUI";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  SettingsState
} from "@/features/settings/types";

export function SettingPage() {
  useTranslation("common");
  const settings = useSettingsStore();
  const setMode = useAppStore((s) => s.setMode);
  const [activeTab, setActiveTab] = React.useState("general");
  const [saved, setSaved] = React.useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleResetSection = () => {
    // Determine which keys belong to the active section
    let keysToReset: (keyof SettingsState)[] = [];
    if (activeTab === "general") {
      keysToReset = ["language", "dateFormat", "fileSizeUnit", "restoreSession", "checkUpdates", "launchAtLogin"];
    } else if (activeTab === "appearance") {
      keysToReset = ["theme", "accentColor", "fontSize", "sidebarWidth", "showCliPreview", "showMetadata"];
    } else if (activeTab === "files") {
      keysToReset = ["outputFolder", "presetFolder", "namingPattern", "conflictPolicy", "autoOpenOutput"];
    } else if (activeTab === "processing") {
      keysToReset = ["workers", "memoryLimit", "livePreview", "previewMaxResolution"];
    } else if (activeTab === "imagick") {
      keysToReset = ["magickBinaryPath", "stripMetadata", "defaultColorProfile"];
    } else if (activeTab === "notifications") {
      keysToReset = ["notifyBatchComplete", "notifyError", "playSound"];
    }
    
    if (keysToReset.length > 0) {
      settings.resetSection(keysToReset);
    }
  };

  return (
    <div className="flex h-full w-full bg-background overflow-hidden border-t border-border/50">
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        orientation="vertical" 
        className="flex h-full w-full"
      >
        <aside className="w-[190px] border-r border-border/50 bg-muted/30 flex flex-col">
          <div className="p-4 border-b border-border/50">
            <div className="text-[13px] font-medium leading-none mb-1">Settings</div>
            <div className="text-[11px] text-muted-foreground">ImageMagick GUI v1.0</div>
          </div>
          
          <ScrollArea className="flex-1">
            <div className="p-2 flex flex-col gap-0.5">
              <div className="px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">General</div>
              <TabsList className="flex flex-col h-auto bg-transparent p-0 gap-0.5" variant="line">
                <TabsTrigger value="general" className="justify-start px-3 py-1.5 h-8 text-xs font-normal data-active:bg-background">
                  <Settings className="size-3.5 mr-2 opacity-70" />
                  General
                </TabsTrigger>
                <TabsTrigger value="appearance" className="justify-start px-3 py-1.5 h-8 text-xs font-normal data-active:bg-background">
                  <Palette className="size-3.5 mr-2 opacity-70" />
                  Appearance
                </TabsTrigger>
                <TabsTrigger value="files" className="justify-start px-3 py-1.5 h-8 text-xs font-normal data-active:bg-background">
                  <Files className="size-3.5 mr-2 opacity-70" />
                  Files & output
                </TabsTrigger>
                <TabsTrigger value="processing" className="justify-start px-3 py-1.5 h-8 text-xs font-normal data-active:bg-background">
                  <Cpu className="size-3.5 mr-2 opacity-70" />
                  Processing
                </TabsTrigger>
                <TabsTrigger value="shortcuts" className="justify-start px-3 py-1.5 h-8 text-xs font-normal data-active:bg-background">
                  <Keyboard className="size-3.5 mr-2 opacity-70" />
                  Shortcuts
                </TabsTrigger>
              </TabsList>

              <div className="mt-4 px-3 py-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Advanced</div>
              <TabsList className="flex flex-col h-auto bg-transparent p-0 gap-0.5" variant="line">
                <TabsTrigger value="imagick" className="justify-start px-3 py-1.5 h-8 text-xs font-normal data-active:bg-background">
                  <Terminal className="size-3.5 mr-2 opacity-70" />
                  ImageMagick
                </TabsTrigger>
                <TabsTrigger value="notifications" className="justify-start px-3 py-1.5 h-8 text-xs font-normal data-active:bg-background">
                  <Bell className="size-3.5 mr-2 opacity-70" />
                  Notifications
                </TabsTrigger>
                <TabsTrigger value="about" className="justify-start px-3 py-1.5 h-8 text-xs font-normal data-active:bg-background">
                  <Info className="size-3.5 mr-2 opacity-70" />
                  About
                </TabsTrigger>
              </TabsList>
            </div>
          </ScrollArea>

          <div className="p-2 border-t border-border/50">
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start h-8 text-xs"
              onClick={() => setMode("single")}
            >
              <ChevronLeft className="size-3.5 mr-2" />
              Back
            </Button>
          </div>
        </aside>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-[44px] px-4 border-b border-border/50 flex items-center justify-between flex-shrink-0">
            <div className="text-[13px] font-medium capitalize">{activeTab.replace("-", " ")}</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-7 text-[11px] px-2" onClick={handleResetSection}>
                <RotateCcw className="size-3 mr-1.5" />
                Reset section
              </Button>
              <Button 
                size="sm" 
                className={cn("h-7 text-[11px] px-3 transition-all", saved && "bg-green-600 hover:bg-green-600")}
                onClick={handleSave}
              >
                {saved ? (
                  <>
                    <Check className="size-3 mr-1.5" />
                    Saved
                  </>
                ) : "Save changes"}
              </Button>
            </div>
          </header>

          <ScrollArea className="flex-1">
            <div className="max-w-[700px] p-6">
              
              <TabsContent value="general" className="m-0 border-0 p-0">
                <SettingSection label="Language & region">
                  <SettingGroup>
                    <SettingRow name="Language" description="Ngôn ngữ hiển thị giao diện">
                      <Select 
                        value={settings.language} 
                        onValueChange={(v) => settings.setSetting("language", v as Language)}
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs">
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
                    <SettingRow name="Date format" description="Dùng trong tên file output khi có {date}">
                      <Select 
                        value={settings.dateFormat} 
                        onValueChange={(v) => settings.setSetting("dateFormat", v as DateFormat)}
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                          <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                          <SelectItem value="MM-DD-YYYY">MM-DD-YYYY</SelectItem>
                        </SelectContent>
                      </Select>
                    </SettingRow>
                    <SettingRow name="File size unit" description="Cách hiển thị kích thước file trong queue">
                      <Select 
                        value={settings.fileSizeUnit} 
                        onValueChange={(v) => settings.setSetting("fileSizeUnit", v as FileSizeUnit)}
                      >
                        <SelectTrigger className="w-[100px] h-8 text-xs">
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

                <SettingSection label="Startup">
                  <SettingGroup>
                    <SettingRow name="Restore last session" description="Mở lại pipeline và file queue của lần dùng trước">
                      <Switch 
                        checked={settings.restoreSession} 
                        onCheckedChange={(v) => settings.setSetting("restoreSession", v)} 
                      />
                    </SettingRow>
                    <SettingRow name="Check for updates on launch" description="Tự kiểm tra phiên bản mới khi khởi động">
                      <Switch 
                        checked={settings.checkUpdates} 
                        onCheckedChange={(v) => settings.setSetting("checkUpdates", v)} 
                      />
                    </SettingRow>
                    <SettingRow name="Launch at login" description="Khởi động cùng hệ thống (chạy nền ở tray)">
                      <Switch 
                        checked={settings.launchAtLogin} 
                        onCheckedChange={(v) => settings.setSetting("launchAtLogin", v)} 
                      />
                    </SettingRow>
                  </SettingGroup>
                </SettingSection>
              </TabsContent>

              <TabsContent value="appearance" className="m-0 border-0 p-0">
                <SettingSection label="Theme">
                  <SettingGroup>
                    <SettingRow name="Color theme" description="Giao diện sáng hoặc tối">
                      <Select 
                        value={settings.theme} 
                        onValueChange={(v) => settings.setSetting("theme", v as Theme)}
                      >
                        <SelectTrigger className="w-[130px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="system">System default</SelectItem>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                        </SelectContent>
                      </Select>
                    </SettingRow>
                    <SettingRow name="Accent color" description="Màu nhấn cho nút và trạng thái active">
                       <div className="flex gap-1.5">
                        {["#7F77DD", "#1D9E75", "#378ADD", "#D85A30", "#888780"].map(color => (
                          <button
                            key={color}
                            className={cn(
                              "size-5 rounded-full border border-border/50",
                              settings.accentColor === color && "ring-2 ring-offset-2 ring-primary"
                            )}
                            style={{ backgroundColor: color }}
                            onClick={() => settings.setSetting("accentColor", color)}
                          />
                        ))}
                      </div>
                    </SettingRow>
                    <SettingRow name="Font size" description="Kích thước chữ trong giao diện">
                      <Select 
                        value={settings.fontSize} 
                        onValueChange={(v) => settings.setSetting("fontSize", v as FontSize)}
                      >
                        <SelectTrigger className="w-[120px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small (12px)</SelectItem>
                          <SelectItem value="default">Default (13px)</SelectItem>
                          <SelectItem value="large">Large (15px)</SelectItem>
                        </SelectContent>
                      </Select>
                    </SettingRow>
                  </SettingGroup>
                </SettingSection>

                <SettingSection label="Layout">
                  <SettingGroup>
                    <SettingRow name="Sidebar width" description="Độ rộng sidebar danh sách operation">
                      <Select 
                        value={settings.sidebarWidth} 
                        onValueChange={(v) => settings.setSetting("sidebarWidth", v as SidebarWidth)}
                      >
                        <SelectTrigger className="w-[130px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compact">Compact (160px)</SelectItem>
                          <SelectItem value="default">Default (180px)</SelectItem>
                          <SelectItem value="wide">Wide (220px)</SelectItem>
                        </SelectContent>
                      </Select>
                    </SettingRow>
                    <SettingRow name="Show CLI preview" description="Hiện thanh lệnh magick phía dưới options panel">
                      <Switch 
                        checked={settings.showCliPreview} 
                        onCheckedChange={(v) => settings.setSetting("showCliPreview", v)} 
                      />
                    </SettingRow>
                    <SettingRow name="Show image metadata" description="Hiện kích thước, dung lượng ở thanh dưới canvas">
                      <Switch 
                        checked={settings.showMetadata} 
                        onCheckedChange={(v) => settings.setSetting("showMetadata", v)} 
                      />
                    </SettingRow>
                  </SettingGroup>
                </SettingSection>
              </TabsContent>

              <TabsContent value="files" className="m-0 border-0 p-0">
                <SettingSection label="Default locations">
                  <SettingGroup>
                    <div className="p-3 border-b border-border/50">
                      <div className="text-sm font-medium mb-1">Default output folder</div>
                      <div className="text-xs text-muted-foreground mb-2">Thư mục mặc định khi lưu file output</div>
                      <div className="flex gap-2">
                        <Input 
                          value={settings.outputFolder} 
                          onChange={(e) => settings.setSetting("outputFolder", e.target.value)}
                          className="flex-1 h-8 text-[11px] font-mono bg-muted/30"
                        />
                        <Button variant="outline" size="sm" className="h-8 text-[11px] px-2">Browse…</Button>
                      </div>
                    </div>
                    <div className="p-3">
                      <div className="text-sm font-medium mb-1">Default preset folder</div>
                      <div className="text-xs text-muted-foreground mb-2">Nơi lưu và load pipeline preset</div>
                      <div className="flex gap-2">
                        <Input 
                          value={settings.presetFolder} 
                          onChange={(e) => settings.setSetting("presetFolder", e.target.value)}
                          className="flex-1 h-8 text-[11px] font-mono bg-muted/30"
                        />
                        <Button variant="outline" size="sm" className="h-8 text-[11px] px-2">Browse…</Button>
                      </div>
                    </div>
                  </SettingGroup>
                </SettingSection>

                <SettingSection label="File naming">
                  <SettingGroup>
                    <SettingRow name="Default naming pattern" description="Biến: {name} {date} {op} {width} {height}">
                      <Input 
                        value={settings.namingPattern} 
                        onChange={(e) => settings.setSetting("namingPattern", e.target.value)}
                        className="w-[150px] h-8 text-xs"
                      />
                    </SettingRow>
                    <SettingRow name="On filename conflict" description="Khi file đầu ra đã tồn tại">
                      <Select 
                        value={settings.conflictPolicy} 
                        onValueChange={(v) => settings.setSetting("conflictPolicy", v as ConflictPolicy)}
                      >
                        <SelectTrigger className="w-[130px] h-8 text-xs">
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
                    <SettingRow name="Auto-open output folder" description="Tự mở Finder/Explorer sau khi xử lý xong">
                      <Switch 
                        checked={settings.autoOpenOutput} 
                        onCheckedChange={(v) => settings.setSetting("autoOpenOutput", v)} 
                      />
                    </SettingRow>
                  </SettingGroup>
                </SettingSection>
              </TabsContent>

              <TabsContent value="processing" className="m-0 border-0 p-0">
                <SettingSection label="Performance">
                  <SettingGroup>
                    <SettingRow name="Batch workers" description="Số luồng xử lý song song. Khuyến nghị ≤ số CPU cores">
                       <Select 
                        value={settings.workers.toString()} 
                        onValueChange={(v) => settings.setSetting("workers", parseInt(v))}
                      >
                        <SelectTrigger className="w-[100px] h-8 text-xs">
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
                    <SettingRow name="Memory limit per job" description="Giới hạn RAM cho mỗi tiến trình ImageMagick">
                      <Select 
                        value={settings.memoryLimit} 
                        onValueChange={(v) => settings.setSetting("memoryLimit", v)}
                      >
                        <SelectTrigger className="w-[120px] h-8 text-xs">
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
                    <SettingRow name="Live preview" description="Cập nhật preview real-time khi chỉnh tham số">
                      <Switch 
                        checked={settings.livePreview} 
                        onCheckedChange={(v) => settings.setSetting("livePreview", v)} 
                      />
                    </SettingRow>
                    <SettingRow name="Preview max resolution" description="Giảm độ phân giải preview để nhanh hơn">
                      <Select 
                        value={settings.previewMaxResolution} 
                        onValueChange={(v) => settings.setSetting("previewMaxResolution", v as PreviewResolution)}
                      >
                        <SelectTrigger className="w-[120px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="800px">800px (fast)</SelectItem>
                          <SelectItem value="1200px">1200px</SelectItem>
                          <SelectItem value="full">Full size</SelectItem>
                        </SelectContent>
                      </Select>
                    </SettingRow>
                  </SettingGroup>
                </SettingSection>
              </TabsContent>

              <TabsContent value="shortcuts" className="m-0 border-0 p-0">
                <SettingSection label="Global shortcuts">
                  <SettingGroup>
                    <SettingRow name="Run batch">
                      <kbd className="px-2 py-0.5 rounded border border-border bg-muted text-[10px] font-mono">⌘ R</kbd>
                    </SettingRow>
                    <SettingRow name="Open file(s)">
                      <kbd className="px-2 py-0.5 rounded border border-border bg-muted text-[10px] font-mono">⌘ O</kbd>
                    </SettingRow>
                    <SettingRow name="Save preset">
                      <kbd className="px-2 py-0.5 rounded border border-border bg-muted text-[10px] font-mono">⌘ S</kbd>
                    </SettingRow>
                  </SettingGroup>
                </SettingSection>
              </TabsContent>

              <TabsContent value="imagick" className="m-0 border-0 p-0">
                <SettingSection label="Binary">
                  <SettingGroup>
                    <div className="p-3">
                      <div className="text-sm font-medium mb-1">ImageMagick binary path</div>
                      <div className="text-xs text-muted-foreground mb-2">Đường dẫn tới lệnh magick</div>
                      <div className="flex gap-2">
                        <Input 
                          value={settings.magickBinaryPath} 
                          onChange={(e) => settings.setSetting("magickBinaryPath", e.target.value)}
                          className="flex-1 h-8 text-[11px] font-mono bg-muted/30"
                        />
                        <Button variant="outline" size="sm" className="h-8 text-[11px] px-2">Detect</Button>
                        <Button variant="outline" size="sm" className="h-8 text-[11px] px-2">Browse…</Button>
                      </div>
                    </div>
                  </SettingGroup>
                </SettingSection>

                <SettingSection label="Default flags">
                  <SettingGroup>
                    <SettingRow name="Strip metadata by default" description="Thêm -strip vào mọi lệnh">
                      <Switch 
                        checked={settings.stripMetadata} 
                        onCheckedChange={(v) => settings.setSetting("stripMetadata", v)} 
                      />
                    </SettingRow>
                    <SettingRow name="Color profile" description="Profile màu mặc định cho output">
                      <Select 
                        value={settings.defaultColorProfile} 
                        onValueChange={(v) => settings.setSetting("defaultColorProfile", v as ColorProfile)}
                      >
                        <SelectTrigger className="w-[120px] h-8 text-xs">
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
              </TabsContent>

              <TabsContent value="notifications" className="m-0 border-0 p-0">
                <SettingSection label="System notifications">
                  <SettingGroup>
                    <SettingRow name="Batch completed" description="Thông báo khi toàn bộ batch xử lý xong">
                      <Switch 
                        checked={settings.notifyBatchComplete} 
                        onCheckedChange={(v) => settings.setSetting("notifyBatchComplete", v)} 
                      />
                    </SettingRow>
                    <SettingRow name="Error occurred" description="Thông báo khi có file bị lỗi trong batch">
                      <Switch 
                        checked={settings.notifyError} 
                        onCheckedChange={(v) => settings.setSetting("notifyError", v)} 
                      />
                    </SettingRow>
                    <SettingRow name="Play sound" description="Phát âm thanh kèm thông báo">
                      <Switch 
                        checked={settings.playSound} 
                        onCheckedChange={(v) => settings.setSetting("playSound", v)} 
                      />
                    </SettingRow>
                  </SettingGroup>
                </SettingSection>
              </TabsContent>

              <TabsContent value="about" className="m-0 border-0 p-0">
                <div className="mb-6 p-4 rounded-lg border border-border bg-muted/30 flex items-center gap-4">
                  <div className="size-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                    <Settings className="size-6" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">ImageMagick GUI</div>
                    <div className="text-xs text-muted-foreground">Version 1.0.0 · Built with Tauri 2 + React</div>
                  </div>
                  <Button variant="outline" size="sm" className="ml-auto h-8 text-[11px]">Check for updates</Button>
                </div>

                <SettingGroup>
                  <div className="flex items-center justify-between p-3 border-b border-border/50">
                    <div className="text-sm">ImageMagick version</div>
                    <div className="text-[11px] font-mono text-muted-foreground">7.1.1-15</div>
                  </div>
                  <div className="flex items-center justify-between p-3 border-b border-border/50">
                    <div className="text-sm">Tauri version</div>
                    <div className="text-[11px] font-mono text-muted-foreground">2.0.4</div>
                  </div>
                  <div className="flex items-center justify-between p-3">
                    <div className="text-sm">Config location</div>
                    <div className="text-[11px] font-mono text-muted-foreground">~/.config/imgui/</div>
                  </div>
                </SettingGroup>

                <div className="mt-6 flex gap-2">
                  <Button variant="outline" size="sm" className="h-8 text-[11px]">Open config folder</Button>
                  <Button variant="destructive" size="sm" className="ml-auto h-8 text-[11px]" onClick={() => settings.resetSettings()}>
                    Reset all settings
                  </Button>
                </div>
              </TabsContent>

            </div>
          </ScrollArea>
        </main>
      </Tabs>
    </div>
  );
}
