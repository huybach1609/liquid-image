import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { RotateCcw } from "lucide-react";
import { open as openDialog } from "@tauri-apps/plugin-dialog";
import { openPath } from "@tauri-apps/plugin-opener";
import { useBatchStore } from "../state/batch.store";
import { useSettingsStore } from "@/features/settings/state/settings.store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
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
  FieldTitle,
} from "@/components/ui/field";

export function BatchOutputPanel() {
  const { t } = useTranslation("batch");

  // Granular store subscriptions
  const outputDirectory = useBatchStore((s) => s.outputDirectory);
  const setOutputDirectory = useBatchStore((s) => s.setOutputDirectory);
  const defaultOutputFolder = useSettingsStore((s) => s.outputFolder);
  const conflictPolicy = useSettingsStore((s) => s.conflictPolicy);
  const autoOpenOutput = useSettingsStore((s) => s.autoOpenOutput);
  const setSetting = useSettingsStore((s) => s.setSetting);

  const handleSelectDirectory = useCallback(async () => {
    try {
      const selected = await openDialog({
        directory: true,
        multiple: false,
        defaultPath: outputDirectory || defaultOutputFolder || undefined,
      });
      if (selected && typeof selected === "string") {
        setOutputDirectory(selected);
      }
    } catch (err) {
      console.error("Failed to select output folder:", err);
    }
  }, [outputDirectory, defaultOutputFolder, setOutputDirectory]);

  const handleResetToDefault = useCallback(() => {
    setOutputDirectory(defaultOutputFolder || "./out/");
  }, [defaultOutputFolder, setOutputDirectory]);

  const handleOpenFolder = useCallback(async () => {
    try {
      const target = outputDirectory || defaultOutputFolder || "./out/";
      await openPath(target);
    } catch (err) {
      console.warn("Could not open destination directory directly:", err);
    }
  }, [outputDirectory, defaultOutputFolder]);

  return (
    <div className="flex flex-col gap-5">
      {/* Destination Directory Section */}
      <section className="flex flex-col gap-2">
        <header className="flex items-center justify-between text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          <span>{t("output.destination", "Destination Directory")}</span>
          <button
            type="button"
            onClick={handleOpenFolder}
            className="text-[11px] font-normal normal-case text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("output.openFolder", "Open folder")}
          </button>
        </header>

        <div className="rounded-lg border border-border/70 bg-card p-3 shadow-xs">
          <div className="flex items-center gap-1.5">
            <Input
              value={outputDirectory}
              onChange={(e) => setOutputDirectory(e.target.value)}
              placeholder="./out/"
              className="h-8 flex-1 font-mono text-xs truncate"
            />
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              title={t("output.useDefault", "Reset to default output folder")}
              onClick={handleResetToDefault}
              className="shrink-0"
            >
              <RotateCcw className="size-3.5" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectDirectory}
              className="shrink-0 text-xs"
            >
              {t("common.browse", { defaultValue: "Browse" })}
            </Button>
          </div>
        </div>
      </section>

      {/* Conflict Resolution Section */}
      <section className="flex flex-col gap-2">
        <header className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {t("output.conflictHandling", "Conflict Resolution")}
        </header>

        <div className="rounded-lg border border-border/70 bg-card p-3 shadow-xs">
          <Select
            value={conflictPolicy}
            onValueChange={(val) => setSetting("conflictPolicy", val as any)}
          >
            <SelectTrigger className="h-8 w-full text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="rename">
                  {t("output.policyRename", "Auto-rename (append _1)")}
                </SelectItem>
                <SelectItem value="overwrite">
                  {t("output.policyOverwrite", "Overwrite existing")}
                </SelectItem>
                <SelectItem value="skip">
                  {t("output.policySkip", "Skip file")}
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Output Automation Section */}
      <section className="flex flex-col gap-2">
        <header className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
          {t("output.behavior", "Automation")}
        </header>

        <div className="rounded-lg border border-border/70 bg-card p-3 shadow-xs">
          <FieldGroup>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle className="text-xs font-medium text-foreground">
                  {t("output.autoOpen", "Auto-open destination")}
                </FieldTitle>
              </FieldContent>
              <Switch
                checked={autoOpenOutput}
                onCheckedChange={(val) => setSetting("autoOpenOutput", val)}
              />
            </Field>
          </FieldGroup>
        </div>
      </section>
    </div>
  );
}
