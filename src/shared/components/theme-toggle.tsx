import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Switch aria-label="Toggle theme" disabled />;
  }

  return (
    <div className="flex items-center space-x-2">
      <Switch
        size="sm"
        id="theme-toggle"
        aria-label="Toggle theme"
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        checked={resolvedTheme === "dark"}
      />
      <Label htmlFor="theme-toggle">Theme</Label>
    </div>
  );
}
