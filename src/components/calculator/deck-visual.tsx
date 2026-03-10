"use client";

import type { Card, Rank, Suit } from "@/lib/poker-data";
import { suitSymbols } from "@/lib/poker-data";
import { cn } from "@/lib/utils";

const RANKS: Rank[] = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
const SUITS: Suit[] = ["spades", "hearts", "diamonds", "clubs"];

function cardKey(c: Card): string {
  return `${c.rank}${c.suit}`;
}

interface DeckVisualProps {
  usedCards: Card[];
  outs: Card[];
  outColorMap?: Map<string, string>;
}

export function DeckVisual({ usedCards, outs, outColorMap }: DeckVisualProps) {
  const usedKeys = new Set(usedCards.map(cardKey));
  const outKeys = new Set(outs.map(cardKey));

  return (
    <div className="space-y-1">
      {SUITS.map((suit) => {
        const isRed = suit === "hearts" || suit === "diamonds";
        return (
          <div key={suit} className="flex gap-0.5 sm:gap-1">
            {RANKS.map((rank) => {
              const card: Card = { rank, suit };
              const key = cardKey(card);
              const isUsed = usedKeys.has(key);
              const isOut = outKeys.has(key);
              const outColor = outColorMap?.get(key);

              return (
                <div
                  key={key}
                  className={cn(
                    "flex flex-col items-center justify-center rounded text-[9px] sm:text-xs font-medium w-[22px] h-[30px] sm:w-[26px] sm:h-[34px] transition-all border",
                    isUsed
                      ? "opacity-15 bg-white/5 border-white/5"
                      : isOut
                        ? "border-green-500/60 shadow-[0_0_8px_rgba(34,197,94,0.3)]"
                        : "bg-white/[0.04] border-white/10"
                  )}
                  style={isOut ? { backgroundColor: `${outColor || "#22c55e"}20` } : undefined}
                >
                  <span
                    className={cn(
                      "leading-none",
                      isOut
                        ? "text-green-300"
                        : isRed
                          ? "text-red-400/70"
                          : "text-white/50"
                    )}
                  >
                    {rank}
                  </span>
                  <span
                    className={cn(
                      "leading-none text-[7px] sm:text-[9px]",
                      isOut
                        ? "text-green-300"
                        : isRed
                          ? "text-red-400/70"
                          : "text-white/50"
                    )}
                  >
                    {suitSymbols[suit]}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
