import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useSingleStore } from "@/features/single/state/single.store";
import { Input } from "../ui/input";

const ConvertFunction = () => {
  const functionParams = useSingleStore((s) => s.functionParams);
  const updateFunctionParam = useSingleStore((s) => s.updateFunctionParam);

  const outputFormat =
    (typeof functionParams.outputFormat === "string" &&
      functionParams.outputFormat) ||
    "PNG";
  const quality =
    typeof functionParams.quality === "number"
      ? functionParams.quality
      : typeof functionParams.quality === "string"
        ? Number(functionParams.quality) || 85
        : 85;

  const stripMetadata =
    functionParams.stripMetadata === true ||
    functionParams.stripMetadata === "true";
  const colorProfile =
    typeof functionParams.colorProfile === "string"
      ? functionParams.colorProfile
      : "sRGB";
  const outputName =
    typeof functionParams.outputName === "string"
      ? functionParams.outputName
      : "photo_out";
  const outputDir =
    typeof functionParams.outputDir === "string"
      ? functionParams.outputDir
      : "./output";

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label className="block text-xs text-muted-foreground">
          Output format
        </label>
        <Select
          value={outputFormat}
          onValueChange={(value) => updateFunctionParam("outputFormat", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an output format" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="PNG">PNG</SelectItem>
            <SelectItem value="JPG">JPG</SelectItem>
            <SelectItem value="WEBP">WEBP</SelectItem>
            <SelectItem value="TIFF">TIFF</SelectItem>
            <SelectItem value="BMP">BMP</SelectItem>
            <SelectItem value="GIF">GIF</SelectItem>
            <SelectItem value="HEIC">HEIC</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <label className="block text-xs text-muted-foreground">Quality</label>
        <Slider
          min={1}
          max={100}
          value={[quality]}
          onValueChange={(value) => updateFunctionParam("quality", value[0])}
        />
        <span className="text-xs text-muted-foreground">{quality}</span>
      </div>

      <div className="space-y-1">
        <label className="block text-xs text-muted-foreground">
          Strip metadata
        </label>
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
        <label className="block text-xs text-muted-foreground">
          Color profile
        </label>
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
            <SelectItem value="CMYK">CMYK</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <label className="block text-xs text-muted-foreground">
          Output filename
        </label>
        <Input
          value={outputName}
          onChange={(e) => updateFunctionParam("outputName", e.target.value)}
          placeholder="photo_out"
        />
      </div>

      <div className="space-y-1">
        <label className="block text-xs text-muted-foreground">
          Output folder
        </label>
        <Input
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
          value={outputDir}
          onChange={(e) => updateFunctionParam("outputDir", e.target.value)}
        />
      </div>
    </div>
  );
};

export default ConvertFunction;
