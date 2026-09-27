import { Gauge, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useSingleStore } from "@/features/single/state/single.store";
import { useSettingsStore } from "@/features/settings/state/settings.store";
import { getNumberParam, getStringParam } from "@/lib/functionParams";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "../ui/input";
import {
  getCachedImageFormatInfo,
  getImageFormatInfo,
} from "@/shared/tauri/commands";
import type { MagickFormatInfo } from "@/shared/types/magick";

const COLOR_DEPTHS = [8, 16, 32] as const;
const DITHER_OPTIONS = ["None", "Floyd-Steinberg"] as const;

type DitherMode = (typeof DITHER_OPTIONS)[number];

function normalizeOutputFormat(v: string): string {
  const normalized = v.trim().toUpperCase();
  if (!normalized) return "PNG";
  if (normalized === "JPEG" || normalized === "JPG") return "JPEG";
  return normalized;
}

function getQualityLabel(format: string): string {
  if (format === "JPEG") return "Quality (JPEG)";
  if (format === "PNG") return "Compression level (PNG)";
  if (format === "WEBP") return "Quality (WEBP)";
  return "Quality";
}

function getQualityHint(format: string, quality: number): string {
  if (format === "PNG") {
    return `zlib level: ~${Math.round(quality / 10)} (${quality}÷10)`;
  }
  if (format === "JPEG" || format === "WEBP") {
    return quality >= 90
      ? "High quality, larger file size"
      : "Balanced quality and size";
  }
  return String(quality);
}

interface ConvertFunctionProps {
  params?: Record<string, any>;
  onUpdateParam?: (key: string, value: any) => void;
  selectedFile?: string | null;
}

const ConvertFunction = ({
  params: propsParams,
  onUpdateParam: propsUpdateParam,
  selectedFile: propsSelectedFile,
}: ConvertFunctionProps) => {
  const storeSelectedFile = useSingleStore((s) => s.selectedFile);
  const storeFunctionParams = useSingleStore((s) => s.functionParams);
  const storeUpdateFunctionParam = useSingleStore((s) => s.updateFunctionParam);

  const selectedFile = propsSelectedFile !== undefined ? propsSelectedFile : storeSelectedFile;
  const functionParams = propsParams !== undefined ? propsParams : storeFunctionParams;
  const updateFunctionParam = propsUpdateParam !== undefined ? propsUpdateParam : storeUpdateFunctionParam;

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isCustomDpi, setIsCustomDpi] = useState(false);

  // Default to input extension if available, else PNG
  const defaultExt = selectedFile
    ? normalizeOutputFormat(
        selectedFile.split(".").pop()?.toLowerCase() || "PNG",
      )
    : "PNG";

  const outputFormat = normalizeOutputFormat(
    getStringParam(functionParams, "outputFormat", defaultExt),
  );
  const quality = getNumberParam(functionParams, "quality", 90);
  const webpMethod = Math.min(
    6,
    Math.max(0, getNumberParam(functionParams, "webpMethod", 1)),
  );
  const dither = getStringParam(functionParams, "dither", "None") as DitherMode;
  const defaultStripMetadata = useSettingsStore((s) => s.stripMetadata);
  const defaultColorProfile = useSettingsStore((s) => s.defaultColorProfile);

  const stripMetadata =
    functionParams.stripMetadata !== undefined
      ? functionParams.stripMetadata === true || functionParams.stripMetadata === "true"
      : defaultStripMetadata;
  const colorProfile = getStringParam(
    functionParams,
    "colorProfile",
    defaultColorProfile || "None",
  );
  const colorDepth = getNumberParam(functionParams, "colorDepth", 0);
  const dpi = getNumberParam(functionParams, "dpi", 0);
  const progressive =
    functionParams.progressive === true ||
    functionParams.progressive === "true";

  useEffect(() => {
    if (functionParams.stripMetadata === undefined && defaultStripMetadata !== undefined) {
      updateFunctionParam("stripMetadata", defaultStripMetadata);
    }
    if (
      functionParams.colorProfile === undefined &&
      defaultColorProfile &&
      defaultColorProfile !== "None"
    ) {
      updateFunctionParam("colorProfile", defaultColorProfile);
    }
  }, [defaultStripMetadata, defaultColorProfile, functionParams.stripMetadata, functionParams.colorProfile, updateFunctionParam]);

  const isWebp = outputFormat === "WEBP";
  const isGif = outputFormat === "GIF";
  const [formatCatalog, setFormatCatalog] = useState<MagickFormatInfo[]>(
    () => getCachedImageFormatInfo() ?? [],
  );

  useEffect(() => {
    let cancelled = false;

    void getImageFormatInfo()
      .then((results) => {
        if (!cancelled) {
          setFormatCatalog(results);
        }
      })
      .catch((error) => {
        console.error("[convert] failed to load format catalog", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const formatOptions = useMemo(() => {
    const catalogByName = new Map<string, MagickFormatInfo>();

    for (const format of formatCatalog) {
      const name = normalizeOutputFormat(format.name);
      if (!format.mode.toLowerCase().includes("w")) continue;
      if (!catalogByName.has(name)) {
        catalogByName.set(name, { ...format, name });
      }
    }

    if (!catalogByName.has(outputFormat)) {
      catalogByName.set(outputFormat, {
        name: outputFormat,
        module: "CUSTOM",
        mode: "rw+",
        description: "Current output format",
      });
    }

    const ordered = Array.from(catalogByName.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    return {
      catalogByName,
      names: ordered.map((format) => format.name),
    };
  }, [formatCatalog, outputFormat]);

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Output format</Label>
        <Combobox
          items={formatOptions.names}
          value={outputFormat}
          onValueChange={(value) => {
            updateFunctionParam(
              "outputFormat",
              normalizeOutputFormat(value ?? "PNG"),
            );
          }}
        >
          <ComboboxInput
            className="w-full"
            placeholder="Select an output format"
          />
          <ComboboxContent>
            <ComboboxEmpty>No writable formats found.</ComboboxEmpty>
            <ComboboxList>
              {(item) => {
                const name = item as string;
                const format = formatOptions.catalogByName.get(name);
                return (
                  <ComboboxItem key={name} value={name}>
                    <div className="flex w-full flex-col gap-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{name}</span>
                        <span className="text-[11px] text-muted-foreground">
                          {format?.mode ?? "rw+"}
                        </span>
                      </div>
                      <span className="line-clamp-1 text-xs text-muted-foreground/80">
                        {format?.description || format?.module || "Image format"}
                      </span>
                    </div>
                  </ComboboxItem>
                );
              }}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">
          {getQualityLabel(outputFormat)}
        </Label>
        <Slider
          min={0}
          max={100}
          value={[quality]}
          onValueChange={(value) =>
            updateFunctionParam("quality", value[0] ?? 90)
          }
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{getQualityHint(outputFormat, quality)}</span>
          <span>{quality}</span>
        </div>
      </div>

      {isWebp ? (
        <div className="space-y-3.5 py-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="size-3.5 text-muted-foreground" />
              <Label className="text-xs font-medium">Compression Speed</Label>
            </div>
            <span className="text-xs font-medium text-foreground/70">
              {webpMethod === 6
                ? "Slow (Best)"
                : webpMethod === 4
                  ? "Normal"
                  : webpMethod === 2
                    ? "Fast"
                    : webpMethod === 0
                      ? "Very Fast"
                      : `Level ${6 - webpMethod}`}
            </span>
          </div>
          <div className="px-1">
            <Slider
              min={0}
              max={6}
              step={1}
              value={[6 - webpMethod]}
              onValueChange={(v) => updateFunctionParam("webpMethod", 6 - v[0])}
            />
          </div>
          <div className="flex items-center justify-between px-0.5 text-xs text-muted-foreground/60">
            <span>Slow</span>
            <span className="translate-x-1">Normal</span>
            <span className="-translate-x-1">Fast</span>
            <span>Very Fast</span>
          </div>
          <p className="text-xs italic text-muted-foreground/40">
            * Slower methods provide higher quality and smaller file sizes.
          </p>
        </div>
      ) : null}

      {isGif ? (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Dithering</Label>
          <div className="grid grid-cols-2 gap-2">
            {DITHER_OPTIONS.map((option) => {
              const active = dither === option;
              return (
                <Button
                  key={option}
                  type="button"
                  size="sm"
                  variant={active ? "default" : "outline"}
                  className="h-7 text-xs"
                  onClick={() => updateFunctionParam("dither", option)}
                >
                  {option}
                </Button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Strip metadata</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            size="sm"
            variant={stripMetadata ? "default" : "outline"}
            className="h-7 text-xs"
            onClick={() => updateFunctionParam("stripMetadata", true)}
          >
            Yes (-strip)
          </Button>
          <Button
            type="button"
            size="sm"
            variant={!stripMetadata ? "default" : "outline"}
            className="h-7 text-xs"
            onClick={() => updateFunctionParam("stripMetadata", false)}
          >
            No
          </Button>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-full justify-between px-2 text-xs"
          onClick={() => setShowAdvanced((prev) => !prev)}
        >
          <span>Advanced options</span>
          <span>{showAdvanced ? "▴" : "▾"}</span>
        </Button>

        {showAdvanced ? (
          <div className="space-y-3 rounded-md border border-border/70 p-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  className={cn(
                    "text-xs transition-colors",
                    colorProfile !== "None"
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  Color profile
                </Label>
                <Switch
                  size="sm"
                  checked={colorProfile !== "None"}
                  onCheckedChange={(checked) =>
                    updateFunctionParam(
                      "colorProfile",
                      checked ? "sRGB" : "None",
                    )
                  }
                />
              </div>
              <Select
                disabled={colorProfile === "None"}
                value={colorProfile}
                onValueChange={(value) =>
                  updateFunctionParam("colorProfile", value)
                }
              >
                <SelectTrigger className="h-8 w-full text-xs">
                  <SelectValue placeholder="Select a color profile" />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="sRGB">sRGB</SelectItem>
                  <SelectItem value="Adobe RGB">Adobe RGB</SelectItem>
                  <SelectItem value="ProPhoto RGB">ProPhoto RGB</SelectItem>
                  <SelectItem value="None">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  className={cn(
                    "text-xs transition-colors",
                    colorDepth !== 0 ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  Color depth
                </Label>
                <Switch
                  size="sm"
                  checked={colorDepth !== 0}
                  onCheckedChange={(checked) =>
                    updateFunctionParam("colorDepth", checked ? 8 : 0)
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {COLOR_DEPTHS.map((depth) => (
                  <Button
                    key={depth}
                    disabled={colorDepth === 0}
                    type="button"
                    size="sm"
                    variant={colorDepth === depth ? "default" : "outline"}
                    className="h-7 text-xs"
                    onClick={() => updateFunctionParam("colorDepth", depth)}
                  >
                    {depth}-bit
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  className={cn(
                    "text-xs transition-colors",
                    dpi !== 0 ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  Resolution (DPI)
                </Label>
                <Switch
                  size="sm"
                  checked={dpi !== 0}
                  onCheckedChange={(checked) =>
                    updateFunctionParam("dpi", checked ? 72 : 0)
                  }
                />
              </div>
              {isCustomDpi ? (
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    disabled={dpi === 0}
                    min={1}
                    max={1200}
                    className="h-8 flex-1 text-xs"
                    value={dpi === 0 ? "" : String(dpi)}
                    onChange={(e) => {
                      const next = Number(e.target.value);
                      if (Number.isFinite(next)) {
                        updateFunctionParam(
                          "dpi",
                          Math.max(1, Math.min(1200, next)),
                        );
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    onClick={() => setIsCustomDpi(false)}
                    disabled={dpi === 0}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <Select
                  disabled={dpi === 0}
                  value={
                    ["72", "150", "300"].includes(String(dpi))
                      ? String(dpi)
                      : "custom"
                  }
                  onValueChange={(value) => {
                    if (value === "custom") {
                      setIsCustomDpi(true);
                    } else {
                      updateFunctionParam("dpi", Number(value));
                    }
                  }}
                >
                  <SelectTrigger className="h-8 w-full text-xs">
                    <SelectValue placeholder="Select resolution" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="72">72 web</SelectItem>
                    <SelectItem value="150">150</SelectItem>
                    <SelectItem value="300">300 print</SelectItem>
                    <SelectItem value="custom">Custom...</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="flex items-center justify-between gap-3">
              <Label
                className={cn(
                  "text-xs transition-colors",
                  progressive ? "text-primary" : "text-muted-foreground",
                )}
              >
                Progressive / interlaced
              </Label>
              <Switch
                size="sm"
                checked={progressive}
                onCheckedChange={(checked) =>
                  updateFunctionParam("progressive", checked)
                }
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ConvertFunction;
