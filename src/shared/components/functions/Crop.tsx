import { useCallback } from "react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { useSingleStore } from "@/features/single/state/single.store";
import { useSingleT } from "@/i18n/useSingleT";
import { getNumberParam, getStringParam } from "@/lib/functionParams";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

type CropMethod = "free" | "trim" | "shave";
type CropGravity = "NW" | "Center" | "SE";

const CROP_METHOD_IDS: CropMethod[] = ["free", "trim", "shave"];

const GRAVITY_OPTIONS: CropGravity[] = ["NW", "Center", "SE"];

function parseCropMethod(v: unknown): CropMethod {
  if (v === "trim" || v === "shave" || v === "free") return v;
  return "free";
}

function parseGravity(v: unknown): CropGravity {
  if (v === "NW" || v === "Center" || v === "SE") return v;
  return "NW";
}

interface CropFunctionProps {
  params?: Record<string, any>;
  onUpdateParam?: (key: string, value: any) => void;
  selectedFile?: string | null;
}

export const CropFunction = ({
  params: propsParams,
  onUpdateParam: propsUpdateParam,
  selectedFile: propsSelectedFile,
}: CropFunctionProps) => {
  const { t } = useSingleT();
  const storeSelectedFile = useSingleStore((s) => s.selectedFile);
  const storeFunctionParams = useSingleStore((s) => s.functionParams);
  const storeUpdateFunctionParam = useSingleStore((s) => s.updateFunctionParam);

  const selectedFile = propsSelectedFile !== undefined ? propsSelectedFile : storeSelectedFile;
  const functionParams = propsParams !== undefined ? propsParams : storeFunctionParams;
  const updateFunctionParam = propsUpdateParam !== undefined ? propsUpdateParam : storeUpdateFunctionParam;

  const setFunctionParams = useSingleStore((s) => s.setFunctionParams);
  const requestPreview = useSingleStore((s) => s.requestPreview);
  const cropFreeApplyReview = useSingleStore((s) => s.cropFreeApplyReview);
  const setCropFreeApplyReview = useSingleStore(
    (s) => s.setCropFreeApplyReview,
  );

  const cropMethod = parseCropMethod(functionParams.cropMethod);
  const cropAspectRatio = getStringParam(
    functionParams,
    "cropAspectRatio",
    "Free",
  );
  const cropGravity = parseGravity(functionParams.cropGravity);
  const cropX = getNumberParam(functionParams, "cropX", 0);
  const cropY = getNumberParam(functionParams, "cropY", 0);
  const cropW = getNumberParam(functionParams, "cropW", 0);
  const cropH = getNumberParam(functionParams, "cropH", 0);
  const cropTrimFuzz = getNumberParam(functionParams, "cropTrimFuzz", 10);
  const cropShaveH = getNumberParam(functionParams, "cropShaveH", 30);
  const cropShaveV = getNumberParam(functionParams, "cropShaveV", 40);

  const resetCrop = useCallback(() => {
    setCropFreeApplyReview(false);
    setFunctionParams((prev) => ({
      ...prev,
      cropMethod: "free",
      cropAspectRatio: "Free",
      cropGravity: "NW",
      cropX: 120,
      cropY: 80,
      cropW: 1200,
      cropH: 900,
      cropTrimFuzz: 10,
      cropShaveH: 30,
      cropShaveV: 40,
    }));
  }, [setCropFreeApplyReview, setFunctionParams]);

  const setNumberParam = (key: string, raw: string) => {
    if (raw.trim() === "") {
      updateFunctionParam(key, 0);
      return;
    }
    const n = Number(raw);
    if (Number.isFinite(n)) {
      updateFunctionParam(key, n);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <p className="text-[11px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
          {t("cropForm.methodHeading")}
        </p>
        <div
          className="flex flex-col gap-1.5"
          role="radiogroup"
          aria-label={t("cropForm.methodAria")}
        >
          {CROP_METHOD_IDS.map((id) => {
            const active = cropMethod === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => {
                  updateFunctionParam("cropMethod", id);
                  if (id !== "free") {
                    setCropFreeApplyReview(false);
                  }
                }}
                className={cn(
                  "flex w-full items-start gap-2 rounded-lg border border-border/80 bg-background px-2.5 py-2 text-left transition-colors",
                  "hover:bg-muted/40 hover:border-border",
                  active && "border-primary/50 bg-primary/10",
                )}
              >
                <span
                  className={cn(
                    "mt-0.5 size-5 shrink-0 rounded-full border border-border bg-background shadow-[inset_0_0_0_3px_var(--background)]",
                    active && "border-primary bg-primary",
                  )}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-medium text-foreground">
                    {t(`cropForm.methods.${id}.name`)}
                  </span>
                  <span className="mt-0.5 block text-[10px] leading-snug text-muted-foreground">
                    {t(`cropForm.methods.${id}.desc`)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      {cropMethod === "free" ? (
        cropFreeApplyReview ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 w-full text-xs font-medium"
            onClick={() => setCropFreeApplyReview(false)}
          >
            {t("cropForm.cropAgain")}
          </Button>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="crop-aspect"
                className="text-[11px] font-medium text-muted-foreground"
              >
                {t("cropForm.aspectRatio")}
              </Label>
              <Select
                value={cropAspectRatio}
                onValueChange={(value) =>
                  updateFunctionParam("cropAspectRatio", value)
                }
              >
                <SelectTrigger id="crop-aspect" className="h-8 w-full text-xs">
                  <SelectValue
                    placeholder={t("cropForm.aspectPlaceholder")}
                  />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="Free">
                    {t("cropForm.aspect.free")}
                  </SelectItem>
                  <SelectItem value="1:1">
                    {t("cropForm.aspect.ratio_1_1")}
                  </SelectItem>
                  <SelectItem value="4:3">
                    {t("cropForm.aspect.ratio_4_3")}
                  </SelectItem>
                  <SelectItem value="16:9">
                    {t("cropForm.aspect.ratio_16_9")}
                  </SelectItem>
                  <SelectItem value="3:2">
                    {t("cropForm.aspect.ratio_3_2")}
                  </SelectItem>
                  <SelectItem value="9:16">
                    {t("cropForm.aspect.ratio_9_16")}
                  </SelectItem>
                  <SelectItem value="Custom">
                    {t("cropForm.aspect.custom")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-medium text-muted-foreground">
                {t("cropForm.positionSize")}
              </p>
              <div className="flex gap-2">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Label
                    htmlFor="crop-x"
                    className="text-[11px] text-muted-foreground"
                  >
                    {t("cropForm.coordX")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="crop-x"
                      inputMode="numeric"
                      className="h-8 pr-8 text-xs tabular-nums"
                      value={String(cropX)}
                      placeholder="0"
                      onChange={(e) => setNumberParam("cropX", e.target.value)}
                    />
                    <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[10px] text-muted-foreground">
                      {t("cropForm.px")}
                    </span>
                  </div>
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Label
                    htmlFor="crop-y"
                    className="text-[11px] text-muted-foreground"
                  >
                    {t("cropForm.coordY")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="crop-y"
                      inputMode="numeric"
                      className="h-8 pr-8 text-xs tabular-nums"
                      value={String(cropY)}
                      placeholder="0"
                      onChange={(e) => setNumberParam("cropY", e.target.value)}
                    />
                    <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[10px] text-muted-foreground">
                      {t("cropForm.px")}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Label
                    htmlFor="crop-w"
                    className="text-[11px] text-muted-foreground"
                  >
                    {t("cropForm.coordW")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="crop-w"
                      inputMode="numeric"
                      className="h-8 pr-8 text-xs tabular-nums"
                      value={String(cropW)}
                      placeholder="0"
                      onChange={(e) => setNumberParam("cropW", e.target.value)}
                    />
                    <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[10px] text-muted-foreground">
                      {t("cropForm.px")}
                    </span>
                  </div>
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Label
                    htmlFor="crop-h"
                    className="text-[11px] text-muted-foreground"
                  >
                    {t("cropForm.coordH")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="crop-h"
                      inputMode="numeric"
                      className="h-8 pr-8 text-xs tabular-nums"
                      value={String(cropH)}
                      placeholder="0"
                      onChange={(e) => setNumberParam("cropH", e.target.value)}
                    />
                    <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[10px] text-muted-foreground">
                      {t("cropForm.px")}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] leading-snug text-muted-foreground">
                {t("cropForm.freeHint")}
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-medium text-muted-foreground">
                {t("cropForm.gravity.label")}
              </span>

              <div className="flex gap-1.5">
                {GRAVITY_OPTIONS.map((opt) => {
                  const on = cropGravity === opt;
                  return (
                    <Tooltip key={opt}>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          size="sm"
                          variant={on ? "default" : "outline"}
                          className="h-7 min-w-0 flex-1 px-1 text-[11px] font-medium"
                          onClick={() =>
                            updateFunctionParam("cropGravity", opt)
                          }
                        >
                          {t(`cropForm.gravity.${opt}`)}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {t(`cropForm.gravity.${opt}_tooltip`)}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          </div>
        )
      ) : null}

      {cropMethod === "trim" ? (
        <div className="flex flex-col gap-2">
          <Label className="text-[11px] font-medium text-muted-foreground">
            {t("cropForm.fuzzTolerance")}
          </Label>
          <div className="flex items-center gap-2">
            <span className="w-7 shrink-0 text-[11px] font-medium text-muted-foreground">
              {t("cropForm.trimPctMin")}
            </span>
            <Slider
              className="flex-1"
              min={0}
              max={100}
              step={1}
              value={[cropTrimFuzz]}
              onValueChange={(v) =>
                updateFunctionParam("cropTrimFuzz", v[0] ?? 0)
              }
            />
            <span className="w-10 shrink-0 text-right font-mono text-[11px] text-foreground tabular-nums">
              {cropTrimFuzz}%
            </span>
          </div>
          <p className="text-[10px] leading-snug text-muted-foreground">
            {t("cropForm.trimHint")}
          </p>
        </div>
      ) : null}

      {cropMethod === "shave" ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-medium text-muted-foreground">
              {t("cropForm.shaveAmount")}
            </Label>
            <div className="flex items-center gap-2">
              <span className="w-7 shrink-0 text-[11px] font-medium text-muted-foreground">
                {t("cropForm.shaveHorizontal")}
              </span>
              <Slider
                className="flex-1"
                min={0}
                max={200}
                step={1}
                value={[cropShaveH]}
                onValueChange={(v) =>
                  updateFunctionParam("cropShaveH", v[0] ?? 0)
                }
              />
              <span className="w-11 shrink-0 text-right font-mono text-[11px] text-foreground tabular-nums">
                {cropShaveH}px
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-7 shrink-0 text-[11px] font-medium text-muted-foreground">
                {t("cropForm.shaveVertical")}
              </span>
              <Slider
                className="flex-1"
                min={0}
                max={200}
                step={1}
                value={[cropShaveV]}
                onValueChange={(v) =>
                  updateFunctionParam("cropShaveV", v[0] ?? 0)
                }
              />
              <span className="w-11 shrink-0 text-right font-mono text-[11px] text-foreground tabular-nums">
                {cropShaveV}px
              </span>
            </div>
          </div>
          <p className="text-[10px] leading-snug text-muted-foreground">
            {t("cropForm.shaveHint")}
          </p>
        </div>
      ) : null}

      <Separator />

      {!(cropMethod === "free" && cropFreeApplyReview) ? (
        <div className="flex flex-col gap-1.5">
          <Button
            type="button"
            size="sm"
            className="h-8 w-full text-xs font-medium"
            onClick={() => {
              if (cropMethod === "free") {
                setCropFreeApplyReview(true);
              }
              requestPreview();
            }}
          >
            {t("cropForm.apply")}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8 w-full text-xs font-medium"
            onClick={resetCrop}
          >
            {t("cropForm.reset")}
          </Button>
        </div>
      ) : null}
    </div>
  );
};

export default CropFunction;
