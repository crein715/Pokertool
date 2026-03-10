"use client";

import { useState, useMemo, useCallback } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import type { Card } from "@/lib/poker-data";
import { suitSymbols } from "@/lib/poker-data";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { detectDraws, type OutsResult } from "@/lib/outs";
import { outsToEquityOneCard, outsToEquityTwoCards, ruleOf2, ruleOf4 } from "@/lib/poker-math";
import { MultiCardSelector } from "./card-selector";
import { DeckVisual } from "./deck-visual";
import { PresetButtons } from "./preset-buttons";

export function OutsCounter() {
  const { t } = useT();
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

  const drawNameMap: Record<string, string> = {
    "Flush Draw": t("draws.flushDraw"),
    "Backdoor Flush": t("draws.backdoorFlush"),
    "Open-Ended Straight Draw": t("draws.oesd"),
    "Gutshot Straight Draw": t("draws.gutshot"),
    "Two Overcards": t("draws.twoOvercards"),
    "One Overcard": t("draws.oneOvercard"),
  };

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

  const PRESETS = useMemo(() => [
    {
      label: t("outs.preset.flushDraw"), description: t("outs.preset.flushDraw.desc"),
      hand: [{ rank: "A" as const, suit: "spades" as const }, { rank: "5" as const, suit: "spades" as const }] as [Card, Card],
      board: [{ rank: "K" as const, suit: "spades" as const }, { rank: "8" as const, suit: "spades" as const }, { rank: "3" as const, suit: "hearts" as const }] as Card[],
    },
    {
      label: t("outs.preset.oesd"), description: t("outs.preset.oesd.desc"),
      hand: [{ rank: "9" as const, suit: "clubs" as const }, { rank: "8" as const, suit: "clubs" as const }] as [Card, Card],
      board: [{ rank: "7" as const, suit: "diamonds" as const }, { rank: "6" as const, suit: "hearts" as const }, { rank: "2" as const, suit: "spades" as const }] as Card[],
    },
    {
      label: t("outs.preset.gutshot"), description: t("outs.preset.gutshot.desc"),
      hand: [{ rank: "A" as const, suit: "spades" as const }, { rank: "K" as const, suit: "spades" as const }] as [Card, Card],
      board: [{ rank: "Q" as const, suit: "hearts" as const }, { rank: "T" as const, suit: "clubs" as const }, { rank: "4" as const, suit: "diamonds" as const }] as Card[],
    },
    {
      label: t("outs.preset.combo"), description: t("outs.preset.combo.desc"),
      hand: [{ rank: "J" as const, suit: "spades" as const }, { rank: "T" as const, suit: "spades" as const }] as [Card, Card],
      board: [{ rank: "9" as const, suit: "spades" as const }, { rank: "8" as const, suit: "hearts" as const }, { rank: "2" as const, suit: "spades" as const }] as Card[],
    },
    {
      label: t("outs.preset.overcards"), description: t("outs.preset.overcards.desc"),
      hand: [{ rank: "A" as const, suit: "hearts" as const }, { rank: "K" as const, suit: "diamonds" as const }] as [Card, Card],
      board: [{ rank: "8" as const, suit: "clubs" as const }, { rank: "5" as const, suit: "spades" as const }, { rank: "2" as const, suit: "diamonds" as const }] as Card[],
    },
  ], [t]);

  const handlePreset = useCallback((preset: typeof PRESETS[number]) => {
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
        <span>{t("outs.howToUse")}</span>
        {howToUse ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>
      {howToUse && (
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 text-xs text-white/50 space-y-2">
          <p>{t("outs.helpText1")}</p>
          <p>{t("outs.helpText2")}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="text-xs font-semibold text-green-400 uppercase tracking-wider">{t("outs.yourHand")}</div>
          <MultiCardSelector
            cards={hand}
            onChange={(i, card) => { const next = [...hand]; next[i] = card; setHand(next); }}
            usedCards={allSelected.filter((c) => !hand.some((h) => h && h.rank === c.rank && h.suit === c.suit))}
            count={2}
          />
        </div>
        <div className="space-y-2">
          <div className="text-xs font-semibold text-white/50 uppercase tracking-wider">{t("outs.board")} <span className="font-normal text-white/30">{t("outs.boardFlop")}</span></div>
          <MultiCardSelector
            cards={board}
            onChange={(i, card) => { const next = [...board]; next[i] = card; setBoard(next); }}
            usedCards={allSelected.filter((c) => !board.some((b) => b && b.rank === c.rank && b.suit === c.suit))}
            count={4}
          />
        </div>
      </div>

      <div className="text-xs text-white/40">{t("outs.quickPresets")}</div>
      <PresetButtons presets={PRESETS} onSelect={handlePreset} />

      {outsResult.totalOutCount > 0 && (
        <>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-white/40 mb-1">{t("outs.totalOuts")}</div>
                <div className="text-3xl font-bold text-poker-green">{outsResult.totalOutCount}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-white/40 mb-1">
                  {cardsTocome === 2 ? t("outs.hitByRiver") : t("outs.hitOnRiver")}
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
                    <th className="text-left px-3 py-2 font-medium">{t("outs.table.draw")}</th>
                    <th className="text-center px-3 py-2 font-medium">{t("outs.table.outs")}</th>
                    <th className="text-left px-3 py-2 font-medium">{t("outs.table.cards")}</th>
                    <th className="text-right px-3 py-2 font-medium">{t("outs.table.perCard")}</th>
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
                        {drawNameMap[draw.name] || draw.name}
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
                    <td className="px-3 py-2 text-white/80 font-semibold">{t("outs.totalNoOverlap")}</td>
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
              <div className="text-xs font-semibold text-poker-green uppercase tracking-wider">{t("outs.ruleOf2And4")}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <div className="text-white/50">{t("outs.twoCards")}</div>
                  <div className="text-white/70">
                    {t("outs.quick")} <span className="font-mono text-poker-green">{outsResult.totalOutCount} × 4 = ~{quick4}%</span>
                  </div>
                  <div className="text-white/40">
                    {t("outs.exact")} <span className="font-mono">{exactTwoCards.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-white/50">{t("outs.oneCard")}</div>
                  <div className="text-white/70">
                    {t("outs.quick")} <span className="font-mono text-poker-green">{outsResult.totalOutCount} × 2 = ~{quick2}%</span>
                  </div>
                  <div className="text-white/40">
                    {t("outs.exact")} <span className="font-mono">{exactOneCard.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
            <h4 className="text-xs font-semibold text-white/60 uppercase tracking-wider">{t("outs.usingOuts")}</h4>
            <div className="text-xs text-white/40 space-y-2 leading-relaxed">
              <p><strong className="text-white/60">{t("outs.usingOuts1")}</strong> {t("outs.usingOuts1.text")}</p>
              <p>{t("outs.usingOuts2")}</p>
            </div>
          </div>
        </>
      )}

      {outsResult.totalOutCount === 0 && hand[0] && hand[1] && boardCardCount >= 3 && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
          <div className="text-white/30 text-sm">{t("outs.noDraws")}</div>
          <div className="text-white/20 text-xs mt-1">{t("outs.noDrawsSub")}</div>
        </div>
      )}
    </div>
  );
}
