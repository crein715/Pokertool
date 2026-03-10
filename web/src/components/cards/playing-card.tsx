"use client";

import { cn } from "@/lib/utils";
import type { Card, Suit } from "@/lib/poker-data";
import { suitSymbols, suitColors } from "@/lib/poker-data";

interface PlayingCardProps {
  card: Card;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: "w-10 h-14 text-sm",
  md: "w-14 h-20 text-lg",
  lg: "w-20 h-28 text-2xl",
};

export function PlayingCard({ card, size = "md", className }: PlayingCardProps) {
  const color = suitColors[card.suit];
  const symbol = suitSymbols[card.suit];

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center rounded-lg border border-neutral-300 bg-[#faf5e8] shadow-md select-none",
        sizeStyles[size],
        className
      )}
      style={{ color }}
    >
      <span className="font-bold leading-none">{card.rank}</span>
      <span className="leading-none">{symbol}</span>
      <div className="absolute top-0.5 left-1 flex flex-col items-center" style={{ fontSize: size === "sm" ? "0.5rem" : size === "md" ? "0.6rem" : "0.75rem" }}>
        <span className="font-bold leading-tight">{card.rank}</span>
        <span className="leading-tight">{symbol}</span>
      </div>
    </div>
  );
}

interface CardHandProps {
  cards: Card[];
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function CardHand({ cards, size = "md", className }: CardHandProps) {
  return (
    <div className={cn("flex gap-1.5", className)}>
      {cards.map((card, i) => (
        <PlayingCard key={`${card.rank}-${card.suit}-${i}`} card={card} size={size} />
      ))}
    </div>
  );
}
