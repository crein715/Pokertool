"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import type { Card, Rank, Suit } from "@/lib/poker-data";
import { suitSymbols } from "@/lib/poker-data";
import { cn } from "@/lib/utils";
import { detectDraws, type OutsResult } from "@/lib/outs";
import { outsToEquityOneCard, outsToEquityTwoCards, ruleOf2, ruleOf4 } from "@/lib/poker-math";
import { MultiCardSelector } from "./card-selector";
import { DeckVisual } from "./deck-visual";
import { PresetButtons } from "./preset-buttons";

interface OutsPreset {
  label: string;
  description: string;
  hand: [Card, Card];
  board: Card[];
}

const PRESETS: OutsPreset[] = [
  {
    label: "Flush draw on flop",
    description: "A♠5♠ on K♠8♠3♥",
    hand: [{ rank: "A", suit: "spades" }, { rank: "5", suit: "spades" }],
    board: [{ rank: "K", suit: "spades" }, { rank: "8", suit: "spades" }, { rank: "3", suit: "hearts" }],
  },
  {
    label: "Open-ended straight draw",
    description: "9♣8♣ on 7♦6♥2♠",
    hand: [{ rank: "9", suit: "clubs" }, { rank: "8", suit: "clubs" }],
    board: [{ rank: "7", suit: "diamonds" }, { rank: "6", suit: "hearts" }, { rank: "2", suit: "spades" }],
  },
  {
    label: "Gutshot",
    description: "A♠K♠ on Q♥T♣4♦",
    hand: [{ rank: "A", suit: "spades" }, { rank: "K", suit: "spades" }],
    board: [{ rank: "Q", suit: "hearts" }, { rank: "T", suit: "clubs" }, { rank: "4", suit: "diamonds" }],
  },
  {
    label: "Combo draw",
    description: "J♠T♠ on 9♠8♥2♠",
    hand: [{ rank: "J", suit: "spades" }, { rank: "T", suit: "spades" }],
    board: [{ rank: "9", suit: "spades" }, { rank: "8", suit: "hearts" }, { rank: "2", suit: "spades" }],
  },
  {
    label: "Overcards",
    description: "A♥K♦ on 8♣5♠2♦",
    hand: [{ rank: "A", suit: "hearts" }, { rank: "K", suit: "diamonds" }],
    board: [{ rank: "8", suit: "clubs" }, { rank: "5", suit: "spades" }, { rank: "2", suit: "diamonds" }],
  },
];

export function OutsCounter() {
  const [hand, setHand] = useState<(Card | null)[]>([null, null]);
  const [board, setBoard] = useState<(Card | null)[]>([null, null, null, null]);
  const [howToUse, setHowToUse] = useState(false);

  const allSelected: Card[] = useMemo(() => {
    return [...hand, ...board].filter((c): c is Card => c !== null);
  }, [hand, board]);

  const outsResult: OutsResult = useMemo(() => {
    const h = hand.filter((c): c is Card => c !== null);
    const b = board.filter((c): c is Card => c !== null);
    if (h.length < 2 || b.length < 3) {
      return { draws: [], totalOuts: [], totalOutCount: 0 };
    }
    return detectDraws(h, b);
  }, [hand, board]);

  const boardCardCount = board.filter((c) => c !== null).length;
  const remaining = 52 - allSelected.length;
  const cardsTocome = boardCardCount === 3 ? 2 : 1;

  const exactOneCard = outsToEquityOneCard(outsResult.totalOutCount, remaining);
  const exactTwoCards = outsToEquityTwoCards(outsResult.totalOutCount, remaining);
  const quick2 = ruleOf2(outsResult.totalOutCount);
  const quick4 = ruleOf4(outsResult.totalOutCount);

  const outColorMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const draw of outsResult.draws) {
      for (const card of draw.outs) {
        const key = `${card.rank}${card.suit}`;
        if (!map.has(key)) map.set(key, draw.color);
      }
    }
    return map;
  }, [outsResult]);

  const handlePreset = useCallback((preset: OutsPreset) => {
    setHand([preset.hand[0], preset.hand[1]]);
    const newBoard: (Card | null)[] = [null, null, null, null];
    preset.board.forEach((c, i) => { newBoard[i] = c; });
    setBoard(newBoard);
  }, []);

  return (
    <div className="space-y-6">
      <button
        onClick={() => setHowToUse(!howToUse)}
        className="flex items-center gap-2 text-xs text-white/40 hover:text-white/60 transition-colors"
      >
        <Info className="h-3.5 w-3.5" />
        <span>How to use</span>
        {howToUse ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      {howToUse && (
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 text-xs text-white/50 space-y-2">
          <p>Select your two hole cards and the board (3-4 cards). The tool automatically detects your draws and counts your outs.</p>
          <p>Outs are cards that improve your hand. The display highlights exactly which cards help you.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="text-xs font-semibold text-green-400 uppercase tracking-wider">Your Hand</div>
          <MultiCardSelector
            cards={hand}
            onChange={(i, card) => {
              const next = [...hand];
              next[i] = card;
              setHand(next);
            }}
            usedCards={allSelected.filter((c) => !hand.some((h) => h && h.rank === c.rank && h.suit === c.suit))}
            count={2}
          />
        </div>
        <div className="space-y-2">
          <div className="text-xs font-semibold text-white/50 uppercase tracking-wider">Board <span className="font-normal text-white/30">(flop + turn)</span></div>
          <MultiCardSelector
            cards={board}
            onChange={(i, card) => {
              const next = [...board];
              next[i] = card;
              setBoard(next);
            }}
            usedCards={allSelected.filter((c) => !board.some((b) => b && b.rank === c.rank && b.suit === c.suit))}
            count={4}
          />
        </div>
      </div>

      <div className="text-xs text-white/40">Quick preset draws</div>
      <PresetButtons presets={PRESETS} onSelect={handlePreset} />

      {outsResult.totalOutCount > 0 && (
        <>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-white/40 mb-1">Total Outs</div>
                <div className="text-3xl font-bold text-poker-green">{outsResult.totalOutCount}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/40 mb-1">
                  {cardsTocome === 2 ? "Hit by river" : "Hit on river"}
                </div>
                <div className="text-3xl font-bold text-white/80">
                  {cardsTocome === 2
                    ? `${exactTwoCards.toFixed(1)}%`
                    : `${exactOneCard.toFixed(1)}%`
                  }
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <DeckVisual
                usedCards={allSelected}
                outs={outsResult.totalOuts}
                outColorMap={outColorMap}
              />
            </div>

            <div className="rounded-lg border border-white/[0.06] overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06] text-white/40">
                    <th className="text-left px-3 py-2 font-medium">Draw</th>
                    <th className="text-center px-3 py-2 font-medium">Outs</th>
                    <th className="text-left px-3 py-2 font-medium">Cards</th>
                    <th className="text-right px-3 py-2 font-medium">Per card</th>
                  </tr>
                </thead>
                <tbody>
                  {outsResult.draws.map((draw) => (
                    <tr key={draw.name} className="border-b border-white/[0.04]">
                      <td className="px-3 py-2 text-white/70 font-medium flex items-center gap-2">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: draw.color }}
                        />
                        {draw.name}
                      </td>
                      <td className="text-center px-3 py-2 text-white/60 font-mono">{draw.outs.length}</td>
                      <td className="px-3 py-2 text-white/40 font-mono text-[10px]">
                        {draw.outs
                          .slice(0, 6)
                          .map((c) => `${c.rank}${suitSymbols[c.suit]}`)
                          .join(" ")}
                        {draw.outs.length > 6 && " ..."}
                      </td>
                      <td className="text-right px-3 py-2 text-white/60 font-mono">
                        {outsToEquityOneCard(draw.outs.length, remaining).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-white/[0.02]">
                    <td className="px-3 py-2 text-white/80 font-semibold">Total (no overlap)</td>
                    <td className="text-center px-3 py-2 text-poker-green font-bold font-mono">
                      {outsResult.totalOutCount}
                    </td>
                    <td className="px-3 py-2" />
                    <td className="text-right px-3 py-2 text-white/80 font-semibold font-mono">
                      {cardsTocome === 2
                        ? `${exactTwoCards.toFixed(1)}%`
                        : `${exactOneCard.toFixed(1)}%`
                      }
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rounded-lg border border-poker-green/20 bg-poker-green/5 p-4 space-y-3">
              <div className="text-xs font-semibold text-poker-green uppercase tracking-wider">Rule of 2 and 4</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <div className="text-white/50">2 cards to come (flop)</div>
                  <div className="text-white/70">
                    Quick: <span className="font-mono text-poker-green">{outsResult.totalOutCount} × 4 = ~{quick4}%</span>
                  </div>
                  <div className="text-white/40">
                    Exact: <span className="font-mono">{exactTwoCards.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-white/50">1 card to come (turn)</div>
                  <div className="text-white/70">
                    Quick: <span className="font-mono text-poker-green">{outsResult.totalOutCount} × 2 = ~{quick2}%</span>
                  </div>
                  <div className="text-white/40">
                    Exact: <span className="font-mono">{exactOneCard.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">Using Outs</h4>
            <div className="text-xs text-white/40 space-y-2 leading-relaxed">
              <p><strong className="text-white/60">The Rule of 2 and 4:</strong> Multiply your outs by 2 (one card to come) or 4 (two cards to come) for a quick probability estimate.</p>
              <p>Compare this probability to your pot odds. If your equity from outs is higher than pot odds → calling with a draw is profitable.</p>
            </div>
          </div>
        </>
      )}

      {outsResult.totalOutCount === 0 && hand[0] && hand[1] && boardCardCount >= 3 && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
          <div className="text-white/30 text-sm">No draws detected with these cards.</div>
          <div className="text-white/20 text-xs mt-1">You may already have a made hand, or try a different combination.</div>
        </div>
      )}
    </div>
  );
}
