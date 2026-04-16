import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectValue, SelectTrigger, SelectItem } from "@/components/ui/select";
import { useSingleStore } from "@/features/single/state/single.store";
import { Button } from "../ui/button";

export const CropFunction = () => {
  const functionParams = useSingleStore((s) => s.functionParams);
  const updateFunctionParam = useSingleStore((s) => s.updateFunctionParam);

  const cropAspectRatio =
    typeof functionParams.cropAspectRatio === "string" ? functionParams.cropAspectRatio : "Free";

  return (
    <div className="space-y-3">
      <Label>Aspect ratio</Label>
      <Select   
        value={cropAspectRatio}
        onValueChange={(value) => updateFunctionParam("cropAspectRatio", value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select an aspect ratio" />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value="Free">Free</SelectItem>
          <SelectItem value="1:1">1:1</SelectItem>
          <SelectItem value="16:9">16:9</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="sm"
        onClick={() => updateFunctionParam("cropAspectRatio", "Free")}
      >
        Reset crop
      </Button>
    </div>
  );
};

export default CropFunction;