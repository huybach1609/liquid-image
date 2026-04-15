import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { ThemeToggle } from "./components/theme-toggle";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setGreetMsg(await invoke("greet", { name }));
  }

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
    </main>
  );
}

export default App;
