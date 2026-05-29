import * as React from "react";
import { Check, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useAppStore } from "@/app/store/app.store";
import { Button } from "@/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAppInfo } from "@/shared/hooks/useAppInfo";
import { SettingsSidebar } from "@/features/settings/SettingsSidebar";
import {
  type SettingsTab,
  useSettingsDraft,
} from "@/features/settings/hooks/useSettingsDraft";
import { GeneralSettingsSection } from "@/features/settings/sections/GeneralSettingsSection";
import { AppearanceSettingsSection } from "@/features/settings/sections/AppearanceSettingsSection";
import { FilesSettingsSection } from "@/features/settings/sections/FilesSettingsSection";
import { ProcessingSettingsSection } from "@/features/settings/sections/ProcessingSettingsSection";
import { ShortcutsSettingsSection } from "@/features/settings/sections/ShortcutsSettingsSection";
import { ImagickSettingsSection } from "@/features/settings/sections/ImagickSettingsSection";
import { NotificationsSettingsSection } from "@/features/settings/sections/NotificationsSettingsSection";
import { AboutSection } from "@/features/settings/sections/AboutSection";

export function SettingPage() {
  useTranslation("common");
  const setMode = useAppStore((s) => s.setMode);
  const [activeTab, setActiveTab] = React.useState<SettingsTab>("general");
  const appInfo = useAppInfo();
  const sidebarRef = React.useRef<HTMLElement>(null);
  const [isCompact, setIsCompact] = React.useState(false);
  const {
    draft,
    saved,
    magickStatus,
    isTesting,
    updateDraftSetting,
    handleThemeChange,
    handleResetSection,
    handleResetAllSettings,
    handleBrowseBinary,
    handleDetectBinary,
    handleTestBinary,
    handleSave,
  } = useSettingsDraft(activeTab);

  React.useEffect(() => {
    if (!sidebarRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setIsCompact(entry.contentRect.width < 120);
      }
    });

    observer.observe(sidebarRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex h-full w-full overflow-hidden border-t border-border/40 bg-background">
      <ResizablePanelGroup className="h-full w-full">
        <ResizablePanel
          defaultSize={200}
          minSize={50}
          maxSize={300}
          className="bg-muted/10"
        >
          <SettingsSidebar
            activeTab={activeTab}
            isCompact={isCompact}
            appName={appInfo.name}
            appVersion={appInfo.version}
            onTabChange={setActiveTab}
            onBack={() => setMode("single")}
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={80}>
          <main className="flex h-full min-w-0 flex-1 flex-col">
            <header className="flex h-[56px] flex-shrink-0 items-center justify-between border-b border-border/40 bg-background/50 px-8 backdrop-blur-sm">
              <div className="text-base font-bold capitalize tracking-tight">
                {activeTab.replace("-", " ")}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 font-medium"
                  onClick={handleResetSection}
                >
                  <RotateCcw className="mr-2 size-3.5" />
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
                      <Check className="mr-2 size-3.5" />
                      Saved
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </div>
            </header>

            <ScrollArea className="flex-1">
              <div className="mx-auto max-w-[800px] p-10">
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {activeTab === "general" && (
                    <GeneralSettingsSection
                      draft={draft}
                      onUpdateSetting={updateDraftSetting}
                    />
                  )}
                  {activeTab === "appearance" && (
                    <AppearanceSettingsSection
                      draft={draft}
                      onThemeChange={handleThemeChange}
                      onUpdateSetting={updateDraftSetting}
                    />
                  )}
                  {activeTab === "files" && (
                    <FilesSettingsSection
                      draft={draft}
                      onUpdateSetting={updateDraftSetting}
                    />
                  )}
                  {activeTab === "processing" && (
                    <ProcessingSettingsSection
                      draft={draft}
                      onUpdateSetting={updateDraftSetting}
                    />
                  )}
                  {activeTab === "shortcuts" && <ShortcutsSettingsSection />}
                  {activeTab === "imagick" && (
                    <ImagickSettingsSection
                      draft={draft}
                      magickStatus={magickStatus}
                      isTesting={isTesting}
                      onUpdateSetting={updateDraftSetting}
                      onBrowseBinary={handleBrowseBinary}
                      onDetectBinary={handleDetectBinary}
                      onTestBinary={handleTestBinary}
                    />
                  )}
                  {activeTab === "notifications" && (
                    <NotificationsSettingsSection
                      draft={draft}
                      onUpdateSetting={updateDraftSetting}
                    />
                  )}
                  {activeTab === "about" && (
                    <AboutSection
                      appName={appInfo.name}
                      appVersion={appInfo.version}
                      tauriVersion={appInfo.tauriVersion}
                      onResetAllSettings={handleResetAllSettings}
                    />
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
