// src/features/single/types/contracts.ts
export type OutputFormat = "jpg" | "png" | "webp" | "tiff" | "bmp" | "gif" | "HEIC";

export type OnConflict = "overwrite" | "skip" | "rename";

export type ResizeFit = "contain" | "cover" | "fill";

export type Gravity =
  | "center"
  | "north"
  | "south"
  | "east"
  | "west"
  | "northeast"
  | "northwest"
  | "southeast"
  | "southwest";

export type Operation =
  | { type: "convert"; format: OutputFormat; quality?: number } // quality 1..100
  | { type: "crop"; width: number; height: number; x?: number; y?: number; gravity?: Gravity }
  | { type: "mirror"; axis: "horizontal" | "vertical" }
  | { type: "black_white"; threshold?: number } // 0..100
  | { type: "contrast"; amount: number } // -100..100
  | { type: "normalize_color" }
  | { type: "vignette"; radius?: number; sigma?: number }
  | { type: "border"; size: number; color: string } // color: "#RRGGBB" or named
  | { type: "rotate"; degrees: number; background?: string }
  | { type: "resize"; width?: number; height?: number; fit?: ResizeFit; keepAspect?: boolean }
  | { type: "text_logo"; text: string; font?: string; size?: number; color?: string; x?: number; y?: number }
  | { type: "compose"; overlayPath: string; gravity?: Gravity; x?: number; y?: number; opacity?: number };

export type RunSingleRequest = {
  requestId: string;
  inputPath: string;
  outputDir: string;
  outputName: string; // without extension
  outputFormat?: OutputFormat; // optional; can be overridden by convert op
  onConflict: OnConflict;
  operations: Operation[];
  dryRun?: boolean;
};

export type CliPreview = {
  command: string;
  args: string[];
  redactedCommand: string; // hide sensitive paths if needed
};

export type RunSingleResponse = {
  requestId: string;
  jobId: string;
  outputPath: string;
  durationMs: number;
  cliPreview: CliPreview;
  warnings: string[];
};

export type AppErrorCode =
  | "VALIDATION_ERROR"
  | "INPUT_NOT_FOUND"
  | "UNSUPPORTED_FORMAT"
  | "IMAGEMAGICK_NOT_FOUND"
  | "PROCESS_FAILED"
  | "CANCELLED"
  | "INTERNAL_ERROR";

export type AppError = {
  code: AppErrorCode;
  message: string;
  details?: Record<string, unknown>;
};