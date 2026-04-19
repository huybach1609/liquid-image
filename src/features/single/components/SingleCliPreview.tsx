import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "react-i18next";

type CommandPreviewItem = {
  label: string;
  command: string;
};

type SingleCliPreviewProps = {
  commandPreviews: CommandPreviewItem[];
  cliPreviewMode: "function" | "all";
  setCliPreviewMode: (mode: "function" | "all") => void;
};

export function SingleCliPreview({
  commandPreviews,
  cliPreviewMode,
  setCliPreviewMode,
}: SingleCliPreviewProps) {
  const { t } = useTranslation("single");
  const modeLabel =
    cliPreviewMode === "function" ? t("cli.modeFunction") : t("cli.modeAll");

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="mb-1 flex w-full cursor-pointer items-center justify-between gap-1 border-0 bg-transparent p-0 text-left text-[10px] font-medium tracking-[0.08em] text-muted-foreground uppercase hover:text-foreground"
          >
            <span>{t("cli.panelHeading")}</span>
            <span className="flex gap-1 lowercase text-primary">
              <span>{modeLabel}</span>
              <ChevronDown className="size-4" />
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuRadioGroup
            value={cliPreviewMode}
            onValueChange={(value) => setCliPreviewMode(value as "function" | "all")}
          >
            <DropdownMenuRadioItem value="function" id="function">
              {t("cli.modeFunction")}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="all" id="all">
              {t("cli.modeAll")}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
           </DropdownMenuContent>
      </DropdownMenu>

      <div className="space-y-2">
        {commandPreviews.map((item) => (
          <div key={item.label} className="space-y-1">
            {commandPreviews.length > 1 ? (
              <p className="text-[10px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
                {item.label}
              </p>
            ) : null}
            <div className="overflow-x-auto">
              <code className="block   text-xs text-primary">
                {item.command}
              </code>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
