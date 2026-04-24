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

export function SettingSection({ label, children, className }: SettingSectionProps) {
  return (
    <div className={cn("mb-6", className)}>
      <div className="mb-2 text-[10px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
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
    <div className={cn("overflow-hidden rounded-lg border border-border bg-card", className)}>
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

export function SettingRow({ name, description, children, className }: SettingRowProps) {
  return (
    <div className={cn("flex items-center gap-4 border-b border-border p-3 last:border-0", className)}>
      <Field orientation="horizontal" className="w-full">
        <FieldContent>
          <FieldTitle className="text-sm font-medium leading-none mb-1">
            {name}
          </FieldTitle>
          {description && (
            <FieldDescription className="text-xs text-muted-foreground leading-normal">
              {description}
            </FieldDescription>
          )}
        </FieldContent>
        <div className="flex-shrink-0">
          {children}
        </div>
      </Field>
    </div>
  );
}
