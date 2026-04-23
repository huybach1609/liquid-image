import { useState } from "react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { BatchQueuePanel } from "@/features/batch/components/BatchQueuePanel";
import { BatchPipelinePanel } from "@/features/batch/components/BatchPipelinePanel";
import { BatchOutputPanel } from "@/features/batch/components/BatchOutputPanel";
import { BatchLogPanel } from "@/features/batch/components/BatchLogPanel";
import { BatchSettingsPanel } from "@/features/batch/components/BatchSettingsPanel";
import { BatchBottomBar } from "@/features/batch/components/BatchBottomBar";
import { useTranslation } from "react-i18next";

export function BatchModePage() {
  const { t } = useTranslation("batch");
  const [activeTab, setActiveTab] = useState<"output" | "log" | "settings">(
    "output",
  );

  return (
    <ResizablePanelGroup className="h-full border border-border/70 bg-card overflow-hidden">
      {/* Left Sidebar: Input Queue */}
      <ResizablePanel defaultSize={20} minSize={15} className="bg-muted/5">
        <BatchQueuePanel />
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Main Content: Pipeline */}
      <ResizablePanel defaultSize={55} minSize={40}>
        <BatchPipelinePanel />
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Right Sidebar: Tabs & Execution */}
      <ResizablePanel defaultSize={25} minSize={20}>
        <aside className="grid h-full min-h-0 grid-rows-[auto_1fr_auto] border-l border-border/70">
          {/* Tabs Header */}
          <div className="flex h-12 items-center border-b border-border/70 bg-muted/10 px-1">
            {[
              { id: "output", label: t("tabs.output", "Output") },
              { id: "log", label: t("tabs.log", "Log") },
              { id: "settings", label: t("tabs.settings", "Settings") },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 h-full flex items-center justify-center text-[11px] font-semibold tracking-wider uppercase transition-all ${
                  activeTab === tab.id
                    ? "bg-background border-x border-border/70 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="overflow-auto p-4 bg-background">
            {activeTab === "output" && <BatchOutputPanel />}
            {activeTab === "log" && <BatchLogPanel />}
            {activeTab === "settings" && <BatchSettingsPanel />}
          </div>

          {/* Actions Footer */}
          <BatchBottomBar />
        </aside>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
