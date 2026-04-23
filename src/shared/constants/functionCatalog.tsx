import { type ComponentType, type ReactNode } from "react";
import BlackWhiteFunction from "@/shared/components/functions/BlackWhite";
import BorderFunction from "@/shared/components/functions/Border";
import ComposeFunction from "@/shared/components/functions/Compose";
import ContrastFunction from "@/shared/components/functions/Contrast";
import ConvertFunction from "@/shared/components/functions/Convert";
import { CropFunction } from "@/shared/components/functions/Crop";
import MirrorFunction from "@/shared/components/functions/Mirror";
import NormalizeColorFunction from "@/shared/components/functions/NormalizeColor";
import RotateFunction from "@/shared/components/functions/Rotate";
import ScaleResizeFunction from "@/shared/components/functions/ScaleResize";
import TextLogoFunction from "@/shared/components/functions/TextLogo";
import VignetteFunction from "@/shared/components/functions/Vignette";
import {
  ALargeSmall,
  Blend,
  Contrast,
  CropIcon,
  Disc3,
  FlipHorizontal2,
  ImageIcon,
  ImageUpscale,
  Palette,
  Rotate3d,
  SquareRoundCorner,
  SquaresUnite,
} from "lucide-react";

export type FunctionSlug =
  | "convert"
  | "crop"
  | "mirror"
  | "blackWhite"
  | "contrast"
  | "normalizeColors"
  | "vignette"
  | "border"
  | "rotate"
  | "scaleResize"
  | "textLogo"
  | "compose";

export type FunctionCatalogEntry = {
  /** Stable id used in store and ImageMagick routing (English labels). */
  id: string;
  slug: FunctionSlug;
  component: ComponentType<any>;
  icon: ReactNode;
};

export const FUNCTION_CATALOG: readonly FunctionCatalogEntry[] = [
  {
    id: "Convert",
    slug: "convert",
    component: ConvertFunction,
    icon: <ImageIcon className="size-4" />,
  },
  {
    id: "Crop",
    slug: "crop",
    component: CropFunction,
    icon: <CropIcon className="size-4" />,
  },
  {
    id: "Mirror",
    slug: "mirror",
    component: MirrorFunction,
    icon: <FlipHorizontal2 className="size-4" />,
  },
  {
    id: "Black & white",
    slug: "blackWhite",
    component: BlackWhiteFunction,
    icon: <Blend className="size-4" />,
  },
  {
    id: "Contrast",
    slug: "contrast",
    component: ContrastFunction,
    icon: <Contrast className="size-4" />,
  },
  {
    id: "Normalize colors",
    slug: "normalizeColors",
    component: NormalizeColorFunction,
    icon: <Palette className="size-4" />,
  },
  {
    id: "Vignette",
    slug: "vignette",
    component: VignetteFunction,
    icon: <Disc3 className="size-4" />,
  },
  {
    id: "Border",
    slug: "border",
    component: BorderFunction,
    icon: <SquareRoundCorner className="size-4" />,
  },
  {
    id: "Rotate",
    slug: "rotate",
    component: RotateFunction,
    icon: <Rotate3d className="size-4" />,
  },
  {
    id: "Scale / resize",
    slug: "scaleResize",
    component: ScaleResizeFunction,
    icon: <ImageUpscale className="size-4" />,
  },
  {
    id: "Text / logo",
    slug: "textLogo",
    component: TextLogoFunction,
    icon: <ALargeSmall className="size-4" />,
  },
  {
    id: "Compose",
    slug: "compose",
    component: ComposeFunction,
    icon: <SquaresUnite className="size-4" />,
  },
];
