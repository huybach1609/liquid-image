import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useBatchStore } from "../state/batch.store";
import { SortablePipelineStep } from "./SortablePipelineStep";
import { FUNCTION_CATALOG } from "@/shared/constants/functionCatalog";
import { Plus, Save, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";

export function BatchPipelinePanel() {
  const { t } = useTranslation("batch");
  const { pipeline, reorderSteps, addStep } = useBatchStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = pipeline.findIndex((step) => step.id === active.id);
      const newIndex = pipeline.findIndex((step) => step.id === over.id);
      reorderSteps(oldIndex, newIndex);
    }
  };

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_1fr_auto]">
      <header className="flex items-center gap-2 border-b border-border/70 px-4 py-3">
        <p className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
          {t("pipeline.title", "Pipeline")}
        </p>
        <div className="ml-auto flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted/50 transition-colors"
          >
            <Save className="size-3" />
            {t("pipeline.savePreset", "Save preset")}
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted/50 transition-colors"
          >
            <Upload className="size-3" />
            {t("pipeline.loadPreset", "Load preset")}
          </button>
        </div>
      </header>

      <div className="overflow-auto px-4 py-4 space-y-4">
        {pipeline.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-8 space-y-4 rounded-xl border-2 border-dashed border-border/50">
            <div className="p-3 bg-muted/20 rounded-full">
              <Plus className="size-8 text-muted-foreground/50" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {t("pipeline.emptyTitle", "Your pipeline is empty")}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {t("pipeline.emptySubtitle", "Add an operation below to start processing images.")}
              </p>
            </div>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={pipeline.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {pipeline.map((step, index) => (
                <SortablePipelineStep key={step.id} step={step} index={index} />
              ))}
            </SortableContext>
          </DndContext>
        )}

        {/* Add Step Button */}
        <div className="flex justify-center pt-2">
          <div className="group relative">
            <button
              type="button"
              className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-all hover:scale-105"
            >
              <Plus className="size-4" />
              {t("pipeline.addOperation", "Add operation")}
            </button>
            
            {/* Simple Dropdown Mock (to be improved) */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-50">
              <div className="bg-popover border border-border rounded-lg shadow-xl overflow-hidden py-1">
                {FUNCTION_CATALOG.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => addStep(entry.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-accent transition-colors text-left"
                  >
                    <span className="text-primary">{entry.icon}</span>
                    {entry.id}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-border/70 px-4 py-3 bg-muted/10">
        <p className="mb-1 text-[10px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
          {t("pipeline.preview", "Mogrify Preview (per file)")}
        </p>
        <code className="text-[11px] text-primary/80 font-mono break-all line-clamp-2">
          mogrify -path {useBatchStore.getState().outputDirectory} {pipeline.map(s => `-${s.functionId.toLowerCase().replace(/ /g, '_')}`).join(' ')} *.jpg
        </code>
      </footer>
    </div>
  );
}
