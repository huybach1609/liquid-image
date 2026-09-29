import * as React from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useAppStore } from "@/app/store/app.store";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
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

export function SettingsDialog() {
  useTranslation("common");
  const isSettingsOpen = useAppStore((s) => s.isSettingsOpen);
  const closeSettings = useAppStore((s) => s.closeSettings);

  const [activeTab, setActiveTab] = React.useState<SettingsTab>("general");
  const appInfo = useAppInfo();

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

  const handleTabChange = React.useCallback((tab: SettingsTab) => {
    if (tab === "notifications" || tab === "shortcuts") {
      return;
    }
    setActiveTab(tab);
  }, []);

  React.useEffect(() => {
    if (activeTab === "notifications" || activeTab === "shortcuts") {
      setActiveTab("general");
    }
  }, [activeTab]);

  return (
    <Dialog
      open={isSettingsOpen}
      onOpenChange={(open) => {
        if (!open) {
          closeSettings();
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[94vw] max-w-5xl sm:max-w-5xl md:max-w-5xl lg:max-w-5xl h-[86vh] max-h-[860px] p-0 gap-0 overflow-hidden rounded-2xl border border-border/80 bg-background/95 backdrop-blur-md shadow-2xl flex flex-col focus:outline-none"
      >
        {/* Top Header Bar */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-border/60 bg-muted/20 px-4 sm:px-6 gap-3 select-none">
          <div className="flex items-center gap-2.5 min-w-0">
            <DialogTitle className="text-sm font-semibold tracking-tight text-foreground truncate">
              Settings
            </DialogTitle>
          </div>

          <DialogDescription className="sr-only">
            Application settings and preferences
          </DialogDescription>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              className="rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={closeSettings}
              title="Close (Esc)"
              aria-label="Close"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Dialog Body */}
        <div className="flex flex-1 min-h-0 w-full overflow-hidden">
          {/* Left Sidebar */}
          <div className="w-56 sm:w-60 md:w-64 shrink-0 border-r border-border/40 bg-muted/10 flex flex-col min-h-0">
            <SettingsSidebar
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          </div>

          {/* Right Main Content */}
          <main className="flex h-full min-w-0 flex-1 flex-col bg-background">
            <header className="flex h-12 flex-shrink-0 items-center justify-between border-b border-border/40 bg-background/50 px-6 backdrop-blur-sm">
              <div className="text-sm font-bold capitalize tracking-tight text-foreground">
                {activeTab.replace("-", " ")}
              </div>
              <div className="flex items-center gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 px-2.5 text-xs font-medium cursor-pointer"
                  onClick={handleResetSection}
                >
                  <RotateCcw className="mr-1.5 size-3" />
                  Reset section
                </Button>
                <Button
                  size="sm"
                  className={cn(
                    "h-7 px-3 text-xs font-semibold transition-all shadow-xs cursor-pointer",
                    saved && "bg-emerald-600 hover:bg-emerald-600 text-white",
                  )}
                  onClick={handleSave}
                >
                  {saved ? (
                    <>
                      <Check className="mr-1.5 size-3" />
                      Saved
                    </>
                  ) : (
                    "Save changes"
                  )}
                </Button>
              </div>
            </header>

            <ScrollArea className="flex-1 min-h-0">
              <div className="mx-auto max-w-[780px] p-6 sm:p-8">
                <div className="animate-in fade-in slide-in-from-bottom-1 duration-200">
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
                      magickVersion={magickStatus?.version}
                      onResetAllSettings={handleResetAllSettings}
                    />
                  )}
                </div>
              </div>
            </ScrollArea>
          </main>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SettingsDialog;
