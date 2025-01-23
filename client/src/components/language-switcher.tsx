import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLanguage(language === "ru" ? "en" : "ru")}
      className="w-16"
    >
      {language === "ru" ? "🇷🇺 RU" : "🇬🇧 EN"}
    </Button>
  );
}
