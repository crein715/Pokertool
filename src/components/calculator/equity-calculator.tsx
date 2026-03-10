"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { Loader2, Info } from "lucide-react";
import type { Card } from "@/lib/poker-data";
import { suitSymbols } from "@/lib/poker-data";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { calculateEquity, type EquityResult } from "@/lib/equity";
import { MultiCardSelector } from "./card-selector";
import { EquityBar } from "./equity-bar";
import { PresetButtons } from "./preset-buttons";

function cardStr(c: Card): string {
  return `${c.rank}${suitSymbols[c.suit]}`;
}

export function EquityCalculator() {
  const { t } = useT();
  const [hand1, setHand1] = useState<(Card | null)[]>([null, null]);
  const [hand2, setHand2] = useState<(Card | null)[]>([null, null]);
  const [board, setBoard] = useState<(Card | null)[]>([null, null, null, null, null]);
  const [result, setResult] = useState<EquityResult | null>(null);
  const [computing, setComputing] = useState(false);
  const [presetNote, setPresetNote] = useState<string>("");
  const autoCalcRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allSelected: Card[] = useMemo(() => {
    return [...hand1, ...hand2, ...board].filter((c): c is Card => c !== null);
  }, [hand1, hand2, board]);

  const canCalculate =
    hand1[0] !== null &&
    hand1[1] !== null &&
    hand2[0] !== null &&
    hand2[1] !== null;

  const runCalculation = useCallback(() => {
    if (!canCalculate) return;
    setComputing(true);
    setTimeout(() => {
      const boardCards = board.filter((c): c is Card => c !== null);
      const eq = calculateEquity(
        [hand1[0]!, hand1[1]!],
        [hand2[0]!, hand2[1]!],
        boardCards,
        10000
      );
      setResult(eq);
      setComputing(false);
    }, 50);
  }, [hand1, hand2, board, canCalculate]);

  useEffect(() => {
    if (autoCalcRef.current) clearTimeout(autoCalcRef.current);
    if (canCalculate) {
      autoCalcRef.current = setTimeout(() => {
        runCalculation();
      }, 100);
    } else {
      setResult(null);
    }
    return () => { if (autoCalcRef.current) clearTimeout(autoCalcRef.current); };
  }, [hand1, hand2, board, canCalculate, runCalculation]);

  const PRESETS = useMemo(() => [
    {
      label: t("equity.preset.overpair"), description: t("equity.preset.overpair.desc"),
      hand1: [{ rank: "A" as const, suit: "spades" as const }, { rank: "A" as const, suit: "hearts" as const }] as [Card, Card],
      hand2: [{ rank: "K" as const, suit: "diamonds" as const }, { rank: "K" as const, suit: "clubs" as const }] as [Card, Card],
      board: [] as Card[], note: t("equity.preset.overpair.note"),
    },
    {
      label: t("equity.preset.pairVsOvercards"), description: t("equity.preset.pairVsOvercards.desc"),
      hand1: [{ rank: "Q" as const, suit: "spades" as const }, { rank: "Q" as const, suit: "hearts" as const }] as [Card, Card],
      hand2: [{ rank: "A" as const, suit: "diamonds" as const }, { rank: "K" as const, suit: "diamonds" as const }] as [Card, Card],
      board: [] as Card[], note: t("equity.preset.pairVsOvercards.note"),
    },
    {
      label: t("equity.preset.dominated"), description: t("equity.preset.dominated.desc"),
      hand1: [{ rank: "A" as const, suit: "spades" as const }, { rank: "K" as const, suit: "hearts" as const }] as [Card, Card],
      hand2: [{ rank: "A" as const, suit: "diamonds" as const }, { rank: "Q" as const, suit: "clubs" as const }] as [Card, Card],
      board: [] as Card[], note: t("equity.preset.dominated.note"),
    },
    {
      label: t("equity.preset.coinFlip"), description: t("equity.preset.coinFlip.desc"),
      hand1: [{ rank: "J" as const, suit: "spades" as const }, { rank: "J" as const, suit: "hearts" as const }] as [Card, Card],
      hand2: [{ rank: "A" as const, suit: "diamonds" as const }, { rank: "K" as const, suit: "diamonds" as const }] as [Card, Card],
      board: [] as Card[], note: t("equity.preset.coinFlip.note"),
    },
    {
      label: t("equity.preset.suitedConnector"), description: t("equity.preset.suitedConnector.desc"),
      hand1: [{ rank: "T" as const, suit: "clubs" as const }, { rank: "T" as const, suit: "diamonds" as const }] as [Card, Card],
      hand2: [{ rank: "8" as const, suit: "hearts" as const }, { rank: "7" as const, suit: "hearts" as const }] as [Card, Card],
      board: [] as Card[], note: t("equity.preset.suitedConnector.note"),
    },
  ], [t]);

  const handlePreset = useCallback((preset: typeof PRESETS[number]) => {
    setHand1([preset.hand1[0], preset.hand1[1]]);
    setHand2([preset.hand2[0], preset.hand2[1]]);
    const newBoard: (Card | null)[] = [null, null, null, null, null];
    preset.board.forEach((c, i) => { newBoard[i] = c; });
    setBoard(newBoard);
    setPresetNote(preset.note);
    setResult(null);
  }, []);

  const handleReset = useCallback(() => {
    setHand1([null, null]);
    setHand2([null, null]);
    setBoard([null, null, null, null, null]);
    setResult(null);
    setPresetNote("");
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="text-xs font-semibold text-green-400 uppercase tracking-wider">{t("equity.yourHand")}</div>
          <MultiCardSelector
            cards={hand1}
            onChange={(i, card) => { const next = [...hand1]; next[i] = card; setHand1(next); }}
            usedCards={allSelected.filter((c) => !hand1.some((h) => h && h.rank === c.rank && h.suit === c.suit))}
            count={2}
          />
        </div>
        <div className="space-y-2">
          <div className="text-xs font-semibold text-red-400 uppercase tracking-wider">{t("equity.opponentHand")}</div>
          <MultiCardSelector
            cards={hand2}
            onChange={(i, card) => { const next = [...hand2]; next[i] = card; setHand2(next); }}
            usedCards={allSelected.filter((c) => !hand2.some((h) => h && h.rank === c.rank && h.suit === c.suit))}
            count={2}
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-xs font-semibold text-white/50 uppercase tracking-wider">{t("equity.board")} <span className="font-normal text-white/30">{t("equity.boardOptional")}</span></div>
        <MultiCardSelector
          cards={board}
          onChange={(i, card) => { const next = [...board]; next[i] = card; setBoard(next); }}
          usedCards={allSelected.filter((c) => !board.some((b) => b && b.rank === c.rank && b.suit === c.suit))}
          count={5}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleReset}
          className="rounded-xl border border-white/10 px-5 py-3 sm:px-4 sm:py-2.5 text-sm text-white/50 hover:bg-white/[0.06] hover:text-white/70 transition-all duration-200"
        >
          {t("equity.reset")}
        </button>
      </div>

      <div className="text-xs text-white/40">{t("equity.presets")}</div>
      <PresetButtons presets={PRESETS} onSelect={handlePreset} />

      {computing && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-poker-green" />
          <span className="ml-2 text-sm text-white/50">{t("equity.calculating")}</span>
        </div>
      )}

      {result && !computing && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 space-y-5">
          <EquityBar
            hand1Pct={result.hand1WinPct}
            hand2Pct={result.hand2WinPct}
            tiePct={result.tiePct}
          />

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xs text-white/40 mb-1">{t("equity.result.yourHand")}</div>
              <div className="text-4xl sm:text-2xl font-bold text-green-400">
                {result.hand1WinPct.toFixed(1)}%
              </div>
              <div className="text-[10px] text-white/30 mt-1">{result.hand1Best}</div>
            </div>
            <div>
              <div className="text-xs text-white/40 mb-1">{t("equity.result.tie")}</div>
              <div className="text-4xl sm:text-2xl font-bold text-white/50">
                {result.tiePct.toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-white/40 mb-1">{t("equity.result.opponent")}</div>
              <div className="text-4xl sm:text-2xl font-bold text-red-400">
                {result.hand2WinPct.toFixed(1)}%
              </div>
              <div className="text-[10px] text-white/30 mt-1">{result.hand2Best}</div>
            </div>
          </div>

          <div className="text-center">
            <div className="text-xs text-white/30">
              {t("equity.result.basedOn").replace("{n}", result.sampleSize.toLocaleString())}
            </div>
            {hand1[0] && hand1[1] && hand2[0] && hand2[1] && (
              <div className="text-sm text-white/50 mt-2 font-mono">
                {cardStr(hand1[0])}{cardStr(hand1[1])} vs {cardStr(hand2[0])}{cardStr(hand2[1])}
              </div>
            )}
          </div>

          {presetNote && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-xs text-white/50 flex items-start gap-2">
              <Info className="h-3.5 w-3.5 text-poker-green shrink-0 mt-0.5" />
              <span>{presetNote}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
