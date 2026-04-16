import { useState } from "react";

import { ThemeToggle } from "@/shared/components/theme-toggle";
import { greet } from "@/shared/tauri/commands";
import { normalizeTauriError } from "@/shared/tauri/errors";
import { ModeSwitch } from "@/app/ModeSwitch";
import type { AppMode } from "@/shared/types/common";

type SingleModePageProps = {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
};

export function SingleModePage({ mode, onModeChange }: SingleModePageProps) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isRunning, setIsRunning] = useState(false);

  async function handleRunSingle() {
    setIsRunning(true);
    try {
      const result = await greet(name);
      setMessage(result);
    } catch (error) {
      setMessage(normalizeTauriError(error));
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <section className="grid h-full grid-cols-[180px_1fr_240px] border border-border/70 bg-card">
      <aside className="border-r border-border/70 bg-muted/20">
        <div className="flex h-14 items-center border-b border-border/70 px-5 text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
          Operations
        </div>
        <nav className="py-2">
          {[
            "Convert",
            "Crop",
            "Mirror",
            "Black & white",
            "Contrast",
            "Normalize colors",
            "Vignette",
            "Border",
            "Rotate",
            "Scale / resize",
            "Text / logo",
            "Compose",
          ].map((item, index) => (
            <button
              key={item}
              type="button"
              className={`flex w-full items-center px-5 py-2 text-left text-[13px] ${
                index === 1
                  ? "border-r-2 border-primary bg-background font-medium text-foreground"
                  : "text-muted-foreground hover:bg-background hover:text-foreground"
              }`}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <div className="grid min-w-0 grid-rows-[auto_1fr_auto]">
        <header className="flex h-14 items-center gap-2 border-b border-border/70 px-4">
          <button type="button" className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
            photo.jpg
          </button>
          <button type="button" className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
            + Add file
          </button>
          <div className="ml-auto flex items-center gap-2">
            <ModeSwitch mode={mode} onModeChange={onModeChange} />
            <ThemeToggle />
            <button
              type="button"
              onClick={handleRunSingle}
              disabled={isRunning}
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {isRunning ? "Running..." : "Run"}
            </button>
          </div>
        </header>

        <div className="relative flex items-center justify-center bg-muted/25">
          <div className="flex h-[240px] w-[280px] flex-col items-center justify-center rounded-lg border border-border bg-background text-center">
            <p className="text-sm text-muted-foreground">Drop image or click to open</p>
            <p className="mt-2 text-xs text-muted-foreground">png · jpg · gif · webp · tiff · bmp</p>
          </div>
          <div className="absolute right-3 bottom-3 flex gap-2">
            <button type="button" className="rounded-lg border border-border bg-background px-3 py-1 text-xs">
              100%
            </button>
            <button type="button" className="rounded-lg border border-border bg-background px-3 py-1 text-xs">
              Fit
            </button>
          </div>
        </div>

        <footer className="flex items-center justify-between border-t border-border/70 px-4 py-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-md border border-border bg-muted/40 px-2 py-1">photo.jpg</span>
            <span className="rounded-md border border-border bg-muted/40 px-2 py-1">3840 × 2160</span>
            <span className="rounded-md border border-border bg-muted/40 px-2 py-1">4.2 MB</span>
          </div>
          <p className="text-xs text-muted-foreground">{message || "ImageMagick 7.1"}</p>
        </footer>
      </div>

      <aside className="grid min-h-0 grid-rows-[auto_1fr_auto] border-l border-border/70">
        <div className="flex h-14 items-center border-b border-border/70 px-4 text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">
          Crop - Options
        </div>
        <div className="space-y-3 overflow-auto px-4 py-3">
          <label className="block text-xs text-muted-foreground">Output format</label>
          <select className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm">
            <option>PNG</option>
            <option>JPEG</option>
            <option>WEBP</option>
          </select>
          <label className="block text-xs text-muted-foreground">Quality</label>
          <input
            type="range"
            min={1}
            max={100}
            value={85}
            onChange={() => {}}
            className="w-full accent-primary"
          />
          <label className="block text-xs text-muted-foreground">Output filename</label>
          <input
            value={name || "photo_out.png"}
            onChange={(event) => setName(event.currentTarget.value)}
            className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm"
          />
        </div>
        <div className="border-t border-border/70 px-4 py-3">
          <p className="mb-1 text-[10px] font-medium tracking-[0.08em] text-muted-foreground uppercase">CLI Preview</p>
          <code className="text-xs text-primary">magick photo.jpg -quality 85 ./output/photo_out.png</code>
        </div>
      </aside>
    </section>
  );
}
