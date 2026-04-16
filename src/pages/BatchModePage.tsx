import { useState } from "react";

import { ModeSwitch } from "@/app/ModeSwitch";
import { ThemeToggle } from "@/shared/components/theme-toggle";
import type { AppMode } from "@/shared/types/common";

type BatchModePageProps = {
  mode: AppMode;
  onModeChange: (mode: AppMode) => void;
};

export function BatchModePage({ mode, onModeChange }: BatchModePageProps) {
  const [activeTab, setActiveTab] = useState<"output" | "log" | "settings">("output");

  return (
    <section className="grid h-full grid-cols-[220px_1fr_300px] border border-border/70 bg-card">
      <aside className="grid min-h-0 grid-rows-[auto_1fr_auto] border-r border-border/70">
        <header className="flex items-center justify-between border-b border-border/70 px-4 py-3">
          <p className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
            Input Queue
          </p>
          <button type="button" className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
            + Add files
          </button>
        </header>

        <div className="overflow-auto px-3 py-3">
          <div className="mb-3 rounded-lg border border-border/70 bg-muted/30 p-2 text-xs text-muted-foreground">
            ~/photos/raw/
          </div>
          {[
            { name: "sunset_01.jpg", meta: "4032×3024 · 3.8 MB", state: "done" },
            { name: "portrait_02.jpg", meta: "2448×3264 · 2.1 MB", state: "done" },
            { name: "landscape_03.jpg", meta: "processing...", state: "run" },
            { name: "citynight_04.jpg", meta: "5472×3648 · 6.2 MB", state: "wait" },
            { name: "scan_corrupt.tif", meta: "unsupported depth", state: "error" },
          ].map((item) => (
            <div
              key={item.name}
              className={`mb-2 rounded-lg border px-3 py-2 ${
                item.state === "run"
                  ? "border-info/60 bg-info/10"
                  : item.state === "error"
                    ? "border-destructive/50 bg-destructive/10"
                    : "border-border/70 bg-background"
              }`}
            >
              <p className="text-sm font-medium">{item.name}</p>
              <p className="text-xs text-muted-foreground">{item.meta}</p>
            </div>
          ))}
        </div>

        <footer className="border-t border-border/70 px-4 py-3">
          <p className="text-xs text-muted-foreground">2 done · 1 running · 1 error</p>
        </footer>
      </aside>

      <div className="grid min-h-0 grid-rows-[auto_1fr_auto]">
        <header className="flex items-center gap-2 border-b border-border/70 px-4 py-3">
          <p className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">Pipeline</p>
          <div className="ml-auto flex items-center gap-2">
            <ModeSwitch mode={mode} onModeChange={onModeChange} />
            <ThemeToggle />
            <button type="button" className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
              Save preset
            </button>
            <button type="button" className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
              Load preset
            </button>
          </div>
        </header>

        <div className="overflow-auto px-3 py-3">
          {["Resize", "Normalize colors", "Convert"].map((step, index) => (
            <div key={step} className="mb-2 rounded-lg border border-border/70 bg-background p-3">
              <div className="flex items-center gap-2">
                <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {index + 1}
                </span>
                <p className="text-sm font-medium">{step}</p>
              </div>
            </div>
          ))}
        </div>

        <footer className="border-t border-border/70 px-4 py-3">
          <p className="mb-1 text-[10px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
            Mogrify Preview (per file)
          </p>
          <code className="text-xs text-primary">
            mogrify -path ./out/ -resize 1920x1080 -filter Lanczos -normalize -quality 85 -strip -format webp *.jpg
          </code>
        </footer>
      </div>

      <aside className="grid min-h-0 grid-rows-[auto_1fr_auto] border-l border-border/70">
        <div className="flex border-b border-border/70">
          {[
            { id: "output", label: "Output" },
            { id: "log", label: "Log" },
            { id: "settings", label: "Settings" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as "output" | "log" | "settings")}
              className={`px-4 py-3 text-sm ${
                activeTab === tab.id
                  ? "border-b-2 border-primary font-medium text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="overflow-auto px-4 py-3">
          {activeTab === "output" && (
            <div className="space-y-3">
              <p className="text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">Destination</p>
              <input className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm" value="./out/" readOnly />
              <select className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm">
                <option>Same name</option>
              </select>
            </div>
          )}
          {activeTab === "log" && (
            <div className="space-y-1 font-mono text-xs text-muted-foreground">
              <p>✓ sunset_01.jpg -&gt; sunset_01.webp</p>
              <p>↻ landscape_03.jpg - step 2/3...</p>
              <p>✕ scan_corrupt.tif - unsupported depth</p>
            </div>
          )}
          {activeTab === "settings" && (
            <div className="space-y-3">
              <p className="text-xs font-medium tracking-[0.08em] text-muted-foreground uppercase">Runtime</p>
              <select className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm">
                <option>4 workers</option>
              </select>
            </div>
          )}
        </div>

        <footer className="border-t border-border/70 px-4 py-3">
          <div className="flex gap-2">
            <button type="button" className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm">
              Dry run
            </button>
            <button type="button" className="flex-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground">
              Run batch
            </button>
          </div>
        </footer>
      </aside>
    </section>
  );
}
