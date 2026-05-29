import { Check } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  SettingGroup,
  SettingRow,
  SettingSection,
} from "@/features/settings/components/SettingUI";
import { cn } from "@/lib/utils";
import type { SettingsState, Theme } from "@/features/settings/types";

interface AppearanceSettingsSectionProps {
  draft: SettingsState;
  onThemeChange: (theme: Theme) => void;
  onUpdateSetting: <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K],
  ) => void;
}

const THEMES: Array<{
  id: Theme;
  name: string;
  desc: string;
  swatch: string;
}> = [
  {
    id: "light",
    name: "Light",
    desc: "Mặc định",
    swatch: "bg-gradient-to-br from-[#f5f5f3] to-[#e8e8e6]",
  },
  {
    id: "dark",
    name: "Dark",
    desc: "Tối giản",
    swatch: "bg-gradient-to-br from-[#1a1a2e] to-[#16162a]",
  },
  {
    id: "claude",
    name: "Claude",
    desc: "Cream, coral",
    swatch: "bg-gradient-to-br from-[#faf9f5] to-[#cc785c]",
  },
  {
    id: "claude-dark",
    name: "Claude Dark",
    desc: "Navy, coral",
    swatch: "bg-gradient-to-br from-[#181715] to-[#cc785c]",
  },
  {
    id: "notion",
    name: "Notion",
    desc: "White, blue",
    swatch: "bg-gradient-to-br from-[#ffffff] to-[#0075de]",
  },
  {
    id: "notion-dark",
    name: "Notion Dark",
    desc: "Dark, blue",
    swatch: "bg-gradient-to-br from-[#191919] to-[#0075de]",
  },
  {
    id: "starbucks",
    name: "Starbucks",
    desc: "Cream, green",
    swatch: "bg-gradient-to-br from-[#f2f0eb] to-[#006241]",
  },
  {
    id: "starbucks-dark",
    name: "Starbucks Dark",
    desc: "Dark green",
    swatch: "bg-gradient-to-br from-[#1E3932] to-[#00754A]",
  },
];

export function AppearanceSettingsSection({
  draft,
  onThemeChange,
  onUpdateSetting,
}: AppearanceSettingsSectionProps) {
  return (
    <>
      <SettingSection label="Theme">
        <SettingGroup>
          <div className="p-4">
            <div className="font-semibold mb-1.5">Design theme</div>
            <div className="text-muted-foreground leading-relaxed mb-4">
              Chọn phong cách giao diện cho toàn bộ ứng dụng
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  className={cn(
                    "group relative overflow-hidden rounded-xl border-2 p-3 text-left transition-all hover:shadow-md",
                    draft.theme === theme.id
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border/60 hover:border-primary/40",
                  )}
                  onClick={() => onThemeChange(theme.id)}
                >
                  <div className={cn("h-12 rounded-lg mb-2.5", theme.swatch)} />
                  <div className="text-sm font-semibold">{theme.name}</div>
                  <div className="text-xs text-muted-foreground">{theme.desc}</div>
                  {draft.theme === theme.id && (
                    <div className="absolute top-2 right-2 size-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="size-3 text-primary-foreground" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
          <SettingRow
            name="Font size"
            description="Kích thước chữ trong giao diện"
          >
            <Input
              type="number"
              min={10}
              max={20}
              step={0.5}
              value={draft.fontSize}
              onChange={(e) =>
                onUpdateSetting("fontSize", Number(e.target.value) || 13.5)
              }
              className="h-9 w-[120px]"
            />
          </SettingRow>
        </SettingGroup>
      </SettingSection>

      <SettingSection label="Layout">
        <SettingGroup>
          <SettingRow
            name="Show CLI preview"
            description="Hiện thanh lệnh magick phía dưới options panel"
          >
            <Switch
              checked={draft.showCliPreview}
              onCheckedChange={(v) => onUpdateSetting("showCliPreview", v)}
            />
          </SettingRow>
          <SettingRow
            name="Show image metadata"
            description="Hiện kích thước, dung lượng ở thanh dưới canvas"
          >
            <Switch
              checked={draft.showMetadata}
              onCheckedChange={(v) => onUpdateSetting("showMetadata", v)}
            />
          </SettingRow>
        </SettingGroup>
      </SettingSection>
    </>
  );
}
