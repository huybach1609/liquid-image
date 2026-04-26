import { useSingleStore } from "@/features/single/state/single.store";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/shared/components/ui/button";
import { getNumberParam, getStringParam } from "@/lib/functionParams";
import { cn } from "@/lib/utils";

interface RotateFunctionProps {
  params?: Record<string, any>;
  onUpdateParam?: (key: string, value: any) => void;
}

const RotateFunction = ({
  params: propsParams,
  onUpdateParam: propsUpdateParam,
}: RotateFunctionProps) => {
  const storeFunctionParams = useSingleStore((s) => s.functionParams);
  const storeUpdateFunctionParam = useSingleStore((s) => s.updateFunctionParam);

  const functionParams = propsParams !== undefined ? propsParams : storeFunctionParams;
  const updateFunctionParam = propsUpdateParam !== undefined ? propsUpdateParam : storeUpdateFunctionParam;

  const degrees = getNumberParam(functionParams, "rotateDegrees", 0);
  const background = getStringParam(functionParams, "rotateBackground", "none");
  const autoOrient = functionParams.rotateAutoOrient === true || functionParams.rotateAutoOrient === "true";

  const setAngle = (deg: number) => updateFunctionParam("rotateDegrees", deg);

  return (
    <div className="flex flex-col gap-6">
      <Badge variant="secondary" className="w-fit bg-primary/10 text-primary hover:bg-primary/15 border-none px-2 py-0.5 text-[10px] uppercase tracking-wider">
        rotate
      </Badge>

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2.5">
          <Label className="text-xs font-medium text-muted-foreground/80">Angle (degrees)</Label>
          <div className="text-xl font-light text-foreground">{degrees}°</div>
          <Slider
            min={-180}
            max={180}
            value={[degrees]}
            onValueChange={(v) => updateFunctionParam("rotateDegrees", v[0])}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {[-90, 90, 180, 0].map((deg) => (
            <Button
              key={deg}
              variant="outline"
              size="sm"
              className="h-7 min-w-14 text-[10px] font-medium"
              onClick={() => setAngle(deg)}
            >
              {deg === 0 ? "Reset" : `${deg > 0 ? "+" : ""}${deg}°`}
            </Button>
          ))}
        </div>

        <Separator className="bg-border/40" />

        <div className="flex flex-col gap-3">
          <Label className="text-xs font-medium text-muted-foreground/80">Background fill</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: "none", label: "None" },
              { value: "white", label: "White" },
              { value: "black", label: "Black" },
              { value: "transparent", label: "Transparent" },
            ].map((opt) => (
              <Button
                key={opt.value}
                variant="outline"
                className={cn(
                  "text-[11px] h-8 px-2",
                  background === opt.value
                    ? "bg-primary/10 text-primary border-primary/20"
                    : "text-muted-foreground/70 border-border/40"
                )}
                onClick={() => updateFunctionParam("rotateBackground", opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-[12px] text-muted-foreground/70 font-normal cursor-pointer" htmlFor="auto-orient">
              Auto-orient (EXIF)
            </Label>
            <Switch
              id="auto-orient"
              checked={autoOrient}
              onCheckedChange={(v) => updateFunctionParam("rotateAutoOrient", v)}
            />
          </div>
          <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
            Reads EXIF to correct camera rotation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RotateFunction;
