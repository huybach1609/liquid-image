import { Slider } from "@/components/ui/slider";
import { Button } from "../ui/button";
import { useSingleStore } from "@/features/single/state/single.store";

const RotateFunction = () => {
  const functionParams = useSingleStore((s) => s.functionParams);
  const updateFunctionParam = useSingleStore((s) => s.updateFunctionParam);

  const rotateDegrees =
    typeof functionParams.rotateDegrees === "number"
      ? functionParams.rotateDegrees
      : typeof functionParams.rotateDegrees === "string"
        ? Number(functionParams.rotateDegrees) || 0
        : 0;
  const autoOrient = functionParams.rotateAutoOrient === true;

  return (
    <div className="space-y-3">
      <label className="block text-xs text-muted-foreground">Angle (degrees)</label>
      <Slider
        value={[rotateDegrees]}
        onValueChange={(value) => updateFunctionParam("rotateDegrees", value[0])}
      />
      <span className="text-xs text-muted-foreground">{rotateDegrees}</span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => updateFunctionParam("rotateAutoOrient", true)}
        disabled={autoOrient}
      >
        Auto rotate by EXIF
      </Button>
    </div>
  );
};

export default RotateFunction;
