"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/learn/hand-rankings": "Hand Rankings",
  "/learn/positions": "Table Positions",
  "/learn/concepts": "Key Concepts",
  "/learn/glossary": "Glossary",
  "/ranges": "Preflop Ranges",
  "/trainer": "Trainer",
  "/calculator": "Calculator",
};

export function Header() {
  const pathname = usePathname();
  const title = pageTitles[pathname] || "PokerTrainer";

  return (
    <header className="flex h-14 items-center border-b border-white/[0.06] px-6 lg:px-8">
      <div className="ml-10 lg:ml-0">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      </div>
    </header>
  );
}
