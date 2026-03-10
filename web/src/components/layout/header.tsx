"use client";

import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n";

const pageTitleKeys: Record<string, string> = {
  "/": "header.dashboard",
  "/learn/hand-rankings": "header.handRankings",
  "/learn/positions": "header.positions",
  "/learn/concepts": "header.concepts",
  "/learn/glossary": "header.glossary",
  "/ranges": "header.ranges",
  "/trainer": "header.trainer",
  "/calculator": "header.calculator",
  "/tutorial": "header.tutorial",
};

export function Header() {
  const pathname = usePathname();
  const { t } = useT();
  const key = pageTitleKeys[pathname];
  const title = key ? t(key) : "PokerTrainer";

  return (
    <header className="flex h-14 items-center border-b border-white/[0.06] px-6 lg:px-8">
      <div className="ml-10 lg:ml-0">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      </div>
    </header>
  );
}
