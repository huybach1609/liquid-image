import { useSingleStore } from "@/features/single/state/single.store";
import { Input } from "../ui/input";
import { Select, SelectItem, SelectValue, SelectTrigger, SelectContent } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const TextLogoFunction = () => {
  const functionParams = useSingleStore((s) => s.functionParams);
  const updateFunctionParam = useSingleStore((s) => s.updateFunctionParam);

  const text =
    typeof functionParams.textLogoText === "string" ? functionParams.textLogoText : "Your text";
  const position =
    typeof functionParams.textLogoPosition === "string"
      ? functionParams.textLogoPosition
      : "bottom-right";

  return (
    <div className="space-y-3">
      <label className="block text-xs text-muted-foreground">Text</label>
      <Input
        value={text}
        onChange={(e) => updateFunctionParam("textLogoText", e.target.value)}
      />
      <label className="block text-xs text-muted-foreground">Position</label>
      <Select
        value={position}
        onValueChange={(value) => updateFunctionParam("textLogoPosition", value)}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a position" />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value="bottom-right">bottom-right</SelectItem>
          <SelectItem value="bottom-left">bottom-left</SelectItem>
          <SelectItem value="center">center</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TextLogoFunction;
