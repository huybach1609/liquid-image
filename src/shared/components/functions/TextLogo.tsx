import { useSingleStore } from "@/features/single/state/single.store";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "../../components/ui/input";
import { getNumberParam, getStringParam } from "@/lib/functionParams";

const GRAVITY_OPTIONS = [
  "NorthWest", "North", "NorthEast",
  "West", "Center", "East",
  "SouthWest", "South", "SouthEast"
] as const;

const FONTS = ["Arial", "Helvetica", "Times-Roman", "Courier"] as const;

const TextLogoFunction = () => {
  const functionParams = useSingleStore((s) => s.functionParams);
  const updateFunctionParam = useSingleStore((s) => s.updateFunctionParam);

  const text = getStringParam(functionParams, "textLogoText", "Watermark");
  const font = getStringParam(functionParams, "textLogoFont", "Arial");
  const size = getNumberParam(functionParams, "textLogoSize", 36);
  const angle = getNumberParam(functionParams, "textLogoAngle", 0);
  const gravity = getStringParam(functionParams, "textLogoGravity", "SouthEast");
  const color = getStringParam(functionParams, "textLogoColor", "#ffffff");

  return (
    <div className="flex flex-col gap-6">
      <Badge variant="secondary" className="w-fit bg-primary/10 text-primary hover:bg-primary/15 border-none px-2 py-0.5 text-[10px] uppercase tracking-wider">
        text / logo
      </Badge>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-medium text-muted-foreground/80">Text content</Label>
          <Input
            value={text}
            onChange={(e) => updateFunctionParam("textLogoText", e.target.value)}
            className="h-8 text-[11px] font-mono"
            placeholder="Enter watermark text..."
          />
        </div>

        <div className="flex flex-col gap-3">
          <Label className="text-xs font-medium text-muted-foreground/80">Font</Label>
          <ToggleGroup
            type="single"
            value={font}
            onValueChange={(v) => v && updateFunctionParam("textLogoFont", v)}
            className="grid grid-cols-2 gap-2"
          >
            {FONTS.map((f) => (
              <ToggleGroupItem key={f} value={f} className="text-[10px] h-8 px-1">
                {f}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2.5">
            <Label className="text-xs font-medium text-muted-foreground/80">Size (px)</Label>
            <div className="text-xl font-light text-foreground">{size}</div>
            <Slider
              min={8}
              max={200}
              value={[size]}
              onValueChange={(v) => updateFunctionParam("textLogoSize", v[0])}
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <Label className="text-xs font-medium text-muted-foreground/80">Angle°</Label>
            <div className="text-xl font-light text-foreground">{angle}°</div>
            <Slider
              min={-180}
              max={180}
              value={[angle]}
              onValueChange={(v) => updateFunctionParam("textLogoAngle", v[0])}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Label className="text-xs font-medium text-muted-foreground/80">Position (gravity)</Label>
          <ToggleGroup
            type="single"
            value={gravity}
            onValueChange={(v) => v && updateFunctionParam("textLogoGravity", v)}
            className="grid grid-cols-3 gap-1.5"
          >
            {GRAVITY_OPTIONS.map((g) => {
              const short = g.replace("North", "N").replace("South", "S").replace("East", "E").replace("West", "W");
              return (
                <ToggleGroupItem key={g} value={g} className="text-[10px] size-8 p-0">
                  {short === "Center" ? "C" : short}
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
        </div>

        <div className="flex flex-col gap-3">
          <Label className="text-xs font-medium text-muted-foreground/80">Color</Label>
          <div className="flex items-center gap-3">
            <div className="relative size-10 shrink-0 overflow-hidden rounded-md border border-border/40">
              <Input
                type="color"
                value={color}
                onChange={(e) => updateFunctionParam("textLogoColor", e.target.value)}
                className="absolute inset-[-20%] size-[140%] cursor-pointer border-none bg-transparent p-0"
              />
            </div>
            <span className="font-mono text-[11px] font-medium uppercase tracking-tight text-muted-foreground">
              {color}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextLogoFunction;
