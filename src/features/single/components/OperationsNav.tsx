import { cloneElement, isValidElement, memo, type ReactNode, type RefObject } from "react";
import { useTranslation } from "react-i18next";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

type FunctionNavItem = {
  id: string;
  icon: ReactNode;
  label: string;
  description: string;
};

type OperationsNavProps = {
  operationsPanelRef: RefObject<HTMLElement | null>;
  isCompact: boolean;
  functionNavItems: FunctionNavItem[];
  selectedFunctionName: string;
  editedFunctionNameSet: Set<string>;
  onSelectFunction: (functionName: string) => void;
};

function iconView(icon: ReactNode, size: number) {
  if (!isValidElement<{ className?: string }>(icon)) {
    return icon;
  }

  const existingClassName =
    typeof icon.props.className === "string" ? icon.props.className : "";
  const sizeClassName = size > 0 ? `size-${size}` : "";

  return cloneElement(icon, {
    className: `${existingClassName} ${sizeClassName}`.trim(),
  });
}

export const OperationsNav = memo(function OperationsNav({
  operationsPanelRef,
  isCompact,
  functionNavItems,
  selectedFunctionName,
  editedFunctionNameSet,
  onSelectFunction,
}: OperationsNavProps) {
  const { t } = useTranslation("single");

  return (
    <aside ref={operationsPanelRef} className="h-full">
      <div
        className={`flex h-14 items-center border-b border-border/70 text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase ${
          isCompact ? "justify-center px-2" : "px-5"
        }`}
      >
        {isCompact ? "Ops" : t("operations.heading")}
      </div>
      <nav className="py-2">
        {functionNavItems.map((item) => {
          const isSelected = selectedFunctionName === item.id;
          const isEdited = editedFunctionNameSet.has(item.id);
          return (
            <Tooltip key={item.id} delayDuration={700}>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={item.label}
                  className={`flex h-12 w-full items-center border-r-2 py-2 text-[13px] leading-5 transition-colors outline-none ${
                    isCompact ? "justify-center gap-0 px-2" : "gap-2 px-5 text-left"
                  } ${
                    isSelected
                      ? "border-primary bg-background/80 font-medium text-primary"
                      : "border-transparent text-muted-foreground hover:bg-background/70 hover:text-foreground"
                  }`}
                  onClick={() => onSelectFunction(item.id)}
                >
                  {iconView(item.icon, isCompact ? 6 : 4)}
                  {!isCompact ? (
                    <span className="inline-flex items-center gap-1.5">
                      {item.label}
                      {isEdited ? (
                        <span
                          className="size-1.5 rounded-full bg-primary/80"
                          aria-label={t("operations.editedBadgeAria", {
                            name: item.label,
                          })}
                          title={t("operations.editedBadgeTitle")}
                        />
                      ) : null}
                    </span>
                  ) : null}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>
                  {item.label}
                  {item.description ? ` - ${item.description}` : ""}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </nav>
    </aside>
  );
});
