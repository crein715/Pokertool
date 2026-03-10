"use client";

import { useState, useRef, useEffect } from "react";
import type { Card, Rank, Suit } from "@/lib/poker-data";
import { suitSymbols } from "@/lib/poker-data";
import { cn } from "@/lib/utils";

const RANKS: Rank[] = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
const SUITS: Suit[] = ["spades", "hearts", "diamonds", "clubs"];

const SUIT_DISPLAY: Record<Suit, { symbol: string; color: string }> = {
  spades: { symbol: "♠", color: "text-white" },
  hearts: { symbol: "♥", color: "text-red-500" },
  diamonds: { symbol: "♦", color: "text-blue-400" },
  clubs: { symbol: "♣", color: "text-green-400" },
};

interface CardSelectorProps {
  value: Card | null;
  onChange: (card: Card | null) => void;
  usedCards?: Card[];
  label?: string;
}

function cardKey(c: Card): string {
  return `${c.rank}${c.suit}`;
}

export function CardSelector({ value, onChange, usedCards = [], label }: CardSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const usedKeys = new Set(usedCards.map(cardKey));
  if (value) usedKeys.delete(cardKey(value));

  return (
    <div className="relative" ref={ref}>
      {label && (
        <span className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">{label}</span>
      )}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border select-none transition-all",
          "w-12 h-[68px] sm:w-14 sm:h-20",
          value
            ? "border-white/20 bg-poker-card shadow-md"
            : "border-dashed border-white/20 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/30"
        )}
      >
        {value ? (
          <>
            <span
              className="font-bold text-base sm:text-lg leading-none"
              style={{
                color:
                  value.suit === "hearts" || value.suit === "diamonds"
                    ? "#dc2626"
                    : "#1a1a2e",
              }}
            >
              {value.rank}
            </span>
            <span
              className="leading-none text-sm sm:text-base"
              style={{
                color:
                  value.suit === "hearts" || value.suit === "diamonds"
                    ? "#dc2626"
                    : "#1a1a2e",
              }}
            >
              {suitSymbols[value.suit]}
            </span>
          </>
        ) : (
          <span className="text-white/30 text-lg">?</span>
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-2 rounded-xl border border-white/10 bg-neutral-900 p-3 shadow-2xl w-[260px] sm:w-[280px] left-1/2 -translate-x-1/2">
          {value && (
            <button
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
              className="w-full mb-2 text-xs text-white/40 hover:text-white/60 py-1 border border-white/10 rounded-md hover:bg-white/5 transition-colors"
            >
              Clear
            </button>
          )}
          <div className="space-y-1">
            {SUITS.map((suit) => (
              <div key={suit} className="flex gap-0.5">
                {RANKS.map((rank) => {
                  const card: Card = { rank, suit };
                  const key = cardKey(card);
                  const isUsed = usedKeys.has(key);
                  const isSelected = value && cardKey(value) === key;
                  const { symbol, color } = SUIT_DISPLAY[suit];

                  return (
                    <button
                      key={key}
                      disabled={isUsed}
                      onClick={() => {
                        onChange(card);
                        setOpen(false);
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center rounded text-[10px] sm:text-xs w-[19px] h-[26px] sm:w-[20px] sm:h-[28px] transition-all font-medium",
                        isUsed
                          ? "opacity-15 cursor-not-allowed bg-white/5"
                          : isSelected
                            ? "bg-poker-green/30 ring-1 ring-poker-green"
                            : "bg-white/[0.06] hover:bg-white/15 cursor-pointer"
                      )}
                    >
                      <span className={cn("leading-none", color)}>{rank}</span>
                      <span className={cn("leading-none text-[8px]", color)}>{symbol}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface MultiCardSelectorProps {
  cards: (Card | null)[];
  onChange: (index: number, card: Card | null) => void;
  usedCards: Card[];
  labels?: string[];
  count: number;
}

export function MultiCardSelector({ cards, onChange, usedCards, labels, count }: MultiCardSelectorProps) {
  const allUsed = [
    ...usedCards,
    ...cards.filter((c): c is Card => c !== null),
  ];

  return (
    <div className="flex gap-1.5 sm:gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <CardSelector
          key={i}
          value={cards[i] || null}
          onChange={(card) => onChange(i, card)}
          usedCards={allUsed.filter((c) => !(cards[i] && cardKey(c) === cardKey(cards[i])))}
          label={labels?.[i]}
        />
      ))}
    </div>
  );
}
