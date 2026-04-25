import { useSingleStore } from "@/features/single/state/single.store";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getNumberParam, getStringParam } from "@/lib/functionParams";
import { Input } from "../../components/ui/input";

interface BorderFunctionProps {
  params?: Record<string, any>;
  onUpdateParam?: (key: string, value: any) => void;
  selectedFile?: string | null;
}

const BorderFunction = ({
  params: propsParams,
  onUpdateParam: propsUpdateParam,
  selectedFile: propsSelectedFile,
}: BorderFunctionProps) => {
  const storeSelectedFile = useSingleStore((s) => s.selectedFile);
  const storeFunctionParams = useSingleStore((s) => s.functionParams);
  const storeUpdateFunctionParam = useSingleStore((s) => s.updateFunctionParam);

  const selectedFile = propsSelectedFile !== undefined ? propsSelectedFile : storeSelectedFile;
  const functionParams = propsParams !== undefined ? propsParams : storeFunctionParams;
  const updateFunctionParam = propsUpdateParam !== undefined ? propsUpdateParam : storeUpdateFunctionParam;

  const thickness = getNumberParam(functionParams, "borderSize", 10);
  const color = getStringParam(functionParams, "borderColor", "#ffffff");
  const isFrame = functionParams.borderIsFrame === true || functionParams.borderIsFrame === "true";
  const frameDepth = getNumberParam(functionParams, "borderFrameDepth", 6);

  return (
    <div className="flex flex-col gap-6">
      <Badge variant="secondary" className="w-fit bg-primary/10 text-primary hover:bg-primary/15 border-none px-2 py-0.5 text-[10px] uppercase tracking-wider">
        border / frame
      </Badge>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2.5">
          <Label className="text-xs font-medium text-muted-foreground/80">Thickness (px)</Label>
          <div className="text-xl font-light text-foreground">{thickness}</div>
          <Slider
            min={1}
            max={100}
            value={[thickness]}
            onValueChange={(v) => updateFunctionParam("borderSize", v[0])}
          />
        </div>

        <div className="flex flex-col gap-3">
          <Label className="text-xs font-medium text-muted-foreground/80">Border color</Label>
          <div className="flex items-center gap-3">
            <div className="relative size-10 shrink-0 overflow-hidden rounded-md border border-border/40">
              <Input
                type="color"
                value={color}
                onChange={(e) => updateFunctionParam("borderColor", e.target.value)}
                className="absolute inset-[-20%] size-[140%] cursor-pointer border-none bg-transparent p-0"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-mono text-[11px] font-medium uppercase tracking-tight text-muted-foreground">
                {color}
              </span>
            </div>
          </div>
        </div>

        <Separator className="bg-border/40" />

        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <Label className="text-[12px] text-muted-foreground/70 font-normal cursor-pointer" htmlFor="frame-toggle">
              3D frame effect
            </Label>
            <Switch
              id="frame-toggle"
              checked={isFrame}
              onCheckedChange={(v) => updateFunctionParam("borderIsFrame", v)}
            />
          </div>

          {isFrame && (
            <div className="flex flex-col gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <Label className="text-xs font-medium text-muted-foreground/80">Frame depth</Label>
              <div className="text-xl font-light text-foreground">{frameDepth}</div>
              <Slider
                min={2}
                max={30}
                value={[frameDepth]}
                onValueChange={(v) => updateFunctionParam("borderFrameDepth", v[0])}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BorderFunction;
