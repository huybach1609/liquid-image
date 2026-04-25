import { useSingleStore } from "@/features/single/state/single.store";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "../../components/ui/input";
import { getNumberParam, getStringParam } from "@/lib/functionParams";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const BLEND_MODES = [
  "Over", "Multiply", "Screen", 
  "Dissolve", "Overlay", "Difference", 
  "Exclusion", "Darken", "Lighten"
] as const;

const BLEND_DESCRIPTIONS: Record<string, string> = {
  Over: "Paste overlay on top using alpha channel.",
  Multiply: "Darkens — multiplies pixel values.",
  Screen: "Lightens — inverts multiply.",
  Dissolve: "Blend by opacity.",
  Overlay: "Contrast boost — dark darker, light lighter.",
  Difference: "Absolute difference between layers.",
  Exclusion: "Lower-contrast version of Difference.",
  Darken: "Keep darkest pixel from each layer.",
  Lighten: "Keep lightest pixel from each layer.",
};

interface ComposeFunctionProps {
  params?: Record<string, any>;
  onUpdateParam?: (key: string, value: any) => void;
  selectedFile?: string | null;
}

const ComposeFunction = ({
  params: propsParams,
  onUpdateParam: propsUpdateParam,
  selectedFile: propsSelectedFile,
}: ComposeFunctionProps) => {
  const storeSelectedFile = useSingleStore((s) => s.selectedFile);
  const storeFunctionParams = useSingleStore((s) => s.functionParams);
  const storeUpdateFunctionParam = useSingleStore((s) => s.updateFunctionParam);

  const selectedFile = propsSelectedFile !== undefined ? propsSelectedFile : storeSelectedFile;
  const functionParams = propsParams !== undefined ? propsParams : storeFunctionParams;
  const updateFunctionParam = propsUpdateParam !== undefined ? propsUpdateParam : storeUpdateFunctionParam;

  const overlayPath = getStringParam(functionParams, "composeOverlayPath", "overlay.png");
  const blendMode = getStringParam(functionParams, "composeBlendMode", "Over");
  const opacity = getNumberParam(functionParams, "composeOpacity", 100);
  const offsetX = getNumberParam(functionParams, "composeOffsetX", 0);
  const offsetY = getNumberParam(functionParams, "composeOffsetY", 0);

  return (
    <div className="flex flex-col gap-6">
      <Badge variant="secondary" className="w-fit bg-primary/10 text-primary hover:bg-primary/15 border-none px-2 py-0.5 text-[10px] uppercase tracking-wider">
        composite / blend
      </Badge>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-medium text-muted-foreground/80">Overlay image path</Label>
          <Input
            value={overlayPath}
            onChange={(e) => updateFunctionParam("composeOverlayPath", e.target.value)}
            className="h-8 text-[11px] font-mono"
            placeholder="e.g. assets/logo.png"
          />
        </div>

        <div className="flex flex-col gap-3">
          <Label className="text-xs font-medium text-muted-foreground/80">Blend mode</Label>
          <div className="grid grid-cols-3 gap-1.5">
            {BLEND_MODES.map((mode) => (
              <Button
                key={mode}
                variant="outline"
                className={cn(
                  "text-[10px] h-8 px-1",
                  blendMode === mode
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "text-muted-foreground/70 border-border/40"
                )}
                onClick={() => updateFunctionParam("composeBlendMode", mode)}
              >
                {mode}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <Label className="text-xs font-medium text-muted-foreground/80">Opacity</Label>
          <div className="text-xl font-light text-foreground">{opacity}%</div>
          <Slider
            min={0}
            max={100}
            value={[opacity]}
            onValueChange={(v) => updateFunctionParam("composeOpacity", v[0])}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-medium text-muted-foreground/70">X offset</Label>
            <Input
              type="number"
              value={offsetX}
              onChange={(e) => updateFunctionParam("composeOffsetX", parseInt(e.target.value) || 0)}
              className="h-8 text-[11px] font-mono"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-medium text-muted-foreground/70">Y offset</Label>
            <Input
              type="number"
              value={offsetY}
              onChange={(e) => updateFunctionParam("composeOffsetY", parseInt(e.target.value) || 0)}
              className="h-8 text-[11px] font-mono"
            />
          </div>
        </div>

        <Alert className="bg-primary/5 border-primary/20 p-3">
          <div className="flex gap-2 items-start">
            <InfoIcon className="size-3.5 text-primary mt-0.5 shrink-0" />
            <AlertDescription className="text-[11px] text-muted-foreground leading-normal">
              {BLEND_DESCRIPTIONS[blendMode]}
            </AlertDescription>
          </div>
        </Alert>
      </div>
    </div>
  );
};

export default ComposeFunction;
