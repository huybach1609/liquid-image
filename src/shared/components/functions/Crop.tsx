import { useCallback, useMemo } from "react";

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
import { buildSingleOperationArgs } from "@/features/single/buildSingleCliPreview";
import { useSingleStore } from "@/features/single/state/single.store";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";

type CropMethod = "free" | "trim" | "shave";
type CropGravity = "NW" | "Center" | "SE";

const CROP_METHODS: Array<{
  id: CropMethod;
  name: string;
  desc: string;
}> = [
  { id: "free", name: "Free crop", desc: "Kéo thả khung tự do trên canvas" },
  { id: "trim", name: "Auto trim", desc: "Tự động cắt viền màu giống góc ảnh" },
  { id: "shave", name: "Shave edges", desc: "Cạo đối xứng từ 4 cạnh" },
];

const GRAVITY_OPTIONS: Array<{ id: CropGravity; label: string }> = [
  { id: "NW", label: "NW" },
  { id: "Center", label: "Center" },
  { id: "SE", label: "SE" },
];

function getStringParam(params: Record<string, unknown>, key: string, fallback: string) {
  const v = params[key];
  return typeof v === "string" && v.trim().length > 0 ? v : fallback;
}

function getNumberParam(params: Record<string, unknown>, key: string, fallback: number) {
  const v = params[key];
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim().length > 0) {
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

function parseCropMethod(v: unknown): CropMethod {
  if (v === "trim" || v === "shave" || v === "free") return v;
  return "free";
}

function parseGravity(v: unknown): CropGravity {
  if (v === "NW" || v === "Center" || v === "SE") return v;
  return "NW";
}

export const CropFunction = () => {
  const functionParams = useSingleStore((s) => s.functionParams);
  const updateFunctionParam = useSingleStore((s) => s.updateFunctionParam);
  const setFunctionParams = useSingleStore((s) => s.setFunctionParams);
  const requestPreview = useSingleStore((s) => s.requestPreview);

  const cropMethod = parseCropMethod(functionParams.cropMethod);
  const cropAspectRatio = getStringParam(functionParams, "cropAspectRatio", "Free");
  const cropGravity = parseGravity(functionParams.cropGravity);
  const cropX = getNumberParam(functionParams, "cropX", 0);
  const cropY = getNumberParam(functionParams, "cropY", 0);
  const cropW = getNumberParam(functionParams, "cropW", 0);
  const cropH = getNumberParam(functionParams, "cropH", 0);
  const cropTrimFuzz = getNumberParam(functionParams, "cropTrimFuzz", 10);
  const cropShaveH = getNumberParam(functionParams, "cropShaveH", 30);
  const cropShaveV = getNumberParam(functionParams, "cropShaveV", 40);

  const cliFragment = useMemo(() => {
    const args = buildSingleOperationArgs("Crop", functionParams);
    return args.length > 0 ? args.join(" ") : "—";
  }, [functionParams]);

  const resetCrop = useCallback(() => {
    setFunctionParams({
      ...functionParams,
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
    });
  }, [functionParams, setFunctionParams]);

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
          Crop method
        </p>
        <div className="flex flex-col gap-1.5" role="radiogroup" aria-label="Crop method">
          {CROP_METHODS.map((m) => {
            const active = cropMethod === m.id;
            return (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => updateFunctionParam("cropMethod", m.id)}
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
                  <span className="block text-xs font-medium text-foreground">{m.name}</span>
                  <span className="mt-0.5 block text-[10px] leading-snug text-muted-foreground">
                    {m.desc}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      {cropMethod === "free" ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="crop-aspect" className="text-[11px] font-medium text-muted-foreground">
              Aspect ratio
            </Label>
            <Select
              value={cropAspectRatio}
              onValueChange={(value) => updateFunctionParam("cropAspectRatio", value)}
            >
              <SelectTrigger id="crop-aspect" className="h-8 w-full text-xs">
                <SelectValue placeholder="Aspect ratio" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="Free">Free</SelectItem>
                <SelectItem value="1:1">1:1 (Square)</SelectItem>
                <SelectItem value="4:3">4:3</SelectItem>
                <SelectItem value="16:9">16:9</SelectItem>
                <SelectItem value="3:2">3:2</SelectItem>
                <SelectItem value="9:16">9:16 (Story)</SelectItem>
                <SelectItem value="Custom">Custom…</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-[11px] font-medium text-muted-foreground">Position & size</p>
            <div className="flex gap-2">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Label htmlFor="crop-x" className="text-[11px] text-muted-foreground">
                  X
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
                    px
                  </span>
                </div>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Label htmlFor="crop-y" className="text-[11px] text-muted-foreground">
                  Y
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
                    px
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Label htmlFor="crop-w" className="text-[11px] text-muted-foreground">
                  W
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
                    px
                  </span>
                </div>
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <Label htmlFor="crop-h" className="text-[11px] text-muted-foreground">
                  H
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
                    px
                  </span>
                </div>
              </div>
            </div>
            <p className="text-[10px] leading-snug text-muted-foreground">
              Kéo thả khung crop trên canvas hoặc nhập tọa độ thủ công
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium text-muted-foreground">Gravity</span>
            <div className="flex gap-1.5">
              {GRAVITY_OPTIONS.map((opt) => {
                const on = cropGravity === opt.id;
                return (
                  <Button
                    key={opt.id}
                    type="button"
                    size="sm"
                    variant={on ? "default" : "outline"}
                    className="h-7 min-w-0 flex-1 px-1 text-[11px] font-medium"
                    onClick={() => updateFunctionParam("cropGravity", opt.id)}
                  >
                    {opt.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {cropMethod === "trim" ? (
        <div className="flex flex-col gap-2">
          <Label className="text-[11px] font-medium text-muted-foreground">Fuzz tolerance</Label>
          <div className="flex items-center gap-2">
            <span className="w-7 shrink-0 text-[11px] font-medium text-muted-foreground">0%</span>
            <Slider
              className="flex-1"
              min={0}
              max={100}
              step={1}
              value={[cropTrimFuzz]}
              onValueChange={(v) => updateFunctionParam("cropTrimFuzz", v[0] ?? 0)}
            />
            <span className="w-10 shrink-0 text-right font-mono text-[11px] text-foreground tabular-nums">
              {cropTrimFuzz}%
            </span>
          </div>
          <p className="text-[10px] leading-snug text-muted-foreground">
            Dung sai màu — càng cao càng cắt được nhiều viền gần giống màu góc
          </p>
        </div>
      ) : null}

      {cropMethod === "shave" ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <Label className="text-[11px] font-medium text-muted-foreground">Shave amount</Label>
            <div className="flex items-center gap-2">
              <span className="w-7 shrink-0 text-[11px] font-medium text-muted-foreground">H</span>
              <Slider
                className="flex-1"
                min={0}
                max={200}
                step={1}
                value={[cropShaveH]}
                onValueChange={(v) => updateFunctionParam("cropShaveH", v[0] ?? 0)}
              />
              <span className="w-11 shrink-0 text-right font-mono text-[11px] text-foreground tabular-nums">
                {cropShaveH}px
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-7 shrink-0 text-[11px] font-medium text-muted-foreground">V</span>
              <Slider
                className="flex-1"
                min={0}
                max={200}
                step={1}
                value={[cropShaveV]}
                onValueChange={(v) => updateFunctionParam("cropShaveV", v[0] ?? 0)}
              />
              <span className="w-11 shrink-0 text-right font-mono text-[11px] text-foreground tabular-nums">
                {cropShaveV}px
              </span>
            </div>
          </div>
          <p className="text-[10px] leading-snug text-muted-foreground">
            Cắt đối xứng từ trái/phải và trên/dưới
          </p>
        </div>
      ) : null}

      <Separator />

      <div className="flex flex-col gap-1.5">
        <Button type="button" size="sm" className="h-8 w-full text-xs font-medium" onClick={() => requestPreview()}>
          Apply crop
        </Button>
        <Button type="button" size="sm" variant="outline" className="h-8 w-full text-xs font-medium" onClick={resetCrop}>
          Reset crop
        </Button>
      </div>
{/* 
      <div className="border-t border-border/70 pt-2.5">
        <p className="mb-1 text-[10px] font-medium tracking-[0.06em] text-muted-foreground uppercase">
          CLI preview
        </p>
        <p className="break-all font-mono text-[10px] leading-relaxed text-primary">{cliFragment}</p>
      </div> */}
    </div>
  );
};

export default CropFunction;
