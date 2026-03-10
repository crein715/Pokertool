"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { Card, Rank, Suit } from "@/lib/poker-data";
import { suitSymbols } from "@/lib/poker-data";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { X } from "lucide-react";

const RANKS: Rank[] = ["A", "K", "Q", "J", "T", "9", "8", "7", "6", "5", "4", "3", "2"];
const SUITS: Suit[] = ["spades", "hearts", "diamonds", "clubs"];

const SUIT_DISPLAY: Record<Suit, { symbol: string; color: string; mobileColor: string }> = {
  spades: { symbol: "♠", color: "text-white", mobileColor: "text-white" },
  hearts: { symbol: "♥", color: "text-red-500", mobileColor: "text-red-500" },
  diamonds: { symbol: "♦", color: "text-blue-400", mobileColor: "text-blue-400" },
  clubs: { symbol: "♣", color: "text-green-400", mobileColor: "text-green-400" },
};

function cardKey(c: Card): string {
  return `${c.rank}${c.suit}`;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 639px)");
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

interface MobileCardPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (card: Card) => void;
  onClear: () => void;
  usedKeys: Set<string>;
  currentValue: Card | null;
}

function MobileCardPicker({ open, onClose, onSelect, onClear, usedKeys, currentValue }: MobileCardPickerProps) {
  const { t } = useT();

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0a0a0a]/95 backdrop-blur-sm flex flex-col animate-[fade-in_0.15s_ease-out]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <h3 className="text-base font-semibold text-white">{t("cardSelector.pickCard")}</h3>
        <div className="flex items-center gap-3">
          {currentValue && (
            <button
              onClick={onClear}
              className="text-sm text-white/50 hover:text-white/80 transition-colors px-3 py-1.5 rounded-lg border border-white/10 hover:bg-white/5"
            >
              {t("cardSelector.clear")}
            </button>
          )}
          <button
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.06] hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5 text-white/60" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {SUITS.map((suit) => {
          const { symbol, mobileColor } = SUIT_DISPLAY[suit];
          return (
            <div key={suit} className="space-y-2">
              <div className={cn("flex items-center gap-2 px-1 text-sm font-medium", mobileColor)}>
                <span className="text-lg">{symbol}</span>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {RANKS.map((rank) => {
                  const card: Card = { rank, suit };
                  const key = cardKey(card);
                  const isUsed = usedKeys.has(key);
                  const isSelected = currentValue && cardKey(currentValue) === key;

                  return (
                    <button
                      key={key}
                      disabled={isUsed}
                      onClick={() => onSelect(card)}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-xl text-sm font-semibold transition-all duration-200 min-h-[48px] min-w-[44px] border",
                        isUsed
                          ? "opacity-20 cursor-not-allowed bg-white/5 border-white/5"
                          : isSelected
                            ? "bg-poker-green/25 border-poker-green/60 ring-2 ring-poker-green/40"
                            : "bg-white/[0.06] border-white/10 hover:bg-white/10 active:scale-95 cursor-pointer"
                      )}
                    >
                      <span className={cn("leading-none", isUsed ? "text-white/20" : mobileColor)}>{rank}</span>
                      <span className={cn("leading-none text-xs mt-0.5", isUsed ? "text-white/20" : mobileColor)}>{symbol}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface DesktopDropdownProps {
  onSelect: (card: Card) => void;
  onClear: () => void;
  usedKeys: Set<string>;
  currentValue: Card | null;
}

function DesktopDropdown({ onSelect, onClear, usedKeys, currentValue }: DesktopDropdownProps) {
  const { t } = useT();

  return (
    <div className="absolute z-50 mt-2 rounded-xl border border-white/10 bg-neutral-900 p-3 shadow-2xl w-[320px] left-1/2 -translate-x-1/2">
      {currentValue && (
        <button
          onClick={onClear}
          className="w-full mb-2 text-xs text-white/40 hover:text-white/60 py-1 border border-white/10 rounded-md hover:bg-white/5 transition-colors"
        >
          {t("cardSelector.clear")}
        </button>
      )}
      <div className="space-y-1">
        {SUITS.map((suit) => (
          <div key={suit} className="flex gap-0.5">
            {RANKS.map((rank) => {
              const card: Card = { rank, suit };
              const key = cardKey(card);
              const isUsed = usedKeys.has(key);
              const isSelected = currentValue && cardKey(currentValue) === key;
              const { symbol, color } = SUIT_DISPLAY[suit];

              return (
                <button
                  key={key}
                  disabled={isUsed}
                  onClick={() => onSelect(card)}
                  className={cn(
                    "flex flex-col items-center justify-center rounded text-xs w-6 h-8 transition-all font-medium",
                    isUsed
                      ? "opacity-15 cursor-not-allowed bg-white/5"
                      : isSelected
                        ? "bg-poker-green/30 ring-1 ring-poker-green"
                        : "bg-white/[0.06] hover:bg-white/15 cursor-pointer"
                  )}
                >
                  <span className={cn("leading-none", color)}>{rank}</span>
                  <span className={cn("leading-none text-[9px]", color)}>{symbol}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

interface CardSelectorProps {
  value: Card | null;
  onChange: (card: Card | null) => void;
  usedCards?: Card[];
  label?: string;
}

export function CardSelector({ value, onChange, usedCards = [], label }: CardSelectorProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isMobile]);

  useEffect(() => {
    if (open && isMobile) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open, isMobile]);

  const usedKeys = new Set(usedCards.map(cardKey));
  if (value) usedKeys.delete(cardKey(value));

  const handleSelect = useCallback((card: Card) => {
    onChange(card);
    setOpen(false);
  }, [onChange]);

  const handleClear = useCallback(() => {
    onChange(null);
    setOpen(false);
  }, [onChange]);

  return (
    <div className="relative" ref={ref}>
      {label && (
        <span className="block text-[10px] uppercase tracking-wider text-white/40 mb-1">{label}</span>
      )}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border select-none transition-all duration-200",
          "w-16 h-[88px] sm:w-14 sm:h-20",
          value
            ? "border-white/20 bg-poker-card shadow-md"
            : "border-dashed border-white/20 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/30 active:scale-95"
        )}
      >
        {value ? (
          <>
            <span
              className="font-bold text-xl sm:text-lg leading-none"
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
              className="leading-none text-lg sm:text-base"
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
          <span className="text-white/30 text-2xl sm:text-lg">?</span>
        )}
      </button>

      {isMobile ? (
        <MobileCardPicker
          open={open}
          onClose={() => setOpen(false)}
          onSelect={handleSelect}
          onClear={handleClear}
          usedKeys={usedKeys}
          currentValue={value}
        />
      ) : (
        open && (
          <DesktopDropdown
            onSelect={handleSelect}
            onClear={handleClear}
            usedKeys={usedKeys}
            currentValue={value}
          />
        )
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
    <div className="flex gap-2 sm:gap-2">
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
