import { useState } from "react";

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
import { getNumberParam, getStringParam } from "@/lib/functionParams";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "../ui/input";

const OUTPUT_FORMATS = ["PNG", "JPEG", "WEBP", "GIF", "TIFF", "BMP"] as const;
const WEBP_METHODS = [0, 1, 2, 3, 4, 5, 6] as const;
const COLOR_DEPTHS = [8, 16, 32] as const;
const DITHER_OPTIONS = ["None", "Floyd-Steinberg"] as const;

type OutputFormat = (typeof OUTPUT_FORMATS)[number];
type DitherMode = (typeof DITHER_OPTIONS)[number];

function normalizeOutputFormat(v: string): OutputFormat {
  const normalized = v.trim().toUpperCase();
  if (normalized === "JPEG" || normalized === "JPG") return "JPEG";
  if (normalized === "WEBP") return "WEBP";
  if (normalized === "GIF") return "GIF";
  if (normalized === "TIFF") return "TIFF";
  if (normalized === "BMP") return "BMP";
  return "PNG";
}

function getQualityLabel(format: OutputFormat): string {
  if (format === "JPEG") return "Quality (JPEG)";
  if (format === "PNG") return "Compression level (PNG)";
  return "Quality";
}

function getQualityHint(format: OutputFormat, quality: number): string {
  if (format === "PNG") {
    return `zlib level: ~${Math.round(quality / 10)} (${quality}÷10)`;
  }
  if (format === "JPEG") {
    return quality >= 90 ? "High quality, larger file size" : "Balanced quality and size";
  }
  return String(quality);
}

const ConvertFunction = () => {
  const functionParams = useSingleStore((s) => s.functionParams);
  const updateFunctionParam = useSingleStore((s) => s.updateFunctionParam);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const outputFormat = normalizeOutputFormat(
    getStringParam(functionParams, "outputFormat", "PNG"),
  );
  const quality = getNumberParam(functionParams, "quality", 85);
  const webpMethod = Math.min(
    6,
    Math.max(0, getNumberParam(functionParams, "webpMethod", 1)),
  );
  const dither = getStringParam(functionParams, "dither", "None") as DitherMode;
  const stripMetadata =
    functionParams.stripMetadata === true ||
    functionParams.stripMetadata === "true";
  const outputName = getStringParam(functionParams, "outputName", "photo_out");
  const outputDir = getStringParam(functionParams, "outputDir", "./output");
  const colorProfile = getStringParam(functionParams, "colorProfile", "sRGB");
  const colorDepth = getNumberParam(functionParams, "colorDepth", 8);
  const dpi = getNumberParam(functionParams, "dpi", 72);
  const progressive =
    functionParams.progressive === true || functionParams.progressive === "true";

  const isWebp = outputFormat === "WEBP";
  const isGif = outputFormat === "GIF";

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Output format</Label>
        <Select
          value={outputFormat}
          onValueChange={(value) =>
            updateFunctionParam("outputFormat", normalizeOutputFormat(value))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an output format" />
          </SelectTrigger>
          <SelectContent position="popper">
            {OUTPUT_FORMATS.map((format) => (
              <SelectItem key={format} value={format}>
                {format}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {!isWebp ? (
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">
            {getQualityLabel(outputFormat)}
          </Label>
          <Slider
            min={0}
            max={100}
            value={[quality]}
            onValueChange={(value) => updateFunctionParam("quality", value[0] ?? 85)}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{getQualityHint(outputFormat, quality)}</span>
            <span>{quality}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">
            Compression effort (WebP)
          </Label>
          <div className="grid grid-cols-7 gap-1">
            {WEBP_METHODS.map((method) => {
              const active = webpMethod === method;
              return (
                <Button
                  key={method}
                  type="button"
                  size="sm"
                  variant={active ? "default" : "outline"}
                  className={cn("h-7 text-[11px]", method === 0 || method === 6 ? "px-1" : "px-2")}
                  onClick={() => updateFunctionParam("webpMethod", method)}
                >
                  {method === 0 ? "0 fast" : method === 6 ? "6 best" : method}
                </Button>
              );
            })}
          </div>
        </div>
      )}

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
                  className="h-7 text-[11px]"
                  onClick={() => updateFunctionParam("dither", option)}
                >
                  {option}
                </Button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Strip metadata</Label>
        <Select
          value={stripMetadata ? "yes" : "no"}
          onValueChange={(value) =>
            updateFunctionParam("stripMetadata", value === "yes")
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="yes">Yes (-strip)</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Output filename</Label>
        <Input
          value={outputName}
          onChange={(e) => updateFunctionParam("outputName", e.target.value)}
          placeholder="photo_out"
        />
      </div>

      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Output folder</Label>
        <Input
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={outputDir}
          onChange={(e) => updateFunctionParam("outputDir", e.target.value)}
        />
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
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Color profile</Label>
              <Select
                value={colorProfile}
                onValueChange={(value) => updateFunctionParam("colorProfile", value)}
              >
                <SelectTrigger className="w-full">
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
              <Label className="text-xs text-muted-foreground">Color depth</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {COLOR_DEPTHS.map((depth) => (
                  <Button
                    key={depth}
                    type="button"
                    size="sm"
                    variant={colorDepth === depth ? "default" : "outline"}
                    className="h-7 text-[11px]"
                    onClick={() => updateFunctionParam("colorDepth", depth)}
                  >
                    {depth}-bit
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Resolution (DPI)</Label>
              <div className="flex items-center gap-1.5">
                {[72, 150, 300].map((value) => (
                  <Button
                    key={value}
                    type="button"
                    size="sm"
                    variant={dpi === value ? "default" : "outline"}
                    className="h-7 px-2 text-[11px]"
                    onClick={() => updateFunctionParam("dpi", value)}
                  >
                    {value === 72 ? "72 web" : value === 300 ? "300 print" : "150"}
                  </Button>
                ))}
                <Input
                  type="number"
                  min={1}
                  max={1200}
                  className="h-7 w-20 text-xs"
                  value={String(dpi)}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    if (Number.isFinite(next)) {
                      updateFunctionParam("dpi", Math.max(1, Math.min(1200, next)));
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3">
              <Label className="text-xs text-muted-foreground">
                Progressive / interlaced
              </Label>
              <Switch
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
