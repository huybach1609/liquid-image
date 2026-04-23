import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ChevronRight, ChevronDown, Trash2, Power } from "lucide-react";
import { FUNCTION_CATALOG } from "@/shared/constants/functionCatalog";
import { useBatchStore } from "../state/batch.store";
import type { BatchPipelineStep } from "../types";

interface SortablePipelineStepProps {
  step: BatchPipelineStep;
  index: number;
}

export function SortablePipelineStep({ step, index }: SortablePipelineStepProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });

  const { removeStep, updateStepParams, toggleStepExpanded, toggleStepEnabled } = useBatchStore();

  const catalogEntry = FUNCTION_CATALOG.find((e) => e.id === step.functionId);
  if (!catalogEntry) return null;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  const FunctionComponent = catalogEntry.component;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group rounded-lg border border-border/70 bg-background overflow-hidden transition-shadow ${
        isDragging ? "shadow-lg border-primary/50" : "hover:border-border"
      }`}
    >
      {/* Header */}
      <div className={`flex items-center gap-2 px-3 py-2 ${!step.enabled ? "opacity-50" : ""}`}>
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded text-muted-foreground"
        >
          <GripVertical className="size-4" />
        </button>

        <button
          onClick={() => toggleStepExpanded(step.id)}
          className="p-1 hover:bg-muted rounded text-muted-foreground"
        >
          {step.isExpanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </button>

        <div className="flex size-6 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">
          {index + 1}
        </div>

        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-primary">{catalogEntry.icon}</span>
          <p className="text-sm font-medium truncate">{catalogEntry.id}</p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleStepEnabled(step.id)}
            className={`p-1.5 rounded-md transition-colors ${
              step.enabled ? "text-primary hover:bg-primary/10" : "text-muted-foreground hover:bg-muted"
            }`}
            title={step.enabled ? "Disable step" : "Enable step"}
          >
            <Power className="size-3.5" />
          </button>
          <button
            onClick={() => removeStep(step.id)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Remove step"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Accordion Content */}
      {step.isExpanded && (
        <div className="border-t border-border/50 bg-muted/20 p-4">
          <FunctionComponent
            params={step.params}
            onChange={(newParams: any) => updateStepParams(step.id, newParams)}
          />
        </div>
      )}
    </div>
  );
}
