import { Globe, Sun, Moon } from "lucide-react";
import { useI18n, type Lang } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";

const langLabels: Record<Lang, string> = { en: "EN", fr: "FR", ar: "عربي" };
const langOrder: Lang[] = ["en", "fr", "ar"];

export function TopBar() {
  const { lang, setLang } = useI18n();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-end gap-2 px-4 py-2 bg-background/80 backdrop-blur-md border-b border-border/50">
      {/* Language Switcher */}
      <div className="flex items-center gap-1 bg-secondary/60 rounded-lg p-0.5">
        <Globe className="w-3.5 h-3.5 text-muted-foreground mx-1" />
        {langOrder.map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${
              lang === l
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {langLabels[l]}
          </button>
        ))}
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="p-1.5 rounded-lg bg-secondary/60 text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    </div>
  );
}
