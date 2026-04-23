import { useBatchStore } from "../state/batch.store";
import { FolderOpen, Settings2 } from "lucide-react";
import { open } from "@tauri-apps/plugin-dialog";
import { useTranslation } from "react-i18next";

export function BatchOutputPanel() {
  const { t } = useTranslation("batch");
  const { outputDirectory, setOutputDirectory } = useBatchStore();

  const handleSelectDirectory = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
    });
    if (selected) {
      setOutputDirectory(selected as string);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="flex items-center gap-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          <FolderOpen className="size-3" />
          {t("output.destination", "Destination Directory")}
        </label>
        <div className="flex gap-2">
          <input
            className="h-9 flex-1 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            value={outputDirectory}
            onChange={(e) => setOutputDirectory(e.target.value)}
          />
          <button
            onClick={handleSelectDirectory}
            className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted/30 hover:bg-muted transition-colors"
          >
            <FolderOpen className="size-4" />
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground italic">
          {t("output.hint", "Processed images will be saved here.")}
        </p>
      </div>

      <div className="space-y-3 pt-2 border-t border-border/50">
        <label className="flex items-center gap-2 text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
          <Settings2 className="size-3" />
          {t("output.naming", "File Naming")}
        </label>
        <select className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary">
          <option value="original">{t("output.nameOriginal", "Keep original names")}</option>
          <option value="prefix">{t("output.namePrefix", "Add prefix")}</option>
          <option value="suffix">{t("output.nameSuffix", "Add suffix")}</option>
          <option value="counter">{t("output.nameCounter", "Sequential (001...)")}</option>
        </select>
      </div>
    </div>
  );
}
