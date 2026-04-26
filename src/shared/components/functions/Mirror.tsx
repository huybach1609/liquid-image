import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useSingleStore } from "@/features/single/state/single.store";
import { useSingleT } from "@/i18n/useSingleT";

interface MirrorFunctionProps {
  params?: Record<string, any>;
  onUpdateParam?: (key: string, value: any) => void;
}

const MirrorFunction = ({
  params: propsParams,
  onUpdateParam: propsUpdateParam,
}: MirrorFunctionProps) => {
  const { t } = useSingleT();
  const storeFunctionParams = useSingleStore((s) => s.functionParams);
  const storeUpdateFunctionParam = useSingleStore((s) => s.updateFunctionParam);

  const functionParams = propsParams !== undefined ? propsParams : storeFunctionParams;
  const updateFunctionParam = propsUpdateParam !== undefined ? propsUpdateParam : storeUpdateFunctionParam;

  const mirrorAxis =
    typeof functionParams.mirrorAxis === "string"
      ? functionParams.mirrorAxis
      : "Horizontal";

  return (
    <div className="space-y-3">
      <Label>{t("mirrorForm.direction")}</Label>

      <RadioGroup
        value={mirrorAxis}
        onValueChange={(value) => updateFunctionParam("mirrorAxis", value)}
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem value="Horizontal" id="mirror-horizontal" />
          <Label htmlFor="mirror-horizontal" className="font-normal">
            {t("mirrorForm.horizontal")}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="Vertical" id="mirror-vertical" />
          <Label htmlFor="mirror-vertical" className="font-normal">
            {t("mirrorForm.vertical")}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="Both" id="mirror-both" />
          <Label htmlFor="mirror-both" className="font-normal">
            {t("mirrorForm.both")}
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default MirrorFunction;
