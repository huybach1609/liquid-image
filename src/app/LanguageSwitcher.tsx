import { useTranslation } from "react-i18next";

import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supportedLocales, type AppLocale } from "@/i18n/resources";
import { Languages } from "lucide-react";

export function LanguageSwitcher() {
  const { t, i18n } = useTranslation("common");
  const current = (supportedLocales.includes(i18n.language as AppLocale)
    ? i18n.language
    : "en") as AppLocale;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
          aria-label={t("language.label")}
        >
          <Languages className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {supportedLocales.map((lng) => (
          <DropdownMenuItem
            key={lng}
            className={lng === current ? "bg-muted/80" : undefined}
            onClick={() => {
              void i18n.changeLanguage(lng);
            }}
          >
            {t(`language.${lng}`)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
