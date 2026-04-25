import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldTitle,
} from "@/components/ui/field";

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
      <div className="mb-3 text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
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
  name: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingRow({
  name,
  description,
  children,
  className,
}: SettingRowProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-6 border-b border-border/60 p-4 last:border-0",
        className,
      )}
    >
      <Field orientation="horizontal" className="w-full">
        <FieldContent>
          <FieldTitle className="font-semibold leading-tight mb-1.5">
            {name}
          </FieldTitle>
          {description && (
            <FieldDescription className=" text-muted-foreground leading-relaxed">
              {description}
            </FieldDescription>
          )}
        </FieldContent>
        <div className="flex-shrink-0">{children}</div>
      </Field>
    </div>
  );
}
