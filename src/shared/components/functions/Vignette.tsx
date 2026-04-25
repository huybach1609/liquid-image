import { useSingleStore } from "@/features/single/state/single.store";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { getNumberParam } from "@/lib/functionParams";

interface VignetteFunctionProps {
  params?: Record<string, any>;
  onUpdateParam?: (key: string, value: any) => void;
  selectedFile?: string | null;
}

const VignetteFunction = ({
  params: propsParams,
  onUpdateParam: propsUpdateParam,
  selectedFile: propsSelectedFile,
}: VignetteFunctionProps) => {
  const storeSelectedFile = useSingleStore((s) => s.selectedFile);
  const storeFunctionParams = useSingleStore((s) => s.functionParams);
  const storeUpdateFunctionParam = useSingleStore((s) => s.updateFunctionParam);

  const selectedFile = propsSelectedFile !== undefined ? propsSelectedFile : storeSelectedFile;
  const functionParams = propsParams !== undefined ? propsParams : storeFunctionParams;
  const updateFunctionParam = propsUpdateParam !== undefined ? propsUpdateParam : storeUpdateFunctionParam;

  const radius = getNumberParam(functionParams, "vignetteRadius", 40);
  const softness = getNumberParam(functionParams, "vignetteSoftness", 60);
  const offsetX = getNumberParam(functionParams, "vignetteOffsetX", 5);
  const offsetY = getNumberParam(functionParams, "vignetteOffsetY", 5);

  return (
    <div className="flex flex-col gap-6">
      <Badge variant="secondary" className="w-fit bg-primary/10 text-primary hover:bg-primary/15 border-none px-2 py-0.5 text-[10px] uppercase tracking-wider">
        vignette effect
      </Badge>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2.5">
          <Label className="text-xs font-medium text-muted-foreground/80">Radius</Label>
          <div className="text-xl font-light text-foreground">{radius}</div>
          <Slider
            min={0}
            max={100}
            value={[radius]}
            onValueChange={(v) => updateFunctionParam("vignetteRadius", v[0])}
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <Label className="text-xs font-medium text-muted-foreground/80">Sigma (softness)</Label>
          <div className="text-xl font-light text-foreground">{softness}</div>
          <Slider
            min={1}
            max={100}
            value={[softness]}
            onValueChange={(v) => updateFunctionParam("vignetteSoftness", v[0])}
          />
          <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
            Higher sigma = softer fade at edges.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2.5">
            <Label className="text-xs font-medium text-muted-foreground/80">Offset X</Label>
            <div className="text-xl font-light text-foreground">{offsetX}</div>
            <Slider
              min={-50}
              max={50}
              value={[offsetX]}
              onValueChange={(v) => updateFunctionParam("vignetteOffsetX", v[0])}
            />
          </div>
          <div className="flex flex-col gap-2.5">
            <Label className="text-xs font-medium text-muted-foreground/80">Offset Y</Label>
            <div className="text-xl font-light text-foreground">{offsetY}</div>
            <Slider
              min={-50}
              max={50}
              value={[offsetY]}
              onValueChange={(v) => updateFunctionParam("vignetteOffsetY", v[0])}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default VignetteFunction;
