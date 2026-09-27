import * as React from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldTitle,
} from "@/components/ui/field";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { Info } from "lucide-react";

interface SettingSectionProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingSection({
  label,
  children,
  className,
}: SettingSectionProps) {
  return (
    <div className={cn("mb-8", className)}>
      <div className="mb-3 text-xs font-bold tracking-wider text-muted-foreground uppercase">
        {label}
      </div>
      {children}
    </div>
  );
}

interface SettingGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function SettingGroup({ children, className }: SettingGroupProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-card shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface SettingRowProps {
  name: React.ReactNode;
  description?: React.ReactNode;
  descriptionKey?: string;
  descriptionVariant?: "tooltip" | "inline";
  children: React.ReactNode;
  className?: string;
}

export function SettingRow({
  name,
  description,
  descriptionKey,
  descriptionVariant = "tooltip",
  children,
  className,
}: SettingRowProps) {
  const { t, i18n } = useTranslation(["settings", "common"]);
  const isTooltip = descriptionVariant === "tooltip";

  const resolvedDescription = descriptionKey
    ? t(descriptionKey as any)
    : typeof description === "string" &&
        (i18n.exists(description, { ns: "settings" }) ||
          i18n.exists(description, { ns: "common" }))
      ? t(description as any)
      : description;

  const resolvedName =
    typeof name === "string" &&
    (i18n.exists(name, { ns: "settings" }) ||
      i18n.exists(name, { ns: "common" }))
      ? t(name as any)
      : name;

  return (
    <div
      className={cn(
        "flex items-center gap-6 border-b border-border/60 p-4 last:border-0",
        className,
      )}
    >
      <Field orientation="horizontal" className="w-full">
        <FieldContent>
          <FieldTitle
            className={cn(
              "flex items-center gap-1.5 font-semibold leading-tight",
              resolvedDescription && !isTooltip && "mb-1.5",
            )}
          >
            <span>{resolvedName}</span>
            {resolvedDescription && isTooltip && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex cursor-help items-center text-muted-foreground/70 transition-colors hover:text-foreground focus-visible:outline-none"
                    aria-label="More info"
                  >
                    <Info className="size-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  align="start"
                  className="max-w-xs text-xs"
                >
                  {resolvedDescription}
                </TooltipContent>
              </Tooltip>
            )}
          </FieldTitle>
          {resolvedDescription && !isTooltip && (
            <FieldDescription className="text-muted-foreground leading-relaxed">
              {resolvedDescription}
            </FieldDescription>
          )}
        </FieldContent>
        <div className="flex-shrink-0">{children}</div>
      </Field>
    </div>
  );
}
