import { memo, type ComponentType } from "react";
import { Ellipsis } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SingleCliPreview } from "@/features/single/components/SingleCliPreview";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

type CommandPreviewItem = {
  label: string;
  command: string;
};

type OptionsPaneProps = {
  selectedFunctionNameLabel: string;
  resetCurrentFunctionParams: () => void;
  resetAllFunctionParams: () => void;
  SelectedFunctionComponent: ComponentType;
  commandPreviews: CommandPreviewItem[];
  cliPreviewMode: "function" | "all";
  setCliPreviewMode: (mode: "function" | "all") => void;
};

export const OptionsPane = memo(function OptionsPane({
  selectedFunctionNameLabel,
  resetCurrentFunctionParams,
  resetAllFunctionParams,
  SelectedFunctionComponent,
  commandPreviews,
  cliPreviewMode,
  setCliPreviewMode,
}: OptionsPaneProps) {
  const { t } = useTranslation("single");

  return (
    <aside className="flex h-full min-h-0 flex-col">
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border/70 px-4">
        <span className="text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">
          {t("optionsPanel.title", { name: selectedFunctionNameLabel })}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="sm" className="size-7">
              <Ellipsis />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={resetCurrentFunctionParams}>
              {t("reset.current", { name: selectedFunctionNameLabel })}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={resetAllFunctionParams}>
              {t("reset.all")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <ResizablePanelGroup orientation="vertical">
        <ResizablePanel defaultSize={70} minSize={30}>
          <div className="h-full overflow-auto px-4 py-3">
            <SelectedFunctionComponent />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={30} minSize={10}>
          <div className="h-full overflow-auto px-4 py-3">
            <SingleCliPreview
              commandPreviews={commandPreviews}
              cliPreviewMode={cliPreviewMode}
              setCliPreviewMode={setCliPreviewMode}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </aside>
  );
});
