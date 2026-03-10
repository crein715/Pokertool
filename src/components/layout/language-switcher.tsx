"use client";

import { useLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-white/[0.04] p-0.5">
      <button
        onClick={() => setLocale("en")}
        className={cn(
          "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
          locale === "en"
            ? "bg-poker-green/20 text-poker-green"
            : "text-white/40 hover:text-white/70"
        )}
      >
        EN
      </button>
      <button
        onClick={() => setLocale("uk")}
        className={cn(
          "rounded-md px-2.5 py-1 text-xs font-medium transition-all",
          locale === "uk"
            ? "bg-poker-green/20 text-poker-green"
            : "text-white/40 hover:text-white/70"
        )}
      >
        🇺🇦 UA
      </button>
    </div>
  );
}
