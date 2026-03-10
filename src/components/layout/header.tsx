"use client";

import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n";
import { LanguageSwitcher } from "./language-switcher";

const pageTitleKeys: Record<string, string> = {
  "/": "header.dashboard",
  "/calculator": "header.calculator",
  "/trainer": "header.trainer",
  "/ranges": "header.ranges",
};

export function Header() {
  const pathname = usePathname();
  const { t } = useT();
  const key = pageTitleKeys[pathname];
  const title = key ? t(key) : "PokerTrainer";

  return (
    <header className="flex h-14 items-center border-b border-white/[0.06] px-6 lg:px-8">
      <div className="ml-0">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="ml-auto lg:hidden">
        <LanguageSwitcher />
      </div>
    </header>
  );
}
