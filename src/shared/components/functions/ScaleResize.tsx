import { useSingleStore } from "@/features/single/state/single.store";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/shared/components/ui/button";
import { Input } from "../../components/ui/input";
import { getNumberParam, getStringParam } from "@/lib/functionParams";
import { cn } from "@/lib/utils";

const METHOD_DESCRIPTIONS: Record<string, string> = {
  resize: "High-quality resize with filter support. Best for final output.",
  thumbnail: "Optimized for thumbnails — strips metadata, smaller file size.",
  sample: "Ultra-fast pixel sampling, no filters — may show aliasing.",
};

interface ScaleResizeFunctionProps {
  params?: Record<string, any>;
  onUpdateParam?: (key: string, value: any) => void;
  selectedFile?: string | null;
}

const ScaleResizeFunction = ({
  params: propsParams,
  onUpdateParam: propsUpdateParam,
  selectedFile: propsSelectedFile,
}: ScaleResizeFunctionProps) => {
  const storeSelectedFile = useSingleStore((s) => s.selectedFile);
  const storeFunctionParams = useSingleStore((s) => s.functionParams);
  const storeUpdateFunctionParam = useSingleStore((s) => s.updateFunctionParam);

  const selectedFile = propsSelectedFile !== undefined ? propsSelectedFile : storeSelectedFile;
  const functionParams = propsParams !== undefined ? propsParams : storeFunctionParams;
  const updateFunctionParam = propsUpdateParam !== undefined ? propsUpdateParam : storeUpdateFunctionParam;

  const width = getNumberParam(functionParams, "resizeWidth", 1920);
  const height = getNumberParam(functionParams, "resizeHeight", 1080);
  const keepRatio = functionParams.resizeKeepRatio !== false && functionParams.resizeKeepRatio !== "false";
  const method = getStringParam(functionParams, "resizeMethod", "resize");

  const setSize = (w: number, h: number) => {
    updateFunctionParam("resizeWidth", w);
    updateFunctionParam("resizeHeight", h);
  };

  return (
    <div className="flex flex-col gap-6">
      <Badge variant="secondary" className="w-fit bg-primary/10 text-primary hover:bg-primary/15 border-none px-2 py-0.5 text-[10px] uppercase tracking-wider">
        scale / resize
      </Badge>

      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-medium text-muted-foreground/70">Width (px)</Label>
            <Input
              type="number"
              min={1}
              value={width}
              onChange={(e) => updateFunctionParam("resizeWidth", parseInt(e.target.value) || 0)}
              className="h-8 text-[11px] font-mono"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-medium text-muted-foreground/70">Height (px)</Label>
            <Input
              type="number"
              min={1}
              value={height}
              onChange={(e) => updateFunctionParam("resizeHeight", parseInt(e.target.value) || 0)}
              className="h-8 text-[11px] font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Label className="text-[12px] text-muted-foreground/70 font-normal cursor-pointer" htmlFor="ratio-toggle">
            Keep aspect ratio
          </Label>
          <Switch
            id="ratio-toggle"
            checked={keepRatio}
            onCheckedChange={(v) => updateFunctionParam("resizeKeepRatio", v)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            [1920, 1080],
            [1280, 720],
            [800, 600],
            [512, 512],
          ].map(([w, h]) => (
            <Button
              key={`${w}x${h}`}
              variant="outline"
              size="sm"
              className="h-7 px-2 text-[10px] font-medium"
              onClick={() => setSize(w, h)}
            >
              {w}×{h}
            </Button>
          ))}
        </div>

        <Separator className="bg-border/40" />

        <div className="flex flex-col gap-3">
          <Label className="text-xs font-medium text-muted-foreground/80">Method</Label>
          <div className="grid grid-cols-3 gap-2">
            {(["resize", "thumbnail", "sample"] as const).map((m) => {
              const active = method === m;
              return (
                <Button
                  key={m}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 text-[10px] px-1 font-medium capitalize transition-all border-border/40",
                    active
                      ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 hover:text-primary"
                      : "text-muted-foreground/70 hover:bg-accent/5 hover:text-foreground",
                  )}
                  onClick={() => updateFunctionParam("resizeMethod", m)}
                >
                  {m}
                </Button>
              );
            })}
          </div>
          <p className="text-[11px] text-muted-foreground/60 leading-relaxed min-h-8">
            {METHOD_DESCRIPTIONS[method]}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScaleResizeFunction;
