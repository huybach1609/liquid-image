import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "./shared/components/ui/button";
import { Input } from "./shared/components/ui/input";
import { ThemeToggle } from "./shared/components/theme-toggle";

type MagickVersionInfo = {
  versionName: string;
  aboutLine: string;
};

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [versionInfo, setVersionInfo] = useState<MagickVersionInfo | null>(null);

  async function greet() {
    setGreetMsg(await invoke("greet", { name }));
  }
  async function checkVersion() {
    const info = await invoke<MagickVersionInfo>("check_version");
    setVersionInfo(info);
  }

  useEffect(() => {
    checkVersion();
  }, []);
  
  return (
    <main className="min-h-screen bg-background p-6 text-foreground">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <header className="flex items-center justify-between rounded-xl border border-border/80 bg-card px-4 py-3">
          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
              Liquid Image
            </p>
            <h1 className="text-sm font-medium">shadcn/ui theme setup</h1>
          </div>
          <ThemeToggle />
        </header>

        <section className="rounded-xl border border-border/80 bg-card p-4">
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              greet();
            }}
          >
            <Input
              id="greet-input"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              placeholder="Enter a name..."
            />
            <Button type="submit">Greet</Button>
          </form>
          <p className="mt-3 text-sm text-muted-foreground">
            {greetMsg || "Theme switch now updates all shadcn semantic tokens."}
          </p>
        </section>
      </div>
      <div className="mt-3 space-y-1 text-sm text-muted-foreground">
        <p>{versionInfo ? `Version: ${versionInfo.versionName}` : "Checking version..."}</p>
        {/* <p>{versionInfo?.aboutLine ?? ""}</p> */}
      </div>
    </main>
  );
}

export default App;
