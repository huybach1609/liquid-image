import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSettingsStore } from "@/features/settings/state/settings.store";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";

const NAMING_PRESETS: Record<string, string> = {
  original: "{name}",
  prefix: "out_{name}",
  suffix: "{name}_out",
  counter: "{counter}",
};

function getPatternPreset(pattern: string): string {
  if (pattern === "{name}") return "original";
  if (pattern === "out_{name}") return "prefix";
  if (pattern === "{name}_out") return "suffix";
  if (pattern === "{counter}") return "counter";
  return "custom";
}

export function BatchSettingsPanel() {
  const { t } = useTranslation("batch");

  // Granular store subscriptions
  const workers = useSettingsStore((s) => s.workers);
  const onErrorPolicy = useSettingsStore((s) => s.onErrorPolicy);
  const namingPattern = useSettingsStore((s) => s.namingPattern);
  const dryRunBeforeBatch = useSettingsStore((s) => s.dryRunBeforeBatch);
  const saveErrorLog = useSettingsStore((s) => s.saveErrorLog);
  const setSetting = useSettingsStore((s) => s.setSetting);

  const handleWorkersChange = useCallback(
    (values: number[]) => {
      const val = values[0];
      if (val !== undefined) {
        setSetting("workers", val);
      }
    },
    [setSetting],
  );

  const handlePresetChange = useCallback(
    (preset: string) => {
      if (preset === "custom") {
        if (!namingPattern || namingPattern === "{name}") {
          setSetting("namingPattern", "{name}_processed");
        }
      } else {
        setSetting("namingPattern", NAMING_PRESETS[preset] ?? "{name}");
      }
    },
    [namingPattern, setSetting],
  );

  const currentPreset = getPatternPreset(namingPattern);

  return (
    <div className="flex flex-col gap-5">
      {/* Performance Section */}
      <section className="flex flex-col gap-2">
        <header className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {t("settings.performance", "Performance")}
        </header>

        <div className="rounded-lg border border-border/70 bg-card p-3.5 shadow-xs">
          <FieldGroup className="gap-3.5">
            {/* Parallel Workers */}
            <Field orientation="vertical">
              <div className="flex items-center justify-between">
                <FieldLabel className="text-xs font-medium text-foreground">
                  {t("settings.concurrency", "Parallel Workers")}
                </FieldLabel>
                <Badge variant="secondary" className="font-mono text-xs tabular-nums">
                  {workers}
                </Badge>
              </div>

              <div className="flex flex-col gap-1 pt-1">
                <Slider
                  min={1}
                  max={16}
                  step={1}
                  value={[workers]}
                  onValueChange={handleWorkersChange}
                  className="py-1"
                />
                <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                  <span>1</span>
                  <span>16</span>
                </div>
              </div>
            </Field>

            <Separator className="bg-border/60" />

            {/* On Error Policy */}
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle className="text-xs font-medium text-foreground">
                  {t("settings.onError", "On Error")}
                </FieldTitle>
              </FieldContent>
              <Select
                value={onErrorPolicy}
                onValueChange={(val) => setSetting("onErrorPolicy", val as any)}
              >
                <SelectTrigger className="h-8 min-w-[145px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="skip-and-continue">
                      {t("settings.skipAndContinue", "Skip and continue")}
                    </SelectItem>
                    <SelectItem value="stop-immediately">
                      {t("settings.stopImmediately", "Stop immediately")}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        </div>
      </section>

      {/* File Naming Section */}
      <section className="flex flex-col gap-2">
        <header className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {t("settings.fileNaming", "File Naming")}
        </header>

        <div className="rounded-lg border border-border/70 bg-card p-3 shadow-xs">
          <div className="flex flex-col gap-2">
            <Select value={currentPreset} onValueChange={handlePresetChange}>
              <SelectTrigger className="h-8 w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="original">
                    {t("output.nameOriginal", "Keep original names")}
                  </SelectItem>
                  <SelectItem value="prefix">
                    {t("output.namePrefix", "Add prefix")}
                  </SelectItem>
                  <SelectItem value="suffix">
                    {t("output.nameSuffix", "Add suffix")}
                  </SelectItem>
                  <SelectItem value="counter">
                    {t("output.nameCounter", "Sequential (001...)")}
                  </SelectItem>
                  <SelectItem value="custom">
                    {t("output.nameCustom", "Custom Pattern")}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            {currentPreset !== "original" ? (
              <Input
                value={namingPattern}
                onChange={(e) => setSetting("namingPattern", e.target.value)}
                placeholder="{name}_out"
                className="h-8 font-mono text-xs"
              />
            ) : null}
          </div>
        </div>
      </section>

      {/* Advanced Safety Section */}
      <section className="flex flex-col gap-2">
        <header className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {t("settings.advanced", "Advanced")}
        </header>

        <div className="rounded-lg border border-border/70 bg-card p-3 shadow-xs">
          <FieldGroup className="gap-3">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle className="text-xs font-medium text-foreground">
                  {t("settings.dryRunBeforeBatch", "Pre-batch Validation")}
                </FieldTitle>
              </FieldContent>
              <Switch
                checked={dryRunBeforeBatch}
                onCheckedChange={(val) => setSetting("dryRunBeforeBatch", val)}
              />
            </Field>

            <Separator className="bg-border/60" />

            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle className="text-xs font-medium text-foreground">
                  {t("settings.saveErrorLog", "Save Error Log")}
                </FieldTitle>
              </FieldContent>
              <Switch
                checked={saveErrorLog}
                onCheckedChange={(val) => setSetting("saveErrorLog", val)}
              />
            </Field>
          </FieldGroup>
        </div>
      </section>
    </div>
  );
}
