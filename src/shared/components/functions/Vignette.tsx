import { Slider } from "@/components/ui/slider";
import { useSingleStore } from "@/features/single/state/single.store";

const VignetteFunction = () => {
  const functionParams = useSingleStore((s) => s.functionParams);
  const updateFunctionParam = useSingleStore((s) => s.updateFunctionParam);

  const radius =
    typeof functionParams.vignetteRadius === "number"
      ? functionParams.vignetteRadius
      : typeof functionParams.vignetteRadius === "string"
        ? Number(functionParams.vignetteRadius) || 40
        : 40;

  const softness =
    typeof functionParams.vignetteSoftness === "number"
      ? functionParams.vignetteSoftness
      : typeof functionParams.vignetteSoftness === "string"
        ? Number(functionParams.vignetteSoftness) || 60
        : 60;

  return (
    <div className="space-y-3">
      <label className="block text-xs text-muted-foreground">Radius</label>
      <Slider
        min={0}
        max={100}
        value={[radius]}
        onValueChange={(value) => updateFunctionParam("vignetteRadius", value[0])}
      />
      <span className="text-xs text-muted-foreground">{radius}</span>
      <label className="block text-xs text-muted-foreground">Softness</label>
      <Slider
        min={0}
        max={100}
        value={[softness]}
        onValueChange={(value) => updateFunctionParam("vignetteSoftness", value[0])}
      />
      <span className="text-xs text-muted-foreground">{softness}</span>
    </div>
  );
};

export default VignetteFunction;
