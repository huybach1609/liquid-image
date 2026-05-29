import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { MagickStatus } from "../hooks/useSettingsDraft";

interface MagickBinaryFieldProps {
  value: string;
  status: MagickStatus | null;
  isTesting: boolean;
  onChange: (value: string) => void;
  onDetect: () => void;
  onBrowse: () => void;
  onTest: (path: string) => void;
}

export function MagickBinaryField({
  value,
  status,
  isTesting,
  onChange,
  onDetect,
  onBrowse,
  onTest,
}: MagickBinaryFieldProps) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold">ImageMagick binary path</div>
        {status && (
          <div
            className={cn(
              "text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
              status.type === "sidecar"
                ? "bg-blue-500/10 text-blue-500"
                : "bg-green-500/10 text-green-500",
            )}
          >
            {status.type === "sidecar" ? "Bundled (Sidecar)" : "Custom Path"}
          </div>
        )}
      </div>
      <div className="text-muted-foreground leading-relaxed mb-4 text-sm">
        {status?.type === "sidecar" ? (
          <>
            Using built-in ImageMagick. Set a custom path below to override.
            {status.version && (
              <span className="block mt-1 font-mono text-xs opacity-70">
                Detected: {status.version}
              </span>
            )}
          </>
        ) : (
          <>
            Using custom binary at this location.
            {status?.version && (
              <span className="block mt-1 font-mono text-xs opacity-70">
                Version: {status.version}
              </span>
            )}
          </>
        )}
      </div>
      <div className="flex gap-3">
        <Input
          value={value}
          placeholder="Auto (using sidecar)"
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 h-9 font-mono bg-muted/20"
        />
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 font-medium"
          onClick={onDetect}
        >
          Use Bundled
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3 font-medium"
          onClick={onBrowse}
        >
          Browse…
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className={cn(
            "h-9 px-3 font-medium",
            isTesting && "opacity-50 cursor-not-allowed",
          )}
          disabled={!value || isTesting}
          onClick={() => onTest(value)}
        >
          {isTesting ? "Testing..." : "Test Path"}
        </Button>
      </div>
    </div>
  );
}
